var slices

// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
var oscillator = audioCtx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = 204.8; // value in hertz

// Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
var scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);

var emptyArray = new Array(4096)
for (var sample = 0; sample < emptyArray.length; sample++) {
  emptyArray[sample] = 0;
}

var lastBuffer = emptyArray
var scalingBuffer = emptyArray

for (var sample = 0; sample < emptyArray.length; sample++) {
  scalingBuffer[sample] = 1-Math.abs( (sample / emptyArray.length)*2 - 1);
}

// Give the node a function to process audio events
scriptNode.onaudioprocess = function(audioProcessingEvent) {
  var inputBuffer = audioProcessingEvent.inputBuffer;
  var outputBuffer = audioProcessingEvent.outputBuffer;

  // Loop through the output channels (in this case there is only one)
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);

    var outputData = newWave(getSlice())
    // console.log(outputData)
  }
  // console.log(outputData[1024])
}



// create analyser
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

function connectNodesAndStart() {
  oscillator.connect(scriptNode);
  scriptNode.connect(analyser);
  analyser.connect(audioCtx.destination);
  oscillator.start();
}

// var canvas = document.createElement('canvas')
// WIDTH = 700;
// HEIGHT = 500;
// canvas.height = HEIGHT;
// canvas.width = WIDTH;
// var canvasCtx = canvas.getContext('2d');
// document.body.appendChild(canvas);

function draw() {

  drawVisual = requestAnimationFrame(draw);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = 'rgb(200, 200, 200)';
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

  canvasCtx.beginPath();

  var sliceWidth = WIDTH * 1.0 / bufferLength;
  var x = 0;

  for(var i = 0; i < bufferLength; i++) {

    var v = dataArray[i] / 128.0;
    var y = v * HEIGHT/2;

    if(i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height/2);
  canvasCtx.stroke();
};

// draw();

function getSlices (url) {
  return new Promise(function(resolve, reject) {

    var width = 50
    // var height = 4096
    var height = 256

    var img = new Image()
    img.crossOrigin="anonymous"
    img.src = url

    var slices = []

    img.addEventListener("load", function() {
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      document.body.appendChild(canvas)

      var data = canvas.getContext('2d').getImageData(0, 0, width, height).data

      for (var x = 0; x < width; x++) {
        var slice = []
        var s
        for (var y = 0; y < height; y++) {
          s = (x + y * width) * 4
          slice[y] = (data[s + 0] + data[s + 1] + data[s + 2]) / (3*255)
          slice[y] = (1 - slice[y])*64// * (4096 * 0.05)
        }
        slices.push(slice.reverse())
      }
      resolve(slices);
    })
  })
}

var sliceIndex = -1
function getSlice() {
  sliceIndex++
  return slices[sliceIndex]
}

// getSlices('https://farm9.staticflickr.com/8693/16891485046_dd0615aab3_o_d.jpg')
// getSlices('http://i.imgur.com/cBbnrYN.jpg')
getSlices('file:///Users/aokholm/git/generalhore/soundGeneration/pic/line.png')
  .then(r => {
    slices = r
    // r.forEach(s => {
    //   console.log(s[1024])
    // })
    // console.log(slices[])
    // connectNodesAndStart();
    // analyzeSlices();
  });

function analyzeSlices() {
  for (var i = 0; i < 50; i++) {
    var data = getSlice()
    plot(data)
    plot(newWave(data))
  }
}

phase = 0
phaseDelta = 0
phaseDeltaIncrement = 0.001
function toneGenerator(N) {
  output = new Array(N)
  for (var i = 0; i < output.length; i++) {
    phaseDelta += phaseDeltaIncrement
    phase += phaseDelta
    output[i] = Math.sin(phase)
  }

  return output
}

function analyzeTones() {
  for (var i = 0; i < 10; i++) {
    var data = toneGenerator(128)
    plot(data)
    plot(getFrequency(data))
  }
}

analyzeTones()

function getFrequency(tone) {

  var fresult = cfft(tone)
  var result = new Array(fresult.length)

  for (var i = 0; i < result.length; i++) {
    result[i] = fresult[i].re
  }
  return result
}

function newWave(slice) {
  var output = new Array(slice.length*2)

  // zero pad slice
  for (var i = 0; i< output.length; i++) {
    if (i < slice.length) {
      // if (slice[i] == max)
      output[i] = slice[i]*2
    } else {
      output[i] = 0
    }
    // output[21] = 128

  }
  var result = icfft(output)
  for (var sample = 0; sample < result.length; sample++) {
    output[sample] = result[sample].re
  }
  return output
}

function plot(array) {
  var canvas = document.createElement('canvas')
  WIDTH = 300;
  HEIGHT = 300;
  canvas.height = HEIGHT;
  canvas.width = WIDTH;
  var canvasCtx = canvas.getContext('2d');
  document.body.appendChild(canvas);

  function draw() {

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    var sliceWidth = WIDTH * 1.0 / array.length;
    var x = 0;

    for(var i = 0; i < array.length; i++) {
      var y = (1-(array[i]+1)/2) * HEIGHT;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    canvasCtx.stroke();
  };

  draw();
}
