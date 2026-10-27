import Notification from '../models/Notification.js';

export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort({ createdAt: -1 }).limit(50);
    return res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
    return res.json({ updated: result.modifiedCount || 0 });
  } catch (error) {
    next(error);
  }
};
