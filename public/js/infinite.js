var game
var startingIn = 5
var intervalId


function startGame() {
    game = new Game('randomly generated words will start to appear', () => {
    })
    game.setAlert(startingIn)
    intervalId = setInterval(() => {
        --startingIn
        game.setAlert(startingIn)
        if (startingIn < 1) {
            game.startEngine()
            clearInterval(intervalId)
            game.setAlert()
        }
    }, 1000)

    setInterval(() => {
        var dictionary = ["water", "aqua", "breathe", "see", "fall", "reason", "why", "world", "continue", "discover", "run", "place", "territory", "country", "airplane", "airport", "nature", "keyboard", "computer", "website", "internet", "domain", "computer", "mouse", "speaker", "configuration", "bridge", "phone", "blood", "pressure", "notebook", "pencil", "pen", "array", "channel", "television", "broadway", "broadcast", "reasons", "speech", "united", "nation", "color", "red", "green", "blue", "yellow", "purple", "female", "male", "dog", "cat", "fast", "slow", "interesting", "professor", "teacher", "student", "prison", "labor", "force", "biology", "chemistry", "physics", "minecraft", "fortnite", "suicide", "america"]
        if (game.getLettersLeft() < 100) {
            game.addTextToPassage(" " + dictionary[Math.floor(Math.random() * dictionary.length)] + " " + dictionary[Math.floor(Math.random() * dictionary.length)] + " " + dictionary[Math.floor(Math.random() * dictionary.length)]);
        }
    }, 200)
}

startGame()