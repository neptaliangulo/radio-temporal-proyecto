const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  type:       { type: String, enum: ['song', 'comment'], required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  reason:     { type: String, required: true, maxlength: 500 },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:     { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' }
}, { timestamps: true });

// Un usuario solo puede reportar una vez el mismo contenido
reportSchema.index({ type: 1, targetId: 1, reportedBy: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
