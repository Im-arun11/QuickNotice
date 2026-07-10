import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a job title'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please select a job category']
  },
  description: {
    type: String,
    required: [true, 'Please add a job description']
  },
  salary: {
    type: Number,
    required: [true, 'Please specify salary amount'],
    min: [1, 'Salary must be positive']
  },
  salaryType: {
    type: String,
    enum: ['day', 'hour'],
    default: 'day'
  },
  peopleNeeded: {
    type: Number,
    required: [true, 'Please specify staffing headcount needed'],
    min: [1, 'Must need at least 1 person']
  },
  peopleApplied: {
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: [true, 'Please specify city area']
  },
  address: {
    type: String,
    required: [true, 'Please specify working address']
  },
  date: {
    type: String,
    required: [true, 'Please add working date (YYYY-MM-DD)']
  },
  workingTime: {
    type: String,
    required: [true, 'Please specify working hours/times']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a contact phone number']
  },
  requirements: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
