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
var intervalDelay = 100
var wpmUpdateDelay = 1000

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
    updatePassage()
    gameIdElement.innerHTML = `ID: ${game.id}`
    gameTimesTypedElement.innerHTML = `Total Times Typed ${game.text.totalTimesTyped}`

    setInterval(() => {
        /*
        gameTimer starts at a negative value equivelent to
        the seconds for the game to start, after which it
        acts like a normal timer
        */
        var gameTimer = new Date().getTime() - game.startTime

        if (gameStage == 1) {
            secondsElapsed += intervalDelay / 1000
        }

        // Only allow typing during the game
        gameTextInput.readOnly = gameStage != 1

        if (gameTimer < 0) { // Hasn't started yet
            var startingText = "Starting in: " + Math.abs(msToSec(gameTimer))
            setGameStatus(startingText, startingText)
        } else if (gameTimer < game.options.gameLength) { // Game is ongoing
            // Prevent changing stage if user finished early
            if (gameStage == 0)
                gameStage = 1

            // Prevent replacing status if user finished early
            if (gameStage == 1) {
                setGameStatus("Time left: " + msToSec(game.options.gameLength - gameTimer), "Start typing!")
            }
        } else { // Game ended
            finishGame()
        }
    }, intervalDelay)

    socket.on('dataRequest', () => {
        if (gameStage < 2) { // Game hasn't finished yet
            socket.emit('dataResponse', { username: username, gameId: game.id, wpm: getWPM(), gameUniqueId: game.uniqueId })
        }
    })

    socket.on('dataResponse', players => {
        updatePlayers(players)
    })

    function updatePlayers(players) {
        var listHTML = ""

        for (var i = 0; i < players.length; i++) {
            listHTML += `<li>${players[i].username} : ${players[i].wpm}</li>`
        }

        playerListElement.innerHTML = listHTML
    }

    /*
     Each word has it's own <span> tag to allow styles
     for individual words and hilighting of the active
     word
    */
    function updatePassage() { // Each word has it's own <span>
        var passageHTML = ""
        var passageLetterArray = Array.from(game.text.passage)
        var correctLettersLeft = getCorrectLetters()
        var incorrectLettersLeft = getIncorrectLetters()
        var cursorPlaced = false;
        for (var letterNumber in passageLetterArray) {
            if (correctLettersLeft-- > 0) {
                passageHTML += `<span id=\"letter-${letterNumber}\" class=\"correctLetter\">${passageLetterArray[letterNumber]}</span>`
                continue
            } else if (incorrectLettersLeft-- > 0) {
                if (!cursorPlaced) {
                    passageHTML+= `<span id="cursor">|</span>`
                    cursorPlaced = true
                }
                passageHTML += `<span id=\"letter-${letterNumber}\" class=\"incorrectLetter\">${passageLetterArray[letterNumber]}</span>`
                continue
            }
            if (!cursorPlaced) {
                passageHTML+= `<span id="cursor">|</span>`
                cursorPlaced = true;
            }
            passageHTML += `<span id=\"letter-${letterNumber}\" class=\"\">${passageLetterArray[letterNumber]}</span>`
        }
        passageElement.innerHTML = passageHTML
    }

    gameTextInput.oninput = event => {
        var wordInputed = gameTextInput.value.substring(0, gameTextInput.value.length - 1)
        if (isLastWord())
            wordInputed = gameTextInput.value
        if (event.data == " " || isLastWord()) {
            if (getExpectedWord() == wordInputed) {
                gameTextInput.value = ""
                confirmedText += wordInputed + " "
                currentWordIndex++
                if (isTextFinished())
                    finishGame()
            }
        }
        updatePassage()
    }

    function getExpectedWord() {
        return game.text.passage.split(" ")[currentWordIndex]
    }

    function isTextFinished() {
        return (currentWordIndex + 1) > game.text.passage.split(" ").length
    }

    function finishGame() {
        if (gameStage == 2) return // Game has already been finished, don't finish again!
        gameStage = 2 // Prevent game from finishing more than once
        var wpm = getWPM() // Use variable instead of calling the function twice to maintain sync
        socket.emit('dataResponse', { username: username, gameId: game.id, wpm: wpm }) // Sync local and public wpm
        gameTextInput.placeholder = "Finished!"
        gameTextInput.readonly = true; // Prevent the 100ms delay when game ended but user can type
        gameTextInput.value = ""
        gameStatusElement.innerHTML = "Game ended!"
    }

    function isTextCorrect(wordInputed) {
        return getExpectedWord().substring(0, (wordInputed.length > getExpectedWord().length ? getExpectedWord().length : wordInputed.length)) == wordInputed
    }

    function isLastWord() {
        return getTotalTypedText().split(' ').filter(e => e).length  >= game.text.passage.split(' ').length
    }

    function getTotalTypedText() {
        return confirmedText + gameTextInput.value;
    }

    function msToSec(time) {
        return Math.round(time / 100) / 10
    }

    function getWPM() {
        var wordsTyped = confirmedText.split(" ").length - 1
        var wpm = Math.round(wordsTyped / (secondsElapsed / 60))
        return (isNaN(wpm) || wpm == "Infinity" ? 0 : wpm) // WPM is "Infinity" if secondsElapsed is 0 (divide by 0)
    }

    function setGameStatus(status, placeholder) {
        gameStatusElement.innerHTML = status
        if (placeholder)
        gameTextInput.placeholder = placeholder
    }

    function getCorrectLetters() {
        var letterCount = 0;
        var letterArray = Array.from(getTotalTypedText());
        var passageLetterArray = Array.from(game.text.passage);
        for (var i in letterArray) {
            if (letterArray[i] == passageLetterArray[i]) {
                letterCount++;
            } else {
                break;
            }
        }
        return letterCount;
    }

    function getIncorrectLetters() {
        var letterCount = 0;
        var letterArray = Array.from(getTotalTypedText());
        var passageLetterArray = Array.from(game.text.passage);
        var incorrectLetterFound = false;
        for (var i in letterArray) {
            if (i < getCorrectLetters()) // Skip all the correct letters
                continue;

            // 2nd condition : If the user has typed more characters than exist, def wrong
            if (letterArray[i] != passageLetterArray[i] || !passageLetterArray[i] || incorrectLetterFound) {
                incorrectLetterFound++;
                letterCount++;
            } else {
                break;
            }
        }
        return letterCount;
    }
}