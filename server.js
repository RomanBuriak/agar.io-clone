const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("public")); // Обслуговуємо статичні файли (HTML, JS)

const players = {};
const food = [];
const grid = [];
const foodCount = 1000;
const gameWidth = 4000; // Розміри ігрового поля
const gameHeight = 4000;

// Генерація їжі
for (let i = 0; i < foodCount; i++) {
  food.push({
    x: Math.random() * gameWidth,
    y: Math.random() * gameHeight,
    radius: 10,
    color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
      Math.random() * 255
    })`,
  });
}
//Генерація клітинок ігрового поля
for (let i = 0; i <= gameWidth; i += 25) {
  grid.push({
    x: i,
    y: i,
  });
}

wss.on("connection", (ws) => {
  const id = Date.now();
  players[id] = {
    x: Math.random() * gameWidth,
    y: Math.random() * gameHeight,
    radius: 40,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    score: 0,
  };

  ws.send(JSON.stringify({ type: "init", id, food, grid }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "move") {
      if (players[id]) {
        players[id].x = data.x;
        players[id].y = data.y;
      }
    }
  });

  ws.on("close", () => {
    delete players[id];
  });
});

// Оновлення гри кожні 30 мс
setInterval(() => {
  for (const playerId in players) {
    const player = players[playerId];

    // Перевірка зіткнення з їжею
    for (let i = food.length - 1; i >= 0; i--) {
      const f = food[i];
      const dist = Math.sqrt((player.x - f.x) ** 2 + (player.y - f.y) ** 2);
      if (dist < player.radius) {
        food.splice(i, 1);
        player.radius += 0.2;
        player.score += 0.2;

        // Додаємо нову їжу
        food.push({
          x: Math.random() * gameWidth,
          y: Math.random() * gameHeight,
          radius: 10,
          color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
            Math.random() * 255
          })`,
        });
      }
    }

    // Перевірка зіткнення гравців і поїдання
    for (let otherId in players) {
      if (otherId !== playerId) {
        let other = players[otherId];

        // Відстань між центрами
        let dx = player.x - other.x;
        let dy = player.y - other.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        // Перевірка поїдання
        if (player.radius > other.radius && distance < player.radius) {
          // Гравець з'їв іншого
          player.score += other.score; // Отримуємо очки з'їденого + бонус
          player.radius += Math.sqrt(other.radius); // Збільшуємо радіус
          delete players[otherId]; // Видаляємо з'їденого
          // ws.send(JSON.stringify({ type: "eaten" }));
        }
      }
    }
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "update", players, food, grid }));
    }
  });
}, 1000 / 60);

server.listen(3000, () => console.log("Server is running on port 3000"));
