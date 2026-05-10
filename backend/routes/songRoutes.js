const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const Song     = require('../models/Song');
const Comment  = require('../models/Comment');
const User     = require('../models/User');
const cloudinary = require('cloudinary').v2;
const multer   = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'radio-temporal',
    resource_type: file.mimetype.startsWith('audio') ? 'video' : 'image'
  })
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }
});

function withLikedByMe(song, userId) {
  const obj = song.toObject ? song.toObject() : song;
  obj.likesCount = (obj.likes || []).length;
  obj.likedByMe  = userId
    ? (obj.likes || []).some(id => String(id) === String(userId))
    : false;
  delete obj.likes;
  return obj;
}

function decorateComment(c, userId) {
  const obj = c.toObject ? c.toObject() : { ...c };
  obj.likesCount = (obj.likes || []).length;
  obj.likedByMe  = userId
    ? (obj.likes || []).some(id => String(id) === String(userId))
    : false;
  return obj;
}

// ── POST /api/songs ─────────────────────────────────────────────
router.post(
  '/',
  auth,
  upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  async (req, res, next) => {
    try {
      const { title, artist, year, country } = req.body;
      if (!title || !artist || !year || !country)
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      if (!req.files?.audio?.[0])
        return res.status(400).json({ message: 'Falta el archivo de audio' });

      const yearNum = parseInt(year);
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear)
        return res.status(400).json({ message: `Ano debe estar entre 1900 y ${currentYear}` });

      const song = await Song.create({
        title:  title.trim(),
        artist: artist.trim(),
        year:   yearNum,
        country: country.trim().toUpperCase(),
        audioUrl: req.files.audio[0].path,
        coverUrl: req.files.cover?.[0]?.path || '',
        uploadedBy: req.userId
      });
      res.status(201).json(withLikedByMe(song, req.userId));
    } catch (err) { next(err); }
  }
);

// ── GET /api/songs ──────────────────────────────────────────────
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { country, decade, q, sort = 'recent' } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 100, 200);
    const filter = {};

    if (country) filter.country = country.toUpperCase();
    if (decade) {
      const start = parseInt(decade);
      filter.year = { $gte: start, $lt: start + 10 };
    }
    if (q) filter.$or = [
      { title:  new RegExp(q, 'i') },
      { artist: new RegExp(q, 'i') }
    ];

    // ✅ FIX: sort=top usa agregación para ordenar por número real de likes
    if (sort === 'random') {
      const songs = await Song.aggregate([
        { $match: filter },
        { $sample: { size: limit } }
      ]);
      const populated = await Song.populate(songs, { path: 'uploadedBy', select: 'username avatar' });
      return res.json(populated.map(s => withLikedByMe(s, req.userId)));
    }

    if (sort === 'top') {
      const songs = await Song.aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: '$likes' } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $limit: limit }
      ]);
      const populated = await Song.populate(songs, { path: 'uploadedBy', select: 'username avatar' });
      return res.json(populated.map(s => withLikedByMe(s, req.userId)));
    }

    const songs = await Song.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('uploadedBy', 'username avatar');
    res.json(songs.map(s => withLikedByMe(s, req.userId)));
  } catch (err) { next(err); }
});

// ── GET /api/songs/feed ─────────────────────────────────────────
router.get('/feed', auth, async (req, res, next) => {
  try {
    const me = await User.findById(req.userId).select('following');
    const ids = me?.following || [];
    const songs = await Song.find({ uploadedBy: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('uploadedBy', 'username avatar');
    res.json(songs.map(s => withLikedByMe(s, req.userId)));
  } catch (err) { next(err); }
});

// ── GET /api/songs/:id ──────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username avatar');
    if (!song) return res.status(404).json({ message: 'Cancion no encontrada' });
    res.json(withLikedByMe(song, req.userId));
  } catch (err) { next(err); }
});

// ── PUT /api/songs/:id ──────────────────────────────────────────
router.put(
  '/:id',
  auth,
  upload.fields([{ name: 'cover', maxCount: 1 }]),
  async (req, res, next) => {
    try {
      const song = await Song.findOne({ _id: req.params.id, uploadedBy: req.userId });
      if (!song) return res.status(404).json({ message: 'No puedes editar esta cancion' });

      const { title, artist, year, country } = req.body;
      if (title)   song.title   = String(title).trim();
      if (artist)  song.artist  = String(artist).trim();
      if (country) song.country = String(country).trim().toUpperCase();
      if (year !== undefined && year !== '') {
        const y = parseInt(year);
        const cy = new Date().getFullYear();
        if (isNaN(y) || y < 1900 || y > cy)
          return res.status(400).json({ message: `Ano debe estar entre 1900 y ${cy}` });
        song.year = y;
      }
      if (req.files?.cover?.[0]) song.coverUrl = req.files.cover[0].path;

      await song.save();
      await song.populate('uploadedBy', 'username avatar');
      res.json(withLikedByMe(song, req.userId));
    } catch (err) { next(err); }
  }
);

// ── POST /api/songs/:id/like ────────────────────────────────────
router.post('/:id/like', auth, async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Cancion no encontrada' });

    const idx = song.likes.findIndex(id => String(id) === String(req.userId));
    const liked = idx === -1;
    if (liked) song.likes.push(req.userId);
    else song.likes.splice(idx, 1);

    await song.save();
    res.json({ likes: song.likes.length, likedByMe: liked });
  } catch (err) { next(err); }
});

// ── GET /api/songs/:id/comments ─────────────────────────────────
// Devuelve top-level ordenados por likes, con replies anidadas
router.get('/:id/comments', optionalAuth, async (req, res, next) => {
  try {
    const all = await Comment.find({ song: req.params.id })
      .populate('user', 'username avatar _id')
      .lean();

    const userId = req.userId;

    // Separar top-level y replies
    const topLevel = all.filter(c => !c.parentId);
    const replies  = all.filter(c =>  c.parentId);

    // Ordenar top-level: primero por likes desc, luego fecha desc
    topLevel.sort((a, b) =>
      (b.likes?.length || 0) - (a.likes?.length || 0) ||
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Construir respuesta con replies anidadas (orden cronológico asc)
    const result = topLevel.map(c => ({
      ...decorateComment(c, userId),
      replies: replies
        .filter(r => String(r.parentId) === String(c._id))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(r => decorateComment(r, userId))
    }));

    res.json(result);
  } catch (err) { next(err); }
});

// ── POST /api/songs/:id/comments ────────────────────────────────
router.post('/:id/comments', auth, async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'El comentario no puede estar vacio' });
    if (text.length > 500) return res.status(400).json({ message: 'Maximo 500 caracteres' });

    const { parentId, replyTo } = req.body;

    // Validar que el parentId existe y es top-level (solo un nivel)
    if (parentId) {
      const parent = await Comment.findById(parentId);
      if (!parent) return res.status(404).json({ message: 'Comentario padre no encontrado' });
      if (parent.parentId) return res.status(400).json({ message: 'No se pueden anidar respuestas' });
    }

    const comment = await Comment.create({
      song:     req.params.id,
      user:     req.userId,
      text,
      parentId: parentId || null,
      replyTo:  replyTo  || ''
    });
    await comment.populate('user', 'username avatar _id');

    res.status(201).json(decorateComment(comment.toObject(), req.userId));
  } catch (err) { next(err); }
});

// ── POST /api/songs/:id/comments/:commentId/like ─────────────────
router.post('/:id/comments/:commentId/like', auth, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });

    const idx   = comment.likes.findIndex(id => String(id) === String(req.userId));
    const liked = idx === -1;
    if (liked) comment.likes.push(req.userId);
    else comment.likes.splice(idx, 1);

    await comment.save();
    res.json({ likesCount: comment.likes.length, likedByMe: liked });
  } catch (err) { next(err); }
});

// ── DELETE /api/songs/:id/comments/:commentId ───────────────────
router.delete('/:id/comments/:commentId', auth, async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comentario no encontrado' });
    if (String(comment.user) !== String(req.userId))
      return res.status(403).json({ message: 'No puedes eliminar este comentario' });

    // Si es top-level, borrar también sus replies
    if (!comment.parentId) {
      await Comment.deleteMany({ parentId: comment._id });
    }
    await comment.deleteOne();
    res.json({ message: 'Comentario eliminado' });
  } catch (err) { next(err); }
});

module.exports = router;
