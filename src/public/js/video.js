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
});
