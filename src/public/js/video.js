const socket = io();
const myFace = document.getElementById("myStream");
const video = myFace.querySelector("video");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const cameraSelect = document.getElementById("cameraSelect");

let myStream;
let muted = false;
let cameraOff = false;

getMedia();
getDevices();

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    video.srcObject = myStream;
    video.play();
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
