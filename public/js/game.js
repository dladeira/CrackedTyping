// DOM Elements
var gameStatusElement = document.getElementById('js-status')
var gameIdElement = document.getElementById('js-id')
var passageElement = document.getElementById('game-passage')
var gameTextInput = document.getElementById('text-input')
var textInfoElement = document.getElementById('js-text-info')
var playerListElement = document.getElementById('player-list')

var socket = io()
var currentWordIndex = 0 // Start the user at the first word
var confirmedText = '' // Text typed correctly locked after space was pressed
var secondsElapsed = 0 // Seconds of user being able to type

// (milliseconds)
var intervalDelay = 100

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
    gameTextInput.onfocusout = gameTextInput.focus


    console.log(game)
    updatePassage()
    gameIdElement.innerHTML = `Game ID: `
    textInfoElement.innerHTML = `Times typed: ${game.text.timesTyped}<br>Average WPM: ${Math.round(game.text.totalWPM / game.text.timesTyped) ? Math.round(game.text.totalWPM / game.text.timesTyped) : 0}`

    /*
        gameTimer starts at a negative value equivelent to
        the seconds for the game to start, after which it
        acts like a normal timer
        */
    var gameTimer = game.timeSinceStart
    setInterval(() => {
        if (gameStage == 1) {
            secondsElapsed += intervalDelay / 1000
        }

        if (gameTimer < 0) { // Hasn't started yet
            var startingText = 'Starting in: ' + Math.abs(msToSec(gameTimer))
            setGameStatus(startingText, startingText, 0)
        } else if (gameTimer < game.options.gameLength) { // Game is ongoing
            // Prevent changing status if user finished early
            if (gameStage != 2) {
                setGameStatus('Time left: ' + msToSec(game.options.gameLength - gameTimer), 'Start typing!', 1)
            }
        } else { // Game ended
            finishGame()
        }
    }, intervalDelay)

    socket.on('dataRequest', () => {
        if (gameStage < 2) { // Game in progress
            socket.emit('dataResponse', { username: username, gameId: game.id, wpm: getWPM(), final: false })
        }
    })

    socket.on('dataResponse', data => {
        updatePlayers(data.players)
        gameTimer = data.time
    })

    function updatePlayers(players) {
        var listHTML = ''

        for (var i = 0; i < players.length; i++) {
            listHTML += `<li class="player-card"><img src="${players[i].avatar}" class="avatar-sm">${players[i].username} : ${players[i].wpm}</li>`
        }

        playerListElement.innerHTML = listHTML
    }

    /*
     Each word has it's own <span> tag to allow styles
     for individual words and hilighting of the active
     word
    */
    function updatePassage() { // Each word has it's own <span>
        var passageHTML = ''
        var correctLettersLeft = getCorrectLetterCount()
        var incorrectLettersLeft = getIncorrectLetterCount()
        var cursorPlaced = false
        for (var letter of Array.from(game.text.passage)) {
            var classToAdd = ''
            if (correctLettersLeft-- > 0) {
                var classToAdd = 'correctLetter'
            } else if (incorrectLettersLeft-- > 0) {
                var classToAdd = 'incorrectLetter'
            }
            if (classToAdd != 'correctLetter' && !cursorPlaced) {
                passageHTML+= `<span id='cursor'>|</span>`
                cursorPlaced = true
            }
            passageHTML += `<span class='${classToAdd}'>${letter}</span>`
        }
        passageElement.innerHTML = passageHTML
    }

    gameTextInput.oninput = event => {
        var wordInputed = gameTextInput.value.substring(0, gameTextInput.value.length - 1)
        if (onLastWord())
            wordInputed = gameTextInput.value
        if (event.data == ' ' || onLastWord()) {
            if (getExpectedWord() == wordInputed) {
                gameTextInput.value = ''
                confirmedText += wordInputed + ' '
                currentWordIndex++
                if (isTextFinished())
                    finishGame()
            }
        }
        updatePassage()
    }

    function getExpectedWord() {
        return game.text.passage.split(' ')[currentWordIndex]
    }

    function isTextFinished() {
        return (currentWordIndex + 1) > game.text.passage.split(' ').length
    }

    function finishGame() {
        if (gameStage == 2) return // Prevent game from finishing more than once
        setGameStatus(`Game ended! <a id="play-again" href="/game">Continue the grind? (${getCookie('newGame')})</a>`, "Finished!", 2)
        socket.emit('dataResponse', { username: username, gameId: game.id, wpm: getWPM(), gameUniqueId: game.uniqueId, final: true })
    }

    function onLastWord() {
        return getTotalTypedText().split(' ').filter(e => e).length  >= game.text.passage.split(' ').length
    }

    function getTotalTypedText() {
        return confirmedText + gameTextInput.value
    }

    function msToSec(time) {
        return Math.round(time / 100) / 10
    }

    function getWPM() {
        var wordsTyped = confirmedText.split(' ').length - 1
        var wpm = Math.round(wordsTyped / (secondsElapsed / 60))
        return (isNaN(wpm) || wpm == 'Infinity' ? 0 : wpm) // WPM is 'Infinity' if secondsElapsed is 0
    }

    function setGameStatus(status, placeholder, stage) {
        gameStatusElement.innerHTML = status
        gameTextInput.placeholder = placeholder
        gameStage = stage

        // Only allow typing during the game
        gameTextInput.readOnly = stage != 1
        if (stage != 1)
            gameTextInput.value = ''
    }

    function getCorrectLetterCount() {
        var letterCount = 0
        var letterArray = Array.from(getTotalTypedText())
        var passageLetterArray = Array.from(game.text.passage)
        for (var i in letterArray) {
            if (letterArray[i] == passageLetterArray[i]) {
                letterCount++
            } else {
                break
            }
        }
        return letterCount
    }

    function getIncorrectLetterCount() {
        var letterCount = 0
        var letterArray = Array.from(getTotalTypedText())
        var passageLetterArray = Array.from(game.text.passage)
        var incorrectLetterFound = false
        for (var i in letterArray) {
            if (i < getCorrectLetterCount()) // Skip all the correct letters
                continue

            // 2nd condition : If the user has typed more characters than exist, def wrong
            if (letterArray[i] != passageLetterArray[i] || !passageLetterArray[i] || incorrectLetterFound) {
                incorrectLetterFound++
                letterCount++
            } else {
                break
            }
        }
        return letterCount
    }
}