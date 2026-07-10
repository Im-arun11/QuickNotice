import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  notice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notice',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure a worker cannot submit multiple active applications for the same notice
applicationSchema.index({ notice: 1, worker: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
