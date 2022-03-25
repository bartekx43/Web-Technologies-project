
class Body{
    coord = {x: 0, y: 0};
    vel = {x: 0, y: 0};
    factor = 1.0;
    path = [];
    constructor(x_coord, y_coord, radius, mass){
        this.coord.x = x_coord;
        this.coord.y = y_coord;
        this.radius = radius;
        this.mass = mass;
    }
}

var canvas;
var ctx;
var sun;
var earth;
var comet;
var paused = true;
var ended = false;
var started = false;
var worker = null;
var currentTime = "";

function simulation(){
    intialize();
    if(document.getElementById("simulation").hidden){
        document.getElementById("simulation").hidden = false;
        document.getElementById("homepage").hidden = true;
        document.getElementById("footer").hidden = true;
        document.getElementById("page_button").value = "Strona główna";
        startHour();
        resetValues();
    }
    else{
        document.getElementById("simulation").hidden = true;
        document.getElementById("homepage").hidden = false;
        document.getElementById("footer").hidden = false;
        document.getElementById("page_button").value = "Symulacja";
    }
}

function resetValues(){
    sun.factor = 1.0;
    earth.factor = 1.0;
    paused = true;
    ended = false;
    started = false;
    document.getElementById("comet_y").value = 100;
    document.getElementById("comet_mass").value = 0.5;
    document.getElementById("comet_angle").value = -5.0;
    document.getElementById("comet_vel").value = 1.0;
    document.getElementById("pause_button").value = "Wstrzymaj";
    document.getElementById("sun_mass").value = 1.0;
    document.getElementById("earth_mass").value = 1.0;
}

function intialize(){
    canvas = document.getElementById("cnv");
    ctx = canvas.getContext("2d");
    sun = new Body(500, 300, 30, 2000);
    earth = new Body(500, 50, 10, 1);
    comet = new Body(20, parseInt(document.getElementById("comet_y").value), 5, 0.1);
    sun_update();
    earth_update();
    earth.vel.x = Math.sqrt(sun.mass/250);    
    var angle = -parseFloat(document.getElementById("comet_angle").value);
    var vel = parseFloat(document.getElementById("comet_vel").value)*Math.sqrt(sun.mass/250);
    comet.factor = parseFloat(document.getElementById("comet_mass").value);
    comet.vel.x = Math.cos(angle*2*Math.PI/360)*vel;
    comet.vel.y = Math.sin(angle*2*Math.PI/360)*vel;
    earth.path = [];
    comet.path = [];
    drawBack();
}

function startHour(){
    if (worker == null){
        worker = new Worker("hour.js");
    }
    worker.onmessage = function(event){
        document.getElementById("time").innerHTML = event.data;
    };
}

function cometUpdate(){
    comet.coord.y = parseInt(document.getElementById("comet_y").value);
    comet.radius = 5+comet.factor*5;
    intialize();
}

function start(){
    intialize();
    if(paused){
        pause();
    }
    else if(!started) {
        requestAnimationFrame(play);
    }
    ended = false;
    started = true;
};

function pause(){
    if(paused){
        paused = false;
        document.getElementById("pause_button").value = "Wstrzymaj";
        requestAnimationFrame(play);
    }
    else{
        paused = true;
        document.getElementById("pause_button").value = "Wskrześ";
    }
}
function end(){
    resetValues();
    intialize();
}

function play(){
    if(ended) end();
    else if(!paused) {
        animate();
        drawBack();
        requestAnimationFrame(play);
    }  
}

function sun_update(){
    sun.factor = parseFloat(document.getElementById("sun_mass").value);
    document.getElementById("sun_label").innerHTML = "Masa: " + sun.factor*sun.mass + "*10<sup>24</sup> kg";
}

function earth_update(){
    earth.factor = parseFloat(document.getElementById("earth_mass").value);
    document.getElementById("earth_label").innerHTML = "Masa: " + earth.factor*earth.mass + "*10<sup>24</sup> kg";
}

function get_distance(b1, b2){
    return Math.sqrt(Math.abs((b1.coord.x)-(b2.coord.x))*Math.abs((b1.coord.x)-(b2.coord.x))+Math.abs((b1.coord.y)-(b2.coord.y))*Math.abs((b1.coord.y)-(b2.coord.y)));
}

function update_vel(b, B){
    b.vel.x += (B.coord.x-b.coord.x)/get_distance(b, B) * B.factor * B.mass / (get_distance(b, B)*get_distance(b, B));
    b.vel.y += (B.coord.y-b.coord.y)/get_distance(b, B) * B.factor * B.mass / (get_distance(b, B)*get_distance(b, B));
}

function animate() {
    if(get_distance(earth, sun) >= earth.radius+sun.radius){
        update_vel(earth, sun);
        update_vel(earth, comet);
    }
    if(get_distance(earth, comet) >= earth.radius+comet.radius){
        update_vel(comet, earth);
        update_vel(comet, sun);
    }
    earth.path.unshift({x: earth.coord.x, y: earth.coord.y});
    earth.path.length = 100;
    comet.path.unshift({x: comet.coord.x, y: comet.coord.y});
    comet.path.length = 100;

    earth.coord.x += earth.vel.x;
    earth.coord.y += earth.vel.y;
    comet.coord.x += comet.vel.x;
    comet.coord.y += comet.vel.y;
}

function drawBack() {
    drawRect(0,0,canvas.width,canvas.height, 'white');
    ctx.strokeStyle = "lightgrey";
    ctx.beginPath();
    ctx.arc(500, 300, 250, 0, 2 * Math.PI);
    ctx.stroke(); 
    earth.path.forEach(element => {
        colorCircle(element.x, element.y, 1, 'black');
    });
    comet.path.forEach(element => {
        colorCircle(element.x, element.y, 1, 'black');
    });
    colorCircle(sun.coord.x, sun.coord.y, sun.radius, 'black');
    colorCircle(earth.coord.x,earth.coord.y, earth.radius, 'red');
    colorCircle(comet.coord.x,comet.coord.y, comet.radius, 'blue');
    ctx.beginPath();
    ctx.moveTo(50, 570);
    ctx.lineTo(150, 570);
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.font = '18px black';
    ctx.fillStyle = 'black';
    ctx.fillText('1.5E12 m', 70, 560);   
}

function drawRect(leftX,topY,width,height, drawColor) {
    ctx.fillStyle = drawColor;
    ctx.fillRect(leftX,topY,width,height);
    ctx.fill();
}

function colorCircle(centerX,centerY,radius, drawColor) {
    ctx.fillStyle = drawColor;
    ctx.beginPath();
    ctx.arc(centerX,centerY,radius,0,Math.PI*2,true);
    ctx.closePath();
    ctx.fill();
}
