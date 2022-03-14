/*
Goal: My goal was to use teachable machine to make my pong game interactive. I always thought that GUIs that interact with the user's motion were super cool so it was cool to incorperate that into my Sketch. The user controls the paddle but either putting both their arms above their head to move the paddle up, or by putting their right arm up parallel to the ground to make the paddle go down. The game ends when the user misses the ball with the paddle

Accomplished: I was able to impliment this into my pong game which was great. I did run into some problems but it works most of the time which is really cool. One of the problems that I ran into was that if I moved the paddle everytime my model spit out a result, the paddle moved way too fast. Therefore, I only moved the paddle every other frame to slow it down. Another problem I had was that becasue of my training data, my model needs to see the person's entire torso, and their entire right arm in order for it to recognize them. 

What to do in the future: In the future, I want to use the PoseNet offered by teachable machine. This would allow the sketch to work with anybody instead of only me. I also think that using PoseNet would make this game much more stable as well.



*/





let classifier;
// Model URL
let imageModelURL = 'https://teachablemachine.withgoogle.com/models/MHLPVuYgG/';

// Video
let video;
let flippedVideo;
// To store the classification
let label = "";
let confidence;


var timer;
var stop = false;

// Load the model first
function preload() {
  classifier = ml5.imageClassifier(imageModelURL + 'model.json');
}

function setup() {
  createCanvas(600, 600);
  // Create the video
  video = createCapture(VIDEO);
  video.size(200, 200);
  video.hide();
  textAlign(CENTER, CENTER);
  timer = 0;
  paddle = {
    xPos: 0,
    yPos: 0,
    width: 20,
    height: 70,
    speed: 5
  }
  ball = {
    xSpeed: 1.5,
    ySpeed: 1.5,
    size: 20,
    xPos: int(random(10, (width-200)-25)),
    yPos: int(random(10, (height-200)-25))
  }

  flippedVideo = ml5.flipImage(video);
  // Start classifying
  classifyVideo();
}

function draw() {
  background(0);
  // Draw the video
  image(flippedVideo, 400, 400);
  // Draw the label
  fill(255);

  if (frameCount % 60 == 0 && !stop) { 
      timer += 1;
  }
  
  if (frameCount % 2 == 0 && confidence > 0.75){ // find the position and move the paddle every 2 frames
    if (label == 'Both' && confidence > 0.95 && paddle.yPos > 0){
      paddle.yPos -= paddle.speed;
    }
    else if (label == 'Right' && paddle.yPos <= height-200 && paddle.yPos+paddle.height <= height-200) {
      paddle.yPos += paddle.speed;
    }
  }
    
  // what makes the ball move every frame
  ball.xPos = ball.xPos + ball.xSpeed; 
  ball.yPos = ball.yPos + ball.ySpeed;


  // boundaries
  if (ball.xPos + ball.size >= width){
    ball.xSpeed = ball.xSpeed * -1;
  }

  if (ball.yPos >= height-200 - ball.size || ball.yPos <= 0){
    ball.ySpeed = ball.ySpeed * -1;
  }
  //push()
  if ((ball.xPos > paddle.xPos && ball.xPos < paddle.xPos+paddle.width) && (ball.yPos > paddle.yPos && ball.yPos < paddle.yPos + paddle.height)) {
    ball.xSpeed *= -1;
  } 
  
  if (ball.xPos <= 0){
    textSize(32);
    fill('red')
    text('YOU LOSE', (height-100)/2, (width/2)-200);
    text('Time: '+timer+'s', (height-100)/2, (width/2)-120);
    stop = true;
  }
  // init objects
  rect(paddle.xPos, paddle.yPos, paddle.width, paddle.height);
  //pop();
  rect(ball.xPos, ball.yPos, ball.size, ball.size);
  rect(0, 400, 400, 200)
  textSize(15)
  if (label == 'Both') {
    fill('black')
    text('Up', 200, 500)
    text(floor(confidence*100)+'%', 200, 550)
  }
  else if (label == 'Right') {
    fill('black')
    text('Down', 200, 500)
    text(floor(confidence*100)+'%', 200, 550)
  }
}


// Get a prediction for the current video frame
function classifyVideo() {
  flippedVideo = ml5.flipImage(video)
  classifier.classify(flippedVideo, gotResult);
  flippedVideo.remove();

}

// When we get a result
function gotResult(error, results) {
  // If there is an error
  if (error) {
    console.error(error);
    return;
  }
  label = results[0].label;
  confidence = results[0].confidence;
  classifyVideo();
}