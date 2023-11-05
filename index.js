const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const barThickness = 10;
const ball = {
  x: canvas.width / 2,
  y: 50, // Start at the middle-top of the canvas
  radius: 10,
  dx: 0, // Change in x (horizontal movement)
  onBar: true,
};

const bar = {
  leftX: 0,
  rightX: canvas.width,
  y: canvas.height - 50,
  leftY: canvas.height - 50,
  rightY: canvas.height - 50,
  width: 10,
  moveSpeed: 3, // The speed at which each end of the bar moves
};

const maxAngle = (30 * Math.PI) / 180; // Convert maximum angle to radians
let gravity = 25; // Gravity effect on the ball's rolling

const targetHole = {
  x: canvas.width / 2,
  y: 30,
  radius: 12,
  isTarget: true, // A property to indicate that this is the target hole
};

// Key state tracking
let keysPressed = {
  i: false,
  j: false,
  w: false,
  s: false,
};

// Seeded random number generator function
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadSeedFromLocalStorage() {
  let storedSeed = localStorage.getItem("gameSeed");
  if (storedSeed === null) {
    // If there's no seed in local storage, generate a new random seed
    storedSeed = Math.floor(Math.random() * 10000);
    localStorage.setItem("gameSeed", storedSeed.toString());
  }
  return parseInt(storedSeed, 10);
}

seed = loadSeedFromLocalStorage(); // Set the seed
rand = mulberry32(seed); // Initialize the RNG with the seed

function saveSeedToLocalStorage() {
  localStorage.setItem("gameSeed", seed.toString());
}

function changeSeedAndRegenerateHoles() {
  // Logic to change the seed and regenerate holes
  seed = Math.floor(Math.random() * 10000); // Generate a new random seed
  localStorage.setItem("gameSeed", seed.toString()); // Save new seed to local storage
  rand = mulberry32(seed); // Update the random number generator with new seed

  holes.length = 0; // Clear existing holes
  holes.push(...generateHoles(50, canvas.width, canvas.height / 2, 11)); // Regenerate holes
  holes.push(targetHole); // Add the target hole back in

  // Redraw the canvas or reset any necessary state
}

// Generate holes randomly on the top half of the canvas
const holes = generateHoles(50, canvas.width, canvas.height / 2, 11);
holes.push(targetHole);
function generateHoles(holeCount, maxWidth, maxHeight, holeRadius) {
  const holes = [];
  while (holes.length < holeCount) {
    let newHole = {
      x: rand() * maxWidth,
      y: rand() * maxHeight,
      radius: holeRadius,
    };

    // Check that the new hole doesn't overlap with existing holes
    let overlapping = holes.some((hole) => {
      const dx = newHole.x - hole.x;
      const dy = newHole.y - hole.y;
      return Math.sqrt(dx * dx + dy * dy) < 2 * holeRadius;
    });

    // Add the hole if it doesn't overlap
    if (!overlapping) {
      holes.push(newHole);
    }
  }
  return holes;
}

// Drawing and updating functions

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBar() {
  ctx.beginPath();
  ctx.moveTo(bar.leftX, bar.leftY);
  ctx.lineTo(bar.rightX, bar.rightY);
  ctx.strokeStyle = "#000";
  ctx.lineWidth = barThickness;
  ctx.stroke();
  ctx.closePath();
}

function drawHoles() {
  holes.forEach((hole) => {
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
    ctx.fillStyle = hole.isTarget ? "#00ff00" : "#000"; // Red for the target hole, black for others
    ctx.fill();
    ctx.closePath();
  });
}

function checkBallInHole() {
  let enteredHole = null;
  holes.forEach((hole) => {
    const dx = ball.x - hole.x;
    const dy = ball.y - hole.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < hole.radius) {
      enteredHole = hole;
    }
  });
  return enteredHole;
}

function isSlopeWithinLimit(newLeftY, newRightY) {
  const deltaY = newRightY - newLeftY;
  const deltaX = bar.rightX - bar.leftX;
  const angle = Math.atan2(deltaY, deltaX);
  return Math.abs(angle) <= maxAngle;
}

function updateBarPosition() {
  let newLeftY = bar.leftY;
  let newRightY = bar.rightY;

  if (keysPressed["w"] && newLeftY - bar.moveSpeed >= 0)
    newLeftY -= bar.moveSpeed;
  if (
    keysPressed["s"] &&
    newLeftY + bar.moveSpeed + barThickness <= canvas.height
  )
    newLeftY += bar.moveSpeed;
  if (keysPressed["i"] && newRightY - bar.moveSpeed >= 0)
    newRightY -= bar.moveSpeed;
  if (
    keysPressed["j"] &&
    newRightY + bar.moveSpeed + barThickness <= canvas.height
  )
    newRightY += bar.moveSpeed;

  if (isSlopeWithinLimit(newLeftY, newRightY)) {
    bar.leftY = newLeftY;
    bar.rightY = newRightY;
  }
}

function handleKeyDown(event) {
  if (["i", "j", "w", "s"].includes(event.key)) {
    keysPressed[event.key] = true;
  }
}

function handleKeyUp(event) {
  if (["i", "j", "w", "s"].includes(event.key)) {
    keysPressed[event.key] = false;
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updateBarPosition();

  let slope = (bar.rightY - bar.leftY) / (bar.rightX - bar.leftX);
  ball.dx = slope * gravity;

  ball.x += ball.dx;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.dx = -ball.dx;
  } else if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.dx = -ball.dx;
  }

  ball.y = slope * (ball.x - bar.leftX) + bar.leftY - ball.radius;

  if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
  }

  drawBall();
  drawBar();
  drawHoles();

  const holeResult = checkBallInHole();
  if (holeResult) {
    if (holeResult.isTarget) {
      displayVictoryScreen(); // If the ball is in the target hole, display the victory screen
      setTimeout(function () {
        window.location.reload();
      }, 2000);
    } else {
      displayYouSuckScreen();
      setTimeout(function () {
        window.location.reload();
      }, 2000);
      console.log("Game Over!"); // Regular hole, game over
      // Handle regular hole game over
    }
  } else {
    animationFrameId = requestAnimationFrame(update);
  }
}

let animationFrameId = requestAnimationFrame(update); // Keep track of the animation frame ID to cancel it later

function displayVictoryScreen() {
  // Stop the game loop
  cancelAnimationFrame(animationFrameId);

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "50px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText("nice i guess", canvas.width / 10, canvas.height / 10);
}

function displayYouSuckScreen() {
  cancelAnimationFrame(animationFrameId);

  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "80px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "left";
  ctx.fillText("u suck", canvas.width / 10, canvas.height / 10);
}

function resetGame() {
  cancelAnimationFrame(animationFrameId);
  // Reset ball position and velocity
  ball.x = canvas.width / 2;
  ball.y = 50; // Start at the middle-top of the canvas
  ball.dx = 0;

  // Reset bar position
  bar.leftY = canvas.height - 50;
  bar.rightY = canvas.height - 50;

  // Reset key presses
  keysPressed = {
    i: false,
    j: false,
    w: false,
    s: false,
  };

  // Start the animation again
  animationFrameId = requestAnimationFrame(update);
}

function getDifficultyLevel(value, max) {
  const segments = ['super lil bitch', 'lil bitch', 'ok', 'dam', 'yeah right'];
  const index = Math.floor((value / max) * (segments.length - 1));
  return segments[index];
}

function interpretBarSpeed(value) {
  const scalingFactor = 0.8; // Example scaling factor
  return value * scalingFactor;
}

function interpretBallAcceleration(value) {
  const scalingFactor = 0.8; // Example scaling factor
  return value * scalingFactor;
}


function initializeSliders() {
  const barSpeedSlider = document.getElementById('barSpeed');
 const savedBarSpeed = localStorage.getItem('barSpeed');
  if (savedBarSpeed !== null) {
    const barSpeedSlider = document.getElementById('barSpeed');
    barSpeedSlider.value = savedBarSpeed;
    // Use the interpreted value for game logic
    bar.moveSpeed = interpretBarSpeed(parseInt(savedBarSpeed, 10));
    document.getElementById('barSpeedValue').textContent = getDifficultyLevel(savedBarSpeed, barSpeedSlider.max);
  }

  const ballAccelerationSlider = document.getElementById('ballAcceleration');
  const savedBallAcceleration = localStorage.getItem('ballAcceleration');
  if (savedBallAcceleration !== null) {
    const ballAccelerationSlider = document.getElementById('ballAcceleration');
    ballAccelerationSlider.value = savedBallAcceleration;
    gravity = interpretBallAcceleration(parseInt(savedBallAcceleration, 10)); // Use the interpreted value for game logic
    document.getElementById('ballAccelerationValue').textContent = getDifficultyLevel(savedBallAcceleration, ballAccelerationSlider.max);
  }

}

// Call this function when the page loads
initializeSliders();


function adjustContainerWidth() {
  const canvas = document.getElementById("gameCanvas");
  const gameContainer = document.getElementById("gameContainer");
  gameContainer.style.width = `${canvas.offsetWidth}px`;
}

// Call this function whenever the canvas size changes
adjustContainerWidth();

// Optionally, call it on window resize if the canvas size is responsive
window.addEventListener("resize", adjustContainerWidth);

update();

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("changeSeedButton")
    .addEventListener("click", changeSeedAndRegenerateHoles);
  
    document.getElementById('barSpeed').addEventListener('input', function(e) {
      const barSpeedValue = e.target.value;
      localStorage.setItem('barSpeed', barSpeedValue);
      bar.moveSpeed = interpretBarSpeed(parseInt(barSpeedValue, 10));
      document.getElementById('barSpeedValue').textContent = getDifficultyLevel(barSpeedValue, e.target.max);
    });
    
    document.getElementById('ballAcceleration').addEventListener('input', function(e) {
      const ballAccelerationValue = e.target.value;
      localStorage.setItem('ballAcceleration', ballAccelerationValue);
      gravity = interpretBallAcceleration(parseInt(ballAccelerationValue, 10));
      document.getElementById('ballAccelerationValue').textContent = getDifficultyLevel(ballAccelerationValue, e.target.max);
    });
});
