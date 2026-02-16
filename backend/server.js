// server.js - Backend API for Creative Writing Portfolio
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static HTML files

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/writing-portfolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const pieceSchema = new mongoose.Schema({
    category: { type: String, required: true },
    title: { type: String, required: true },
    meta: { type: String, required: true },
    content: { type: String, required: true },
    classes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Piece = mongoose.model('Piece', pieceSchema);

// Authentication Middleware
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Initialize default admin user (run once)
async function initializeAdmin() {
    try {
        const existingAdmin = await User.findOne({ username: 'admin' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('writing123', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword
            });
            console.log('Default admin user created');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
}

// Initialize default pieces
async function initializeDefaultPieces() {
    try {
        const count = await Piece.countDocuments();
        if (count === 0) {
            const defaultPieces = [
                {
                    category: 'prose',
                    title: 'The Last Bookstore',
                    meta: 'Prose • Winter 2024',
                    content: `The smell of old paper greeted me like an old friend as I pushed open the door. Dust motes danced in the afternoon light that slanted through the tall windows, each particle a tiny universe tumbling through space.

I ran my fingers along the spines, feeling the ridges of leather and cloth, the smooth coolness of glossy covers. Each book was a door to somewhere else, a portal waiting to be opened. The bookstore owner, Mrs. Chen, watched from behind her counter, her eyes crinkling with a knowing smile.

"Looking for something specific?" she asked, though she already knew the answer.

"Just browsing," I replied, which was code for: I'm looking for magic, for meaning, for that one book that will change everything.`
                },
                {
                    category: 'poetry',
                    title: 'Autumn Leaves',
                    meta: 'Poetry • Fall 2024',
                    content: `Crimson and gold they fall,
whispers of summer's end,
each leaf a letter never sent,
floating to earth's embrace.

The wind carries them
like thoughts I cannot keep,
swirling in patterns
only the air understands.

I stand beneath the oak,
catching memories
in my open palms,
watching them dissolve.`,
                    classes: 'poetry'
                },
                {
                    category: 'creative-nonfiction',
                    title: 'Learning to Bake Bread',
                    meta: 'Creative Nonfiction • Spring 2024',
                    content: `My grandmother's hands were always dusted with flour. Even now, twenty years after her passing, I can close my eyes and see them—gnarled and strong, pressing dough against the counter with a rhythm that seemed older than time itself.

She never measured anything. A handful of this, a pinch of that, water until it "felt right." When I asked her how much flour to use, she'd laugh and say, "Enough." Enough for what? I'd wonder, frustrated by the lack of precision.

Now, standing in my own kitchen with flour on my own hands, I finally understand. The bread tells you when it's ready. You feel it in your palms, in the way the dough resists and yields, in how it breathes beneath your touch.`
                },
                {
                    category: 'script',
                    title: 'Coffee Shop Conversation',
                    meta: 'Script • Summer 2024',
                    content: `INT. SMALL COFFEE SHOP - MORNING

The shop is warm and crowded. The hiss of the espresso machine provides constant background noise. MAYA (30s, tired eyes, paint-stained fingers) sits alone at a small table, sketching in a notebook.

ALEX (30s, business casual, slightly disheveled) enters, spots Maya, hesitates.

ALEX
Is this seat taken?

MAYA
(without looking up)
Depends. Are you going to talk to me or actually sit?

ALEX
(smiling)
I haven't decided yet.

Maya finally looks up. Recognition flickers across her face.

MAYA
You're early.

ALEX
You're here.

They hold each other's gaze. Years of unspoken words hang between them.`,
                    classes: 'script'
                }
            ];
            
            await Piece.insertMany(defaultPieces);
            console.log('Default pieces created');
        }
    } catch (error) {
        console.error('Error initializing default pieces:', error);
    }
}

// Routes

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Piece Routes
app.get('/api/pieces', async (req, res) => {
    try {
        const pieces = await Piece.find().sort({ createdAt: -1 });
        res.json(pieces);
    } catch (error) {
        console.error('Error fetching pieces:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/pieces', authenticate, async (req, res) => {
    try {
        const { category, title, meta, content, classes } = req.body;
        
        const piece = await Piece.create({
            category,
            title,
            meta,
            content,
            classes
        });
        
        res.status(201).json(piece);
    } catch (error) {
        console.error('Error creating piece:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/pieces/:id', authenticate, async (req, res) => {
    try {
        await Piece.findByIdAndDelete(req.params.id);
        res.json({ message: 'Piece deleted' });
    } catch (error) {
        console.error('Error deleting piece:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server and initialize data
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await initializeAdmin();
    await initializeDefaultPieces();
});
