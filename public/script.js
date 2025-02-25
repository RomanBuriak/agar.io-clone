const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let playerId = null;
let players = {};
let food = [];
let grid = [];
let scale = 1;
const gameWidth = 4000; // Розміри ігрового поля
const gameHeight = 4000;
const socket = new WebSocket("ws://localhost:3000");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "init") {
    playerId = data.id;
    food = data.food;
    grid = data.grid;
  } else if (data.type === "update") {
    players = data.players;
    food = data.food;
    grid = data.grid;
  }
  // else if (data.type === "eaten") {
  //   alert("Вас з'їли! Перезапустіть сторінку.");
  //   location.reload();
  // }
};

// Позиція миші
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
canvas.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

// Оновлення гри
function update() {
  if (!playerId || !players[playerId]) return;

  const player = players[playerId];
  // const dx = mouse.x - player.x;
  // const dy = mouse.y - player.y;

  // різниця між координатами курсора і центру екрану
  const dx = mouse.x - canvas.width / 2;
  const dy = mouse.y - canvas.height / 2;

  const distance = Math.sqrt(dx * dx + dy * dy);
  // dx > player.x && dy > player.y (distance > 1)
  if (distance > 1) {
    // console.log("mouse.x y " + mouse.x + " " + mouse.y);
    // console.log();
    // console.log("player.x y" + player.x + " " + player.y);

    player.x += (dx / distance) * 2;
    player.y += (dy / distance) * 2;

    // player.x += 2;
    // player.y += 2;

    // player.x = Math.max(0, Math.min(gameWidth, player.x));
    // player.y = Math.max(0, Math.min(gameHeight, player.y));
    // if (Math.abs(player.x) > 4000  !Math.abs(player.y) === 4000) {

    // }
    // if (player.x > gameWidth) player.x = gameWidth;
    // if (player.y > gameHeight) player.y = gameHeight;
    // if (player.y < 0) player.y = 0;
    // if (player.x < 0) player.x = 0;

    player.x = Math.max(0, Math.min(gameWidth, player.x));
    player.y = Math.max(0, Math.min(gameHeight, player.y));

    socket.send(JSON.stringify({ type: "move", x: player.x, y: player.y }));
  }
}

// function drawGrid() {
//   const gridSize = 50; // Розмір клітинки

//   // Знаходимо верхній лівий кут, звідки почати малювати
//   const startX = 0;
//   const startY = 0;

//   ctx.strokeStyle = "#ddd"; // Колір сітки
//   ctx.lineWidth = 1;

//   for (let g of grid) {
//     ctx.beginPath();
//     ctx.moveTo(g.x + offsetX, 0);
//     ctx.lineTo(g.x + offsetX, canvas.height);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(0, g.y + offsetY);
//     ctx.lineTo(canvas.width, g.y + offsetY);
//     ctx.stroke();
//   }

//   // Малюємо вертикальні лінії
//   // for (let x = startX; x < canvas.width; x += gridSize) {
//   //   ctx.beginPath();
//   //   ctx.moveTo(x, 0);
//   //   ctx.lineTo(x, canvas.height);
//   //   ctx.stroke();
//   // }

//   // // Малюємо горизонтальні лінії
//   // for (let y = startY; y < canvas.height; y += gridSize) {
//   //   ctx.beginPath();
//   //   ctx.moveTo(0, y);
//   //   ctx.lineTo(canvas.width, y);
//   //   ctx.stroke();
//   // }
// }

// Малюємо гру
// function draw() {
//   ctx.clearRect(0, 0, canvas.width, canvas.height);

//   if (!playerId || !players[playerId]) return;

//   const player = players[playerId];

//   // Визначаємо масштаб: чим більше радіус, тим менший масштаб
//   let scale = Math.max(0.5, Math.min(3, 30 / player.radius));

//   // Визначаємо зміщення (зміщуємо світ відносно гравця)
//   const offsetX = canvas.width / 2 - player.x;
//   const offsetY = canvas.height / 2 - player.y;
//   // const cameraX = player.x - canvas.width / 2;
//   // const cameraY = player.y - canvas.height / 2;

//   ctx.lineWidth = 50;
//   ctx.beginPath();
//   ctx.moveTo(0 + offsetX, 0 + offsetY);
//   ctx.lineTo(gameWidth + offsetX, 0 + offsetY);
//   ctx.lineTo(gameWidth + offsetX, gameHeight + offsetY);
//   ctx.lineTo(0 + offsetX, gameHeight + offsetY);
//   ctx.lineTo(0 + offsetX, -25 + offsetY);
//   ctx.stroke();

//   // Малюємо фон-сітку
//   ctx.strokeStyle = "#ddd"; // Колір сітки
//   ctx.lineWidth = 1;

//   for (let g of grid) {
//     ctx.beginPath();
//     ctx.moveTo(g.x + offsetX, 0);
//     ctx.lineTo(g.x + offsetX, canvas.height);
//     // ctx.moveTo(g.x, 0);
//     // ctx.lineTo(g.x, canvas.height);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(0, g.y + offsetY);
//     ctx.lineTo(canvas.width, g.y + offsetY);
//     // ctx.moveTo(0, g.y);
//     // ctx.lineTo(canvas.width, g.y);
//     ctx.stroke();
//   }

//   // Малюємо їжу
//   for (let f of food) {
//     ctx.beginPath();
//     // ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
//     ctx.arc(f.x + offsetX, f.y + offsetY, f.radius, 0, Math.PI * 2);
//     // ctx.arc(f.x - cameraX, f.y - cameraY, f.radius, 0, Math.PI * 2);
//     ctx.fillStyle = f.color;
//     ctx.fill();
//     // ctx.closePath();
//   }

//   // Малюємо всіх гравців
//   for (let id in players) {
//     const p = players[id];
//     ctx.beginPath();
//     // ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
//     ctx.arc(p.x + offsetX, p.y + offsetY, p.radius, 0, Math.PI * 2);
//     // ctx.arc(p.x - cameraX, p.y - cameraY, p.radius, 0, Math.PI * 2);
//     ctx.fillStyle = p.color;
//     ctx.fill();
//     // ctx.closePath();
//   }
// }

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!playerId || !players[playerId]) return;

  const player = players[playerId];

  // Визначаємо масштаб: чим більше радіус, тим менший масштаб
  // let scale = Math.max(0.5, Math.min(3, 30 / player.radius));

  if (player.score > 50 && player.score < 100) scale = 0.8;
  if (player.score > 100 && player.score < 150) scale = 0.6;
  if (player.score > 150 && player.score < 200) scale = 0.4;
  if (player.score > 200 && player.score < 300) scale = 0.2;
  if (player.score > 300) scale = 0.1;
  // console.log("SCORE: " + player.score);
  // let baseScale = 1;
  // let scaleFactor = 0.01; // Швидкість масштабування
  // console.log("scoore: " + player.score);

  // let scale = Math.max(0.2, baseScale - player.score * scaleFactor);

  // let minScale = 0.5;
  // let maxScale = 1;

  // let scale = maxScale - Math.log10(player.score + 1) * 0.1;
  // scale = Math.max(minScale, Math.min(maxScale, scale));

  // Визначаємо зміщення (зміщуємо світ відносно гравця)
  const offsetX = canvas.width / 2 - player.x * scale;
  const offsetY = canvas.height / 2 - player.y * scale;

  ctx.save(); // Зберігаємо стан canvas
  ctx.translate(canvas.width / 2, canvas.height / 2); // Переміщаємо центр камери
  ctx.scale(scale, scale); // Масштабуємо все
  ctx.translate(-player.x, -player.y); // Центруємо камеру на гравцеві

  // Малюємо межі ігрового поля
  // ctx.strokeStyle = "#000";
  // ctx.lineWidth = 50 / scale;
  // ctx.beginPath();
  // ctx.moveTo(0, 0);
  // ctx.lineTo(gameWidth, 0);
  // ctx.lineTo(gameWidth, gameHeight);
  // ctx.lineTo(0, gameHeight);
  // ctx.closePath();
  // ctx.stroke();

  // Малюємо фон-сітку
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1 / scale;

  for (let g of grid) {
    ctx.beginPath();
    ctx.moveTo(g.x, 0);
    ctx.lineTo(g.x, gameHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, g.y);
    ctx.lineTo(gameWidth, g.y);
    ctx.stroke();
  }

  // Малюємо їжу
  for (let f of food) {
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fillStyle = f.color;
    ctx.fill();
  }

  // Малюємо всіх гравців
  for (let id in players) {
    const p = players[id];
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }

  ctx.restore(); // Відновлюємо стан canvas
}

// Основний ігровий цикл
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
