/// (C) Ken Fyrstenberg Nilsen, Abdias Software, CC3.0-attribute.
var ctx = canvas.getContext('2d'),
    img = new Image(),
    play = false;

/// turn off image smoothing - this will give the pixelated effect
ctx.mozImageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

/// wait until image is actually available
img.onload = pixelate;

/// some image, we are not struck with CORS restrictions as we
/// do not use pixel buffer to pixelate, so any image will do
img.src = 'http://i.imgur.com/w1yg6qo.jpg';

/// MAIN function
function pixelate(v) {

    /// if in play mode use that value, else use slider value
    var size = (play ? v : blocks.value) * 0.01,

        /// cache scaled width and height
        w = canvas.width * size,
        h = canvas.height * size;

    /// draw original image to the scaled size
    ctx.drawImage(img, 0, 0, w, h);

    /// then draw that scaled image thumb back to fill canvas
    /// As smoothing is off the result will be pixelated
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
}

/// event listeneners for slider and button
blocks.addEventListener('change', pixelate, false);

/// poly-fill for requestAnmationFrame with fallback for older
/// browsers which do not support rAF.
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();