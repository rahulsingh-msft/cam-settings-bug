// Change Camera settings

// partial public const MediaTrackConstraints {
//   whiteBalanceMode = true,
//   exposureMode = true,
//   focusMode = true,
//   pointsOfInterest = true,

//   exposureCompensation = true,
//   exposureTime = true,
//   colorTemperature = true,
//   iso = true,

//   brightness = true,
//   contrast = true,
//   pan = true,
//   saturation = true,
//   sharpness = true,
//   focusDistance = true,
//   tilt = true,
//   zoom = true,
//   torch = true,
// };



const input = document.querySelector('input[type="range"]');
var imageCapture;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(mediaStream => {
    document.querySelector('video').srcObject = mediaStream;
    const track = mediaStream.getVideoTracks()[0];

    /// OVERRIDE Constraint
    const capabilities = track.getCapabilities()
    // Check whether aspectRatio and frameRate are supported.
    if (!capabilities.aspectRatio || !capabilities.frameRate) {
      return;
    }

    track.applyConstraints({advanced : [{aspectRatio: 1}] });
    track.applyConstraints({advanced : [{frameRate: 5}] });
    /// OVERRIDE Constraint

    imageCapture = new ImageCapture(track);
    return imageCapture.getPhotoCapabilities();
  }).then(photoCapabilities => {
    const settings = imageCapture.track.getSettings();

    input.min = photoCapabilities.imageWidth.min;
    input.max = photoCapabilities.imageWidth.max;
    input.step = photoCapabilities.imageWidth.step;

    return imageCapture.getPhotoSettings();
  }).then(photoSettings => {
    input.value = photoSettings.imageWidth;
  }).catch(error => ChromeSamples.log('Argh!', error.name || error));

function onTakePhotoButtonClick() {
  imageCapture.takePhoto({ imageWidth: input.value })
    .then(blob => createImageBitmap(blob))
    .then(imageBitmap => {
      drawCanvas(imageBitmap);
      ChromeSamples.log(`Photo size is ${imageBitmap.width}x${imageBitmap.height}`);
    })
    .catch(error => ChromeSamples.log(error));
}

document.querySelector('video').addEventListener('play', function () {
  document.querySelector('#takePhotoButton').disabled = false;
});

/* Utils */

function drawCanvas(img) {
  const canvas = document.querySelector('canvas');
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
    x, y, img.width * ratio, img.height * ratio);
}

document.querySelector('#takePhotoButton').addEventListener('click', onTakePhotoButtonClick);
