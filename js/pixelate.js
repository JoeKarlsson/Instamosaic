/*

+-----------------------------------------------------------------+
|     Created by Joe Carlson - http://www.callmejoe.net           |
|-----------------------------------------------------------------|
|                          Instamosaic                            |
+-----------------------------------------------------------------+

This script is released under the: Creative Commons License:
Attribution 2.5 http://creativecommons.org/licenses/by/2.5/

*/

//replace Clinet ID with your own Client ID from Instgram
var myClientId = 'edcd676d826d4cbeb9304acb43d126c7';

//If no image is found, this image will be used
var errorImage = 'https://scontent.cdninstagram.com/hphotos-xaf1/t51.2885-15/s306x306/e15/11137674_372809412920242_238623449_n.jpg';

// Grab the Pixelate canvas and Drawing Context
var canvas = document.getElementById('pixelate');
var ctx = canvas.getContext('2d');

//Grab the Instamosaic canvas and Drawing Context
var mosaicCanvas = document.getElementById('instamosaic');
var mosaicctx = mosaicCanvas.getContext('2d');

// Create an image element for pixelate element
var img = new Image();

//When the page first loads - draw the initial demo image
window.onload = firstDraw();

//Draws the iniital image when the page is first rendered
function firstDraw() {
    //preload the demo image
    var initialImageURL = 'https://i.imgur.com/3vfZPKL.jpg';
    draw(initialImageURL);
}

//Gets the number of pixels high a pixelated image is
function getHeight() {
    var size = (blocks.value) * 0.01;
    return Math.ceil(canvas.height * size);
}

//Gets the number of pixels wide a pixelated image is
function getWidth() {
    var size = (blocks.value) * 0.01;
    return Math.ceil(canvas.width * size);
}

//Returns the number of pixels in the pixelated image
function numPixels() {
    var size = getImageData();
    return size.length/4;
}

//takes any image URL and creates an un pixelated image /4 the orginal size of the image
function draw (imgURL) {
    // Specify the src to load the image
    img.crossOrigin="anonymous";
    img.src = imgURL;
    var instaPhotos = [];

    //once the image has loaded, begin pixelating and creating a mosiac
    img.onload = function() {
        canvas.height = img.height/4;
        canvas.width = img.width/4;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        pixelate();
        getInstaPhotos();    
    };
}

//Displays a pixelated version of the uploaded image
function pixelate() {
    //get width and height of the pixelated image
    var w = getWidth();
    var h = getHeight();

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
}

//Returns an array of RGBA values from the uploaded image.
function getImageData() {
    //get width and height of the pixelated image
    var w = getWidth();
    var h = getHeight();

    /// draw original image to the scaled size
    ctx.drawImage(img, 0, 0, w, h);
    
    //Get pixel color data from the image and save it to the data array
    var imgData = ctx.getImageData(0, 0, w, h);
    var data = imgData.data;

    //return array of image data
    return data;
}


//This function returns an array of photos from instagram that are tagged with the color from the pixels from the uploaded image
function getInstaPhotos(_callback) {
    var hex = [];
    var color = [];
    var instaPhotos = [];

    //get width and height of the original image
    var w = getWidth();
    var h = getHeight();
    var area = numPixels();

    //Call image data to get an array of RGBA values for the uploaded image
    var imgData =  getImageData();

    // enumerate all pixels
    // each pixel's r,g,b,a datum are stored in separate sequential array elements
    for (var i = 0; i < imgData.length; i += 4) {
        var rgb = [];
        rgb[0] = imgData[i]; //red
        rgb[1] = imgData[i + 1]; //green
        rgb[2] = imgData[i + 2]; //blue
        rgb[3] = imgData[i + 3]; //alpha

        // convert RGBA color data from the original image to hex values
        hex[hex.length] = ((rgb && rgb.length === 4) ? "#" 
        + ("0" + parseInt(rgb[0],10).toString(16)).slice(-2) 
        + ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) 
        + ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) : '');
        
        //match hex to closest text string color name - this is the name that will be used to search for the tag on Instagram
        var n_match  = ntc.name(hex[hex.length-1]);

        //Pull tagged images from Instgram, but do not display them yet - save their data in images JSON array
        //More information about the input here can be found at http://instafeedjs.com/
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
                var hashImage = images[0].images.low_resolution.url;
                instaPhotos[instaPhotos.length] = hashImage;
                //console.log(area);
                //console.log(instaPhotos.length);
                
                //Checks to make sure the Instaphoto array is the same number of pixels that are in the pixelated image
                if (area == instaPhotos.length) {
                        //console.log(instaPhotos);
                        //console.log('done!');
                        drawMosaic(w,h,area,instaPhotos);
                        return instaPhotos;
                    }
            },
            //If no image is returned from Instagram, place in a placeholder error image
            error: function() {
                instaPhotos[instaPhotos.length] = errorImage;
                if (area == instaPhotos.length) {
                    drawMosaic(w,h,area,instaPhotos);
                    return instaPhotos;
                }
            },
        });
        feed.run();
    }
} 

//Function to render the mosiac in a canvas on the page
function drawMosaic(width, height, area, photoURLArray){
    //https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
    //http://chimera.labs.oreilly.com/books/1234000001654/ch04.html#the_basic_file_setup_for_this_chapte

    //create a new mosiac image
    var mosaicImg = new Image;
    var k = 0;

    //console.log(photoURLArray);
    console.log("draw mosiac got array!");
    mosaicImg.src = photoURLArray[k];

    mosaicCanvas.width = canvas.width;
    mosaicCanvas.height = canvas.height;

    //calculate the actual width and height of each image canvas width/pixel width == answer
    var mosaicPixelWidth = mosaicCanvas.width/width;
    var mosaicPixelHeight = mosaicCanvas.height/height;

    //Create a grid of images that is the the same pixels in width and height
    for (var i=0;i<height;i++){
        for (var j=0;j<width;j++){
            var mosaicImg = new Image;
            mosaicImg.src = photoURLArray[k];
            mosaicctx.drawImage(mosaicImg,j*mosaicPixelWidth,i*mosaicPixelWidth,mosaicPixelWidth,mosaicPixelWidth);
            k++;
        }
    };
}

//Funcion called when submit button pressed on page. Submits and verify Image URL input
function submitImageURL() {
    var imgURL = document.getElementById("ImageURL").value;

    //veriy the form isn't blank or null
    if (imgURL == null || imgURL == "") {
        alert("Image URL must be filled out");
        return false;
    }
    //verify that the address is secure (i.e. https)
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
