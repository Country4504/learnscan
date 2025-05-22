const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  survey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scores: {
    perception: {
      visual: Number,
      auditory: Number,
      kinesthetic: Number
    },
    processing: {
      systematic: Number,
      global: Number
    },
    environment: {
      structured: Number,
      flexible: Number
    },
    thinking: {
      analytical: Number,
      creative: Number
    },
    timeManagement: {
      planned: Number,
      adaptive: Number
    }
  },
  dominantType: {
    perceptionType: String,
    processingType: String,
    environmentType: String,
    thinkingType: String,
    timeManagementType: String
  },
  learningTypeCode: String,
  learningTypeDescription: String,
  isMixedType: Boolean,
  strengths: [String],
  challenges: [String],
  strategies: [String],
  subjectStrategies: {
    math: [String],
    language: [String],
    english: [String],
    science: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 