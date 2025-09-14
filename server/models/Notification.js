import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
  sentBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  target: {
    type: String,
    enum: ['All', 'Citizens', 'Workers', 'Area'],
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  area: { // Only if target is 'Area'
    type: String,
  },
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;