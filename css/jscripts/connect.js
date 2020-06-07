var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60) };

var canvasParent = document.getElementById("game-parent");
var canvas = document.getElementById("game");
canvas.width = window.innerWidth/2;
canvas.height = canvas.width * (6/7);
var context = canvas.getContext('2d');

var holeRadius = canvas.width / 16;
var columnBottoms = [5, 11, 17, 23, 29, 35, 41];
var topYCoords = null;
var topXCoords = [];
var cpuScores = [0, 0, 0, 0, 0, 0, 0];
var playerScores = [0, 0, 0, 0, 0, 0, 0];
var colWeight = [-3, -2, -1, 0, -1, -2, -3];
var dangerIndex = [null, null, null, null, null, null, null]
var holes = [];
var mouseLoc = [];
var mouseClickLoc = [];
var dropTrigger = false;

var playerStart = Math.random() >= 0.5;
if (playerStart) {
    var playerTurn = true;
} else {
    var playerTurn = false;
}
//var playerTurn = false;
var winner = null;
var winningHoles = [];
var keysDown = {};
var mouseDown = false;

manila = "#4a7cff";
soviet = "#fe5353";

var player = new Player();
var board = new Board();
var chipDropped = new DropChip(null, 0, null);
var cpu = new CPU();

window.onload = function () {
    canvasParent.appendChild(canvas);
    animate(step);
};

window.addEventListener("keydown", function (event) {
    if (event.keyCode == 86) {
        mouseDown = true;
    }
    keysDown[event.keyCode] = true;
}, false);

window.addEventListener("keyup", function (event) {
    mouseDown = false;
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
    board.reset();
    player.update();
    cpu.update();
    chipDropped.update();
};

var render = function () {
    context.fillStyle = "rgb(255, 217, 102)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    cpu.render();
    chipDropped.render();
    player.render();
    board.render();
};

var determineException = function(holeIndex) {
    currentHoleCol = Math.floor(holeIndex/6);

    totalExceptions = [];

    if (currentHoleCol in colExceptions) {
        totalExceptions.push.apply(totalExceptions, colExceptions[currentHoleCol]);
    } 

    currentHoleRow = holeIndex - (currentHoleCol * 6);
    if (currentHoleRow in rowExceptions) {
        totalExceptions.push.apply(totalExceptions, rowExceptions[currentHoleRow]);
    } 

    totalExceptions = totalExceptions.sort((function (a, b) { return a - b }));
    for (var i = 0; i < totalExceptions.length - 1; i++) {
        if (totalExceptions[i] - totalExceptions[i+1] == 0) {
            totalExceptions.splice(i, 1);
        }
    }
    return totalExceptions;
};

var neighbours = function(holeIndex, owner) {
    //hole[1] = owner;
    checkIndices = {1: 1, 5: 1, 6: 1, 7: 1};
    colExceptions = {0: [-7, -6, -5], 6: [5, 6, 7]};
    rowExceptions = {0: [-7, -1, 5], 5: [-5, 1, 7]};

    currentHole = holeIndex;
    baseExceptions = determineException(currentHole);
    //console.log(totalExceptions);
    for (var index in checkIndices) {
        index = parseInt(index, 10);
        var checkleft = true;
        var checkright = true;
        var resultNotFound = true;
        var rightCount = currentHole;
        var leftCount = currentHole;
        var linedHoles = [board.holes[currentHole][0]];
        leftExceptions = baseExceptions;
        rightExceptions = baseExceptions;
        //console.log(index);

        while (resultNotFound) {
            //console.log(leftExceptions);
            leftCount -= index;
            if (leftExceptions.includes(-index) && checkleft) {
                checkleft = false;
            } else if (typeof board.holes[leftCount] != "undefined" && board.holes[leftCount][1] == owner && checkleft) {
                //console.log(leftCount);
                //console.log(this.holes[leftCount][1]);
                linedHoles.unshift(board.holes[leftCount][0])
                checkIndices[index] += 1;
                leftExceptions = determineException(leftCount);
            } else if (checkleft) {
                checkleft = false;
            }

            //console.log(rightExceptions);
            rightCount += index;
            if (rightExceptions.includes(index) && checkright) {
                checkright = false;
            } else if (typeof board.holes[rightCount] != "undefined" && board.holes[rightCount][1] == owner && checkright) {
                //console.log(rightCount);
                //console.log(this.holes[rightCount][1]);
                linedHoles.push(board.holes[rightCount][0])
                checkIndices[index] += 1;
                rightExceptions = determineException(rightCount);
            } else if (checkright) {
                checkright = false;
            }

            if (checkIndices[index] >= 4) {
                return [checkIndices, linedHoles];
            }
            if (!checkleft && !checkright) {
                //console.log("nonefound");
                //checkIndices[index] = 1;
                resultNotFound = false;
            }
        }
    }
    return [checkIndices, null];
};


function Board() {
    this.fill = null;
    this.highlightedColumn = null;
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
    var four = neighbours(this.holes.indexOf(hole), owner)[1];
    var checkTrigger = playerStart ? "player" : "cpu";
    if (four) {
        winningHoles = four;
        winner = owner;
    }
    else if (owner == checkTrigger) {
        for (var column = 0; column < 7; column++) {
            if (cpuScores[column] != null && cpuScores[column] != "danger") {
                for (var i = 0; i < 6; i++) {
                    var totalHoleScore = colWeight[column];
                    potentialOwners = ["cpu", "player"];
                    if (this.holes[columnBottoms[column] - i][1] == null) {
                        for (var ownerPtr of potentialOwners) {
                            //console.log(ownerPtr);
                            var posScores = neighbours(columnBottoms[column] - i, ownerPtr)[0];
                            //console.log(posScores);
                            for (const [key, value] of Object.entries(posScores)) {
                                totalHoleScore += (Math.pow(value, value));
                            }
                            if (ownerPtr == "cpu") {
                                cpuScores[column] = totalHoleScore;
                            } else {
                                playerScores[column] = totalHoleScore;
                            }
                        }
                        break;
                    }
                }
            }
        }
    }
    /*
    else {
        for (var column = 0; column < 7; column++) {
            if (cpuScores[column] != null && cpuScores[column] != "danger") {
                for (var i = 0; i < 6; i++) {
                    var totalHoleScore = colWeight[column];
                    potentialOwners = ["cpu", "player"];
                    if (this.holes[columnBottoms[column] - i][1] == null) {
                        for (var ownerPtr of potentialOwners) {
                            //console.log(ownerPtr);
                            var posScores = neighbours(columnBottoms[column] - i, ownerPtr)[0];
                            //console.log(posScores);
                            for (const [key, value] of Object.entries(posScores)) {
                                totalHoleScore += (Math.pow(value, value));
                            }
                            if (ownerPtr == "cpu") {
                                cpuScores[column] = totalHoleScore;
                            } else {
                                playerScores[column] = totalHoleScore;
                            }
                        }
                        break;
                    }
                }
            }
        }
    } */
};

Board.prototype.render = function() {
    for (var i = 0; i < this.holes.length; i ++) {
        if (this.holes[i][1] == "player") {
            this.fill = manila;
        } else if (this.holes[i][1] == "cpu") {
            this.fill = soviet;
        } else {
            this.fill = "rgba(0, 0, 0, 0.0001)";
        }
        //var stroke = "white";
        if (mouseDown) {
            var stroke = "rgb(141, 141, 141)";
        } else {
            var stroke = "white";
        }
        context.beginPath();
        context.arc(this.holes[i][0][0], this.holes[i][0][1], holeRadius, 2 * Math.PI, false);
        context.fillStyle = this.fill;
        context.strokeStyle = stroke;//"white";//"rgba(0, 0, 0, 0.1)";
        context.lineWidth = 2;
        context.stroke();
        context.fill();
    }
    if (winner) {
        context.beginPath();
        context.moveTo(winningHoles[0][0], winningHoles[0][1]);
        context.lineTo(winningHoles[3][0], winningHoles[3][1]);
        //context.strokeStyle = "green";
        context.stroke();
    }
};

Board.prototype.reset = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if (value == 78) {
            winner = null;
            winningHoles = [];
            playerTurn = !playerStart;
            playerStart = !playerStart;
            cpuScores = [0, 0, 0, 0, 0, 0, 0];
            playerScores = [0, 0, 0, 0, 0, 0, 0];
            if (dropTrigger) {
                dropTrigger = false;
                chipDropped = new DropChip(null, 0, null);
                board = new Board();
            } else {
                board = new Board();
            }
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
        this.color = manila;
    } else if (this.owner == "cpu") {
        this.color = soviet;
    } else if (this.owner == "lastCpu") {
        this.color = "#ff196a";
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
    this.chip = new Chip(null, 0, holeRadius, null);
}

Player.prototype.render = function () {
    this.chip.render();
};

Player.prototype.update = function () {
    for (var i = 0; i < board.holes.length; i++) {
        context.beginPath();
        context.arc(board.holes[i][0][0], board.holes[i][0][1], holeRadius, 2 * Math.PI, false);
        if (context.isPointInPath(mouseClickLoc[0], mouseClickLoc[1]) || 
            (mouseClickLoc[0] < (topXCoords[Math.floor(i / 6)] + holeRadius) && 
            mouseClickLoc[0] > (topXCoords[Math.floor(i / 6)] - holeRadius) && 
            mouseClickLoc[1] < (board.holes[5][0][1] + holeRadius) && 
            mouseClickLoc[1] > (board.holes[0][0][1] - (2 * holeRadius)))) 
            {
            mouseClickLoc = [];
            var columnHead = columnBottoms[Math.floor(i/6)];
            for (var j = 0; j < 6; j++) {
                if (!board.holes[columnHead - j][1] && !dropTrigger && playerTurn) {
                    //this.dropchip.col = topXCoords[Math.floor(i / 6)];
                    chipDropped.droppingchip.col = board.holes[columnHead][0][0];
                    chipDropped.droppingchip.owner = "player";
                    if (cpuScores[Math.floor(i/6)] == "danger") {
                        cpuScores[Math.floor(i/6)] = 0;
                        playerScores[Math.floor(i/6)] = 0;
                    }
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

var determineLowest = function(colBottom) {
    for (var i = 0; i < 6; i++) {
        if (!board.holes[colBottom - i][1]) {
            return colBottom - i
        }
    }
    return -1
};

var calcDrop = function(cpuScoresScratch, playerScoresScratch) {
    if (!playerStart && !cpuScoresScratch.some(item => item !== 0)) {
        retCol = columnBottoms[3];
    } else {
        noRowFound = true;
        var retCol = null;
        winningMove = false;
        cpuScoresCopy = cpuScoresScratch.slice();
        playerScoresCopy = playerScoresScratch.slice();
        dangerFound = false;
        while (noRowFound) {
            cpuBest = Math.max(...cpuScoresCopy.filter(val => val != null && val != "danger" && val != "trap"));
            if (cpuBest && cpuBest != -Infinity) {
                playerBest = Math.max(...playerScoresCopy.filter(val => val != null));
                var zonePtr = null;
                if (cpuBest >= 255 || playerBest < 26) {
                    if (cpuBest >= 255) {
                        winningMove = true;
                    }
                    zonePtr = cpuScoresCopy.indexOf(cpuBest);
                } else {
                    zonePtr = playerScoresCopy.indexOf(playerBest);
                }
                retCol = columnBottoms[zonePtr];
                if (!board.holes[retCol - 5][1]) {
                    //console.log("false");
                    nextHoleIndex = determineLowest(retCol) - 1;
                    if (retCol - nextHoleIndex < 6 && !winningMove) {
                        nextCpuWinner = neighbours(nextHoleIndex, "cpu")[1];
                        if (nextCpuWinner) {
                            if (playerScoresCopy[zonePtr] < 255) {
                                cpuScoresCopy[zonePtr] = "trap";
                                playerScoresCopy[zonePtr] = null;
                                //retCol = calcDrop(cpuScoresCopy, playerScoresCopy);
                            } else {
                                nextCpuWinner = false;
                            }
                        }
                        [nextScores, nextWinner] = neighbours(nextHoleIndex, "player");
                        if (nextWinner) {
                            cpuScoresCopy[zonePtr] = "danger";
                            playerScoresCopy[zonePtr] = null;
                            //retCol = calcDrop(cpuScoresCopy, playerScoresCopy);               
                        //retCol = calcDrop(cpuScoresCopy, playerScoresCopy);               
                            //retCol = calcDrop(cpuScoresCopy, playerScoresCopy);               
                        }
                        if (nextCpuWinner || nextWinner) {
                            retCol = calcDrop(cpuScoresCopy, playerScoresCopy);
                        }
                    }
                    noRowFound = false;
                } else {
                    cpuScoresScratch[zonePtr] = null;
                    playerScoresScratch[zonePtr] = null;
                    //cpuScoresNull = cpuScoresScratch.slice(0, zonePtr).concat(cpuScoresScratch.slice((zonePtr+1), cpuScoresScratch.length));
                    //playerScoresNull = playerScoresScratch.slice(0, zonePtr).concat(playerScoresScratch.slice((zonePtr + 1), playerScoresScratch.length));
                    //console.log(cpuScoresScratch);
                    retCol = calcDrop(cpuScoresScratch, playerScoresScratch);
                    noRowFound = false;
                }
            } else {
                for (var i = 0; i < cpuScoresScratch.length; i++) {
                    if (cpuScoresScratch[i] == "danger") {
                        retCol = columnBottoms[i];
                        noRowFound = false;
                    }
                }
            }
        }
    }
    //console.log(cpuScoresCopy);
    return retCol;
};

CPU.prototype.update = function () {
    if (!playerTurn && !winner) {
        col = calcDrop(cpuScores, playerScores);
        for (var j = 0; j < 6; j++) {
            if (!board.holes[col - j][1] && !dropTrigger) {
                this.chip.owner = "cpu";
                this.chip.move(topXCoords[Math.floor(col/6)]);
                chipDropped.droppingchip.col = board.holes[col][0][0];
                chipDropped.droppingchip.owner = "cpu";
                chipDropped.droppingchip.dest = board.holes[col - j];
                dropTrigger = true;
                break;
            }
        }
    } else {
        this.chip.owner = "rgba(0, 0, 0, 0.0001)";
    }
};

