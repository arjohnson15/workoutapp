const https = require('https');
const fs = require('fs');
const path = require('path');

const EXERCISES_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const DATA_DIR = path.join(__dirname, 'data');
const EXERCISES_FILE = path.join(DATA_DIR, 'exercises.json');

console.log('📥 Downloading exercises from free-exercise-db...');

https.get(EXERCISES_URL, (response) => {
  let data = '';

  response.on('data', (chunk) => {
    data += chunk;
  });

  response.on('end', () => {
    try {
      const exercises = JSON.parse(data);
      
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
      }
      
      // Write exercises to file
      fs.writeFileSync(EXERCISES_FILE, JSON.stringify(exercises, null, 2));
      
      console.log(`✅ Successfully downloaded ${exercises.length} exercises!`);
      console.log(`📁 Saved to: ${EXERCISES_FILE}`);
      
      // Show some stats
      const categories = [...new Set(exercises.map(e => e.category))];
      const muscles = [...new Set(exercises.flatMap(e => e.primaryMuscles || []))];
      
      console.log(`\n📊 Exercise Database Stats:`);
      console.log(`   - Total Exercises: ${exercises.length}`);
      console.log(`   - Categories: ${categories.join(', ')}`);
      console.log(`   - Muscle Groups: ${muscles.length}`);
      console.log(`\n✨ You're ready to start tracking workouts!`);
    } catch (error) {
      console.error('❌ Error parsing exercise data:', error.message);
    }
  });
}).on('error', (error) => {
  console.error('❌ Error downloading exercises:', error.message);
  console.log('\n💡 Try downloading manually from:');
  console.log(EXERCISES_URL);
});
