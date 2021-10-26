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

server.listen(PORT, onListening);
