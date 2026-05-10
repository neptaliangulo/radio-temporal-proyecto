const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Report  = require('../models/Report');

// POST /api/reports — denunciar una cancion o comentario
router.post('/', auth, async (req, res, next) => {
  try {
    const { type, targetId, reason } = req.body;
    if (!['song', 'comment'].includes(type))
      return res.status(400).json({ message: 'Tipo de reporte invalido' });
    if (!targetId)
      return res.status(400).json({ message: 'Falta el contenido a reportar' });
    const text = (reason || '').trim();
    if (text.length < 3)
      return res.status(400).json({ message: 'Indica un motivo (min. 3 caracteres)' });

    await Report.create({
      type,
      targetId,
      reason: text.slice(0, 500),
      reportedBy: req.userId
    });
    res.status(201).json({ message: 'Reporte enviado, gracias por tu colaboracion' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya has reportado este contenido' });
    }
    next(err);
  }
});

module.exports = router;
