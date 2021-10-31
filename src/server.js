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

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countUser(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
  wsServer.sockets.emit("room_change", publicRooms());
  socket["nickname"] = "Anony";
  socket.onAny((event) => console.log(`Socket Event: ${event}`));
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName);
    showRoom();
    socket.to(roomName).emit("welcome", socket.nickname, countUser(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countUser(room) - 1)
    );
  });
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("message", (text, roomName, done) => {
    socket.to(roomName).emit("message", `${socket.nickname}: ${text}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket.nickname = nickname));
});

httpServer.listen(PORT, onListening);
