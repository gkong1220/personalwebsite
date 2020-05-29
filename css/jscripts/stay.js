//select scene
var keysDown = {};

var sceneElements = document.getElementsByClassName("scene-option");
var options = document.getElementsByClassName("dropdown-content");
var optionTitles = document.getElementsByClassName("stay-dropdown");

var sceneTitle = optionTitles[0];
var sceneDropdown = options[0];
var activeScene = null;
var prevScene;
var selectedScene;

var songDropdown = options[1];
var selectedSong;
var activeSong = null;

var soundDropdown = options[2];
var selectedSound;

var timer;
var playing = false;
//media variables
//videos
var malickVideo = document.getElementById("malick");


$(".scene-option").click(function() {
    if (!playing) {
        var currentScene = $(this);
        $(".scene-option.stay-action-active").not(this).removeClass("stay-action-active");
        currentScene.toggleClass("stay-action-active");
        if (currentScene.hasClass("stay-action-active")) {
            sceneDropdown.classList.add("active-dropdown-content");
            selectedScene = currentScene.text();
            prevScene = selectedScene;
            document.getElementById(selectedScene).addEventListener("ended", function(event) {
                selectedScene = null;
                if (!selectedScene && !selectedSong && !selectedSound) {
                    closeAll(prevScene);
                }
            })

            //document.getElementById(selectedScene).addEventListener("play", )

            //document.addEventListener("mousemove", fadeMenu(timer));
            //sceneTitle.style.borderBottom = "0.01rem solid";
        } else {
            sceneDropdown.classList.remove("active-dropdown-content");
            selectedScene = null;
            //sceneTitle.style.borderBottom = "none";
        }

        if (selectedScene || selectedSong || selectedSound) {
            document.getElementById("instructions").innerHTML = "press space key anytime to play/stop movie moment...";
        } else {
            document.getElementById("instructions").innerHTML = "please select a scene, a song, and/or a sound...";
        }
    }
})

$(".scene-option").mouseover(function() {
    if (!playing) {
        activeScene = $(this);
        document.getElementById($(this).text()).currentTime = 80;
        document.getElementById("menu").classList.add("media-playing");
        document.getElementById($(this).text()).classList.remove("hide-scene");
        document.getElementById($(this).text()).play();
    }
})

$(".scene-option").mouseleave(function () {
    if (!playing) {
        document.getElementById(activeScene.text()).pause();
        document.getElementById("menu").classList.remove("media-playing");
        document.getElementById(activeScene.text()).classList.add("hide-scene");
        activeScene = null;
    }
})

//songs
$(".song-option").click(function() {
    if (!playing) {
        var currentSong = $(this);
        $(".song-option.stay-action-active").not(this).removeClass("stay-action-active");
        currentSong.toggleClass("stay-action-active");
        if (currentSong.hasClass("stay-action-active")) {
            songDropdown.classList.add("active-dropdown-content");
            selectedSong = currentSong.text();
            document.getElementById(selectedSong).addEventListener("ended", function(event) {
                console.log("song ended");
                selectedSong = null;
                if (!selectedScene && !selectedSong && !selectedSound) {
                    closeAll(prevScene);
                }
            })
            //document.addEventListener("mousemove", fadeMenu(timer));
        } else {
            songDropdown.classList.remove("active-dropdown-content");
            selectedSong = null;
        }

        if (selectedScene || selectedSong || selectedSound) {
            document.getElementById("instructions").innerHTML = "press space key anytime to play/stop movie moment...";
        } else {
            document.getElementById("instructions").innerHTML = "please select a scene, a song, and/or a sound...";
        }
    }
})

//sounds
$(".sound-option").click(function() {
    if (!playing) {
        var currentSound = $(this);
        $(".sound-option.stay-action-active").not(this).removeClass("stay-action-active");
        currentSound.toggleClass("stay-action-active");
        if (currentSound.hasClass("stay-action-active")) {
            soundDropdown.classList.add("active-dropdown-content");
            selectedSound = currentSound.text();
            document.getElementById(selectedSound).addEventListener("ended", function(event) {
                console.log("sound ended");
                selectedSound = null;
                if (!selectedScene && !selectedSong && !selectedSound) {
                    closeAll(prevScene);
                }
            })
            //document.addEventListener("mousemove", fadeMenu(timer));
        } else {
            soundDropdown.classList.remove("active-dropdown-content");
            selectedSound = null;
        }

        if (selectedScene || selectedSong || selectedSound) {
            document.getElementById("instructions").innerHTML = "press space key anytime to play/stop movie moment...";
        } else {
            document.getElementById("instructions").innerHTML = "please select a scene, a song, and/or a sound...";
        }
    }
})

$(document).mousemove(function() {
    if (playing && selectedScene) {
        console.log("detected mouse");
        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }
    
        document.getElementById("menu").classList.remove("media-playing-fadeout");
        $(".scene-option.stay-action-active").removeClass("stay-action-fade");
        $(".song-option.stay-action-active").removeClass("stay-action-fade");
        $(".sound-option.stay-action-active").removeClass("stay-action-fade");

        timer = setTimeout(function() {
            $(".scene-option.stay-action-active").addClass("stay-action-fade");
            $(".song-option.stay-action-active").addClass("stay-action-fade");
            $(".sound-option.stay-action-active").addClass("stay-action-fade");
            document.getElementById("menu").classList.add("media-playing-fadeout");
        }, 2000)
    } else if(!playing) {
        clearTimeout(timer);
    }
})

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
    if (keysDown[32] == true) {
        if (!playing) {
            if (selectedScene != null && document.getElementById(selectedScene).paused) {
                document.getElementById("menu").classList.add("media-playing");
                document.getElementById(selectedScene).currentTime = 0;
                document.getElementById(selectedScene).classList.remove("hide-scene");
                document.getElementById(selectedScene).play();
                playing = true;
            }

            if (selectedSong != null && document.getElementById(selectedSong).paused) {
                document.getElementById(selectedSong).currentTime = 0;
                document.getElementById(selectedSong).play();
                playing = true;
            }

            if (selectedSound != null && document.getElementById(selectedSound).paused) {
                document.getElementById(selectedSound).currentTime = 0;
                document.getElementById(selectedSound).play();
                playing = true;
            }
        } else if (playing) {
            if (selectedScene != null && !document.getElementById(selectedScene).paused) {
                document.getElementById(selectedScene).pause();
                document.getElementById("menu").classList.remove("media-playing");
                document.getElementById(selectedScene).classList.add("hide-scene");
                //sceneDropdown.classList.remove("active-dropdown-content");
                //$(".scene-option.stay-action-active").removeClass("stay-action-active");
                selectedScene = null;
            }

            if (selectedSong != null && !document.getElementById(selectedSong).paused) {
                document.getElementById(selectedSong).pause();
                //songDropdown.classList.remove("active-dropdown-content");
                //$(".song-option.stay-action-active").removeClass("stay-action-active");
                selectedSong = null;
            }

            if (selectedSound != null && !document.getElementById(selectedSound).paused) {
                document.getElementById(selectedSound).pause();
                //soundDropdown.classList.remove("active-dropdown-content");
                //$(".sound-option.stay-action-active").removeClass("stay-action-active");
                selectedSound = null;
            }

            if (!selectedScene && !selectedSong && !selectedSound) {
                playing = false;
            }
            closeAll(prevScene);
        }
    }
}, false);

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

var closeAll = function(lastClip) {
    console.log(lastClip);
    if (lastClip) {
        //close scene
        document.getElementById("menu").classList.remove("media-playing");
        document.getElementById(lastClip).classList.add("hide-scene");
    }
    sceneDropdown.classList.remove("active-dropdown-content");
    $(".scene-option.stay-action-active").removeClass("stay-action-active");

    //close song
    songDropdown.classList.remove("active-dropdown-content");
    $(".song-option.stay-action-active").removeClass("stay-action-active");

    //close sound
    soundDropdown.classList.remove("active-dropdown-content");
    $(".sound-option.stay-action-active").removeClass("stay-action-active");
    document.getElementById("instructions").innerHTML = "please select a scene, a song, and/or a sound...";
    playing = false;

    clearTimeout(timer);
    document.getElementById("menu").classList.remove("media-playing-fadeout");
    $(".scene-option.stay-action-fade").removeClass("stay-action-fade");
    $(".song-option.stay-action-fade").removeClass("stay-action-fade");
    $(".sound-option.stay-action-fade").removeClass("stay-action-fade");
    console.log("closed-all");
}

/*
var fadeMenu = function(timer) {
    console.log("mousing");
    if (timer) {
        console.log("in");
        document.getElementById("menu").classList.remove("media-playing-fadeout");
        clearTimeout(timer);
        timer = 0;
    }

    timer = setTimeout(function() {
        document.getElementById("menu").classList.add("media-playing-fadeout");
    }, 3000)
}*/