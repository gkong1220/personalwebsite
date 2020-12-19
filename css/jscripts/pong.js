var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvasParent = document.getElementById("game-parent");
var canvas = document.getElementById("game");
var width = 600;
var height = 400;
canvas.width = window.innerWidth/2;
canvas.height = canvas.width * (2/3);
var context = canvas.getContext('2d');
var keysDown = {};

var player = null;
var computer = null;
var ball = new Ball(canvas.width/2, canvas.height/2);
var scoreboard = new Scoreboard(0, 0);
var sameMoveCount = 0;
var playerSide = true;
var lastMove = 0;
var winner = null;

var leftHanded = false;
var setSide = false;

var paddleWidth = canvas.width/150;
var paddleHeight = canvas.width/15;

var paddleMove = paddleHeight/15;

//keyCodes 
var handKeyCodes = {"left": [87, 83], "right": [38, 40]};

//paddle dummies
var rightDummy = new Paddle(canvas.width - 20, canvas.height/2 - 40, paddleWidth, paddleHeight);
var leftDummy = new Paddle(10, canvas.height/2 - 40, paddleWidth, paddleHeight);

window.onload = function() {
    canvasParent.appendChild(canvas);
    animate(step);
};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
    if ((event.keyCode == 38 || event.keyCode == 40 || event.keyCode == 39) && !setSide) {
        console.log("Right");
        leftHanded = false;
        setSide = true;
        player = new Player();
        computer = new Computer();
    } else if ((event.keyCode == 83 || event.keyCode == 87 || event.keyCode == 37) && !setSide) {
        console.log("Left");
        leftHanded = true;
        setSide = true;
        player = new Player();
        computer = new Computer();
    }
    if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
}, false);
  
window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

function countSameMoves(last, paddleY, count) {
    if (last == paddleY) {
        console.log('same-move');
        count += 1;
    }
    else {
        count = 0;
    }
    return [count, paddleY];
    //lastMove = paddle2.y;
}

var step = function() {
    update();
    render();
    drawDashedLine();
    animate(step);
};

var update = function() {
    if (setSide) {
        player.update();
        ball.update(player.paddle, computer.paddle);
        computer.update(ball);
    } 
    scoreboard.reset();
};

var render = function () {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (setSide) {
        player.render();
        computer.render();
    } else {
        leftDummy.render();
        rightDummy.render();
    }
    ball.render();
    scoreboard.render();
};

var drawDashedLine = function () {
    context.setLineDash([10, 5]);
    context.beginPath();
    context.strokeStyle = "#FFFFFF";
    context.moveTo(canvas.width/2, 10);
    context.lineTo(canvas.width/2, canvas.height - 10);
    context.stroke();
    context.fill();
}

function Scoreboard(player_score, cpu_score) {
    this.player_score = player_score;
    this.cpu_score = cpu_score;
}

Scoreboard.prototype.render = function() {
    context.font = "3rem Karla";
    context.fillStyle = "white";
    if (leftHanded) {
        context.fillText(this.player_score, canvas.width/4 - (context.measureText(this.cpu_score).width/2), canvas.height * 0.15);
        context.fillText(this.cpu_score, canvas.width * 0.75 - (context.measureText(this.player_score).width / 2), canvas.height * 0.15);
    } else {
        context.fillText(this.cpu_score, canvas.width/4 - (context.measureText(this.cpu_score).width/2), canvas.height * 0.15);
        context.fillText(this.player_score, canvas.width * 0.75 - (context.measureText(this.player_score).width / 2), canvas.height * 0.15);
    }
    if (this.player_score == 21 || this.cpu_score == 21 ) {
        winner = this.player_score > this.cpu_score ? "Player" : "CPU";
        context.font = "1.5rem Arial";
        context.fillStyle = "white";
        //context.textAlign = "center"
        context.fillText("GAME OVER!", canvas.width / 2 - context.measureText("GAME OVER").width / 2, canvas.height*0.75);
        context.fillText(`${winner} won`, canvas.width / 2 - context.measureText(`${winner} won`).width / 2, canvas.height * 0.9);
        for (var key in keysDown) {
            var value = Number(key);
            if (value == 78 || value == 32) {
                scoreboard = new Scoreboard(0, 0);
                ball = new Ball(canvas.width / 2, canvas.height / 2);
            }
        }
    }

    // if space bar before setting side
    for (var key in keysDown) {
        if (Number(key) == 32 && !setSide) {
            context.font = "1rem Karla";
            context.fillStyle = "white";
            context.fillText("Set left or right paddle as your preferred side before first serve.", canvas.width / 2 - context.measureText("Set left or right paddle as your preferred side first before first serve.").width / 2, canvas.height*0.75);
        }
    }
}

Scoreboard.prototype.update = function(scorer) {
    if (scorer == "player") {
        this.player_score += 1;
    }
    else if (scorer == "cpu") {
        this.cpu_score += 1;
    }
}

Scoreboard.prototype.reset = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 78) {
            sameMoveCount = 0;
            scoreboard = new Scoreboard(0, 0);
            ball = new Ball(canvas.width/2, canvas.height/2);
        }
    }
}

function Paddle(x, y, width, height, color="#FFFFFF") {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
    this.color = color;
  }
  
Paddle.prototype.render = function() {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function (x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if (this.y < 0) { // all the way to the top
        this.y = 0;
        this.y_speed = 0;
    } else if (this.y + this.height > canvas.height) { // all the way to the bottom
        this.y = canvas.height - this.height;
        this.y_speed = 0;
    }
};

Player.prototype.render = function () {
    this.paddle.render();
};

Player.prototype.update = function () {
    for (var key in keysDown) {
        var value = Number(key);
        if (!leftHanded) {
            if (value == 38) { // up arrow
                this.paddle.move(0, -paddleMove);
            } else if (value == 40) { // down arrow
                this.paddle.move(0, paddleMove);
            } else {
                this.paddle.move(0, 0);
            }
        } else {
            if (value == handKeyCodes["left"][0]) { // up arrow
                this.paddle.move(0, -paddleMove);
            } else if (value == handKeyCodes["left"][1]) { // down arrow
                this.paddle.move(0, paddleMove);
            } else {
                this.paddle.move(0, 0);
            }
        }
    }
};

function Player() {
    if (setSide && !leftHanded) {
        console.log("right side");
        this.paddle = new Paddle(canvas.width - 20, canvas.height/2 - 40, paddleWidth, paddleHeight, "#F8C018");
    } else if (setSide && leftHanded) {
        console.log("left-side");
        this.paddle = new Paddle(10, canvas.height/2 - 40, paddleWidth, paddleHeight, "#F8C018");
    }
}

Computer.prototype.update = function (ball) {
    var y_pos = ball.y;
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    var ballDirection;
    if (!leftHanded) {
        ballDirection = ball.x_speed < 0;
    } else {
        ballDirection = ball.x_speed > 0;
    }
    if (sameMoveCount == 1 && ball.x < canvas.width * 0.75 && ball.x > canvas.width/4 && ballDirection) {
        console.log("detected");
        diff = paddleMove / 2;
    } else if (diff < -(paddleMove * 1.25)) { // max speed left
        diff = -(paddleMove * 1.25);
    } else if (diff > (paddleMove * 1.25)) { // max speed right
        diff = paddleMove * 1.25;
    } 
    this.paddle.move(0, diff);
    if (this.paddle.y < 0) {
        this.paddle.y = 0;
    } else if (this.paddle.y + this.paddle.height > canvas.height) {
        this.paddle.y = canvas.height - this.paddle.height;
    }
};

Computer.prototype.render = function () {
    this.paddle.render();
};
 
function Computer() {
    if (setSide && !leftHanded) {
        this.paddle = new Paddle(10, canvas.height/2 - 40, paddleWidth, paddleHeight);
    } else if (setSide && leftHanded) {
        this.paddle = new Paddle(canvas.width - 20, canvas.height/2 - 40, paddleWidth, paddleHeight);
    }
 }
  
function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.y_speed = 0;
    this.x_speed = 0;
    this.radius = canvas.width * 0.005;
    for (var key in keysDown){
        var value = Number(key);
        if (value == 32){
            this.y_speed = 0;
            if (leftHanded) {
                this.x_speed = -this.radius;
            } else {
                this.x_speed = this.radius;
            }
        }
    }
  }
  
Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#FFFFFF";
    context.fill();
  };

Ball.prototype.update = function(paddle1, paddle2) {
    if (leftHanded) {
        var temp = paddle1;
        paddle1 = paddle2;
        paddle2 = temp;
    }

    this.x += this.x_speed;
    this.y += this.y_speed;
    var left_x = this.x - 5;
    var top_y = this.y - 5;
    var right_x = this.x + 5;
    var bottom_y = this.y -5;

    if(this.y - 5 < 0){ //hitting top wall
        this.y = 5;
        this.y_speed = -this.y_speed;
    }
    else if(this.y + 5 > canvas.height) { //hitting bottom wall
        this.y = canvas.height - 5;
        this.y_speed = -this.y_speed;
    }

    // scoring
    if (this.x > canvas.width || this.x < 0) {
        if (!leftHanded) {
            if (this.x > canvas.width) {
                scoreboard.update("cpu");
            }
            else if (this.x < 0) {
                scoreboard.update("player");
            }
        } else {
            if (this.x > canvas.width) {
                scoreboard.update("player");
            }
            else if (this.x < 0) {
                scoreboard.update("cpu");
            }
        }
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.y_speed = 0;
        this.x_speed = 0;
    }

    // wait for serve
    if (this.x == canvas.width/2 && this.y == canvas.height/2 && this.y_speed == 0 && this.x_speed == 0) {
        for (var key in keysDown){
            var value = Number(key);
            if (value == 32){
                this.y_speed = 0;
                if (!leftHanded) {
                    this.x_speed = this.radius;
                } else {
                    this.x_speed = -this.radius;
                }
            }
        }
    }

    // determine behavior when hitting paddles
    if(right_x > canvas.width/2) {
        if(left_x < (paddle1.x + paddle1.width) && right_x > paddle1.x && bottom_y > paddle1.y && top_y < (paddle1.y + paddle1.height)) {
          // hit right paddle
          this.x_speed = -this.radius;
          this.y_speed += (paddle1.y_speed / 2);
          this.x += this.x_speed;
          if (leftHanded) {
            var moveDetect = countSameMoves(lastMove, paddle2.y, sameMoveCount);
            sameMoveCount = moveDetect[0];
            lastMove = moveDetect[1];
          }
        }
    } 
    else {
        if(left_x < (paddle2.x + paddle2.width) && right_x > paddle2.x && bottom_y > paddle2.y && top_y < (paddle2.y + paddle2.height)) {
            // hit left paddle
            this.x_speed = this.radius;
            this.y_speed += (paddle2.y_speed / 2);
            this.x += this.x_speed;
            if (!leftHanded) {
                var moveDetect = countSameMoves(lastMove, paddle1.y, sameMoveCount);
                sameMoveCount = moveDetect[0];
                lastMove = moveDetect[1];
            }
        }
    }
};
  