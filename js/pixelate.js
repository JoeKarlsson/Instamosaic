//TODO
// Dynamically resize pixalate canvas based on image size
//image uploader
//create grid of instagram images

//replace Clinet ID with your own Client ID from Instgram
var myClientId = 'edcd676d826d4cbeb9304acb43d126c7';

// Grab the Canvas and Drawing Context
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Create an image element
var img = new Image();

//When the page first loads - draw the initial demo image
window.onload = firstDraw();

function firstDraw() {
    //preload the demo image
    var initialImageURL = 'https://i.imgur.com/3vfZPKL.jpg';
    draw(initialImageURL);
}

//takes any image URL and creates an un pixelated image /4 the orginal size of the image
function draw (imgURL) {
    // Specify the src to load the image
    img.crossOrigin="anonymous";
    img.src = imgURL;

    img.onload = function() {
        canvas.height = img.height/4;
        canvas.width = img.width/4;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        console.log("image draw");
        pixelate();
    };
}

function pixelate() {
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

    /// then draw that scaled image thumb back to fill canvas
    /// As smoothing is off the result will be pixelated
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);

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

                //https://css-tricks.com/seamless-responsive-photo-grid/
                $('#photos').append('<img src= ' + images[0].images.low_resolution.url);
            }

        });
        feed.run();
}
}


function submitImageURL() {
    var imgURL = document.getElementById("ImageURL").value;

    //veriy the form isn't black or null
    if (imgURL == null || imgURL == "") {
        alert("Image URL must be filled out");
        return false;
    }
    //verify that the address is secure
    if ( imgURL.search("/https:/") != -1 ) {
        alert("Image URL from https site (security reasons)");
        return false;  
    }

    //draw the submitted image onto the canvas
    draw(imgURL);
}

// event listeneners for slider
blocks.addEventListener('change', pixelate, false);

/// poly-fill for requestAnmationFrame with fallback for older
/// browsers which do not support rAF.
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
