var game, chart
var dataCollectionFrequency = 5000 // How frequently to collect the data in ms

var dictionary = words.toLowerCase().split('\n')

/**
 * Start the game
 */
function startGame() {
    var startingIn = 5

    game = new Game(generateRandomWords(30).substring(1), () => {}, 1) // Create a new game with 30 words and remove the first space (and with a alert type of 1)
    game.setAlert(startingIn) // Set the alert as soon as we start the game

    startWPMUpdater()

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
        updateNotes()
    }, 300)

    chart = renderChart()
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

function startWPMUpdater() {
    for (var i = 1000; i < 10000; i += 1000) {
        game.getWPMInTime((wpm) => {
            document.getElementById("wpm-display").innerHTML = wpm
        }, i)
    }
    setInterval(() => {
        game.getWPMInTime((wpm) => {
            document.getElementById("wpm-display").innerHTML = wpm
        }, 10000)
    }, 300)
}

/**
 * Update the stats view
 */
function updateStats() {
    document.getElementById("time-elapsed").innerHTML = ((game.secondsElapsed - game.secondsElapsed % 60) / 60) + ":" + Math.round(game.secondsElapsed % 60).toString().padStart(2, "0")
    document.getElementById("accuracy").innerHTML = game.getAccuracy()
    document.getElementById("words-typed").innerHTML = game.getWordsTyped()
    document.getElementById("session-wpm").innerHTML = game.getWPM()
}

/**
 * Update the notes view
 */
function updateNotes() {
    var listHTML = ""

    for (ltr of game.getMistakefulLetters()) {
        listHTML += `<ltr>${ltr}</ltr>`
    }

    document.getElementById("letters-list").innerHTML = listHTML
}

startGame()