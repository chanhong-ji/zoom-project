const socket = io();
const nickname = document.getElementById("nickname");
const nicknameForm = nickname.querySelector("form");
const find = document.getElementById("find");
const findForm = find.querySelector("form");
const room = document.getElementById("room");
const messageForm = document.getElementById("message");
const messageList = room.querySelector("ul");

let roomName = null;

find.hidden = true;
room.hidden = true;

function onNicknameSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  const value = input.value;
  socket.emit("nickname", value);
  input.value = "";
  nickname.hidden = true;
  find.hidden = false;
}

nicknameForm.addEventListener("submit", onNicknameSubmit);

function showRoom() {
  find.hidden = true;
  room.hidden = false;
  room.querySelector("h3").innerText = `Room ${roomName}`;
}

function onRoomNameSubmit(event) {
  event.preventDefault();
  const input = findForm.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

findForm.addEventListener("submit", onRoomNameSubmit);

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

socket.on("welcome", (nickname, userCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${userCount})`;
  paintMessage(`${nickname}가 채팅방에 들어왔습니다.`);
});

socket.on("bye", (nickname) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${userCount})`;
  paintMessage(`${nickname}가 채팅방에서 나갔습니다.`);
});

socket.on("message", paintMessage);

socket.on("room_change", (rooms) => {
  const findList = find.querySelector("ul");
  if (rooms.length === 0) {
    findList.innerHTML = "";
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    findList.append(li);
  });
});
