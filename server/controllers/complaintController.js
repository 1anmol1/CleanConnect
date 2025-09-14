import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import Reward from '../models/Reward.js';

/**
 * @desc    Create a new complaint and award points
 * @route   POST /api/complaints
 * @access  Protected (Citizen, Worker)
 */
export const createComplaint = async (req, res) => {
  const { issueType, binId, description } = req.body;
  
  // Get all necessary user info from the protect middleware
  const { id: reportedBy, city, area } = req.user;

  // Ensure user profile is complete
  if (!city || !area) {
    return res.status(400).json({ success: false, error: 'User profile is incomplete. City and Area are required.' });
  }

  try {
    // Create the complaint in the database
    const complaint = await Complaint.create({
      issueType,
      binId,
      description,
      reportedBy,
      city, // Add the user's city
      area, // Add the user's area
      imageUrl: req.file ? `/${req.file.path.split('server/')[1]}` : null,
    });

    // Award 5 points to the reporting user
    await User.findByIdAndUpdate(reportedBy, { $inc: { points: 5 } });

    // Create a reward record for tracking purposes
    await Reward.create({
      user: reportedBy,
      points: 5,
      reason: 'Issue Reported',
      relatedComplaint: complaint._id,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error: ' + error.message });
  }
};

/**
 * @desc    Get all complaints for the logged-in officer's city
 * @route   GET /api/complaints
 * @access  Protected (Officer)
 */
export const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ city: req.user.city })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Get assigned complaints for the logged-in worker
 * @route   GET /api/complaints/my-resolutions
 * @access  Protected (Worker)
 */
export const getMyResolutions = async (req, res) => {
    try {
        const resolutions = await Complaint.find({ assignedTo: req.user.id })
            .populate('reportedBy', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: resolutions });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

/**
 * @desc    Assign a complaint to a worker
 * @route   PUT /api/complaints/:id/assign
 * @access  Protected (Officer)
 */
export const assignComplaint = async (req, res) => {
  const { workerId } = req.body;
  const complaintId = req.params.id;
  const officerCity = req.user.city;

  try {
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    // Security Check: Ensure officer can only manage complaints in their city
    if (complaint.city !== officerCity) {
      return res.status(403).json({ success: false, error: 'You are not authorized to manage complaints outside your city.' });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { assignedTo: workerId, status: 'Assigned' },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * @desc    Resolve a complaint
 * @route   PUT /api/complaints/:id/resolve
 * @access  Protected (Worker)
 */
export const resolveComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        
        // Ensure the worker is the one assigned to this complaint
        if (complaint.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'User not authorized to resolve this complaint' });
        }

        complaint.status = 'Resolved';
        await complaint.save();
        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};