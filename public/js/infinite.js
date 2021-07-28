var gameTextInput = document.getElementById('text-input')
var playerList = document.getElementById('player-list')
var socket = io()
var startCharacter

socket.on('infiniteText', (infiniteText) => {
    if (!startCharacter) startCharacter = infiniteText.character
    game.startEngine()
    game.addPassage(infiniteText.passage)
})

setInterval(() => {
    if (startCharacter) {
        socket.emit('infiniteUpdate', { username: username, wpm: game.getWPM(), character: getCurrentCharacter() })
    } else {
        socket.emit('infiniteUpdate', { username: username, wpm: game.getWPM(), character: 0 })
    }
}, 400)

socket.on('infiniteUpdate', (infiniteData) => {
    updatePlayers(infiniteData)
})

function updatePlayers(players) {
    var listHTML = ''
    
    for (var playerUsername in players) {
        var player = players[playerUsername]

        listHTML += `<li class="player-card"><img src="${player.avatar}" class="avatar-sm">${playerUsername} : ${player.wpm}</li>`

        if (playerUsername != username) { // Don't render own cursor
            game.setCursor(player.username, player.character - startCharacter, 5000)
        }
    }
    playerList.innerHTML = listHTML
}

var game = new Game('Welcome to infinite, enjoy the grind.', () => {
    game.textInput.readOnly = 1
})
game.startEngine()

function getCurrentCharacter() {
    return game.getCorrectLetterCount() + startCharacter
}
