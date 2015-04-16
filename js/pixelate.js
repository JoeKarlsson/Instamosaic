//TODO
// Dynamically resize pixalate canvas based on image size
//image uploader
//create grid of instagram images

//replace Clinet ID with your own Client ID from Instgram
var myClientId = 'edcd676d826d4cbeb9304acb43d126c7';
// Grab the Canvas and Drawing Context
var canvas = document.getElementById('canvas');

var ctx = canvas.getContext('2d');
var play = false;

// Create an image element
var img = new Image();

/// turn off image smoothing - this will give the pixelated effect
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

/// wait until image is actually available
img.onload = function() {
    canvas.height = img.height ;
    canvas.width = img.width ;
};

img.onload = pixelate;

// When the image is loaded, draw it
function pixelate(v) {
    var hex = [];
    var color = [];
    var instaPhotos = [];

    /// if in play mode use that value, else use slider value
    var size = (blocks.value) * 0.01,

        /// cache scaled width and height
        w = canvas.width * size,
        h = canvas.height * size;

    /// draw original image to the scaled size
    ctx.drawImage(img, 0, 0, w, h);
	
	//Get pixel color data from the image and save it to the data array
    var imgData = ctx.getImageData(0, 0, w, h);
    var data = imgData.data;

    // enumerate all pixels
    // each pixel's r,g,b,a datum are stored in separate sequential array elements
    for (var i = 0; i < data.length; i += 4) {
        var rgb = [];
        rgb[0] = data[i]; //red
        rgb[1] = data[i + 1]; //green
        rgb[2] = data[i + 2]; //blue
        rgb[3] = data[i + 3]; //alpha

        // convert RGBA color data to hex
        hex[hex.length] = ((rgb && rgb.length === 4) ? "#" 
		+ ("0" + parseInt(rgb[0],10).toString(16)).slice(-2) 
        + ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) 
	    + ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) : '');
		
		//match hex to closest text string color name - this is the name that will be used to search for the tag on Instagram
		var n_match  = ntc.name(hex[hex.length-1]);
        //color[color.length] = n_match[1].replace(/\s+/g, ''); // This is the text string for the name of the match & remove all white spaces from the color array

        //Pull tagged images from Instgram, but do not display them yet - save their data in images JSON array
        var feed = new Instafeed({
            get: 'tagged',
            sortBy: 'random',
            tagName:  n_match[1].replace(/\s+/g, ''),
            clientId: myClientId,
            limit: 1,
            resolution: 'thumbnail',
            mock: true,
            success: function(data) {
                var images = data.data;
                console.log(images[0].images.low_resolution.url);
                
            }

        });
        feed.run();
}
    
    //console.log(hex); //test hex string in console
    //console.log(n_name); // test color string conversion in console   
    //console.log(color); // test color array in console

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

// Specify the src to load the image
img.crossOrigin="anonymous";
img.src = 'https://i.imgur.com/6QCRtXJ.jpg';