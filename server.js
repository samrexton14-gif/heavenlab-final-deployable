require('dotenv').config(); 

const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Heavenlab:heaven123@cluster0.mrri4pz.mongodb.net/heavenlab?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploads folders statically
app.use('/uploads/photos', express.static(path.join(__dirname, 'public', 'uploads', 'PHOTOS')));
app.use('/uploads/reels', express.static(path.join(__dirname, 'public', 'uploads', 'reels')));

// MongoDB connection
mongoose.connect("mongodb+srv://Heavenlab:heaven123@cluster0.mrri4pz.mongodb.net/heavenlab?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const photoSchema = new mongoose.Schema({
  filename: String,
  title: String,
  uploadedAt: { type: Date, default: Date.now }
});

const reelSchema = new mongoose.Schema({
  filename: String,
  title: String,
  uploadedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Photo = mongoose.model('Photo', photoSchema);
const Reel = mongoose.model('Reel', reelSchema);

// Multer Storage configs

// Photos upload to public/uploads/PHOTOS
const photoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public', 'uploads', 'PHOTOS');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadPhoto = multer({ storage: photoStorage });

// Reels upload to public/uploads/reels
const reelStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public', 'uploads', 'reels');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const uploadReel = multer({ storage: reelStorage });

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: "Email and password are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });

    await User.create({ email, password });
    res.json({ success: true, message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "Invalid credentials" });

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Upload a Photo
app.post('/api/upload/photo', uploadPhoto.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: "No file uploaded" });

    const title = req.body.title || '';
    await Photo.create({ filename: req.file.filename, title });
    res.json({ success: true, message: "Photo uploaded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Upload a Reel (video)
app.post('/api/upload/reel', uploadReel.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: "No file uploaded" });

    const title = req.body.title || '';
    await Reel.create({ filename: req.file.filename, title });
    res.json({ success: true, message: "Reel uploaded successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// Get all photos
app.get('/api/photos', async (req, res) => {
  try {
    const photos = await Photo.find().sort({ uploadedAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch photos" });
  }
});

// Get all reels
app.get('/api/reels', async (req, res) => {
  try {
    const reels = await Reel.find().sort({ uploadedAt: -1 });
    res.json(reels);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch reels" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
