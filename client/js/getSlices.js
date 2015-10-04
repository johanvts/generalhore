// function getImage (url) {
//   return new Promise((resolve, reject) => {
//     var img = new Image()
//     img.crossOrigin= 'anonymous'
//     img.src = url
//     img.addEventListener('load', () => {
//       resolve(img)
//     })
//     document.body.appendChild(img)
//   })
// }

function getSlices (url, width, height) {
  return new Promise(function(resolve, reject) {
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
          slice[y] = (1 - slice[y])
        }
        slices.push(slice.reverse())
      }
      resolve(slices);
    })
  })
}
var slices
var sliceIndex = -1
function getSlice() {
  sliceIndex++
  var i = sliceIndex%slices.length
  // console.log(slices[i])
  return slices[i]
}
