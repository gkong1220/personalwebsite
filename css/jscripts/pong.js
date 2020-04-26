var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 600;
var height = 400;
canvas.width = window.innerWidth/2;
canvas.height = canvas.width * (2/3);
var context = canvas.getContext('2d');
var keysDown = {};

var player = new Player();
var computer = new Computer();
var ball = new Ball(canvas.width/2, canvas.height/2);
var scoreboard = new Scoreboard(0, 0);
var sameMoveCount = 0;
var playerSide = true;
var lastMove = 0;
var winner = null;

window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
    if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
}, false);
  
window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

var step = function() {
    update();
    render();
    drawDashedLine();
    animate(step);
};

var update = function() {
    player.update();
    ball.update(player.paddle, computer.paddle);
    computer.update(ball);
    scoreboard.reset();
};

var render = function () {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.render();
    computer.render();
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
    context.font = "3rem Arial";
    context.fillStyle = "white";
    context.fillText(this.cpu_score, canvas.width/4 - (context.measureText(this.cpu_score).width/2), canvas.height * 0.15);
    context.fillText(this.player_score, canvas.width * 0.75 - (context.measureText(this.player_score).width / 2), canvas.height * 0.15);
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
            scoreboard = new Scoreboard(0, 0);
            ball = new Ball(canvas.width/2, canvas.height/2);
        }
    }
}

function Paddle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.x_speed = 0;
    this.y_speed = 0;
  }
  
Paddle.prototype.render = function() {
    context.fillStyle = "#FFFFFF";
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
        if (value == 38) { // up arrow
            this.paddle.move(0, -4);
        } else if (value == 40) { // down arrow
            this.paddle.move(0, 4);
        } else {
            this.paddle.move(0, 0);
        }
    }
};

function Player() {
    this.paddle = new Paddle(canvas.width - 20, canvas.height/2 - 40, 10, 80);
}

Computer.prototype.update = function (ball) {
    var y_pos = ball.y;
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    if (sameMoveCount == 1 && ball.x < canvas.width * 0.75 && ball.x > canvas.width/4 && ball.x_speed < 0) {
        diff = 2;
    } else if (diff < -4) { // max speed left
        diff = -4;
    } else if (diff > 4) { // max speed right
        diff = 4;
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
   this.paddle = new Paddle(10, canvas.height/2 - 40, 10, 80);
 }
  
function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.y_speed = 0;
    this.x_speed = 0;
    this.radius = 5;
    for (var key in keysDown){
        var value = Number(key);
        if (value == 32){
            this.y_speed = 0;
            this.x_speed = 6;
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

    if (this.x > canvas.width || this.x < 0) {
        if (this.x > canvas.width) {
            scoreboard.update("cpu");
        }
        else if (this.x < 0) {
            scoreboard.update("player");
        }
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.y_speed = 0;
        this.x_speed = 0;
    }

    if (this.x == canvas.width/2 && this.y == canvas.height/2 && this.y_speed == 0 && this.x_speed == 0) {
        for (var key in keysDown){
            var value = Number(key);
            if (value == 32){
                this.y_speed = 0;
                this.x_speed = 5;
            }
        }
    }

    if(right_x > canvas.width/2) {
        if(left_x < (paddle1.x + paddle1.width) && right_x > paddle1.x && bottom_y > paddle1.y && top_y < (paddle1.y + paddle1.height)) {
          // hit the player's paddle
          this.x_speed = -5;
          this.y_speed += (paddle1.y_speed / 2);
          this.x += this.x_speed;
        }
    } 
    else {
        if(left_x < (paddle2.x + paddle2.width) && right_x > paddle2.x && bottom_y > paddle2.y && top_y < (paddle2.y + paddle2.height)) {
            // hit the computer's paddle
            this.x_speed = 5;
            this.y_speed += (paddle2.y_speed / 2);
            this.x += this.x_speed;
            if (lastMove == paddle2.y) {
                sameMoveCount += 1;
            }
            else {
                sameMoveCount = 0;
            }
            lastMove = paddle2.y;
        }
    }
};
  