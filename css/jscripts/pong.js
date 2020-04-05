var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 600;
var height = 400;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});
  
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

function Scoreboard(player_score, cpu_score) {
    this.player_score = player_score;
    this.cpu_score = cpu_score;
}

Scoreboard.prototype.render = function() {
    context.font = "40px Arial";
    context.fillStyle = "white";
    context.fillText(this.cpu_score, 250, 50);
    context.fillText(this.player_score, 330, 50);
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
            ball = new Ball(300, 200);
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

function Player() {
    this.paddle = new Paddle(580, 175, 10, 50);
 }
 
function Computer() {
   this.paddle = new Paddle(10, 175, 10, 50);
 }

Player.prototype.render = function() {
    this.paddle.render();
  };
  
Computer.prototype.render = function() {
    this.paddle.render();
  };

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
            this.x_speed = 3;
        }
    }
  }

var drawDashedLine = function() {
    context.setLineDash([10, 5]);
    context.beginPath();
    context.strokeStyle = "#FFFFFF";
    context.moveTo(300, 10);
    context.lineTo(300, 390);
    context.stroke();
    context.fill();
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
    else if(this.y + 5 > 400) { //hitting bottom wall
        this.y = 395;
        this.y_speed = -this.y_speed;
    }

    if (this.x > 600 || this.x < 0) {
        if (this.x > 600) {
            scoreboard.update("cpu");
        }
        else if (this.x < 0) {
            scoreboard.update("player");
        }
        this.x = 300;
        this.y = 200;
        this.y_speed = 0;
        this.x_speed = 0;
    }

    if (this.x == 300 && this.y == 200 && this.y_speed == 0 && this.x_speed == 0) {
        for (var key in keysDown){
            var value = Number(key);
            if (value == 32){
                this.y_speed = 0;
                this.x_speed = 3;
            }
        }
    }

    if(right_x > 300) {
        if(left_x < (paddle1.x + paddle1.width) && right_x > paddle1.x && bottom_y > paddle1.y && top_y < (paddle1.y + paddle1.height)) {
          // hit the player's paddle
          this.x_speed = -3;
          this.y_speed += (paddle1.y_speed / 2);
          this.x += this.x_speed;
        }
    } 
    else {
        if(left_x < (paddle2.x + paddle2.width) && right_x > paddle2.x && bottom_y > paddle2.y && top_y < (paddle2.y + paddle2.height)) {
          // hit the computer's paddle
          this.x_speed = 3;
          this.y_speed += (paddle2.y_speed / 2);
          this.x += this.x_speed;
        }
    }
};

var player = new Player();
var computer = new Computer();
var ball = new Ball(300, 200);
var scoreboard = new Scoreboard(0, 0);
  
var render = function() {
    context.fillStyle = "#000000";
    context.fillRect(0, 0, width, height);
    player.render();
    computer.render();
    ball.render();
    scoreboard.render();
  };
  
Player.prototype.update = function() {
    for(var key in keysDown) {
      var value = Number(key);
      if(value == 38) { // up arrow
        this.paddle.move(0, -4);
      } else if (value == 40) { // down arrow
        this.paddle.move(0, 4);
      } else {
        this.paddle.move(0, 0);
      }
    }
};
  
Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.y < 0) { // all the way to the top
      this.y = 0;
      this.y_speed = 0;
    } else if (this.y + this.height > 400) { // all the way to the right
      this.y = 400 - this.height;
      this.y_speed = 0;
    }
};

Computer.prototype.update = function(ball) {
    var y_pos = ball.y;
    var diff = -((this.paddle.y + (this.paddle.height / 2)) - y_pos);
    if(diff < 0 && diff < -4) { // max speed left
      diff = -2;
    } else if(diff > 0 && diff > 4) { // max speed right
      diff = 2;
    }
    this.paddle.move(0, diff);
    if(this.paddle.y < 0) {
      this.paddle.y = 0;
    } else if (this.paddle.y + this.paddle.height > 400) {
      this.paddle.y = 400 - this.paddle.height;
    }
};