const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  artist:      { type: String, required: true },
  year:        { type: Number, required: true },
  country:     { type: String, required: true },
  audioUrl:    { type: String, required: true },
  coverUrl:    { type: String, default: '' },
  uploadedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);