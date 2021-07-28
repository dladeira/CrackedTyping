var gameTextInput = document.getElementById('text-input')
var playerList = document.getElementById('player-list')
var socket = io()
var startCharacter

socket.on('infiniteText', (infiniteText) => {
    if (!startCharacter) startCharacter = infiniteText.character
    if ((game.getPassage().length - game.confirmedText.length) < 60) {
        game.startEngine()
        game.addPassage(infiniteText.passage)
    } else {
        // TODO: Display feedback to user that the game is waiting on him
    }
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
    var cursorPositions = []
    for (var playerUsername in players) {
        var player = players[playerUsername]

        listHTML += `<li class="player-card"><img src="${player.avatar}" class="avatar-sm">${playerUsername} : ${player.wpm}</li>`
        console.log(player.character - startCharacter)

        if (playerUsername != username) { // Don't render own cursor
            cursorPositions.push(player.character - startCharacter)
        }
    }
    game.cursorPositions = cursorPositions
    playerList.innerHTML = listHTML
}

var game = new Game('Welcome to infinite, enjoy the grind.', () => {
    game.textInput.readOnly = 1
})
game.startEngine()
// TODO instead of having cursorLetters and postCursorPlacementLetters use substrings
game.updatePassage =  function updatePassage() { // Each word has it's own <span>
    var passageHTML = ''
    var letters = '';
    var correctLettersLeft = this.getCorrectLetterCount()
    var incorrectLettersLeft = this.getIncorrectLetterCount()

    var cursorLetters = ''
    var postCursorPlacementLetters = ''
    var cursorPlaced = false

    for (var letter of Array.from(this.passage)) {
        var classToAdd = ''
        if (correctLettersLeft-- > 0) {
            var classToAdd = 'correctLetter'
        } else if (incorrectLettersLeft-- > 0) {
            var classToAdd = 'incorrectLetter'
        }
        if (classToAdd != 'correctLetter') {
            if (!cursorPlaced) {
                cursorLetters = letters
                cursorPlaced = true
                postCursorPlacementLetters += letter
            } else {
                postCursorPlacementLetters += letter
            }
        }
        passageHTML += `<span class='${classToAdd}'>${letter}</span>`
        letters+= letter
    }

    if (cursorLetters == '' && this.getCorrectLetterCount() != 0) { // Game ended
        cursorLetters = letters
    }

    passageHTML+= `<span class='cursor-container'>${cursorLetters}<span class='cursor'>|</span>${postCursorPlacementLetters}</span>`

    for (var cursorLocation of game.cursorPositions) {
        passageHTML+= `<span class='cursor-container'>${letters.substring(0, cursorLocation)}<span class='cursor other-cursor'>|</span>${letters.substring(cursorLocation)}</span>`
    }
    this.passageElement.innerHTML = passageHTML
}

function getCurrentCharacter() {
    return game.getCorrectLetterCount() + startCharacter
}
