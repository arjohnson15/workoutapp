const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const https = require('https');

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
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

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
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(EXERCISES_FILE)) {
    fs.writeFileSync(EXERCISES_FILE, JSON.stringify([]));
  }
  
  // Auto-download exercises if file is empty
  const exercises = JSON.parse(fs.readFileSync(EXERCISES_FILE, 'utf8'));
  if (exercises.length === 0) {
    console.log('📥 Downloading 800+ exercises from free-exercise-db...');
    downloadExercises();
  }
};

// Function to download exercises automatically
const downloadExercises = () => {
  const url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
  
  https.get(url, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      try {
        const exercises = JSON.parse(data);
        fs.writeFileSync(EXERCISES_FILE, JSON.stringify(exercises, null, 2));
        console.log(`✅ Successfully downloaded ${exercises.length} exercises!`);
      } catch (error) {
        console.error('❌ Error parsing exercise data:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Error downloading exercises:', error.message);
    console.log('You can manually download from: https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json');
  });
};

initializeDataFiles();

// Helper functions to read/write data
const readUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
const writeUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
const readWorkouts = () => JSON.parse(fs.readFileSync(WORKOUTS_FILE, 'utf8'));
const writeWorkouts = (workouts) => fs.writeFileSync(WORKOUTS_FILE, JSON.stringify(workouts, null, 2));
const readExercises = () => JSON.parse(fs.readFileSync(EXERCISES_FILE, 'utf8'));
const writeExercises = (exercises) => fs.writeFileSync(EXERCISES_FILE, JSON.stringify(exercises, null, 2));
const readSettings = () => JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
const writeSettings = (settings) => fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));

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

    // Create default settings for new user
    const settings = readSettings();
    settings.push({
      userId: newUser.id,
      weeklyPlan: {
        monday: { muscles: [], exercises: [] },
        tuesday: { muscles: [], exercises: [] },
        wednesday: { muscles: [], exercises: [] },
        thursday: { muscles: [], exercises: [] },
        friday: { muscles: [], exercises: [] },
        saturday: { muscles: [], exercises: [] },
        sunday: { muscles: [], exercises: [] }
      },
      preferences: {
        exercisesPerDay: 5,
        restDays: []
      }
    });
    writeSettings(settings);

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

// Create custom exercise
app.post('/api/exercises', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    const newExercise = {
      id: `custom_${Date.now()}`,
      ...req.body,
      isCustom: true,
      createdBy: req.user.id
    };
    exercises.push(newExercise);
    writeExercises(exercises);
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update exercise
app.put('/api/exercises/:id', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    const index = exercises.findIndex(e => e.id === req.params.id || e.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Only allow editing custom exercises or exercises created by the user
    if (exercises[index].isCustom && exercises[index].createdBy === req.user.id) {
      exercises[index] = {
        ...exercises[index],
        ...req.body,
        id: exercises[index].id, // Preserve original ID
        isCustom: true
      };
      writeExercises(exercises);
      res.json(exercises[index]);
    } else {
      res.status(403).json({ error: 'Cannot edit this exercise' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete custom exercise
app.delete('/api/exercises/:id', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    const index = exercises.findIndex(e => e.id === req.params.id || e.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Only allow deleting custom exercises created by the user
    if (exercises[index].isCustom && exercises[index].createdBy === req.user.id) {
      exercises.splice(index, 1);
      writeExercises(exercises);
      res.json({ message: 'Exercise deleted' });
    } else {
      res.status(403).json({ error: 'Cannot delete this exercise' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get exercises by primary muscle
app.get('/api/exercises/muscle/:muscle', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    const filtered = exercises.filter(e => 
      e.primaryMuscles && e.primaryMuscles.some(m => 
        m.toLowerCase() === req.params.muscle.toLowerCase()
      )
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get random exercise by muscle group
app.get('/api/exercises/random/:muscle', authenticateToken, (req, res) => {
  try {
    const exercises = readExercises();
    const filtered = exercises.filter(e => 
      e.primaryMuscles && e.primaryMuscles.some(m => 
        m.toLowerCase() === req.params.muscle.toLowerCase()
      )
    );
    
    if (filtered.length === 0) {
      return res.status(404).json({ error: 'No exercises found for this muscle group' });
    }
    
    const randomExercise = filtered[Math.floor(Math.random() * filtered.length)];
    res.json(randomExercise);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user settings
app.get('/api/settings', authenticateToken, (req, res) => {
  try {
    const settings = readSettings();
    const userSettings = settings.find(s => s.userId === req.user.id);
    
    if (!userSettings) {
      // Create default settings if they don't exist
      const defaultSettings = {
        userId: req.user.id,
        weeklyPlan: {
          monday: { muscles: [], exercises: [] },
          tuesday: { muscles: [], exercises: [] },
          wednesday: { muscles: [], exercises: [] },
          thursday: { muscles: [], exercises: [] },
          friday: { muscles: [], exercises: [] },
          saturday: { muscles: [], exercises: [] },
          sunday: { muscles: [], exercises: [] }
        },
        preferences: {
          exercisesPerDay: 5,
          restDays: []
        }
      };
      settings.push(defaultSettings);
      writeSettings(settings);
      return res.json(defaultSettings);
    }
    
    res.json(userSettings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user settings
app.put('/api/settings', authenticateToken, (req, res) => {
  try {
    const settings = readSettings();
    const userSettingsIndex = settings.findIndex(s => s.userId === req.user.id);
    
    if (userSettingsIndex === -1) {
      settings.push({
        userId: req.user.id,
        ...req.body
      });
    } else {
      settings[userSettingsIndex] = {
        userId: req.user.id,
        ...req.body
      };
    }
    
    writeSettings(settings);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get today's workout plan
app.get('/api/today-plan', authenticateToken, (req, res) => {
  try {
    const settings = readSettings();
    const userSettings = settings.find(s => s.userId === req.user.id);
    
    if (!userSettings) {
      return res.json({ muscles: [], exercises: [] });
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const todayPlan = userSettings.weeklyPlan[today];
    
    if (!todayPlan) {
      return res.json({ day: today, muscles: [], exercises: [] });
    }
    
    res.json({
      day: today,
      muscles: todayPlan.muscles || [],
      exercises: todayPlan.exercises || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Log workout
app.post('/api/workouts', authenticateToken, (req, res) => {
  try {
    const { exerciseId, exerciseName, sets, notes } = req.body;
    
    const workouts = readWorkouts();
    const newWorkout = {
      id: workouts.length + 1,
      userId: req.user.id,
      exerciseId,
      exerciseName,
      sets,
      notes: notes || '',
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

// Get previous workout data for a specific exercise
app.get('/api/workouts/previous/:exerciseId', authenticateToken, (req, res) => {
  try {
    const workouts = readWorkouts();
    const userWorkouts = workouts.filter(w => 
      w.userId === req.user.id && 
      w.exerciseId === parseInt(req.params.exerciseId)
    );
    
    if (userWorkouts.length === 0) {
      return res.status(404).json({ error: 'No previous workouts found' });
    }
    
    // Get the most recent workout for this exercise
    const sortedWorkouts = userWorkouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const previousWorkout = sortedWorkouts[0];
    
    res.json(previousWorkout);
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

// Get analytics data
app.get('/api/analytics', authenticateToken, (req, res) => {
  try {
    const workouts = readWorkouts();
    const userWorkouts = workouts.filter(w => w.userId === req.user.id);
    
    // Calculate various analytics
    const analytics = {
      totalWorkouts: userWorkouts.length,
      totalSets: userWorkouts.reduce((sum, w) => sum + (w.sets?.length || 0), 0),
      exerciseFrequency: {},
      volumeOverTime: [],
      strengthProgress: {}
    };
    
    // Exercise frequency
    userWorkouts.forEach(workout => {
      const name = workout.exerciseName;
      analytics.exerciseFrequency[name] = (analytics.exerciseFrequency[name] || 0) + 1;
    });
    
    // Volume over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = userWorkouts.filter(w => new Date(w.date) >= thirtyDaysAgo);
    
    // Group by date
    const volumeByDate = {};
    recentWorkouts.forEach(workout => {
      const date = new Date(workout.date).toISOString().split('T')[0];
      if (!volumeByDate[date]) {
        volumeByDate[date] = { date, volume: 0, workouts: 0 };
      }
      volumeByDate[date].workouts += 1;
      
      // Calculate volume (sets * reps * weight)
      workout.sets?.forEach(set => {
        if (set.reps && set.weight) {
          volumeByDate[date].volume += parseInt(set.reps) * parseInt(set.weight);
        }
      });
    });
    
    analytics.volumeOverTime = Object.values(volumeByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Strength progress for each exercise (max weight over time)
    userWorkouts.forEach(workout => {
      const name = workout.exerciseName;
      if (!analytics.strengthProgress[name]) {
        analytics.strengthProgress[name] = [];
      }
      
      const maxWeight = Math.max(...(workout.sets?.map(s => parseInt(s.weight) || 0) || [0]));
      if (maxWeight > 0) {
        analytics.strengthProgress[name].push({
          date: new Date(workout.date).toISOString().split('T')[0],
          weight: maxWeight
        });
      }
    });
    
    res.json(analytics);
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
  console.log('To download exercises, run: node download-exercises.js');
});