var totalProgress = 0;

var videoNames = ["malick", "nolan", "villeneuve"];
var videoObjects = {};
var videoProgresses = {};

var songNames = ["richter", "taverner", "vangelis"];
var songObjects = {};
var songProgresses = {};

var calcTotalProgress = function(vidProgressList, songProgressList) {
    var progressSum = 0;
    for (progress in vidProgressList) {
        progressSum += vidProgressList[progress];
    }
    for (progress in songProgressList) {
        progressSum += songProgressList[progress];
    }
    totalProgress = (progressSum / (Object.keys(vidProgressList).length + Object.keys(songProgressList).length));
    console.log(vidProgressList);
    console.log(songProgressList);
    document.getElementById("percent-display").textContent = `${totalProgress}%`;
    if (totalProgress == 100) {
        document.getElementById("loading").classList.add("finished");
    }
}

for (var i = 0; i < videoNames.length; i++) {
    let currVideoName = videoNames[i];
    videoObjects[videoNames[i]] = document.getElementById(videoNames[i]);
    if (!(videoNames[i] in videoProgresses)) {
        videoProgresses[videoNames[i]] = 0;
    }
    if (videoObjects[currVideoName].readyState === 4) {
        videoProgresses[currVideoName] = 100;
        calcTotalProgress(videoProgresses, songProgresses);
    } else {
        videoObjects[currVideoName].addEventListener("progress", function(event) {
            var range = 0;
            var bf = this.buffered;
            var time = this.currentTime;
            if (this.buffered.length > 0) {
                console.log(`${currVideoName} going.`);
                while(!(bf.start(range) <= time && time <= bf.end(range))) {
                    range += 1;
                }
                var loadStartPercentage = bf.start(range) / this.duration;
                var loadEndPercentage = bf.end(range) / this.duration;
                var percent = (loadEndPercentage - loadStartPercentage) * 100;
                videoProgresses[currVideoName] = percent;
                calcTotalProgress(videoProgresses, songProgresses);
            } else {
                console.log(`${currVideoName} stuck.`);
            }
        });
    }
}

for (var j = 0; j < songNames.length; j++) {
    let currSongName = songNames[j];
    songObjects[songNames[j]] = document.getElementById(songNames[j]);
    if (!(songNames[j] in songProgresses)) {
        songProgresses[songNames[j]] = 0;
    }
    if (songObjects[currSongName].readyState === 4) {
        songProgresses[currSongName] = 100;
        calcTotalProgress(videoProgresses, songProgresses);
    } else {
        songObjects[currSongName].addEventListener("progress", function(event) {
            var range = 0;
            var bf = this.buffered;
            var time = this.currentTime;
            if (this.buffered.length > 0) {
                console.log(`${currSongName} going.`);
                while(!(bf.start(range) <= time && time <= bf.end(range))) {
                    range += 1;
                }
                var loadStartPercentage = bf.start(range) / this.duration;
                var loadEndPercentage = bf.end(range) / this.duration;
                var percent = (loadEndPercentage - loadStartPercentage) * 100;
                songProgresses[currSongName] = percent;
                calcTotalProgress(videoProgresses, songProgresses);
            } else {
                console.log(`${currSongName} stuck.`);
            }
        });
    }
}