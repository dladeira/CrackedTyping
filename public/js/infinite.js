var game
var startingIn = 5
var intervalId

var dictionary = ["water", "aqua", "breathe", "see", "fall", "reason", "why", "world", "continue", "discover", "run", "place", "territory", "country", "airplane", "airport", "nature", "keyboard", "computer", "website", "internet", "domain", "computer", "mouse", "speaker", "configuration", "bridge", "phone", "blood", "pressure", "notebook", "pencil", "pen", "array", "channel", "television", "broadway", "broadcast", "reasons", "speech", "united", "nation", "color", "red", "green", "blue", "yellow", "purple", "female", "male", "dog", "cat", "fast", "slow", "interesting", "professor", "teacher", "student", "prison", "labor", "force", "biology", "chemistry", "physics", "minecraft", "fortnite", "suicide", "america"]

function startGame() {
    game = new Game(generateRandomWords(30).substring(1), () => {
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
        
        if (game.getLettersLeft() < 200) {
            game.addTextToPassage(generateRandomWords(10));
        }
    }, 200)
}

/**
 * Generate a random sentence
 * @param {Number} wordCount The amount of random words to generate
 * @returns {String} The sentence starting with a space
 */
function generateRandomWords(wordCount = 1) {
    var sentence = ""
    for (var i = 0; i < wordCount; i++) {
        sentence += " " + dictionary[Math.floor(Math.random() * dictionary.length)]
    }
    return sentence
}

startGame()