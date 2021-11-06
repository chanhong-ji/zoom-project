const socket = io();
const myFace = document.getElementById("myFace");
const video = myFace.querySelector("video");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameraSelect");

const nicknameDiv = document.getElementById("nickname");
const nicknameForm = nicknameDiv.querySelector("form");
const find = document.getElementById("find");
const findForm = find.querySelector("form");
const call = document.getElementById("call");

let myStream;
let muted = false;
let cameraOff = false;
let peerConnection;
let chatChannel;
// nickname Form (set a nickname)

let nickname;
find.hidden = true;
call.hidden = true;

function onNicknameSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  nickname = input.value;
  input.value = "";
  nicknameDiv.hidden = true;
  find.hidden = false;
}

nicknameForm.addEventListener("submit", onNicknameSubmit);

// Find Form (join a room)

let roomName;

async function initCall() {
  find.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

findForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = findForm.querySelector("input");
  const value = input.value;
  roomName = value;
  await initCall();
  socket.emit("join_room", value);
  input.value = "";
});

// Media Devices

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameraOptions = devices.filter(
      (device) => device.kind === "videoinput"
    );
    const currentCamera = myStream.getVideoTracks()[0];
    cameraOptions.forEach((cameraOption) => {
      const option = document.createElement("option");
      option.value = cameraOption.deviceId;
      option.innerText = cameraOption.label;
      cameraSelect.appendChild(option);
      if (cameraOption.label === currentCamera.label) {
        option.selected = true;
      }
    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(selectedCamera) {
  const initialConstraints = { audio: true, video: { facingMode: "user" } };
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: selectedCamera } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      selectedCamera ? cameraConstraints : initialConstraints
    );
    video.srcObject = myStream;
    if (!selectedCamera) {
      await getCameras();
    }
  } catch (error) {
    console.log(error);
  }
}

muteBtn.addEventListener("click", () => {
  const audioTracks = myStream.getAudioTracks();
  audioTracks.forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  } else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
});

cameraBtn.addEventListener("click", () => {
  const videoTracks = myStream.getVideoTracks();
  videoTracks.forEach((track) => {
    track.enabled = !track.enabled;
  });
  if (!cameraOff) {
    cameraBtn.innerText = "Turn on Camera";
    cameraOff = true;
  } else {
    cameraBtn.innerText = "Turn off Camera";
    cameraOff = false;
  }
});

cameraSelect.addEventListener("input", async () => {
  await getMedia(cameraSelect.value);
  if (peerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = peerConnection
      .getSenders()
      .filter((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
});

// Socket Codes

socket.on("welcome", async () => {
  chatChannel = peerConnection.createDataChannel("chat");
  paintMessage("for myself: someone joined!");
  chatChannel.addEventListener("message", (message) =>
    paintMessage(message.data)
  );

  const offer = await peerConnection.createOffer();
  peerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  peerConnection.addEventListener("datachannel", (event) => {
    chatChannel = event.channel;
    chatChannel.addEventListener("open", () =>
      chatChannel.send("someone joined!")
    );
    paintMessage("someone joined!");
    chatChannel.addEventListener("message", (message) =>
      paintMessage(message.data)
    );
  });

  peerConnection.setRemoteDescription(offer);
  const answer = await peerConnection.createAnswer();
  peerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  peerConnection.setRemoteDescription(answer);
});

socket.on("ice", (data) => {
  peerConnection.addIceCandidate(data);
});

socket.on("room_update", (rooms) => {
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

socket.on("out_room", (lastUser) => {
  const peerList = document.getElementById("peers");
  const peers = peerList.querySelectorAll("#peerFace");
  let removedPeer;
  for (const peer of peers) {
    if (peer.dataset.id in lastUser) {
      continue;
    } else {
      removedPeer = peer;
    }
  }
  peerList.remove(removedPeer);
});

// Peer connection

function makeConnection() {
  /*   peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  }); */
  peerConnection = new RTCPeerConnection();
  peerConnection.addEventListener("icecandidate", onIceCandidate);
  peerConnection.addEventListener("addstream", onAddStream);
  peerConnection.addEventListener("connectionstatechange", onConnectChange);
  myStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, myStream);
  });
}

function onIceCandidate(data) {
  socket.emit("ice", data.candidate, roomName);
}

function onAddStream(data) {
  const peerList = document.getElementById("peers");
  const peerFace = document.createElement("div");
  peerFace.dataset.id = data.stream.id;
  //여기서 각 stream 의 id 를 저장.
  peerFace.id = "peerFace";
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.width = 400;
  video.height = 400;
  peerFace.appendChild(video);
  peerList.appendChild(peerFace);
  video.srcObject = data.stream;
}

function onConnectChange(data) {
  const state = peerConnection.connectionState;
  if (state == "disconnected") {
    const videoSender = peerConnection.getSenders();
    for (let sender of videoSender) {
      peerConnection.removeTrack(sender);
    }
    socket.emit("out_room", roomName);
  }
}

// chat data channel`

const chat = document.getElementById("chat");
const chatList = chat.querySelector("ul");
const chatForm = chat.querySelector("#message");

function paintMessage(text) {
  const li = document.createElement("li");
  li.innerText = text;
  chatList.append(li);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = chatForm.querySelector("input");
  paintMessage(input.value);
  chatChannel.send(input.value);
  input.value = "";
});
