const normalizeText = (value = '') => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getKeywords = (value = '') => {
  return new Set(
    normalizeText(value)
      .split(' ')
      .filter((term) => term.length > 2)
  );
};

const similarity = (a = '', b = '') => {
  const first = normalizeText(a);
  const second = normalizeText(b);

  if (!first || !second) return 0;
  if (first === second) return 1;

  const firstWords = new Set(first.split(' '));
  const secondWords = new Set(second.split(' '));
  const intersection = [...firstWords].filter((word) => secondWords.has(word));
  const union = new Set([...firstWords, ...secondWords]);

  return union.size ? intersection.length / union.size : 0;
};

export const scorePotentialMatch = (lostListing, foundListing) => {
  const categoryMatch = lostListing.category === foundListing.category ? 30 : 0;
  const titleScore = similarity(lostListing.title, foundListing.title) * 25;
  const descriptionScore = similarity(lostListing.description, foundListing.description) * 20;
  const locationScore = similarity(lostListing.location, foundListing.location) * 15;

  const lostKeywords = getKeywords(`${lostListing.title} ${lostListing.description}`);
  const foundKeywords = getKeywords(`${foundListing.title} ${foundListing.description}`);
  const overlap = [...lostKeywords].filter((keyword) => foundKeywords.has(keyword));
  const keywordScore = (overlap.length / Math.max(1, lostKeywords.size, foundKeywords.size)) * 10;

  const dateGap = Math.abs(new Date(lostListing.dateLostOrFound) - new Date(foundListing.dateLostOrFound));
  const daysGap = Math.max(1, dateGap / (1000 * 60 * 60 * 24));
  const dateScore = Math.max(0, 10 - Math.min(10, daysGap / 7));

  const total = categoryMatch + titleScore + descriptionScore + locationScore + keywordScore + dateScore;
  return Math.round(Math.min(total, 100));
};

export const getPotentialMatches = (listing, candidates = []) => {
  return candidates
    .filter((candidate) => candidate._id.toString() !== listing._id.toString())
    .map((candidate) => ({
      ...candidate.toObject(),
      matchScore: scorePotentialMatch(listing, candidate),
    }))
    .filter((candidate) => candidate.matchScore >= 45)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 8);
};
