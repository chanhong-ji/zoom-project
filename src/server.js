import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const onListening = () => console.log(`Listening on port : ${PORT}🌍`);

const PORT = 4000;

const httpServer = http.createServer(app);

const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket.onAny((event) => console.log(`Socket Event: ${event}`));
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    showRoom();
    socket.to(roomName).emit("welcome");
  });
  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  socket.on("message", (text, roomName, done) => {
    socket.to(roomName).emit("message", text);
    done();
  });
});

httpServer.listen(PORT, onListening);
