# 💪 Workout Tracker App

A full-stack workout tracking application with user authentication, comprehensive exercise database, and workout logging capabilities.

## Features

- **User Authentication**: Secure registration and login with password hashing
- **Pre-loaded Exercise Database**: 75+ popular exercises across all categories:
  - Chest, Back, Shoulders, Legs, Biceps, Triceps, Abs
  - Free weights, machines, cables, bodyweight, and cardio exercises
- **Workout Logging**: 
  - Track sets, reps, and weight for strength exercises
  - Track time and distance for cardio exercises
  - Add multiple sets for each exercise
- **Workout History**: View all past workouts with date/time stamps
- **Category Filtering**: Browse exercises by body part/category
- **Mobile-Friendly**: Responsive design works on all devices

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React (via CDN)
- **Database**: JSON file storage (easily upgradeable to SQL database)
- **Authentication**: JWT tokens with bcrypt password hashing

## Installation

1. **Install Dependencies**
   ```bash
   cd workout-tracker
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the App**
   - Open your browser to: http://localhost:3001
   - Create an account and start tracking workouts!

## Project Structure

```
workout-tracker/
├── server.js           # Backend API server
├── public/
│   └── index.html      # React frontend application
├── data/              # Auto-generated data directory
│   ├── users.json     # User accounts
│   ├── workouts.json  # Workout logs
│   └── exercises.json # Exercise database (pre-populated)
├── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - Login and receive JWT token

### Exercises
- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/category/:category` - Get exercises by category

### Workouts
- `POST /api/workouts` - Log a new workout
- `GET /api/workouts` - Get user's workout history
- `GET /api/workouts/range?startDate=&endDate=` - Get workouts by date range
- `DELETE /api/workouts/:id` - Delete a workout

## How to Use

### 1. Create an Account
- Click "Need an account? Sign up"
- Enter a username and password (min 6 characters)
- Click "Create Account"

### 2. Log a Workout
- Select a category from the sidebar (Chest, Back, Shoulders, etc.)
- Click on an exercise you want to log
- For **Strength Exercises**: Enter reps and weight for each set
- For **Cardio Exercises**: Enter time and/or distance
- Click "+ Add Set" to add more sets
- Click "Log Workout" to save

### 3. View History
- Click the "Workout History" tab
- See all your past workouts with dates and details
- Delete any workout by clicking the "Delete" button

## Pre-loaded Exercises

The app comes with 75+ exercises pre-loaded:

**Strength Categories:**
- Chest (10 exercises)
- Back (10 exercises)
- Shoulders (10 exercises)
- Legs (12 exercises)
- Biceps (7 exercises)
- Triceps (6 exercises)
- Abs (8 exercises)

**Cardio Category:**
- 12 different cardio exercises including treadmill, bike, elliptical, rowing, swimming, etc.

## Customization

### Adding New Exercises
Edit `data/exercises.json` and add new exercise objects with this format:

**For Strength:**
```json
{
  "id": 76,
  "name": "Exercise Name",
  "category": "Chest",
  "equipment": "Barbell",
  "type": "strength"
}
```

**For Cardio:**
```json
{
  "id": 77,
  "name": "Exercise Name",
  "category": "Cardio",
  "equipment": "Machine",
  "type": "cardio"
}
```

### Changing the Port
Edit `server.js` and change the `PORT` constant (default is 3001).

### Security
**Important**: Change the `JWT_SECRET` in `server.js` before deploying to production!

## Future Enhancements

Some ideas for extending this app:
- Add workout programs/routines
- Progress tracking and charts
- Personal records (PRs) tracking
- Social features (share workouts)
- Exercise instruction videos/images
- Rest timer between sets
- Calendar view of workouts
- Export workout data
- Upgrade to PostgreSQL or MongoDB for production

## Troubleshooting

**Port already in use**: Change the PORT variable in server.js

**Can't connect to server**: Make sure the server is running with `npm start`

**CORS errors**: The frontend makes requests to localhost:3001. If you change the port, update the API_URL in index.html

## License

Free to use and modify for personal or commercial projects.

---

Built with ❤️ for fitness enthusiasts!
