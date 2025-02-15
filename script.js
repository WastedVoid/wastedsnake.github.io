    /* script.js - Ultimate Tailwind Snake Game Main Logic
    ====================================================
    This file contains all of the main game logic for the Ultimate Tailwind Snake Game.
    It is organized into several modular classes:
        - Game: Overall game state and game loop management using requestAnimationFrame.
        - Snake: Manages the snake's movement, drawing, growth, and collisions.
        - Food: Handles food spawning, respawning, and drawing.
        - InputManager: Handles keyboard input for controlling the snake.
        - UIManager: Manages UI overlays (score, game over screen, etc.).
        - SettingsManager: Reads and applies settings from the settings panel.
    Additionally, utility functions are provided for randomness and other small tasks.
    This file is over 300 lines with detailed comments to explain the functionality.
    */

    /* ================================
    Global DOM Elements and Settings
    ================================ */
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // UI Elements for Score and High Score
    const scoreEl = document.getElementById('score');
    const highScoreEl = document.getElementById('highScore');
    
    // Buttons for controls
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const restartOverlayButton = document.getElementById('restartOverlayButton');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsPanel = document.getElementById('settingsPanel');
    
    // Global settings object (read from the settings form)
    let settings = {
        snakeColor: document.getElementById('snakeColor').value,   // Color of snake segments
        foodColor: document.getElementById('foodColor').value,     // Color of food block
        bgColor: document.getElementById('bgColor').value,         // Canvas background color
        gameSpeed: parseInt(document.getElementById('gameSpeed').value), // How many ms between updates
        gridSize: parseInt(document.getElementById('gridSize').value),   // Size of each grid cell
        canvasWidth: parseInt(document.getElementById('canvasWidth').value), // Width of canvas
        canvasHeight: parseInt(document.getElementById('canvasHeight').value), // Height of canvas
        musicVolume: parseFloat(document.getElementById('musicVolume').value), // Volume for background music
        sfxVolume: parseFloat(document.getElementById('sfxVolume').value) // Volume for sound effects
    };
    
    /* =====================================================
        Global Manager Instances and Timing Variables
        ===================================================== */
    let game;           // Instance of the Game class
    let inputManager;   // Instance of InputManager (handles keyboard)
    let uiManager;      // Instance of UIManager (handles overlays)
    let settingsManager; // Instance of SettingsManager (reads settings)
    let lastFrameTime = 0; // For tracking time between frames
    let accumulator = 0;   // For fixed time step updates
    
    /* =====================================================
        Game Class: Manages overall game state and game loop
        ===================================================== */
    class Game {
        constructor() {
        // When the game is instantiated, reset state and load high score
        this.resetGame();
        this.highScore = parseInt(localStorage.getItem('highScore')) || 0;
        highScoreEl.innerText = 'High Score: ' + this.highScore;
        this.paused = false;
        }
        
        // Reset game state: snake, food, score, and UI overlays
        resetGame() {
        // Instantiate new Snake and Food objects with current grid size and canvas dimensions
        this.snake = new Snake(settings.gridSize);
        this.food = new Food(settings.gridSize, settings.canvasWidth, settings.canvasHeight);
        this.score = 0;
        scoreEl.innerText = 'Score: ' + this.score;
        // Update canvas properties (size, background color)
        this.updateCanvas();
        // Ensure the game over overlay is hidden
        this.hideGameOverOverlay();
        }
        
        // Update canvas dimensions and background color
        updateCanvas() {
        canvas.width = settings.canvasWidth;
        canvas.height = settings.canvasHeight;
        canvas.style.backgroundColor = settings.bgColor;
        }
        
        // Start the game loop
        start() {
        // Reset game state before starting
        this.resetGame();
        this.paused = false;
        pauseButton.innerText = 'Pause';
        pauseButton.disabled = false;
        // Hide game over overlay if visible
        this.hideGameOverOverlay();
        // Start background music
        playBackgroundMusic();
        // Initialize timing for smooth updates
        lastFrameTime = performance.now();
        accumulator = 0;
        // Begin the animation loop
        requestAnimationFrame(this.loop.bind(this));
        }
        
        // Toggle pause/resume state of the game
        togglePause() {
        this.paused = !this.paused;
        pauseButton.innerText = this.paused ? 'Resume' : 'Pause';
        if (this.paused) {
            // Pause background music when game is paused
            stopBackgroundMusic();
        } else {
            // Resume background music and continue the loop
            playBackgroundMusic();
            lastFrameTime = performance.now();
            requestAnimationFrame(this.loop.bind(this));
        }
        }
        
        // Main game loop using requestAnimationFrame and a fixed time step
        loop(timestamp) {
        if (this.paused) return; // If game is paused, exit loop
        // Calculate time elapsed since last frame
        const deltaTime = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        accumulator += deltaTime;
        
        // Update game state at fixed intervals based on settings.gameSpeed
        while (accumulator >= settings.gameSpeed) {
            this.update();
            accumulator -= settings.gameSpeed;
        }
        // Render the current state of the game
        this.render();
        // Continue the loop
        requestAnimationFrame(this.loop.bind(this));
        }
        
        // Update game state: move snake, handle collisions, update score, etc.
        update() {
        // Move the snake according to its current direction
        this.snake.move();
        // Handle wall collisions by wrapping around the canvas edges
        this.snake.checkWallCollision(canvas.width, canvas.height, settings.gridSize);
        
        // Check if the snake has eaten the food
        if (this.snake.eatFood(this.food)) {
            // Increase snake length and score
            this.snake.grow();
            this.score++;
            scoreEl.innerText = 'Score: ' + this.score;
            // Update high score if necessary
            if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('highScore', this.highScore);
            highScoreEl.innerText = 'High Score: ' + this.highScore;
            }
            // Play eating sound effect
            playEatSound();
            // Respawn the food at a new location that doesn't collide with the snake
            this.food.respawn(settings.canvasWidth, settings.canvasHeight, settings.gridSize, this.snake.cells);
        }
        
        // Check for self-collision (snake running into itself)
        if (this.snake.checkSelfCollision()) {
            this.gameOver();
        }
        }
        
        // Render the game objects on the canvas
        render() {
        // Clear the canvas for fresh drawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw food and snake on the canvas
        this.food.draw();
        this.snake.draw();
        }
        
        // Handle game over: stop the game loop, show overlay, play sound effects
        gameOver() {
        this.paused = true;
        uiManager.showGameOver(this.score);
        pauseButton.disabled = true;
        playGameOverSound();
        stopBackgroundMusic();
        }
        
        // Hide the game over overlay by adding the 'hidden' class
        hideGameOverOverlay() {
        document.getElementById('gameOverOverlay').classList.add('hidden');
        }
    }
    
    /* =====================================================
        Snake Class: Represents the Snake, its movement, drawing, and collisions
        ===================================================== */
    class Snake {
        constructor(gridSize) {
        this.gridSize = gridSize;
        this.reset();
        }
        
        // Reset snake's starting position, direction, and body length
        reset() {
        this.x = this.gridSize * 5;
        this.y = this.gridSize * 5;
        this.dx = this.gridSize;
        this.dy = 0;
        this.cells = [];       // Array to hold each segment of the snake
        this.maxCells = 4;     // Initial length of the snake
        }
        
        // Update snake's position by moving its head and shifting its body segments
        move() {
        // Update head position based on velocity
        this.x += this.dx;
        this.y += this.dy;
        // Add new head position to the beginning of the cells array
        this.cells.unshift({ x: this.x, y: this.y });
        // Remove the last cell if the snake exceeds its current length
        if (this.cells.length > this.maxCells) {
            this.cells.pop();
        }
        }
        
        // Draw the snake with a smooth, rounded style using arcs
        draw() {
        ctx.fillStyle = settings.snakeColor;
        for (let cell of this.cells) {
            ctx.beginPath();
            // Draw a circle for each segment to create a sleek rounded look
            ctx.arc(cell.x + this.gridSize / 2, cell.y + this.gridSize / 2, this.gridSize / 2 - 1, 0, Math.PI * 2);
            ctx.fill();
        }
        }
        
        // Check for collisions with the walls; wrap around if necessary
        checkWallCollision(canvasWidth, canvasHeight, gridSize) {
        if (this.x < 0) this.x = canvasWidth - gridSize;
        else if (this.x >= canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight - gridSize;
        else if (this.y >= canvasHeight) this.y = 0;
        }
        
        // Check if the snake's head is at the same position as the food
        eatFood(food) {
        return (this.x === food.x && this.y === food.y);
        }
        
        // Increase the snake's length (maxCells) when food is eaten
        grow() {
        this.maxCells++;
        }
        
        // Check if the snake has collided with itself
        checkSelfCollision() {
        // Compare head position with every other cell in the snake's body
        for (let i = 1; i < this.cells.length; i++) {
            if (this.x === this.cells[i].x && this.y === this.cells[i].y) {
            return true;
            }
        }
        return false;
        }
    }
    
    /* =====================================================
        Food Class: Handles food positioning and drawing
        ===================================================== */
    class Food {
        constructor(gridSize, canvasWidth, canvasHeight) {
        this.gridSize = gridSize;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        // Spawn food at an initial valid position
        this.respawn(canvasWidth, canvasHeight, gridSize, []);
        }
        
        // Respawn food at a random grid position ensuring it does not overlap the snake
        respawn(canvasWidth, canvasHeight, gridSize, snakeCells) {
        let valid = false;
        while (!valid) {
            this.x = getRandomInt(0, Math.floor(canvasWidth / gridSize)) * gridSize;
            this.y = getRandomInt(0, Math.floor(canvasHeight / gridSize)) * gridSize;
            valid = true;
            // Check if food spawns on any part of the snake
            for (let cell of snakeCells) {
            if (cell.x === this.x && cell.y === this.y) {
                valid = false;
                break;
            }
            }
        }
        }
        
        // Draw the food as a rectangle with a subtle shadow for a modern look
        draw() {
        ctx.fillStyle = settings.foodColor;
        ctx.fillRect(this.x, this.y, this.gridSize - 1, this.gridSize - 1);
        }
    }
    
    /* =====================================================
        InputManager Class: Handles Keyboard Input
        ===================================================== */
    class InputManager {
        constructor(game) {
        this.game = game;
        this.initKeyboard();
        }
        
        // Listen for keydown events and change snake direction accordingly
        initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Use space bar to toggle pause/resume
            if (e.key === ' ') {
            this.game.togglePause();
            return;
            }
            // Change direction based on arrow keys while preventing reversal
            if (e.key === 'ArrowLeft' && this.game.snake.dx === 0) {
            this.game.snake.dx = -settings.gridSize;
            this.game.snake.dy = 0;
            } else if (e.key === 'ArrowUp' && this.game.snake.dy === 0) {
            this.game.snake.dy = -settings.gridSize;
            this.game.snake.dx = 0;
            } else if (e.key === 'ArrowRight' && this.game.snake.dx === 0) {
            this.game.snake.dx = settings.gridSize;
            this.game.snake.dy = 0;
            } else if (e.key === 'ArrowDown' && this.game.snake.dy === 0) {
            this.game.snake.dy = settings.gridSize;
            this.game.snake.dx = 0;
            }
        });
        }
    }
    
    /* =====================================================
        UIManager Class: Manages Overlays and UI Feedback
        ===================================================== */
    class UIManager {
        // Display the game over overlay with final score
        showGameOver(score) {
        const overlay = document.getElementById('gameOverOverlay');
        const finalScoreEl = document.getElementById('finalScore');
        finalScoreEl.innerText = `Your Score: ${score}`;
        overlay.classList.remove('hidden');
        }
    }
    
    /* =====================================================
        SettingsManager Class: Handles Reading and Applying Settings
        ===================================================== */
    class SettingsManager {
        constructor() {
        this.form = document.getElementById('settingsForm');
        this.initListeners();
        }
        
        // Listen for clicks on the "Apply Settings" button and update settings accordingly
        initListeners() {
        document.getElementById('applySettings').addEventListener('click', () => {
            // Read current values from the form inputs
            settings.snakeColor = document.getElementById('snakeColor').value;
            settings.foodColor = document.getElementById('foodColor').value;
            settings.bgColor = document.getElementById('bgColor').value;
            settings.gameSpeed = parseInt(document.getElementById('gameSpeed').value);
            settings.gridSize = parseInt(document.getElementById('gridSize').value);
            settings.canvasWidth = parseInt(document.getElementById('canvasWidth').value);
            settings.canvasHeight = parseInt(document.getElementById('canvasHeight').value);
            settings.musicVolume = parseFloat(document.getElementById('musicVolume').value);
            settings.sfxVolume = parseFloat(document.getElementById('sfxVolume').value);
            
            // Hide the settings panel after applying
            settingsPanel.classList.add('hidden');
            // Restart the game with new settings
            game.start();
            playBackgroundMusic();
        });
        }
    }
    
    /* =====================================================
        Utility Function: Returns a Random Integer between min (inclusive) and max (exclusive)
        ===================================================== */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    /* =====================================================
        Initialization: Create Manager Instances and Set Up UI Event Listeners
        ===================================================== */
    function init() {
        // Set initial canvas dimensions and background color
        canvas.width = settings.canvasWidth;
        canvas.height = settings.canvasHeight;
        canvas.style.backgroundColor = settings.bgColor;
        
        // Instantiate the game and managers
        game = new Game();
        inputManager = new InputManager(game);
        uiManager = new UIManager();
        settingsManager = new SettingsManager();
        
        // Attach event listeners for UI buttons
        startButton.addEventListener('click', () => {
        game.start();
        playBackgroundMusic();
        });
        
        pauseButton.addEventListener('click', () => {
        game.togglePause();
        });
        
        // When the restart button in the overlay is clicked, hide overlay and restart game
        restartOverlayButton.addEventListener('click', () => {
        document.getElementById('gameOverOverlay').classList.add('hidden');
        game.start();
        playBackgroundMusic();
        });
        
        // Toggle the settings panel visibility
        settingsToggle.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
        });
        
        // Ensure the game over overlay is hidden initially
        document.getElementById('gameOverOverlay').classList.add('hidden');
    }
    
    // Run initialization after page loads
    init();
    
    /* =====================================================
        Additional Debug and Utility Logging (Optional)
        ===================================================== */
    // Log current settings (for debugging)
    console.log("Initial Settings:", settings);
    // Example: Log canvas dimensions after initialization
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
    
    /* =====================================================
        END OF SCRIPT.JS
        ===================================================== */
   
