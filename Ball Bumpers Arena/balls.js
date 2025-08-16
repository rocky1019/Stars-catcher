const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const game = document.getElementById("game");
const basket = document.getElementById("basket");
const scoreDisplay = document.getElementById("score");
const gameOverScreen = document.getElementById("game-over");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart");

const bgMusic = document.getElementById("bg-music");
const catchSound = document.getElementById("catch-sound");
const missSound = document.getElementById("miss-sound");

let score = 0;
let lives = 3;
let basketX = 180;
let basketSpeed = 0;
const maxSpeed = 6;
const acceleration = 0.5;
let keys = {};
let gameRunning = false;
let clouds = [];
let starParticles = [];

// Start Game
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameRunning = true;
  bgMusic.volume = 0.3;
  bgMusic.play();
  createClouds();
  createStarParticles();
  createStar();
  gameLoop();
});

// Smooth Controls
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

let dragging = false;
basket.addEventListener("mousedown", () => dragging = true);
document.addEventListener("mouseup", () => dragging = false);
document.addEventListener("mousemove", e => {
  if (dragging) basketX = e.clientX - game.getBoundingClientRect().left - basket.offsetWidth/2;
});

basket.addEventListener("touchstart", () => dragging = true);
document.addEventListener("touchend", () => dragging = false);
document.addEventListener("touchmove", e => {
  if (dragging) basketX = e.touches[0].clientX - game.getBoundingClientRect().left - basket.offsetWidth/2;
});

// Background gradient
let bgHue = 200;
function drawBackground() {
  const hue = bgHue % 360;
  game.style.background = `radial-gradient(circle at top, hsl(${hue},50%,35%), hsl(${hue+40},50%,10%))`;
  bgHue += 0.05;
}

// Clouds & Star Particles
function createClouds() {
  clouds = [];
  for (let i = 0; i < 5; i++) {
    const cloud = document.createElement("div");
    cloud.classList.add("cloud");
    cloud.style.top = Math.random()*150+"px";
    cloud.style.left = Math.random()*400+"px";
    cloud.style.width = 60+Math.random()*60+"px";
    cloud.style.height = 20+Math.random()*20+"px";
    game.appendChild(cloud);
    clouds.push(cloud);
  }
}

function createStarParticles() {
  starParticles = [];
  for (let i = 0; i < 30; i++) {
    const star = document.createElement("div");
    star.classList.add("starParticle");
    star.style.top = Math.random()*300+"px";
    star.style.left = Math.random()*400+"px";
    starParticles.push(star);
    game.appendChild(star);
  }
}

function updateClouds() {
  clouds.forEach(cloud => {
    let x = parseFloat(cloud.style.left);
    x += 0.2;
    if(x>400) x=-80;
    cloud.style.left = x+"px";
  });
}

// Basket Update
function updateBasket() {
  if(keys["ArrowLeft"]||keys["a"]) basketSpeed -= acceleration;
  else if(keys["ArrowRight"]||keys["d"]) basketSpeed += acceleration;
  else basketSpeed *= 0.8;

  if(basketSpeed>maxSpeed) basketSpeed=maxSpeed;
  if(basketSpeed<-maxSpeed) basketSpeed=-maxSpeed;

  basketX += basketSpeed;
  if(basketX<0){ basketX=0; basketSpeed=0; }
  if(basketX>340){ basketX=340; basketSpeed=0; }

  basket.style.left = basketX+"px";
}

// Stars
function createStar() {
  if(!gameRunning) return;

  const star = document.createElement("div");
  let typeChance = Math.random();
  if(typeChance<0.7){ star.classList.add("star"); star.dataset.type="normal"; }
  else if(typeChance<0.9){ star.classList.add("golden-star"); star.dataset.type="golden"; }
  else{ star.classList.add("red-star"); star.dataset.type="red"; }

  star.style.left = Math.floor(Math.random()*380)+"px";
  star.style.top = "0px";
  star.speed = 3 + Math.random()*3; // random speed
  game.appendChild(star);

  let fallInterval = setInterval(()=>{
    if(!gameRunning){ clearInterval(fallInterval); star.remove(); return; }
    let top = parseFloat(star.style.top);
    top += star.speed + Math.min(score/5,5);
    star.style.top = top+"px";

    if(top>560 && top<600){
      let starX = parseFloat(star.style.left);
      if(starX>=basketX-20 && starX<=basketX+60){
        if(star.dataset.type==="normal") score++;
        else if(star.dataset.type==="golden") score+=3;
        else if(star.dataset.type==="red") lives--;

        catchSound.currentTime=0;
        catchSound.play();
        updateUI();
        star.remove();
        clearInterval(fallInterval);
        if(lives<=0) gameOver();
      }
    }

if(top >= 600){
    if(star.dataset.type === "normal") {
        lives--;            // lose life for missing normal star
        missSound.play();
        updateUI();
        if(lives <= 0) gameOver();
    }
    // red stars do NOT penalize when missed
    // golden stars are optional, no penalty if missed
    star.remove();
    clearInterval(fallInterval);
}


  },30);

  setTimeout(createStar, 1000 - Math.min(score*10,700));
}

// UI Update
function updateUI(){
  scoreDisplay.innerText = `Score: ${score} | ❤️ ${lives}`;
}

// Game Over
function gameOver(){
  gameRunning=false;
  finalScore.innerText = `Your Score: ${score}`;
  gameOverScreen.style.display="block";
}

// Restart
restartBtn.addEventListener("click", ()=>{
  score=0; lives=3;
  basketX=180; basket.style.left=basketX+"px";
  gameOverScreen.style.display="none";
  updateUI();
  gameRunning=true;
  createStar();
});

// Main Loop
function gameLoop(){
  drawBackground();
  updateClouds();
  updateBasket();
  requestAnimationFrame(gameLoop);
}
basket.addEventListener("touchmove", (e)=>{
  const touchX = e.touches[0].clientX - game.getBoundingClientRect().left;
  basketX = Math.min(Math.max(touchX - basket.offsetWidth/2, 0), game.offsetWidth - basket.offsetWidth);
  basket.style.left = basketX + "px";
});
