const mongoose = require('mongoose');

const InterventionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true
  },
  details: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['urgent', 'important', 'normal'],
    required: true
  },
  status: {
    type: String,
    enum: ['en attente', 'en cours', 'validé', 'annulé'],
    default: 'en attente'
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Intervention', InterventionSchema);
