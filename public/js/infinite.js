var gameTextInput = document.getElementById('text-input')
var playerList = document.getElementById('player-list')
var socket = io()

socket.on('infiniteText', (infiniteText) => {
    if ((game.getPassage().length - game.confirmedText.length) < 60) {
        game.startEngine()
        game.addPassage(infiniteText)
    } else {
        // TODO: Display feedback to user that the game is waiting on him
    }
})

socket.on('infiniteUpdate', (infiniteData) => {
    updatePlayers(infiniteData)
})

function updatePlayers(players) {
    var listHTML = ''
    for (var username in players) {
        var player = players[username]

        listHTML += `<li class="player-card"><img src="${player.avatar}" class="avatar-sm">${username} : ${player.wpm}</li>`
    }

    playerList.innerHTML = listHTML
}

setInterval(() => {
    socket.emit('infiniteUpdate', { username: username, wpm: game.getWPM() })
}, 400)

var game = new Game('Welcome to infinite, enjoy the grind.', () => {
    game.textInput.readOnly = 1
})
game.startEngine()