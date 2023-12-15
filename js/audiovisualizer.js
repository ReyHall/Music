window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
var audioSrc;
var analyser;

var start = function() {
    var ctx = new (AudioContext || webkitAudioContext)();
    if(!audioSrc){
        audioSrc = ctx.createMediaElementSource(elements.audio);
        analyser = ctx.createAnalyser();
        audioSrc.connect(analyser);
        analyser.connect(ctx.destination);
    }

    // we're ready to receive some data!
    var canvas = document.getElementById('canvas'),
        cwidth = canvas.width,
        cheight = canvas.height - 2,
        meterWidth = 1, //width of the meters in the spectrum
        gap = 2, //gap between meters
        capHeight = 9,
        capStyle = '#ff4700',
        meterNum = 800 / (10 + 2), //count of the meters
        capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
    ctx = canvas.getContext('2d'),
    gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(1, 'black');
    gradient.addColorStop(0.5, '#7b1830');
    gradient.addColorStop(0, 'black');
    // loop
    function renderFrame() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / meterNum); //sample limited data from the total array
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
            var value = array[i * step];
            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            };
            ctx.fillStyle = capStyle;
            //draw the cap, with transition effect
            if (value < capYPositionArray[i]) {
                ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
            } else {
                ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                capYPositionArray[i] = value;
            };
            ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
            ctx.fillRect(i * 12 /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
        }
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
};

elements.audio.onplay = function(){
    start();
}