var gameTextInput = document.getElementById('text-input')
var playerList = document.getElementById('player-list')

var socket = io()

socket.on('infiniteText', (infiniteText) => {
    game.startEngine()
    game.addPassage(infiniteText)
})

socket.on('infiniteUpdate', (infiniteData) => {
    updatePlayers(infiniteData)
})

function updatePlayers(players) {
    var listHTML = ''
    for (var username in players) {
        var player = players[username]

        listHTML += `<li>${username} : ${player.wpm}</li>`
    }

    playerList.innerHTML = listHTML
}

setInterval(() => {
    socket.emit('infiniteUpdate', { username: username, wpm: game.getWPM() })
}, 400)

var game = new Game('test passage', () => {
    game.textInput.readOnly = 1
})
game.startEngine()