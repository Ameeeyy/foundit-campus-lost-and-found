import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import supertest from 'supertest';
import { getAuthCookieOptions, getJwtSecret } from '../src/config/security.js';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret-that-is-long-enough-to-pass-validation';

const { default: app } = await import('../src/app.js');
const api = supertest(app);
let mongoServer;

const createUser = async (name, email, campusId) => {
  const response = await api.post('/api/auth/register').send({
    name,
    email,
    campusId,
    password: 'valid-password',
  });

  assert.equal(response.status, 201);
  return { token: response.body.token, user: response.body.user };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('lost-and-found workflow covers matching, claim review, ownership, and return', async () => {
  const owner = await createUser('Found Item Owner', 'owner@example.test', 'CAMPUS-1');
  const claimant = await createUser('Item Claimant', 'claimant@example.test', 'CAMPUS-2');
  const otherUser = await createUser('Other User', 'other@example.test', 'CAMPUS-3');

  const foundResponse = await api.post('/api/listings').set(auth(owner.token)).send({
    type: 'FOUND',
    title: 'Blue insulated water bottle',
    description: 'Blue bottle with a mountain sticker on the side',
    category: 'Water bottles',
    location: 'North library',
    dateLostOrFound: '2026-10-25',
  });
  assert.equal(foundResponse.status, 201);
  const foundListing = foundResponse.body.listing;

  const lostResponse = await api.post('/api/listings').set(auth(claimant.token)).send({
    type: 'LOST',
    title: 'Blue water bottle',
    description: 'Lost a blue insulated bottle with a mountain sticker',
    category: 'Water bottles',
    location: 'North library',
    dateLostOrFound: '2026-10-25',
  });
  assert.equal(lostResponse.status, 201);

  const searchResponse = await api.get('/api/listings').query({ search: 'mountain sticker' });
  assert.equal(searchResponse.status, 200);
  assert.equal(searchResponse.body.total, 2);

  const deniedMatches = await api
    .get(`/api/listings/${lostResponse.body.listing._id}/matches`)
    .set(auth(otherUser.token));
  assert.equal(deniedMatches.status, 403);

  const matchesResponse = await api
    .get(`/api/listings/${lostResponse.body.listing._id}/matches`)
    .set(auth(claimant.token));
  assert.equal(matchesResponse.status, 200);
  assert.ok(matchesResponse.body.matches.some((match) => match.matchScore >= 45));

  const lostListingClaim = await api.post('/api/claims').set(auth(claimant.token)).send({
    listingId: lostResponse.body.listing._id,
    explanation: 'This is my lost item and I can identify it.',
  });
  assert.equal(lostListingClaim.status, 400);

  const claimResponse = await api.post('/api/claims').set(auth(claimant.token)).send({
    listingId: foundListing._id,
    explanation: 'This is my bottle and the mountain sticker is on its left side.',
    distinguishingDetails: 'There is a small dent near the cap.',
  });
  assert.equal(claimResponse.status, 201);
  const claimId = claimResponse.body.claim._id;

  const duplicateClaim = await api.post('/api/claims').set(auth(claimant.token)).send({
    listingId: foundListing._id,
    explanation: 'This is my bottle and I can identify it.',
  });
  assert.equal(duplicateClaim.status, 409);

  const secondClaim = await api.post('/api/claims').set(auth(otherUser.token)).send({
    listingId: foundListing._id,
    explanation: 'I can identify this bottle by the items inside.',
  });
  assert.equal(secondClaim.status, 201);

  const unauthorizedReview = await api
    .patch(`/api/claims/${claimId}/review`)
    .set(auth(otherUser.token))
    .send({ status: 'APPROVED' });
  assert.equal(unauthorizedReview.status, 403);

  const approvedClaim = await api
    .patch(`/api/claims/${claimId}/review`)
    .set(auth(owner.token))
    .send({ status: 'APPROVED' });
  assert.equal(approvedClaim.status, 200);
  const pendingReturnListing = await api.get(`/api/listings/${foundListing._id}`);
  assert.equal(pendingReturnListing.body.listing.status, 'CLAIM_PENDING');

  const repeatedReview = await api
    .patch(`/api/claims/${claimId}/review`)
    .set(auth(owner.token))
    .send({ status: 'REJECTED' });
  assert.equal(repeatedReview.status, 409);

  const secondApproval = await api
    .patch(`/api/claims/${secondClaim.body.claim._id}/review`)
    .set(auth(owner.token))
    .send({ status: 'APPROVED' });
  assert.equal(secondApproval.status, 409);

  const returnedItem = await api
    .post('/api/claims/confirm-return')
    .set(auth(owner.token))
    .send({ claimId });
  assert.equal(returnedItem.status, 200);
  assert.equal(returnedItem.body.listing.status, 'RETURNED');

  const repeatedReturn = await api
    .post('/api/claims/confirm-return')
    .set(auth(owner.token))
    .send({ claimId });
  assert.equal(repeatedReturn.status, 409);

  const notifications = await api.get('/api/notifications').set(auth(claimant.token));
  assert.equal(notifications.status, 200);
  assert.ok(notifications.body.notifications.some(({ eventType }) => eventType === 'CLAIM_REVIEWED'));
  assert.ok(notifications.body.notifications.some(({ eventType }) => eventType === 'RETURN_CONFIRMED'));
  const markedRead = await api.patch('/api/notifications/read').set(auth(claimant.token));
  assert.equal(markedRead.status, 200);
  assert.ok(markedRead.body.updated > 0);

  const previousEnvironment = process.env.NODE_ENV;
  const previousSecret = process.env.JWT_SECRET;
  const previousMongoUri = process.env.MONGODB_URI;
  process.env.NODE_ENV = 'production';
  process.env.JWT_SECRET = 'replace-this-with-a-random-secret-of-at-least-32-characters';
  assert.throws(() => getJwtSecret(), /Replace the example JWT_SECRET/);
  assert.deepEqual(getAuthCookieOptions(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  delete process.env.MONGODB_URI;
  const { connectDB } = await import('../src/config/db.js');
  await assert.rejects(connectDB(), /MONGODB_URI must be configured in production/);
  process.env.NODE_ENV = previousEnvironment;
  process.env.JWT_SECRET = previousSecret;
  if (previousMongoUri === undefined) delete process.env.MONGODB_URI;
  else process.env.MONGODB_URI = previousMongoUri;
});
