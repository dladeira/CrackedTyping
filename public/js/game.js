/*
  The information for the game (the variable 'game') is retrieved
  from a javascript script in game.ejs which is executed before
  this script
*/

// DOM Elements
var gameStatusElement = document.getElementById("gameStatusElement")
var passageElement = document.getElementById("gamePassageElement")
var gameTextInput = document.getElementById("gameTextInput")
var gameTimesTypedElement = document.getElementById("gameTimesTypedElement")
var playerListElement = document.getElementById("playerListElement")

//var socket = io()
var currentWordIndex = 0 // Start the user at the first word
var confirmedText = "" // Text typed correctly locked after space was pressed
var secondsElapsed = 0 // Seconds of user being able to type
var connectedPlayers = [];

// (milliseconds)
var intervalDelay = 100;
var wpmUpdateDelay = 1000;

/*
 gameStage variable acts independently of
 the gameTimer as the user can finish early

 0: Game hasn't started yet
 1: Game is currently ongoing
 2: User finished or out of time
*/
var gameStage = 0

loadPlayers()
setInterval(() => {
    /*
     gameTimer starts at a negative value equivelent to
     the seconds for the game to start, after which it
     acts like a normal timer
    */
    var gameTimer = new Date().getTime() - game.startTime
    updatePassage()
    updatePlayers()

    if (gameStage == 1) {
        secondsElapsed+=intervalDelay / 1000
    }

    // Only allow typing during the game
    gameTextInput.readOnly = gameStage != 1

    if (gameTimer < 0) { // Hasn't started yet
        var startingText = "Starting in: " + Math.abs(msToSec(gameTimer))
        gameStatusElement.innerHTML = startingText
        gameTextInput.placeholder = startingText
    } else if (gameTimer < game.options.gameLength) { // Game is ongoing
        if (gameStage == 0) { // Only runs once
            gameStage = 1
            gameTextInput.placeholder = "Start typing!"
        }

        // Prevent replacing WPM if user finished early
        if (gameStage == 1)
            gameStatusElement.innerHTML = "Time left: " + msToSec(game.options.gameLength - gameTimer)
    } else { // Game ended
        finishGame()
    }
}, intervalDelay)

setInterval(() => {
    if (gameStage == 1)
        socket.emit('gameUpdate', { username: username, speed: getWPM(), id: game.id })
}, wpmUpdateDelay)

function loadPlayers() {
    for (user of game.users) { // Load the already connected players
        connectedPlayers.push({ username: username, speed: 0})
    }

    socket.on('gameUpdate', data => {
        if (data.id == game.id) {
            for (var i = 0; i < connectedPlayers.length; i++) {
                if (connectedPlayers[i].username == data.username) { // Player we want to update
                    connectedPlayers[i].speed = data.speed;
                }
            }
        }
    })

    socket.on('gameJoin', (data) => {
        if (data.id == game.id) { // A player is joining our game
            connectedPlayers.push({ username: username, speed: 0})
        }
    })

    socket.emit('gameJoin', { id: game.id, username: username }) // Tell the server we are playing
}

function updatePlayers() {
    var listHTML = "";

    for (var i = 0; i < connectedPlayers.length; i++) {
        listHTML += `<li>${connectedPlayers[i].username} : ${connectedPlayers[i].speed}</li>`
    }

    playerListElement.innerHTML = listHTML;
}

/*
 Each word has it's own <span> tag to allow styles
 for individual words and hilighting of the active
 word
*/
function updatePassage() { // Each word has it's own <span>
    var passageHTML = ""
    var passageWordArray = game.text.passage.split(" ")
    for (wordNumber in passageWordArray) {
        if (wordNumber == currentWordIndex)
            passageHTML+=`<span id=\"word-${wordNumber}\" class=\"currentWord\">${passageWordArray[wordNumber]}</span> `
        else
            passageHTML+=`<span id=\"word-${wordNumber}\">${passageWordArray[wordNumber]}</span> `
    }
    passageElement.innerHTML = passageHTML
}

gameTextInput.oninput = event => {
    var wordInputed = gameTextInput.value.replaceAll(" ", "")
    if (event.data == " " || isLastWord()) {
        if (getExpectedWord() == wordInputed) {
            gameTextInput.value = ""
            confirmedText += wordInputed + " "
            getWordElement(currentWordIndex++).classList.remove("currentWord")
            if (!isTextFinished())
                getWordElement(currentWordIndex).classList.add("currentWord")
            else {
                finishGame()
            }
            return
        }
    }
    if (isTextCorrect(wordInputed)) {
        gameTextInput.classList.remove("error")
    } else {
        gameTextInput.classList.add("error")
    }
}

function getExpectedWord() {
    return game.text.passage.split(" ")[currentWordIndex]
}

function isTextFinished() {
    if (gameStage == 1) {
        return (currentWordIndex + 1) > game.text.passage.split(" ").length
    } else {
        return true
    }
}

function finishGame() {
    if (gameStage == 2) return // Game has already been finished, don't finish again!
    socket.emit('gameUpdate', { username: username, speed: getWPM(), id: game.id }) // Sync local and public time
    gameTextInput.placeholder = "Finished!"
    gameStatusElement.innerHTML = "Game ended! Your speed: " + getWPM() + " WPM!"
    gameStage = 2 // Prevent game from finishing more than once
}

function isTextCorrect(wordInputed) {
    return getExpectedWord().substring(0, (wordInputed.length > getExpectedWord().length ? getExpectedWord().length : wordInputed.length)) == wordInputed
}

function getTypedText() {
    return confirmedText + gameTextInput.value
}

function isLastWord() {
    return getTypedText().split(' ').length >= game.text.passage.split(' ').length
}

function getFinalGameText(passage) {
    var finalText = ""
    var gameTextWordArray = passage.split(" ")
    for (wordNumber in gameTextWordArray) {
        finalText+=`<span id=\"word-${wordNumber}\">${gameTextWordArray[wordNumber]}</span> `
    }
    return finalText
}

function getWordElement(wordNumber) {
    return document.getElementById(`word-${wordNumber}`)
}

function msToSec(time) {
    return Math.round(time / 100) / 10
}

function getWPM() {
    return Math.round(getTypedText().split(" ").length / (secondsElapsed / 60))
}