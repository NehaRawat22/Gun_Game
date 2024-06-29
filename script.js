// Fetch the canvas element from the HTML
const canvas = document.getElementById("gameCanvas");
// Get the 2D rendering context for the canvas
const ctx = canvas.getContext("2d");

// Define the gun object and its properties
let gun = {
    x: canvas.width / 2 - 25, // Horizontal position (center of canvas, offset by half of the gun's width)
    y: canvas.height - 100,    // Vertical position (bottom of the canvas)
    width: 50,                // Width of the gun
    height: 80,               // Height of the gun
    dx: 20                    // Change in x-direction for movement
};

// An array to store the bullets
let bullets = [];

// Define the target object and its properties
let target = {
    x: 100,                   // Initial horizontal position
    y: 50,                    // Vertical position
    radius: 20,               // Radius of the target
    dx: 2                     // Change in x-direction for movement (reduced speed)
};

// Load the bullet sound effect
let bulletSound = new Audio('bulletFire.mp3');
let gameOverSound = new Audio('gameOver.wav');

// Game variables
let score = 0; // Player's current score
// Fetch high score from local storage or set it to 0 if not available
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let spacePressed = false;    // Track if the spacebar is pressed
let gameState = "notStarted"; // Current game state (notStarted, ongoing, ended)
let consecutiveMisses = 0;   // Track consecutive missed shots

let monsterImg = new Image();
monsterImg.src = "monsterimage.png"; // path to your monster image

let bulletImg = new Image();
bulletImg.src = "bulletimage.png"; // path to your bullet image

let gunImg = new Image();
gunImg.src = "gunimage.png"; // path to your gun image

// Function to draw the gun
function drawGun() {
    ctx.drawImage(gunImg, gun.x, gun.y, gun.width, gun.height);
}

// Function to draw bullets
function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= 5; // Move bullet upwards
        ctx.drawImage(bulletImg, bullet.x, bullet.y, bullet.width, bullet.height);
        // Remove bullet if it goes off the canvas
        if (bullet.y < 0) {
            bullets.splice(index, 1);
            consecutiveMisses++;
            score -= 2; // Deduct score for missed bullet
            updateScoreDisplay();
            if (consecutiveMisses >= 3) { // End game after 3 consecutive misses
                endGame();
            }
        }
    });
}

// Function to draw the target
function drawTarget() {
    ctx.drawImage(monsterImg, target.x - target.radius, target.y - target.radius, target.radius * 2, target.radius * 2);
}

// Function to reset game variables
function resetGame() {
    score = 0;
    bullets = [];
    target.x = Math.random() * (canvas.width - target.radius * 2) + target.radius;
    target.y = Math.random() * (canvas.height / 2 - target.radius * 2) + target.radius;
    consecutiveMisses = 0;
    updateScoreDisplay(); // Update score display after reset
    updateHighScoreDisplay(); // Update high score display after reset
}

// Function to end the game
function endGame() {
    gameState = "ended";
    gameOverSound.play();
    ctx.fillStyle = '#880808';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '48px serif';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        updateHighScoreDisplay(); // Update high score display after new high score
    }
}

// Function to update the current score display
function updateScoreDisplay() {
    document.getElementById("currentScore").textContent = score;
}

// Function to update the highest score display
function updateHighScoreDisplay() {
    document.getElementById("highestScore").textContent = highScore;
}

// Function to update the game
function update() {
    if (gameState !== "ongoing") return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGun();
    drawBullets();
    drawTarget();
    target.x += target.dx;
    if (target.x < target.radius || target.x > canvas.width - target.radius) {
        target.dx = -target.dx;
    }
    bullets.forEach((bullet, index) => {
        const dist = Math.hypot(bullet.x - target.x, bullet.y - target.y);
        if (dist < target.radius) {
            bullets.splice(index, 1);
            score += 5;
            updateScoreDisplay(); // Update score display after score increment
            target.x = Math.random() * (canvas.width - target.radius * 2) + target.radius;
            target.y = Math.random() * (canvas.height / 2 - target.radius * 2) + target.radius;
            consecutiveMisses = 0; // Reset consecutive misses on hit
            if (score > 50) {
                target.dx *= 1.1;
            }
        }
    });
    requestAnimationFrame(update);
}

// Add event listeners for keydown
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' && gun.x > 0) {
        gun.x -= gun.dx;
    } else if (e.key === 'ArrowRight' && gun.x < canvas.width - gun.width) {
        gun.x += gun.dx;
    } else if (e.key === ' ' && gameState === "ongoing") {
        bullets.push({ x: gun.x + gun.width / 2 - 2.5, y: gun.y, width: 5, height: 10 });
        bulletSound.play();
        spacePressed = true;
    } else if (e.key === 'Enter' && gameState === "notStarted") {
        gameState = "ongoing";
        resetGame();
        gameLoop();
    }
});

// Add event listener for start game button
document.getElementById("startGameBtn").addEventListener('click', () => {
    if (gameState === "notStarted" || gameState === "ended") {
        gameState = "ongoing";
        resetGame();
        gameLoop();
    }
});

// Start the game loop
function gameLoop() {
    update();
}

// Initial draw
ctx.fillStyle = 'black';
ctx.font = '24px serif';
ctx.fillText('Press Enter or Click Start to Begin', canvas.width / 2 - 200, canvas.height / 2 + 30);

// Initial update of high score display
updateHighScoreDisplay();