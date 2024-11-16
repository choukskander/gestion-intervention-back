const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: { 
    type: String,
    required: true 
  },
  profileImage: { 
    type: String
  },
  companyLocation: { 
    type: String
  }
});

module.exports = mongoose.model('User', UserSchema);
