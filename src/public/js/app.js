const messageList = document.querySelector("ul");
const messageForm = document.getElementById("messageForm");
const nameForm = document.getElementById("nameForm");
const frontSocket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  const message = { type, payload };
  return JSON.stringify(message);
}

frontSocket.addEventListener("open", () => {
  console.log("Connect to server ✅");
});

frontSocket.addEventListener("close", () => {
  console.log("Disconnected from server ❌");
});

frontSocket.addEventListener("message", (message) => {
  paintMessage(message.data);
});

function paintMessage(text) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.innerText = text;
  li.append(span);
  messageList.append(li);
}

function onNameSubmit(event) {
  event.preventDefault();
  const input = nameForm.querySelector("input");
  frontSocket.send(makeMessage("name", input.value));
  nameForm.style.display = "none";
}

function onMessageSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  frontSocket.send(makeMessage("chat", input.value));
  input.value = "";
}

nameForm.addEventListener("submit", onNameSubmit);
messageForm.addEventListener("submit", onMessageSubmit);
