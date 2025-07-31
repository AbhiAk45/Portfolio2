const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Check if 'public' folder exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.error('❌ "public" folder not found. Please create it and place index.html inside.');
  process.exit(1);
}

// CORS setup (for local testing)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware for parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (HTML, CSS, JS, Images, etc.)
app.use(express.static(publicDir));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Contact form route
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, project, message } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
    }
    if (!email || !email.includes('@') || email.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Message must be at least 10 characters.' });
    }

    console.log("📨 New contact form submission:", {
      name,
      email,
      project,
      message,
      time: new Date().toISOString()
    });

    return res.status(200).json({
      success: true,
      message: `Thanks ${name.trim()}! I’ll get back to you soon.`,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Contact form error:', err);
    return res.status(500).json({ success: false, error: 'Something went wrong.' });
  }
});

// Portfolio API (optional, used for dynamic data if needed)
app.get('/api/portfolio', (req, res) => {
  res.json({
    reels: [
      {
        id: 1,
        title: "🎓 College Event Reel",
        description: "Capturing energy, crowd, and vibe in a hook-based montage",
        type: "college_event",
        featured: true
      },
      {
        id: 2,
        title: "🎉 Birthday Reel",
        description: "Emotion-packed moments with smooth transitions and overlays",
        videoUrl: "https://drive.google.com/file/d/14ox5yl3d0lDTmzYLuz-1o_4o718DzZRZ/preview",
        type: "birthday",
        featured: true
      },
      {
        id: 3,
        title: "☕ Cafe Promo Reel",
        description: "Highlighting food, ambience, and offers in a catchy scroll-stopper",
        videoUrl: "https://drive.google.com/file/d/1R6alWQNpvEoqgcmJ3uQMyGKyr_r5yyBC/preview",
        type: "cafe_promo",
        featured: true
      }
    ],
    tools: ["Adobe Premiere Pro", "After Effects", "CapCut", "VN Editor", "Audacity"],
    stats: {
      projectsCompleted: 50,
      happyClients: 35,
      avgEngagementRate: "85%"
    }
  });
});

// Handle unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// ✅ FIXED: Catch-all route for frontend (no * wildcard!)
app.get('/*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});


// Start the server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📦 Serving static from: ${publicDir}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
