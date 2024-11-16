const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  adresse: {
    type: String,
    required: true,
    
  },
  fax: {
    type: String,
    required: true
  },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
});

module.exports = mongoose.model('Client', ClientSchema);