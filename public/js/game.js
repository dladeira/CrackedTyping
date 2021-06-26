// DOM Elements
var gameStatusElement = document.getElementById("gameStatusElement")
var gameIdElement = document.getElementById("gameIdElement")
var passageElement = document.getElementById("gamePassageElement")
var gameTextInput = document.getElementById("gameTextInput")
var gameTimesTypedElement = document.getElementById("gameTimesTypedElement")
var playerListElement = document.getElementById("playerListElement")

var socket = io()
var currentWordIndex = 0 // Start the user at the first word
var confirmedText = "" // Text typed correctly locked after space was pressed
var secondsElapsed = 0 // Seconds of user being able to type

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

socket.emit('findGame')

socket.on('foundGame', gameFound => {
    bootstrap(gameFound)
})

function bootstrap(game) {
    setInterval(() => {
        /*
        gameTimer starts at a negative value equivelent to
        the seconds for the game to start, after which it
        acts like a normal timer
        */
        var gameTimer = new Date().getTime() - game.startTime
        updatePassage()

        gameIdElement.innerHTML = `ID: ${game.id}`
        gameTimesTypedElement.innerHTML = `Total Times Typed ${game.text.totalTimesTyped}`

        if (gameStage == 1) {
            secondsElapsed += intervalDelay / 1000
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

    socket.on('dataRequest', () => {
        if (gameStage == 1) {
            socket.emit('dataResponse', { username: username, gameId: game.id, wpm: getWPM(), gameUniqueId: game.uniqueId })
        }
    })

    socket.on('dataResponse', players => {
        updatePlayers(players)
    })

    function updatePlayers(players) {
        var listHTML = "";

        for (var i = 0; i < players.length; i++) {
            listHTML += `<li>${players[i].username} : ${players[i].wpm}</li>`
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
                passageHTML += `<span id=\"word-${wordNumber}\" class=\"currentWord\">${passageWordArray[wordNumber]}</span> `
            else
                passageHTML += `<span id=\"word-${wordNumber}\">${passageWordArray[wordNumber]}</span> `
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
        socket.emit('dataResponse', { username: username, gameId: game.id, wpm: getWPM() }) // Sync local and public time
        gameTextInput.placeholder = "Finished!"
        gameStatusElement.innerHTML = "Game ended! Your speed: " + getWPM() + " WPM!"
        gameStage = 2 // Prevent game from finishing more than once
    }

    function isTextCorrect(wordInputed) {
        return getExpectedWord().substring(0, (wordInputed.length > getExpectedWord().length ? getExpectedWord().length : wordInputed.length)) == wordInputed
    }

    function isLastWord() {
        return getTypedText().split(' ').length >= game.text.passage.split(' ').length
    }

    function getWordElement(wordNumber) {
        return document.getElementById(`word-${wordNumber}`)
    }

    function msToSec(time) {
        return Math.round(time / 100) / 10
    }

    function getTypedText() {
        return confirmedText + gameTextInput.value
    }

    function getWPM() {
        var wpm = Math.round(getTypedText().split(" ").length / (secondsElapsed / 60))
        return (wpm ? wpm : 0) // WPM is null if secondsElapsed is 0 (divide by 0)
    }
}