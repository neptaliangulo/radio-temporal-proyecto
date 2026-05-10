const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const { optionalAuth } = require('../middleware/auth');
const User     = require('../models/User');
const Song     = require('../models/Song');
const cloudinary = require('cloudinary').v2;
const multer   = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'radio-temporal/avatars', resource_type: 'image' }
});
const upload = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

function decorateSong(song, userId) {
  const obj = song.toObject ? song.toObject() : song;
  obj.likesCount = (obj.likes || []).length;
  obj.likedByMe  = userId
    ? (obj.likes || []).some(id => String(id) === String(userId))
    : false;
  delete obj.likes;
  return obj;
}

router.get('/me', auth, async (req, res, next) => {
  try {
    const user  = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    const songs = await Song.find({ uploadedBy: req.userId }).sort('-createdAt');
    const totalLikes = songs.reduce((acc, s) => acc + (s.likes?.length || 0), 0);
    res.json({
      user,
      songsCount:     songs.length,
      totalLikes,
      songs:          songs.map(s => decorateSong(s, req.userId)),
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0
    });
  } catch (err) { next(err); }
});

router.put('/me', auth, upload.single('avatar'), async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.bio !== undefined) updates.bio = String(req.body.bio).slice(0, 280);
    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, select: '-password' }
    );
    res.json({ user });
  } catch (err) { next(err); }
});

router.get('/me/liked', auth, async (req, res, next) => {
  try {
    const songs = await Song.find({ likes: req.userId })
      .sort('-createdAt')
      .populate('uploadedBy', 'username avatar');
    res.json(songs.map(s => decorateSong(s, req.userId)));
  } catch (err) { next(err); }
});

// ─── GET /api/users/me/followers — quien me sigue ───────────────
router.get('/me/followers', auth, async (req, res, next) => {
  try {
    const me = await User.findById(req.userId)
      .populate('followers', 'username avatar bio');
    res.json(me?.followers || []);
  } catch (err) { next(err); }
});

// ─── GET /api/users/me/following — a quien sigo ─────────────────
router.get('/me/following', auth, async (req, res, next) => {
  try {
    const me = await User.findById(req.userId)
      .populate('following', 'username avatar bio');
    res.json(me?.following || []);
  } catch (err) { next(err); }
});

router.delete('/me/songs/:songId', auth, async (req, res, next) => {
  try {
    const song = await Song.findOne({ _id: req.params.songId, uploadedBy: req.userId });
    if (!song) return res.status(404).json({ message: 'Cancion no encontrada' });
    await song.deleteOne();
    res.json({ message: 'Cancion eliminada' });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const users = await User.find({ username: new RegExp(q, 'i') })
      .select('username avatar bio')
      .limit(20);
    res.json(users);
  } catch (err) { next(err); }
});

router.post('/:id/follow', auth, async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (targetId === req.userId)
      return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });

    const target = await User.findById(targetId);
    const me     = await User.findById(req.userId);
    if (!target) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isFollowing = target.followers.some(id => String(id) === String(req.userId));

    if (isFollowing) {
      target.followers.pull(req.userId);
      me.following.pull(targetId);
    } else {
      target.followers.push(req.userId);
      me.following.push(targetId);
    }

    await target.save();
    await me.save();

    res.json({
      following: !isFollowing,
      followersCount: target.followers.length
    });
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -email');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const songs = await Song.find({ uploadedBy: req.params.id }).sort('-createdAt');
    const totalLikes = songs.reduce((acc, s) => acc + (s.likes?.length || 0), 0);

    const isFollowing = req.userId
      ? user.followers.some(id => String(id) === String(req.userId))
      : false;

    res.json({
      user,
      songs:          songs.map(s => decorateSong(s, req.userId)),
      totalLikes,
      songsCount:     songs.length,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      isFollowing
    });
  } catch (err) { next(err); }
});

module.exports = router;
