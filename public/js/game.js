var textInfo = document.getElementById('js-text-info')
var gameStatusElement = document.getElementById('js-status')
var playerListElement = document.getElementById('player-list')

var gameStage = 0

// (milliseconds)
var intervalDelay = 100
var gameTimer
var gameId
var game
var gameFound

socket.emit('findGame')

socket.on('dataResponse', data => {
    updatePlayers(data.players)
    gameTimer = data.time
})

socket.on('dataRequest', () => {
    if (gameId && game) {
        if (gameStage < 2) { // Game in progress
            socket.emit('dataResponse', { username: username, gameId: gameId, wpm: game.getWPM(), final: false, character: game.getCorrectLetterCount() })
        }
    }
})
socket.on('foundGame', gameFound => {
    textInfo.innerHTML = `Times typed: ${gameFound.text.timesTyped}<br>Average WPM: ${Math.round(gameFound.text.totalWPM / gameFound.text.timesTyped) ? Math.round(gameFound.text.totalWPM / gameFound.text.timesTyped) : 0}`
    gameId = gameFound.id
    game = new Game(gameFound.text.passage, () => {
        socket.emit('dataResponse', { username: username, gameId: gameId, wpm: game.getWPM(), final: true, character: game.getCorrectLetterCount() })
        setGameStatus(`Game ended! <a id="play-again" href="/casual">Continue the grind? (${getCookie('newGame')})</a>`, 2)
    })

    /*
    gameTimer starts at a negative value equivelent to
    the seconds for the game to start, after which it
    acts like a normal timer
    */
    gameTimer = gameFound.timeSinceStart
    setInterval(() => {
        if (gameTimer < 0) { // Hasn't started yet
            var startingText = 'Starting in: ' + Math.abs(msToSec(gameTimer))
            setGameStatus(startingText, 0)
            game.setEngineStatus(startingText)
        } else if (gameTimer < gameFound.options.gameLength) { // Game is ongoing
            if (gameStage == 0) { // Game just started
                game.startEngine()
            }

            // Prevent changing status if user finished early
            if (gameStage != 2) {
                setGameStatus('Time left: ' + msToSec(gameFound.options.gameLength - gameTimer), 1)
            }
        } else { // Game ended
            if (gameStage != 2) { // Only finish the game once
                game.stopEngine()
                socket.emit('dataResponse', { username: username, gameId: gameId, wpm: game.getWPM(), final: true, character: game.getCorrectLetterCount() })
                setGameStatus(`Game ended! <a id="play-again" href="/casual">Continue the grind? (${getCookie('newGame')})</a>`, 2)
            }
        }
    }, intervalDelay)
})

function updatePlayers(players) {
    var listHTML = ''

    for (var i = 0; i < players.length; i++) {
        listHTML += `<li class="player-card"><img src="${players[i].avatar}" class="avatar-sm">${players[i].username} : ${players[i].wpm}</li>`
    }

    for (var player of players) {
        if (player.username == username) continue
        game.setCursor(player.username, player.character)
    }

    playerListElement.innerHTML = listHTML
}

function msToSec(time) {
    return Math.round(time / 100) / 10
}

function setGameStatus(status, stage) {
    gameStatusElement.innerHTML = status
    gameStage = stage
}