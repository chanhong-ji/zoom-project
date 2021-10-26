import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => res.render("home"));

const onListening = () => console.log(`Server has openen port ${PORT}🌍`);

const PORT = 4000;

app.listen(PORT, onListening);
