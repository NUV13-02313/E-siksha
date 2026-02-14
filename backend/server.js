const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// ========== MIDDLEWARE ==========
// Current (problematic) CORS
// More permissive CORS for debugging
const allowedOrigins = [
  'https://e-siksha.netlify.app',  // Your Netlify domain
  'http://localhost:5173',           // Local React dev
  'http://localhost:5000',            // Local backend
  'https://e-siksha-mljg.onrender.com' // Your Render backend
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      console.log('Blocked origin:', origin);
      return callback(null, true); // Temporarily allow all origins for debugging
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static folder for uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };
    
    if (!allowedTypes[file.mimetype]) {
      return cb(new Error('Invalid file type. Allowed: images, PDFs, Office documents, text files'), false);
    }
    cb(null, true);
  }
});

// ========== DATABASE CONNECTION ==========
console.log('🚀 Starting E Siksha Server...');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('PORT:', process.env.PORT || 5000);

if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('❌ ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// Connect to MongoDB (simplified for Mongoose 6+)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📁 Database: ${mongoose.connection.db?.databaseName || 'Unknown'}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.error('💡 Error Details:', err);
    process.exit(1);
  });

// ========== DATABASE SCHEMAS ==========
// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });


// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});
// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instructorName: { type: String, required: true }, // Store instructor name separately
 status: {
  type: String,
  enum: ['draft', 'pending', 'published', 'rejected'], // UPDATED: Added 'pending' and 'rejected'
  default: 'pending' // CHANGED: Default to 'pending' for new submissions
},
  isFree: { type: Boolean, default: true },
  price: { type: Number, min: 0, default: 0 },
  duration: { type: String, default: '10 hours' },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'all-levels'
  },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalRatings: { type: Number, default: 0 },
  studentsEnrolled: { type: Number, default: 0 },
  youtubeUrl: { type: String }, // For external video links
  modules: [{
    title: { type: String, required: true },
    videos: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      duration: { type: String, default: '10:00' },
      isPreview: { type: Boolean, default: false }
    }]
  }],
  rejectionReason: { type: String },
  publishedAt: { type: Date }
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

// Notes Schema
// Notes Schema - Simplified
// Notes Schema - Updated to support both files and URLs
const notesSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true },
  tags: [{ type: String }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: { type: String, required: true },
  // Support both options
  contentType: {
    type: String,
    enum: ['file', 'link'],
    required: true
  },
  // For files
  fileUrl: { type: String, default: '' }, // Uploaded file path
  originalFileName: { type: String, default: '' },
  fileSize: { type: Number, default: 0 }, // in bytes
  fileType: { type: String, default: '' }, // pdf, txt, etc.
  
  // For links
  externalUrl: { type: String, default: '' }, // Google Drive, OneDrive, etc.
  urlType: { type: String, default: '' }, // drive, dropbox, etc.
  
  // Common fields
  thumbnail: { type: String, default: '' },
  pages: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  },
  isFree: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notes = mongoose.model('Notes', notesSchema);

// Enrollment Schema
const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  lastAccessed: { type: Date, default: Date.now }
});

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  notes: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notes'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// ========== HELPER FUNCTIONS ==========
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ========== API ENDPOINTS ==========

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'E Siksha Server is running!',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 🔐 AUTH ENDPOINTS

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, role = 'student' } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Passwords do not match' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    // Create new user
    const newUser = new User({
      fullName,
      email,
      password,
      role
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        bio: newUser.bio
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Get current user
app.get('/api/user/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
app.put('/api/user/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const { fullName, bio, skills } = req.body;
    const updateData = { fullName, bio };
    
    if (skills) {
      updateData.skills = JSON.parse(skills);
    }
    
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📊 DASHBOARD ENDPOINTS

// Get dashboard data
app.get('/api/user/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user enrollments with course details
    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title thumbnail category level')
      .sort({ lastAccessed: -1 })
      .limit(5);
    
    // Get user's submitted content
    const submittedCourses = await Course.find({ instructor: userId }).countDocuments();
    const submittedNotes = await Notes.find({ author: userId }).countDocuments();
    
    // Get progress stats
    const totalEnrollments = await Enrollment.countDocuments({ user: userId });
    const completedCourses = await Enrollment.countDocuments({ 
      user: userId, 
      completed: true 
    });
    
    const avgProgress = await Enrollment.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgProgress: { $avg: "$progress" } } }
    ]);
    
    res.json({
      success: true,
      data: {
        user: req.user,
        recentCourses: enrollments,
        stats: {
          totalEnrollments,
          completedCourses,
          averageProgress: avgProgress[0]?.avgProgress || 0,
          submittedCourses,
          submittedNotes
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 📚 COURSE ENDPOINTS

// Get all published courses with filters
app.get('/api/courses', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12 } = req.query;
    
    const query = { status: 'published' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    if (category && category !== 'all') query.category = category;
    if (level && level !== 'all') query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await Course.find(query)
      .populate('instructor', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Course.countDocuments(query);
    
    // Check enrollment status for authenticated users
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        const enrolledCourseIds = await Enrollment.find({ 
          user: userId 
        }).distinct('course');
        
        courses.forEach(course => {
          course.isEnrolled = enrolledCourseIds.includes(course._id.toString());
        });
      } catch (authError) {
        // Token invalid or expired, continue without enrollment info
      }
    }
    
    res.json({
      success: true,
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single course by ID
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'fullName avatar bio')
      .lean();
    
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    
    // Check if user is enrolled
    let isEnrolled = false;
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const enrollment = await Enrollment.findOne({
          user: decoded.id,
          course: course._id
        });
        isEnrolled = !!enrollment;
      } catch (authError) {
        // Not authenticated or token invalid
      }
    }
    
    course.isEnrolled = isEnrolled;
    
    // Get course reviews
    const reviews = await Review.find({ course: course._id })
      .populate('user', 'fullName avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      course: {
        ...course,
        reviews,
        totalStudents: course.studentsEnrolled,
        rating: course.rating || 4.5,
        totalRatings: course.totalRatings || 1250
      }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Enroll in course
app.post('/api/courses/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId
    });
    
    if (existingEnrollment) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment: existingEnrollment
      });
    }
    
    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: courseId,
      progress: 0,
      completed: false
    });
    
    await enrollment.save();
    
    // Update course enrollment count
    course.studentsEnrolled += 1;
    await course.save();
    
    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId }
    });
    
    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      enrollment
    });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update course progress
app.post('/api/courses/:id/progress', authenticateToken, async (req, res) => {
  try {
    const { progress, completed } = req.body;
    const courseId = req.params.id;
    const userId = req.user.id;
    
    const updateData = { 
      lastAccessed: new Date(),
      ...(progress !== undefined && { progress: Math.min(100, Math.max(0, progress)) }),
      ...(completed !== undefined && { completed })
    };
    
    const enrollment = await Enrollment.findOneAndUpdate(
      { user: userId, course: courseId },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Progress updated',
      enrollment
    });
  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit new course
app.post('/api/courses/submit', authenticateToken, upload.fields([
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      isFree, 
      price, 
      tags,
      youtubeUrl,
      modules
    } = req.body;
    
    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }
    
    if (!req.files?.thumbnail) {
      return res.status(400).json({
        success: false,
        message: 'Course thumbnail is required'
      });
    }
    
    // Parse modules if provided
    let parsedModules = [];
    try {
      parsedModules = modules ? JSON.parse(modules) : [];
    } catch (error) {
      console.log('Modules parse error:', error);
      parsedModules = [];
    }
    
    // Create course
    const course = new Course({
      title,
      description,
      category,
      instructor: req.user.id,
      instructorName: req.user.fullName,
      isFree: isFree === 'true',
      price: isFree === 'true' ? 0 : parseFloat(price) || 0,
      thumbnail: `/uploads/${req.files.thumbnail[0].filename}`,
      youtubeUrl,
      modules: parsedModules,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: req.user.role === 'admin' ? 'published' : 'pending'
    });
    
    await course.save();
    
    res.status(201).json({
      success: true,
      message: req.user.role === 'admin' 
        ? 'Course published successfully' 
        : 'Course submitted for review',
      courseId: course._id,
      status: course.status
    });
  } catch (error) {
    console.error('Course submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Submission failed',
      error: error.message 
    });
  }
});

// 📝 NOTES ENDPOINTS

// Get all published notes
// In server.js - Update the /api/notes endpoint
app.get('/api/notes', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    const query = { status: 'published' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // TEMPORARY: Get notes without populate to avoid errors
    const notes = await Notes.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await Notes.countDocuments(query);
    
    res.json({
      success: true,
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single note by ID
app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await Notes.findById(req.params.id)
      .populate('author', 'fullName avatar bio')
      .lean();
    
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notes not found' 
      });
    }
    
    // Increment download count
    await Notes.findByIdAndUpdate(req.params.id, {
      $inc: { downloads: 1 }
    });
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Submit new notes
// Submit new notes - SIMPLIFIED (No admin approval needed)
// Submit new notes - Support both files and URLs
app.post('/api/notes/submit', authenticateToken, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'file', maxCount: 1 } // For file uploads
]), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      tags,
      pages,
      contentType, // 'file' or 'link'
      externalUrl,
      urlType
    } = req.body;
    
    // Basic validation
    if (!title || !category || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and content type are required'
      });
    }
    
    let notesData = {
      title,
      description: description || '',
      category,
      author: req.user.id,
      authorName: req.user.fullName,
      contentType,
      pages: pages ? parseInt(pages) : 0,
      thumbnail: req.files?.thumbnail 
        ? `/uploads/${req.files.thumbnail[0].filename}`
        : '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    status: req.user.role === 'admin' ? 'published' : 'pending',
      isFree: true,
     
    };
    
    // Handle based on content type
    if (contentType === 'file') {
      if (!req.files?.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required for file type notes'
        });
      }
      
      const file = req.files.file[0];
      notesData.fileUrl = `/uploads/${file.filename}`;
      notesData.originalFileName = file.originalname;
      notesData.fileSize = file.size;
      notesData.fileType = file.mimetype;
      
    } else if (contentType === 'link') {
      if (!externalUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL is required for link type notes'
        });
      }
      
      // Validate URL
      try {
        new URL(externalUrl);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid URL'
        });
      }
      
      notesData.externalUrl = externalUrl;
      notesData.urlType = urlType || detectUrlType(externalUrl);
    }
    
    // Create notes
    const notes = new Notes(notesData);
    await notes.save();
    
    res.status(201).json({
      success: true,
       message: req.user.role === 'admin' 
        ? 'Notes published successfully!' 
        : 'Notes submitted for review. Admin approval required.',
      notesId: notes._id,
      status: notes.status
    });
  } catch (error) {
    console.error('Notes submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Submission failed',
      error: error.message 
    });
  }
});
// Download notes file
app.get('/api/notes/:id/download', async (req, res) => {
  try {
    const notes = await Notes.findById(req.params.id);
    
    if (!notes) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notes not found' 
      });
    }
    
    if (notes.contentType === 'file' && notes.fileUrl) {
      // Increment download count
      await Notes.findByIdAndUpdate(req.params.id, {
        $inc: { downloads: 1 }
      });
      
      const filePath = path.join(__dirname, notes.fileUrl);
      const fileName = notes.originalFileName || path.basename(filePath);
      
      res.download(filePath, fileName);
    } else if (notes.contentType === 'link') {
      // For links, just increment count and redirect
      await Notes.findByIdAndUpdate(req.params.id, {
        $inc: { downloads: 1 }
      });
      
      res.redirect(notes.externalUrl);
    } else {
      return res.status(400).json({
        success: false,
        message: 'No downloadable content available'
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Download failed' });
  }
});

// Helper function to detect URL type
function detectUrlType(url) {
  if (url.includes('drive.google.com')) return 'google-drive';
  if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) return 'onedrive';
  if (url.includes('dropbox.com')) return 'dropbox';
  if (url.includes('github.com')) return 'github';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'other';
}

// ⭐ REVIEW ENDPOINTS

// Add review
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { courseId, notesId, rating, comment } = req.body;
    
    if (!rating || (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    // Check if user already reviewed
    const existingReview = await Review.findOne({
      user: req.user.id,
      $or: [
        { course: courseId },
        { notes: notesId }
      ]
    });
    
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this content'
      });
    }
    
    // Create review
    const review = new Review({
      user: req.user.id,
      userName: req.user.fullName,
      course: courseId,
      notes: notesId,
      rating,
      comment
    });
    
    await review.save();
    
    // Update course/notes rating
    if (courseId) {
      await updateCourseRating(courseId);
    } else if (notesId) {
      await updateNotesRating(notesId);
    }
    
    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper function to update course rating
async function updateCourseRating(courseId) {
  const reviews = await Review.find({ course: courseId });
  const totalRatings = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
  
  await Course.findByIdAndUpdate(courseId, {
    rating: averageRating,
    totalRatings
  });
}

// Helper function to update notes rating
async function updateNotesRating(notesId) {
  const reviews = await Review.find({ notes: notesId });
  const totalRatings = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
  
  await Notes.findByIdAndUpdate(notesId, {
    rating: averageRating
  });
}

// // 👨‍💼 ADMIN ENDPOINTS

// Get pending content for approval
app.get('/api/admin/pending', authenticateToken, isAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('instructor', 'fullName email')
      .sort({ createdAt: -1 });
    
    const notes = await Notes.find({ status: 'pending' })
      .populate('author', 'fullName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      courses,
      notes,
      counts: {
        courses: courses.length,
        notes: notes.length,
        total: courses.length + notes.length
      }
    });
  } catch (error) {
    console.error('Get pending error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/reject content
app.post('/api/admin/content/:type/:id/approve', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action, reason } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid action' 
      });
    }
    
    if (type === 'course') {
      const course = await Course.findById(id);
      if (!course) {
        return res.status(404).json({ 
          success: false, 
          message: 'Course not found' 
        });
      }
      
      course.status = action === 'approve' ? 'published' : 'rejected';
      if (action === 'reject' && reason) {
        course.rejectionReason = reason;
      }
      if (action === 'approve') {
        course.publishedAt = new Date();
      }
      
      await course.save();
      
      res.json({
        success: true,
        message: `Course ${action}d successfully`,
        course: {
          id: course._id,
          title: course.title,
          status: course.status
        }
      });
    } 
    else if (type === 'notes') {
      const notes = await Notes.findById(id);
      if (!notes) {
        return res.status(404).json({ 
          success: false, 
          message: 'Notes not found' 
        });
      }
      
      notes.status = action === 'approve' ? 'published' : 'rejected';
      if (action === 'reject' && reason) {
        notes.rejectionReason = reason;
      }
      if (action === 'approve') {
        notes.publishedAt = new Date();
      }
      
      await notes.save();
      
      res.json({
        success: true,
        message: `Notes ${action}d successfully`,
        notes: {
          id: notes._id,
          title: notes.title,
          status: notes.status
        }
      });
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid content type' 
      });
    }
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ success: false, message: 'Action failed' });
  }
});

// Get admin stats
app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalNotes = await Notes.countDocuments();
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const pendingNotes = await Notes.countDocuments({ status: 'pending' });
    
    // Recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName email role createdAt');
    
    const recentCourses = await Course.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title instructorName category createdAt');
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalNotes,
        pendingCourses,
        pendingNotes,
        publishedCourses: totalCourses - pendingCourses,
        publishedNotes: totalNotes - pendingNotes
      },
      recent: {
        users: recentUsers,
        courses: recentCourses
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all users
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 50MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + err.message
    });
  }
  
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/test`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    console.log(`💾 MongoDB: Connected ✓`);
  });
});

module.exports = app;