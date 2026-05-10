const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res, next) => {
  try {
    const username = (req.body.username || '').trim();
    const email    = (req.body.email    || '').trim().toLowerCase();
    const password = req.body.password   || '';

    if (!username || !email || !password)
      return res.status(400).json({ message: 'Rellena todos los campos' });

    if (username.length < 3 || username.length > 24)
      return res.status(400).json({ message: 'El usuario debe tener entre 3 y 24 caracteres' });

    if (!EMAIL_RE.test(email))
      return res.status(400).json({ message: 'Email no valido' });

    if (password.length < 6)
      return res.status(400).json({ message: 'La contrasena debe tener al menos 6 caracteres' });

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      const msg = existing.username === username
        ? 'Ese nombre de usuario ya esta en uso'
        : 'Ese email ya esta registrado';
      return res.status(400).json({ message: msg });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, avatar: user.avatar }
    });

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      const msg = field === 'username'
        ? 'Ese nombre de usuario ya esta en uso'
        : 'Ese email ya esta registrado';
      return res.status(400).json({ message: msg });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email    = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password)
      return res.status(400).json({ message: 'Rellena todos los campos' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Credenciales incorrectas' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: 'Credenciales incorrectas' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, avatar: user.avatar }
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
