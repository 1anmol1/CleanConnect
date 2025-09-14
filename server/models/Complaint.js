import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  issueType: {
    type: String,
    required: [true, 'Please select an issue type'],
  },
  binId: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  imageUrl: {
    type: String,
  },
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'Resolved'],
    default: 'Pending',
  },
  resolutionImageUrl: { // For worker's proof
    type: String,
  }
}, {
  timestamps: true
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;