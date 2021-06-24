// Game info
var gameId = document.getElementById("gameId").value;
var gameStartTime = document.getElementById("gameStartTime").value;
var gameLength = document.getElementById("gameLength").value;
var gameText = document.getElementById("gameText").value;

// DOM Elements
var gameTimerElement = document.getElementById("gameTimeElement");
var gameTextElement = document.getElementById("gameTextElement");
var gameTextInput = document.getElementById("gameTextInput");

var currentGameTime = new Date().getTime() - gameStartTime;
var socket = io();
var currentWordNumber = 0;
var gameOngoing = false;
var correctTypedText = "";
var secondsElapsed = 0;
var finishedGame = false;
var started = false;

gameTextElement.innerHTML = getFinalGameText(gameText); // Each word has it's own span
socket.emit('joinGame', gameId); // No need to reconnect
gameTextInput.value = ""; // Prevent browser cache from filling in the input
getWordElement(currentWordNumber).classList.add("currentWord"); // Add current word to the first word

setInterval(() => {
    currentGameTime = new Date().getTime() - gameStartTime;
    updateGameTime();
    if (gameOngoing)
        secondsElapsed+=0.1;
}, 100);

// Don't use gameOngoing() because distinction between starting and ended
function updateGameTime() {
    if (currentGameTime < 0) { // Hasn't started yet
        var startingText = "Starting in: " + Math.abs(msToSec(currentGameTime));
        gameTextInput.readOnly = true;
        gameTimerElement.innerHTML = startingText;
        gameTextInput.placeholder = startingText;
    } else if (currentGameTime < gameLength) { // Game is ongoing
        // The game has just started
        if (!started) {
            gameTextInput.readOnly = false;
            gameTextInput.placeholder = "Start typing!";
            gameOngoing = true;
            started = true;
        }
        if (!finishedGame)
            gameTimerElement.innerHTML = "Time left: " + msToSec(gameLength - currentGameTime);
    } else { // Game ended
        finishGame();
    }
}

gameTextInput.oninput = event => {
    var wordInputed = gameTextInput.value;
    var preWordInputed = wordInputed.substring(0, wordInputed.length - 1); // Word before the event was fired

    if (event.data == " " || isLastWord()) {
        if ((getCurrentWord() == preWordInputed) || (getCurrentWord() == wordInputed)) {
            gameTextInput.value = "";
            event.preventDefault();
            correctTypedText += wordInputed;
            getWordElement(currentWordNumber++).classList.remove("currentWord")
            if (!isTextFinished())
                getWordElement(currentWordNumber).classList.add("currentWord")
            else {
                finishGame();
            }
            return;
        }
    }
    if (isTextCorrect(wordInputed)) {
        gameTextInput.classList.remove("error");
    } else {
        gameTextInput.classList.add("error");
    }
}

function getCurrentWord() {
    return gameText.split(" ")[currentWordNumber];
}

function isTextFinished() {
    if (gameOngoing) {
        return (currentWordNumber + 1) > gameText.split(" ").length;
    } else {
        return true;
    }
}

function finishGame() {
    if (finishedGame) return; // Game has already been finished, don't finish again!
    gameOngoing = false;
    finishedGame = true;
    gameTextInput.readOnly = true;
    gameTextInput.placeholder = "Finished!";
    gameTimerElement.innerHTML = "Game ended! Your speed: " + Math.round(gameText.split(" ").length / (secondsElapsed / 60)) + " WPM!";
}

function isTextCorrect(wordInputed) {
    return getCurrentWord().substring(0, (wordInputed.length > getCurrentWord().length ? getCurrentWord().length : wordInputed.length)) == wordInputed;
}

function getTotalTypedText() {
    return correctTypedText + gameTextInput.value;
}

function isLastWord() {
    return getTotalTypedText().split(' ').length >= gameText.split(' ').length;
}

function getFinalGameText(gameText) {
    var finalText = "";
    var gameTextWordArray = gameText.split(" ");
    for (wordNumber in gameTextWordArray) {
        finalText+=`<span id=\"word-${wordNumber}\">${gameTextWordArray[wordNumber]}</span> `
    }
    return finalText;
}

function getWordElement(wordNumber) {
    return document.getElementById(`word-${wordNumber}`)
}

function msToSec(time) {
    return Math.round(time / 100) / 10;
}