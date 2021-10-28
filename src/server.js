import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const onListening = () => console.log(`Listening on port : ${PORT}🌍`);

const PORT = 4000;

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  console.log("Connected to Browser ✅");
  sockets.push(socket);
  socket["name"] = "Anony";
  socket.on("close", () => {
    console.log("Server has closed");
  });
  socket.on("message", (message) => {
    const messageObj = JSON.parse(message);
    console.log(messageObj);
    switch (messageObj.type) {
      case "chat":
        sockets.forEach((aSocket) => {
          aSocket.send(
            `${socket.name} : ${messageObj.payload.toString("utf-8")}`
          );
        });
        break;
      case "name":
        socket["name"] = messageObj.payload;
        break;
    }
  });
});

server.listen(PORT, onListening);
