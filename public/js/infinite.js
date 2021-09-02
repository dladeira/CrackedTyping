var game, chart
var dataCollectionFrequency = 5000 // How frequently to collect the data in ms

var dictionary = ["water", "aqua", "breathe", "see", "fall", "reason", "why", "world", "continue", "discover", "run", "place", "territory", "country", "airplane", "airport", "nature", "keyboard", "computer", "website", "internet", "domain", "computer", "mouse", "speaker", "configuration", "bridge", "phone", "blood", "pressure", "notebook", "pencil", "pen", "array", "channel", "television", "broadway", "broadcast", "reasons", "speech", "united", "nation", "color", "red", "green", "blue", "yellow", "purple", "female", "male", "dog", "cat", "fast", "slow", "interesting", "professor", "teacher", "student", "prison", "labor", "force", "biology", "chemistry", "physics", "minecraft", "fortnite", "suicide", "america"]

/**
 * Start the game
 */
function startGame() {
    var startingIn = 5

    game = new Game(generateRandomWords(30).substring(1)) // Create a new game with 30 words and remove the first space
    game.setAlert(startingIn) // Set the alert as soon as we start the game

    var intervalId = setInterval(() => {
        game.setAlert(--startingIn)
        if (startingIn < 1) {
            game.startEngine() // Start the game engine
            game.setAlert() // Clear the alert
            startGraphingData() // Collect data for the graph
            
            clearInterval(intervalId) // Stop the loop
        }
    }, 1000)

    setInterval(() => {
        if (game.getLettersLeft() < 200) // If there are less than 200 letters left add more words
            game.addTextToPassage(generateRandomWords(10));
    }, 200)

    setInterval(() => {
        updateStats()
    }, 1000)

    chart = renderChart();
}

/**
 * Collect data every X milliseconds and display it on the graph
 */
function startGraphingData() {
    game.getWPMInTime((wpm) => {
        chart.data.labels.push('')
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(wpm)
        })
        chart.update()
    }, dataCollectionFrequency)
    
    setInterval(() => {
        game.getWPMInTime((wpm) => {
            chart.data.labels.push('')
            chart.data.datasets.forEach((dataset) => {
                dataset.data.push(wpm)

                dataset.radius = 0
            })

        chart.update()
        }, dataCollectionFrequency)
    }, dataCollectionFrequency)
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

/**
 * Render the chart onto the HTML canvas
 * @returns {Object} The chartJS object
 */
function renderChart() {
    const data = {
        labels: [],
            datasets: [{
                label: '',
                borderColor: '#f8b600',
                data: [],
                radius: 5
            }]
        };
    
    const config = {
        type: 'line',
        data: data,
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: 10
            },
            events: []
        }
    };
    return new Chart(document.getElementById("chart"), config)
}


function updateStats() {
    document.getElementById("wpm-display").innerHTML = game.getWPM()
    document.getElementById("time-elapsed").innerHTML = ((game.secondsElapsed - game.secondsElapsed % 60) / 60) + ":" + Math.round(game.secondsElapsed % 60).toString().padStart(2, "0")
}

startGame()