//var jsonDictionary = require("./words_dictionary.json")
var wordsDetected = {"validWords": {}, "invalidWords": {}};
var sentimentCounter = {"positive": 0, "negative": 0};
var sentimentMessages = {0: "\"Really down?, r u ok? :(\"", 1: "\"Kinda down, r u doing aight? :/\"", 2: "\"ok - not much to complain about :}\"", 3: "\"good - like u should :)\"", 4: "\"Really thriving out here :))\""}

$(".process-button").click(function() {
    console.log("clicked");
    //console.log(document.getElementById("Text1").value);
    document.getElementById("results-body").style.visibility = "visible";

    // get input text and split by space
    inputText = document.getElementById("Text1").value.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\r?\n|\r]/g," ").toLowerCase().split(" ");
    for (var i = 0; i < inputText.length; i++) {
            var currentWord = inputText[i];
            if (currentWord in dictionary && currentWord.length > 1 && !(currentWord in ignore)) {
                if (currentWord in wordsDetected["validWords"]) {
                    wordsDetected["validWords"][currentWord] += 1;
                } else {
                    wordsDetected["validWords"][currentWord] = 1;
                }
            } else if (currentWord.length > 1 && !(currentWord in ignore)) {
                if (currentWord in wordsDetected["invalidWords"]) {
                    wordsDetected["invalidWords"][currentWord] += 1;
                } else {
                    wordsDetected["invalidWords"][currentWord] = 1;
                }
            }

            // check sentiment
            if (currentWord in positives) {
                sentimentCounter["positive"] += 1;
            } else if (currentWord in negatives) {
                sentimentCounter["negative"] += 1;
            }
    }

    var mostUsed = getTopThree(wordsDetected);
    console.log(mostUsed[0]);
    console.log(mostUsed[1]);
    
    var lengthUse = 3;
    if (mostUsed[0].length < 3) {
        lengthUse = mostUsed[0].length;
    }
    for (var i = 0; i < lengthUse; i++) {
        document.getElementById(`most-used-${i+1}`).innerHTML = "<span class=highlight-entry>" + `${mostUsed[0][i]}` + "</span>" + `: ${mostUsed[1][i]} instances`;
    }

    // output sentiment
    var sentimentTotal = sentimentCounter["positive"] + sentimentCounter["negative"];
    var positivePercentage = sentimentCounter["positive"] / sentimentTotal * 100;
    var sentimentOutputMessage = "";
    if (positivePercentage <= 20) {
        sentimentOutputMessage = sentimentMessages[0];
    } else if (positivePercentage > 20 && positivePercentage <= 40) {
        sentimentOutputMessage = sentimentMessages[1];
    } else if (positivePercentage > 40 && positivePercentage <= 60) {
        sentimentOutputMessage = sentimentMessages[2];
    } else if (positivePercentage > 60 && positivePercentage <= 80) {
        sentimentOutputMessage = sentimentMessages[3];
    } else if (positivePercentage > 80) {
        sentimentOutputMessage = sentimentMessages[4];
    }
    console.log(sentimentCounter);
    document.getElementById("sentiment-message").textContent = sentimentOutputMessage;
    document.getElementById("sentiment-stats").innerHTML = "<span style=\"color: green\">+</span> : " + `${sentimentCounter["positive"]} | ` + "<span style=\"color:red\">-</span> : "+ `${sentimentCounter["negative"]}`;

})

$(".back").click(function() {
    wordsDetected = {"validWords": {}, "invalidWords": {}};
    sentimentCounter = {"positive": 0, "negative": 0};
    document.getElementById("results-body").style.visibility = "hidden";
})


function getTopThree(foundWords) {
    var maxScore = 0;
    var wordsRanked = [" "];
    var scoresRanked = [0];
    for (var wordType in foundWords) {
        for (var word in foundWords[wordType]) {
            var wordScore = foundWords[wordType][word];
            if (wordScore > 1) {
                if (scoresRanked.length == 1) {
                    wordsRanked = [word, null];
                    scoresRanked = [wordScore, 0];
                } else {
                    for (var i = 0; i < scoresRanked.length; i++) {
                        if (i == 0) {
                            if (wordScore > scoresRanked[i]) {
                                wordsRanked.unshift(word);
                                scoresRanked.unshift(wordScore);
                                break;
                            } 
                        } else {
                            if (wordScore >= scoresRanked[i] && wordScore <= scoresRanked[i-1]) {
                                wordsRanked.splice(i, 0, word);
                                scoresRanked.splice(i, 0, wordScore);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    wordsRanked.pop();
    scoresRanked.pop();
    //console.log(wordsRanked);
    //console.log(scoresRanked);
    return [wordsRanked, scoresRanked];
}