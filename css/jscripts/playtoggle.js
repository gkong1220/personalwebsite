$(document).ready(function() {
    var audioFile = document.getElementById("audioPlayer");
    var btn = $(".button");
    btn.click(function() {
      btn.toggleClass("paused");
      return audioFile.paused ? audioFile.play() : audioFile.pause();
    });
  })