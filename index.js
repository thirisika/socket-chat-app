const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const users = {}; // Stores socket.id -> nickname

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("set nickname", (nickname) => {
        users[socket.id] = nickname;
        console.log(`${nickname} has joined`);

        io.emit("update users", Object.values(users)); // Update online users
        socket.broadcast.emit("chat message", `${nickname} has joined the chat`);
    });

    // Handle typing event
    socket.on("typing", (nickname) => {
        socket.broadcast.emit("typing", nickname);
    });

    // Listen for chat messages
    socket.on("chat message", (msg) => {
        const sender = users[socket.id] || "Anonymous";
        console.log(`${sender}: ${msg}`);
        socket.broadcast.emit("chat message", `${sender}: ${msg}`); // Send to others only
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
        const nickname = users[socket.id] || "A user";
        console.log(`${nickname} has left`);
        delete users[socket.id]; // Remove from list
        io.emit("update users", Object.values(users)); // Update online users
        socket.broadcast.emit("chat message", ` ${nickname} has left the chat`);
    });
});

server.listen(3000, () => {
    console.log("Server listening on http://localhost:3000");
});
