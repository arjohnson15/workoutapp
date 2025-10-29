const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data storage files
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORKOUTS_FILE = path.join(DATA_DIR, 'workouts.json');
const EXERCISES_FILE = path.join(DATA_DIR, 'exercises.json');

// Initialize data directory and files
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Initialize data files
const initializeDataFiles = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(WORKOUTS_FILE)) {
    fs.writeFileSync(WORKOUTS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(EXERCISES_FILE)) {
    // Pre-load comprehensive exercise database
    const exercises = [
      // Chest Exercises
      { id: 1, name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell', type: 'strength' },
      { id: 2, name: 'Dumbbell Bench Press', category: 'Chest', equipment: 'Dumbbell', type: 'strength' },
      { id: 3, name: 'Incline Barbell Bench Press', category: 'Chest', equipment: 'Barbell', type: 'strength' },
      { id: 4, name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell', type: 'strength' },
      { id: 5, name: 'Decline Bench Press', category: 'Chest', equipment: 'Barbell', type: 'strength' },
      { id: 6, name: 'Chest Fly (Dumbbell)', category: 'Chest', equipment: 'Dumbbell', type: 'strength' },
      { id: 7, name: 'Cable Chest Fly', category: 'Chest', equipment: 'Cable', type: 'strength' },
      { id: 8, name: 'Push-ups', category: 'Chest', equipment: 'Bodyweight', type: 'strength' },
      { id: 9, name: 'Chest Dips', category: 'Chest', equipment: 'Bodyweight', type: 'strength' },
      { id: 10, name: 'Pec Deck Machine', category: 'Chest', equipment: 'Machine', type: 'strength' },
      
      // Back Exercises
      { id: 11, name: 'Deadlift', category: 'Back', equipment: 'Barbell', type: 'strength' },
      { id: 12, name: 'Barbell Row', category: 'Back', equipment: 'Barbell', type: 'strength' },
      { id: 13, name: 'Dumbbell Row', category: 'Back', equipment: 'Dumbbell', type: 'strength' },
      { id: 14, name: 'Pull-ups', category: 'Back', equipment: 'Bodyweight', type: 'strength' },
      { id: 15, name: 'Chin-ups', category: 'Back', equipment: 'Bodyweight', type: 'strength' },
      { id: 16, name: 'Lat Pulldown', category: 'Back', equipment: 'Cable', type: 'strength' },
      { id: 17, name: 'Seated Cable Row', category: 'Back', equipment: 'Cable', type: 'strength' },
      { id: 18, name: 'T-Bar Row', category: 'Back', equipment: 'Machine', type: 'strength' },
      { id: 19, name: 'Face Pulls', category: 'Back', equipment: 'Cable', type: 'strength' },
      { id: 20, name: 'Hyperextensions', category: 'Back', equipment: 'Machine', type: 'strength' },
      
      // Shoulder Exercises
      { id: 21, name: 'Overhead Press (Barbell)', category: 'Shoulders', equipment: 'Barbell', type: 'strength' },
      { id: 22, name: 'Dumbbell Shoulder Press', category: 'Shoulders', equipment: 'Dumbbell', type: 'strength' },
      { id: 23, name: 'Arnold Press', category: 'Shoulders', equipment: 'Dumbbell', type: 'strength' },
      { id: 24, name: 'Lateral Raise', category: 'Shoulders', equipment: 'Dumbbell', type: 'strength' },
      { id: 25, name: 'Front Raise', category: 'Shoulders', equipment: 'Dumbbell', type: 'strength' },
      { id: 26, name: 'Rear Delt Fly', category: 'Shoulders', equipment: 'Dumbbell', type: 'strength' },
      { id: 27, name: 'Cable Lateral Raise', category: 'Shoulders', equipment: 'Cable', type: 'strength' },
      { id: 28, name: 'Machine Shoulder Press', category: 'Shoulders', equipment: 'Machine', type: 'strength' },
      { id: 29, name: 'Upright Row', category: 'Shoulders', equipment: 'Barbell', type: 'strength' },
      { id: 30, name: 'Shrugs', category: 'Shoulders', equipment: 'Dumbbell', type: 'strength' },
      
      // Legs Exercises
      { id: 31, name: 'Barbell Squat', category: 'Legs', equipment: 'Barbell', type: 'strength' },
      { id: 32, name: 'Front Squat', category: 'Legs', equipment: 'Barbell', type: 'strength' },
      { id: 33, name: 'Leg Press', category: 'Legs', equipment: 'Machine', type: 'strength' },
      { id: 34, name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell', type: 'strength' },
      { id: 35, name: 'Leg Extension', category: 'Legs', equipment: 'Machine', type: 'strength' },
      { id: 36, name: 'Leg Curl', category: 'Legs', equipment: 'Machine', type: 'strength' },
      { id: 37, name: 'Lunges', category: 'Legs', equipment: 'Dumbbell', type: 'strength' },
      { id: 38, name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'Dumbbell', type: 'strength' },
      { id: 39, name: 'Calf Raise (Standing)', category: 'Legs', equipment: 'Machine', type: 'strength' },
      { id: 40, name: 'Calf Raise (Seated)', category: 'Legs', equipment: 'Machine', type: 'strength' },
      { id: 41, name: 'Hack Squat', category: 'Legs', equipment: 'Machine', type: 'strength' },
      { id: 42, name: 'Goblet Squat', category: 'Legs', equipment: 'Dumbbell', type: 'strength' },
      
      // Arms - Biceps
      { id: 43, name: 'Barbell Curl', category: 'Biceps', equipment: 'Barbell', type: 'strength' },
      { id: 44, name: 'Dumbbell Curl', category: 'Biceps', equipment: 'Dumbbell', type: 'strength' },
      { id: 45, name: 'Hammer Curl', category: 'Biceps', equipment: 'Dumbbell', type: 'strength' },
      { id: 46, name: 'Cable Curl', category: 'Biceps', equipment: 'Cable', type: 'strength' },
      { id: 47, name: 'Preacher Curl', category: 'Biceps', equipment: 'Barbell', type: 'strength' },
      { id: 48, name: 'Concentration Curl', category: 'Biceps', equipment: 'Dumbbell', type: 'strength' },
      { id: 49, name: 'EZ Bar Curl', category: 'Biceps', equipment: 'Barbell', type: 'strength' },
      
      // Arms - Triceps
      { id: 50, name: 'Tricep Dips', category: 'Triceps', equipment: 'Bodyweight', type: 'strength' },
      { id: 51, name: 'Close-Grip Bench Press', category: 'Triceps', equipment: 'Barbell', type: 'strength' },
      { id: 52, name: 'Tricep Pushdown', category: 'Triceps', equipment: 'Cable', type: 'strength' },
      { id: 53, name: 'Overhead Tricep Extension', category: 'Triceps', equipment: 'Dumbbell', type: 'strength' },
      { id: 54, name: 'Skull Crushers', category: 'Triceps', equipment: 'Barbell', type: 'strength' },
      { id: 55, name: 'Tricep Kickback', category: 'Triceps', equipment: 'Dumbbell', type: 'strength' },
      
      // Core/Abs
      { id: 56, name: 'Crunches', category: 'Abs', equipment: 'Bodyweight', type: 'strength' },
      { id: 57, name: 'Plank', category: 'Abs', equipment: 'Bodyweight', type: 'strength' },
      { id: 58, name: 'Russian Twists', category: 'Abs', equipment: 'Bodyweight', type: 'strength' },
      { id: 59, name: 'Leg Raises', category: 'Abs', equipment: 'Bodyweight', type: 'strength' },
      { id: 60, name: 'Cable Crunches', category: 'Abs', equipment: 'Cable', type: 'strength' },
      { id: 61, name: 'Ab Wheel Rollout', category: 'Abs', equipment: 'Equipment', type: 'strength' },
      { id: 62, name: 'Mountain Climbers', category: 'Abs', equipment: 'Bodyweight', type: 'strength' },
      { id: 63, name: 'Bicycle Crunches', category: 'Abs', equipment: 'Bodyweight', type: 'strength' },
      
      // Cardio
      { id: 64, name: 'Treadmill Running', category: 'Cardio', equipment: 'Machine', type: 'cardio' },
      { id: 65, name: 'Treadmill Walking', category: 'Cardio', equipment: 'Machine', type: 'cardio' },
      { id: 66, name: 'Elliptical', category: 'Cardio', equipment: 'Machine', type: 'cardio' },
      { id: 67, name: 'Stationary Bike', category: 'Cardio', equipment: 'Machine', type: 'cardio' },
      { id: 68, name: 'Rowing Machine', category: 'Cardio', equipment: 'Machine', type: 'cardio' },
      { id: 69, name: 'Stair Climber', category: 'Cardio', equipment: 'Machine', type: 'cardio' },
      { id: 70, name: 'Jump Rope', category: 'Cardio', equipment: 'Equipment', type: 'cardio' },
      { id: 71, name: 'Swimming', category: 'Cardio', equipment: 'None', type: 'cardio' },
      { id: 72, name: 'Cycling (Outdoor)', category: 'Cardio', equipment: 'Equipment', type: 'cardio' },
      { id: 73, name: 'Running (Outdoor)', category: 'Cardio', equipment: 'None', type: 'cardio' },
      { id: 74, name: 'Burpees', category: 'Cardio', equipment: 'Bodyweight', type: 'cardio' },
      { id: 75, name: 'Box Jumps', category: 'Cardio', equipment: 'Equipment', type: 'cardio' }
    ];
    fs.writeFileSync(EXERCISES_FILE, JSON.stringify(exercises, null, 2));
  }
};

initializeDataFiles();

// Helper functions to read/write data
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
const readWorkouts = () => JSON.parse(fs.readFileSync(WORKOUTS_FILE, 'utf8'));
const writeWorkouts = (workouts) => fs.writeFileSync(WORKOUTS_FILE, JSON.stringify(workouts, null, 2));
const readExercises = () => JSON.parse(fs.readFileSync(EXERCISES_FILE, 'utf8'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = readUsers();
    
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: users.length + 1,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeUsers(users);

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all exercises
app.get('/api/exercises', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exercises by category
app.get('/api/exercises/category/:category', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    const filtered = exercises.filter(e => e.category.toLowerCase() === req.params.category.toLowerCase());
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Log workout
app.post('/api/workouts', authenticateToken, (req, res) => {
  try {
    const { exerciseId, exerciseName, sets } = req.body;
    
    const workouts = readWorkouts();
    const newWorkout = {
      id: workouts.length + 1,
      userId: req.user.id,
      exerciseId,
      exerciseName,
      sets, // Array of {reps, weight} for strength or {time, distance} for cardio
      date: new Date().toISOString()
    };

    workouts.push(newWorkout);
    writeWorkouts(workouts);

    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's workout history
app.get('/api/workouts', authenticateToken, (req, res) => {
  try {
    const workouts = readWorkouts();
    const userWorkouts = workouts.filter(w => w.userId === req.user.id);
    res.json(userWorkouts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get workouts by date range
app.get('/api/workouts/range', authenticateToken, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const workouts = readWorkouts();
    let userWorkouts = workouts.filter(w => w.userId === req.user.id);

    if (startDate) {
      userWorkouts = userWorkouts.filter(w => new Date(w.date) >= new Date(startDate));
    }
    if (endDate) {
      userWorkouts = userWorkouts.filter(w => new Date(w.date) <= new Date(endDate));
    }

    res.json(userWorkouts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete workout
app.delete('/api/workouts/:id', authenticateToken, (req, res) => {
  try {
    const workouts = readWorkouts();
    const workoutIndex = workouts.findIndex(w => w.id === parseInt(req.params.id) && w.userId === req.user.id);

    if (workoutIndex === -1) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    workouts.splice(workoutIndex, 1);
    writeWorkouts(workouts);

    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
