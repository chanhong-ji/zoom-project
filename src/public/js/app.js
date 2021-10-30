const socket = io();
const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");
const messageForm = room.querySelector("form");
const messageList = room.querySelector("ul");

room.hidden = true;

let roomName = null;

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  room.querySelector("h3").innerText = `Room ${roomName}`;
}

function onRoomNameSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", onRoomNameSubmit);

function paintMessage(text) {
  const li = document.createElement("li");
  li.innerText = text;
  messageList.append(li);
}

const onMessageSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  const value = input.value;
  socket.emit("message", value, roomName, () => {
    paintMessage(`You: ${value}`);
  });
  input.value = "";
};

messageForm.addEventListener("submit", onMessageSubmit);

socket.on("welcome", () => {
  paintMessage(`누군가가 채팅방에 들어왔습니다.`);
});

socket.on("bye", () => {
  paintMessage(`누군가가 채팅방에서 나갔습니다.`);
});

socket.on("message", paintMessage);
