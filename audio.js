/* audio.js - Audio Management for Ultimate Tailwind Snake Game */

// Load audio assets (place your MP3 files in the assets folder)
const eatSound = new Audio('assets/eat.mp3');
const gameOverSound = new Audio('assets/gameover.mp3');
const backgroundMusic = new Audio('assets/background.mp3');

// Set initial volumes and loop settings
eatSound.volume = settings.sfxVolume;
gameOverSound.volume = settings.sfxVolume;
backgroundMusic.volume = settings.musicVolume;
backgroundMusic.loop = true;

// Function to update volumes when settings change
function updateAudioVolumes() {
  eatSound.volume = settings.sfxVolume;
  gameOverSound.volume = settings.sfxVolume;
  backgroundMusic.volume = settings.musicVolume;
}

// Play the eat sound effect
function playEatSound() {
  try {
    eatSound.currentTime = 0;
    eatSound.play();
  } catch (error) {
    console.error("Error playing eat sound:", error);
  }
}

// Play the game over sound effect
function playGameOverSound() {
  try {
    gameOverSound.currentTime = 0;
    gameOverSound.play();
  } catch (error) {
    console.error("Error playing game over sound:", error);
  }
}

// Play background music
function playBackgroundMusic() {
  try {
    backgroundMusic.play();
  } catch (error) {
    console.error("Error playing background music:", error);
  }
}

// Stop background music
function stopBackgroundMusic() {
  backgroundMusic.pause();
}

// Listen for changes in volume settings
document.getElementById('musicVolume').addEventListener('change', updateAudioVolumes);
document.getElementById('sfxVolume').addEventListener('change', updateAudioVolumes);
