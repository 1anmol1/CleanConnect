import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotification = async (req, res) => {
  const { title, message, target, area } = req.body;
  const sentBy = req.user.id;
  const city = req.user.city;

  try {
    const notification = await Notification.create({
      title,
      message,
      sentBy,
      target,
      city,
      area: target === 'Area' ? area : undefined,
    });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Build a query to find relevant notifications
    const queryConditions = [
      { city: user.city, target: 'All' },
      { city: user.city, target: 'Citizens', role: 'Citizen' },
      { city: user.city, target: 'Workers', role: 'Worker' },
      { city: user.city, target: 'Area', area: user.area },
    ];

    // Filter conditions based on the user's role
    const relevantConditions = queryConditions.filter(condition => {
        if (condition.role) return condition.role === user.role;
        return true;
    });

    const notifications = await Notification.find({ $or: relevantConditions }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};