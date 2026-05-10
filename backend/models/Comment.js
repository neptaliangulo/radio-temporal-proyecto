const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  song:     { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:     { type: String, required: true, maxlength: 500 },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  replyTo:  { type: String, default: '' }  // username al que se responde
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
