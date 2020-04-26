var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60) };

var canvas = document.createElement('canvas');
canvas.width = window.innerWidth / 2;
canvas.height = canvas.width * (6 / 7);
var context = canvas.getContext('2d');

var holeRadius = canvas.width / 16;
var columnBottoms = [5, 11, 17, 23, 29, 35, 41];
var topYCoords = null;
var topXCoords = [];
var holes = [];
var mouseLoc = [];
var mouseClickLoc = [];
var dropTrigger = false;
var playerTurn = true;
var winner = null;
var winningHoles = [];
var keysDown = {};

var player = new Player();
var board = new Board();
var chipDropped = new DropChip("red", 0, null);
var cpu = new CPU();

window.onload = function () {
    document.body.appendChild(canvas);
    animate(step);
};

window.addEventListener("keydown", function (event) {
    keysDown[event.keyCode] = true;
}, false);

window.addEventListener("keyup", function (event) {
    delete keysDown[event.keyCode];
});

window.addEventListener("mousemove", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseLoc = [event.clientX - rect.left, event.clientY - rect.top];
} );

window.addEventListener("click", function(event) {
    var rect = canvas.getBoundingClientRect();
    mouseClickLoc = [event.clientX - rect.left, event.clientY - rect.top];
}, false );

var step = function () {
    update();
    render();
    animate(step);
    //console.log(mouseLoc);
};

var update = function() {
    player.update();
    cpu.update();
    chipDropped.update();
    board.reset();
};

var render = function () {
    context.fillStyle = "yellow";
    context.fillRect(0, 0, canvas.width, canvas.height);
    player.render();
    cpu.render();
    chipDropped.render();
    board.render();
};

function Board() {
    this.fill = null;
    this.holes = [];
    for (col = 1; col < 8; col++) {
        for (row = 1; row < 7; row++) {
            var xCoord = col * (holeRadius * 2);
            var yCoord = row * (holeRadius * 2);
            this.holes.push([[xCoord, yCoord], null]);
        }
        topXCoords.push(xCoord);
    }
    topYCoords = this.holes[0][0][1];
}

Board.prototype.update = function(hole, owner) {
    hole[1] = owner;
    checkIndices = {1: 1, 5: 1, 6: 1, 7: 1};
    colExceptions = {0: [-7, -6, -5], 6: [5, 6, 7]};
    rowExceptions = {0: [-7, -1, 5], 5: [-5, 1, 7]};

    currentHole = this.holes.indexOf(hole);
    currentHoleCol = Math.floor(currentHole/6);

    totalExceptions = [];

    if (currentHoleCol in colExceptions) {
        totalExceptions.push.apply(totalExceptions, colExceptions[currentHoleCol]);
    } 
    currentHoleRow = currentHole - (currentHoleCol * 6);
    if (currentHoleRow in rowExceptions) {
        totalExceptions.push.apply(totalExceptions, rowExceptions[currentHoleRow]);
    } 
    totalExceptions = totalExceptions.sort((function (a, b) { return a - b }));
    for (var i = 0; i < totalExceptions.length - 1; i++) {
        if (totalExceptions[i] - totalExceptions[i+1] == 0) {
            totalExceptions.splice(i, 1);
        }
    }

    console.log(currentHole);
    for (var index in checkIndices) {
        index = parseInt(index, 10);
        var checkleft = true;
        var checkright = true;
        var resultNotFound = true;
        var rightCount = currentHole;
        var leftCount = currentHole;
        var linedHoles = [this.holes[currentHole][0]];
        console.log(index);
        while (resultNotFound && winner == null) {
            leftCount -= index;
            if (-index in totalExceptions) {
                console.log("exception");
                checkLeft = false;
            } else if (typeof this.holes[leftCount] != "undefined" && this.holes[leftCount][1] == owner && checkleft) {
                //console.log(leftCount);
                //console.log(this.holes[leftCount][1]);
                linedHoles.unshift(this.holes[leftCount][0])
                checkIndices[index] += 1;
            } else {
                checkleft = false;
            }
            rightCount += index;
            if (index in totalExceptions) {
                console.log("exception");
                checkright = false;
            } else if (typeof this.holes[rightCount] != "undefined" && this.holes[rightCount][1] == owner && checkright) {
                //console.log(rightCount);
                //console.log(this.holes[rightCount][1]);
                linedHoles.push(this.holes[rightCount][0])
                checkIndices[index] += 1;
            } else {
                checkright = false;
            }
            if (checkIndices[index] == 4) {
                checkIndices[index] = 1;
                console.log("winner!");
                winningHoles = linedHoles;
                winner = owner;
                resultNotFound = false;
            }
            if (!checkleft && !checkright) {
                console.log("nonefound");
                checkIndices[index] = 1;
                resultNotFound = false;
            }
        }
    }
};

Board.prototype.render = function() {
    for (var i = 0; i < this.holes.length; i ++) {
        if (this.holes[i][1] == "player") {
            this.fill = "blue";
        } else if (this.holes[i][1] == "cpu") {
            this.fill = "red";
        } else {
            this.fill = "rgba(0, 0, 0, 0.01)";
        }
        context.beginPath();
        context.arc(this.holes[i][0][0], this.holes[i][0][1], holeRadius, 2 * Math.PI, false);
        context.fillStyle = this.fill;
        context.stroke();
        context.fill();
    }
    if (winner) {
        context.beginPath();
        context.moveTo(winningHoles[0][0], winningHoles[0][1]);
        context.lineTo(winningHoles[3][0], winningHoles[3][1]);
        //context.strokeStyle = "green";
        context.stroke();
        context.font = "5rem Arial";
        context.fillStyle = "white";
        context.fillText(`${winner} won!`, canvas.width / 2 - context.measureText(`${winner} won`).width / 2, canvas.height * 0.5);
    }
};

Board.prototype.reset = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 78) {
            console.log("in");
            winner = null;
            winningHoles = [];
            playerTurn = true;
            board = new Board();
        }
    }
};

function Chip(color, col, y, dest) {
    this.col = col;
    this.y = y;
    this.dest = dest;
    this.speed = canvas.width * 0.01;
    this.owner = null;
    this.color = color;
}

Chip.prototype.render = function() {
    context.beginPath();
    context.arc(this.col, this.y, holeRadius, 2 * Math.PI, false);
    if (this.owner == "player") {
        this.color = "blue";
    } else if (this.owner == "cpu") {
        this.color = "red";
    } else {
        this.color = "rgba(0, 0, 0, 0.000001)";
    }
    context.fillStyle = this.color;
    context.fill();
};

Chip.prototype.move = function(col) {
    this.col = col;
};

Chip.prototype.dummy = function() {
    if (dropTrigger) {
        this.y += this.speed;
        if (this.y <= this.dest[0][1] + 3 && this.y >= this.dest[0][1] - 3) {
            dropTrigger = false;
            playerTurn = !playerTurn;
            board.update(this.dest, this.owner);
            this.y = holeRadius;
            this.owner = null;
        }
    }
};

function DropChip(owner, column, destination) {
    this.column = column;
    this.destination = destination;
    this.droppingchip = new Chip(this.owner, this.column, holeRadius, this.destination);
};

DropChip.prototype.render = function() {
    this.droppingchip.render();
};

DropChip.prototype.update = function() {
    this.droppingchip.dummy();
};


function Player() {
    this.chip = new Chip("blue", 0, holeRadius, null);
}

Player.prototype.render = function () {
    this.chip.render();
};

Player.prototype.update = function () {
    for (var i = 0; i < board.holes.length; i++) {
        context.beginPath();
        context.arc(board.holes[i][0][0], board.holes[i][0][1], holeRadius, 2 * Math.PI, false);
        if (context.isPointInPath(mouseClickLoc[0], mouseClickLoc[1]) || (mouseClickLoc[0] < (topXCoords[Math.floor(i / 6)] + holeRadius) && mouseClickLoc[0] > (topXCoords[Math.floor(i / 6)] - holeRadius))) {
            mouseClickLoc = [];
            var columnHead = columnBottoms[Math.floor(i/6)];
            for (var j = 0; j < 6; j++) {
                if (!board.holes[columnHead - j][1] && !dropTrigger && playerTurn) {
                    //this.dropchip.col = topXCoords[Math.floor(i / 6)];
                    chipDropped.droppingchip.col = board.holes[columnHead][0][0];
                    chipDropped.droppingchip.owner = "player";
                    chipDropped.droppingchip.dest = board.holes[columnHead - j];
                    dropTrigger = true;
                    break;
                }
            }
        } else if (context.isPointInPath(mouseLoc[0], mouseLoc[1])) { //|| (mouseLoc[0] < (topXCoords[Math.floor(i / 6)] + holeRadius) && mouseLoc[0] > (topXCoords[Math.floor(i / 6)] - holeRadius))) {
            this.chip.owner = "player";
            this.chip.move(topXCoords[Math.floor(i/6)]);
        } else if (mouseLoc[0] < 0 || mouseLoc[0] > canvas.width || mouseLoc[1] < 0 || mouseLoc[1] > canvas.height) {
            this.chip.owner = null;
            this.chip.move(0);
        }
    }
};

function CPU() {
    this.chip = new Chip(null, 0, holeRadius, null);
}

CPU.prototype.render = function() {
    this.chip.render();
};

CPU.prototype.update = function () {
    col = columnBottoms[Math.floor(Math.random() * (6 - 0 + 1)) + 0];
    if (!playerTurn && !winner) {
        for (var j = 0; j < 6; j++) {
            if (!board.holes[col - j][1] && !dropTrigger) {
                this.chip.owner = "cpu";
                this.chip.move(topXCoords[col]);
                chipDropped.droppingchip.col = board.holes[col][0][0];
                chipDropped.droppingchip.owner = "cpu";
                chipDropped.droppingchip.dest = board.holes[col - j];
                dropTrigger = true;
                break;
            }
        }
    }
};

