var slices

// create web audio api context
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator node
var oscillator = audioCtx.createOscillator();
oscillator.type = 'sine';
oscillator.frequency.value = 204.8; // value in hertz

// Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
var scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);

// Give the node a function to process audio events
scriptNode.onaudioprocess = function(audioProcessingEvent) {
  var inputBuffer = audioProcessingEvent.inputBuffer;
  var outputBuffer = audioProcessingEvent.outputBuffer;

  // Loop through the output channels (in this case there is only one)
  for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
    var inputData = inputBuffer.getChannelData(channel);
    var outputData = outputBuffer.getChannelData(channel);

    var slice = getSlice()

    slice = icfft(slice)

    for (var sample = 0; sample < outputBuffer.length; sample++) {
      outputData[sample] = slice[sample].re
      // outputData[sample] = slice[sample]


    //   // input = new Array(4096)
    //   // for (var sample = 0; sample < input.length; sample++) {
    //   //   input[sample] = 0;
    //   // }
    //   //
    //   // input[10] = 4096;
    //   // input[20] = 4096;
    //   // input[50] = 4096;
    //   // // console.log(input);
    //   // // console.log( icfft(input) );
    //   // var output = icfft(input)
    //
    // outputData[sample] = Math.random();

    //
    //   // console.log(output[sample].re)
    //
    //   // outputData[sample] = slices[0][sample]
    //   // add noise to each output sample
    //   // outputData[sample] += ((Math.random() * 2) - 1) * 0.2;
    }
    // console.log(outputData)
  }
  // console.log(outputData[1024])
}



// create analyser
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 4096;
var bufferLength = analyser.frequencyBinCount;
var dataArray = new Uint8Array(bufferLength);

function connectNodesAndStart() {
  oscillator.connect(scriptNode);
  scriptNode.connect(analyser);
  analyser.connect(audioCtx.destination);
  oscillator.start();
}

var canvas = document.createElement('canvas')
WIDTH = 700;
HEIGHT = 500;
canvas.height = HEIGHT;
canvas.width = WIDTH;
var canvasCtx = canvas.getContext('2d');
document.body.appendChild(canvas);

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

draw();

function getSlices (url) {
  return new Promise(function(resolve, reject) {

    var width = 500
    var height = 4096

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
          slice[y] = (1 - slice[y]) * (4096 * 0.05)
        }
        slices.push(slice)
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

getSlices('https://farm9.staticflickr.com/8693/16891485046_dd0615aab3_o_d.jpg')
// getSlices('http://i.imgur.com/cBbnrYN.jpg')
  .then(r => {
    slices = r
    // r.forEach(s => {
    //   console.log(s[1024])
    // })
    // console.log(slices[])
    connectNodesAndStart();
  });
