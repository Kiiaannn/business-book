const express = require("express");
const path = require("path");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const wss = new WebSocket.Server({ server });
let chatHistory = [];

wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.send(JSON.stringify({ type: "history", data: chatHistory }));

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "chat") {
      const chatMessage = {
        user: data.user,
        message: data.message,
        timestamp: new Date(),
      };
      chatHistory.push(chatMessage);

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: "chat", data: chatMessage }));
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
