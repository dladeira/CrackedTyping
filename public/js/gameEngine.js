class Game {

    /**
     * Create a game
     * @param {String} passage - The passage to type
     * @param {Function} onGameEnd - The function to run at the end of the game
     */
    constructor(passage, onGameEnd) {
        this.fullPassage = passage.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, ' ').replace(/  +/g, ' ')
        this.onGameEnd = onGameEnd
        this.engineRunning = false
        this.intervalDelay = 200
        this.cursors = {}

        this.currentWordIndex = 0 // Start the user at the first word
        this.confirmedText = '' // Text typed correctly locked after space was pressed
        this.secondsElapsed = 0 // Seconds of user being able to type

        this.textInput = document.getElementById('engine-input')
        this.passageElement = document.getElementById('engine-passage')
        this.passageWrapper = document.getElementById('engine-passage-wrapper')

        this.textInput.readOnly = 1
        this.textInput.value = ''
        this.textInput.placeholder = ''

        this.hiddenTopLetters = 0

        setInterval(() => { this.textInput.focus()} , 100)

        this.textInput.oninput = (event) => {
            var wordInputed = this.textInput.value.substring(0, this.textInput.value.length - 1)
            if (this.onLastWord())
                wordInputed = this.textInput.value

            if (event.data == ' ' || this.onLastWord()) {
                if (this.getExpectedWord() == wordInputed) {
                    this.textInput.value = ''
                    this.confirmedText += wordInputed + ' '
                    this.currentWordIndex++
                    this.textFinishedCheck()
                }
            }
            this.updatePassage()
        }

        setInterval(() => {
            if (this.engineRunning == 1) {
                this.secondsElapsed += this.intervalDelay / 1000
            }


            for (var cursor in this.cursors) {
                if (this.cursors[cursor].timeout != undefined) {
                    this.cursors[cursor].timeout -= this.intervalDelay
                    
                    if (this.cursors[cursor].timeout < 0) {
                        document.getElementById(`cursor--${cursor}`).remove()
                        delete this.cursors[cursor]
                    }
                }
            }
            //this.updatePassage() // KEEP THIS COMMENTED WHEN DEBUGGING
        }, this.intervalDelay)

        this.updatePassage()
    }

    /*
    Engine manipulation
    */

    /**
     * Start the game engine
     */
    startEngine() {
        if (!this.engineRunning) {
            this.engineRunning = true
            this.textInput.readOnly = 0
            this.textInput.value = ''
            this.textInput.placeholder = 'Start typing!'
        }
    }
    
    /**
     * Stop the game engine
     */
    stopEngine() {
        if (this.engineRunning) {
            this.engineRunning = false
            this.textInput.readOnly = 1
            this.textInput.placeholder = 'Finished!'
        }
    }

    /*
    Passage
    */

    /**
     * Add text to the passage
     * @param {String} text - The text to add
     */
    addPassage(text) {
        if (this.engineRunning) {
            this.fullPassage+= text
        }
    }

    /**
     * Get the passage
     * @returns {String} The passage
     */
    getPassage() {
        return this.fullPassage
    }

    /**
     * Get the displayed passage
     * @returns {String}
     */
    getDisplayPassage() {
        return this.fullPassage.substring(this.hiddenTopLetters, this.fullPassage.length)
    }

    /*
    Cursors
    */

    /**
     * Get a cursor
     * @param {String} name - Name of the cursor
     * @returns {Object} The cursor
     */
    getCursor(name) {
        return this.cursors[name]
    }

    /**
     * Set a cursor
     * @param {string} name The unique name of the cursor ('main' is reserved for the user's cursor)
     * @param {integer} character The character that the cursor is currently on
     * @param {integer} timeout If the cursor isn't set again in X miliseconds then it gets removed
     */
    setCursor(name, character, timeout) {
        if (!this.getCursor(name)) { // Create a new cursor
            this.cursors[name] = {} // Create the cursor object
            this.cursors[name].name = name // Set the name
            document.getElementById("cursor-container").innerHTML += `<div class="cursor" id="cursor--${name}"></div>` //  Add cursor to cursor-container

            // Create function for retreving the cursor DOM element
            this.cursors[name].element = function() {
                return document.getElementById(`cursor--${this.name}`)
            }

            if (name == 'main') { // Main cursor (the important one)
                this.cursors[name].element().style.zIndex = 1
                this.cursors[name].element().style.opacity = 0
                setTimeout(() => {
                    this.cursors[name].element().style.opacity = 1
                    this.cursors[name].element().style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }, 300)
            } else { // Not main cursor (make it gray)
                this.cursors[name].element().style.backgroundColor = 'gray'
            }
        }

        this.cursors[name].character = character // Set the character
        this.cursors[name].timeout = timeout // Set timeout if there is one
    }

    /**
     * Display/update all the cursors in the game
     */
    updateCursors() {
        for (var cursorName in this.cursors) {
            var currentLetter
            var cursor = this.cursors[cursorName]
            for (var letterNum in Array.from(document.getElementsByTagName('letter'))) {
                var letter = document.getElementsByTagName('letter')[letterNum]

                if (letterNum == (cursor.character - this.hiddenTopLetters)) {
                    currentLetter = letter
                    break
                }
            }

            if (currentLetter) {
                cursor.element().style.top = `${currentLetter.getBoundingClientRect().top}px`
                cursor.element().style.left = `${currentLetter.getBoundingClientRect().left}px`
                cursor.element().style.height = currentLetter.clientHeight + 'px'
            } else {
                console.log(`FATAL: Current letter not found for cursor ${cursorName}`)
            }

        }
    }
    
    /**
     * Update the passage
     */
    updatePassage() {
        var passageHTML = ''
        this.setCursor('main', Math.max(this.getCorrectLetterCount(true), 0)) // Set the cursor character to either 0 or the current correct letter
        var correctLettersLeft = this.getCorrectLetterCount(false)
        var incorrectLettersLeft = this.getIncorrectLetterCount(false)

        var currentLetterPlaced = false

        for (var word of this.getDisplayPassage().replaceAll(' ', '// ').split('//')) { // Loop through all the words
            passageHTML += `<word>` // Open the word tag
            for (var letter of word) { // Loop through all the letters in the word
                var classToAdd = ''
    
                // Find out whether the word is correct or incorrect
                if (correctLettersLeft-- > 0) {
                    var classToAdd = 'correct'
                } else if (incorrectLettersLeft-- > 0) {
                    var classToAdd = 'incorrect'
                }
    
                // Place the current letter at the end of the correct letters
                if (classToAdd != 'correct' && !currentLetterPlaced) {
                    classToAdd+= ' current'
                    currentLetterPlaced = true
                }
    
                // Add the letter to the passageHTML
                passageHTML += `<letter class='${classToAdd}'>${letter == " " ? '&nbsp' : letter}</letter>`
            }
            passageHTML += `</word>` // Close the word tag
        }

        if (!currentLetterPlaced) { // The game has ended and there is no current letter
            // Create a fake invisible character at the end so the cursor can stand has a letter to stand behind
            passageHTML += `<letter class="current" style="opacity: 0">.</letter>`
        }

        this.passageElement.innerHTML = passageHTML // Set the new passageHTML
        document.getElementsByClassName("current")[0].scrollIntoView() // Scroll the current letter into view
        this.updateCursors() // Update the cursor positions
        this.updateHiddenLetters() // Hide all the letters that are not visible to improve optimization
        
    }

    /**
     * Update the amount of letters hidden above the passage
     */
    updateHiddenLetters() {
        // Get the letters that are currently hidden in the top
        var currentlyHiddenTopLetters = 0
        for (var letterNum in document.getElementsByTagName("letter")) {
            if (isNaN(letterNum)) {
                continue
            }
            var letterArray = document.getElementsByTagName("letter")

            if (this.isLetterHiddenTop(letterArray[letterNum])) {
                currentlyHiddenTopLetters++
            }
        }

        // Add them to the total amount of hiddenTopLetters
        this.hiddenTopLetters += currentlyHiddenTopLetters
    }

    /**
     * Display an alert
     * @param {String} alert The text to display (if undefined) it hides the alert
     */
    setAlert(alert) {
        var alertElement = document.getElementById("alert")
    
        if (alert == undefined) {
            alertElement.style.opacity = 0
            return
        } else {
            alertElement.style.opacity = 1
        }
    
        alertElement.innerHTML = alert
    }

    /**
     * Get the word the user is expected to type
     * @returns {String}
     */
    getExpectedWord() {
        return this.fullPassage.split(' ')[this.currentWordIndex]
    }
    
    /**
     * Check if the user finished typing the text
     * @returns {Boolean}
     */
    textFinishedCheck() {
        if ((this.currentWordIndex + 1) > this.fullPassage.split(' ').length) {
            this.onGameEnd()
            this.stopEngine()
        }
    }
    
    /**
     * Get whether the user is typing the last word
     * @returns {Boolean}
     */
    onLastWord() {
        // I have no clue what ".filter(e => e)" does but it stops the program from breaking
        return this.getTypedText(true).split(' ').filter(e => e).length  >= this.fullPassage.split(' ').length
    }
    
    /**
     * Get the user's words per minute
     * @returns {Number}
     */
    getWPM() {
        var wordsTyped = this.confirmedText.split(' ').length - 1
        var wpm = Math.round(wordsTyped / (this.secondsElapsed / 60))
        return (isNaN(wpm) || wpm == 'Infinity' ? 0 : wpm) // Return 0 if WPM is not a valid number
    }

    /**
     * Get the total text that the user typed
     * @param {Boolean} full - Use full passage or display passage
     * @returns {Number}
     */
    getTypedText(full) {
        if (full) {
            return this.confirmedText + this.textInput.value
        }
        return this.confirmedText.substring(this.hiddenTopLetters) + this.textInput.value
    }
    
    /**
     * Get the amount of correct letters typed
     * @param {Boolean} full - Use full passage or display passage
     * @returns {Number}
     */
    getCorrectLetterCount(full) {
        var letterArray = this.getTypedText(full) // Array of letters user typed
        var passageLetterArray = full ? this.fullPassage : this.getDisplayPassage() // Array of letters from the passage

        var letterCount = 0
        for (var ltrIndex in letterArray) {
            if (letterArray[ltrIndex] == passageLetterArray[ltrIndex]) { // If the letter typed matches the text letter
                letterCount++
                continue
            }
            break // The letter typed does not match, stop counting correct letters
        }
        return letterCount
    }
    
    /**
     * Get the amount of incorrect letters typed
     * @param {Boolean} full - Use full passage or display passage
     * @returns {Number}
     */
    getIncorrectLetterCount(full) {
        var letterArray = this.getTypedText(full) // Array of letters user typed
        var passageLetterArray = full ? this.fullPassage : this.getDisplayPassage() // Array of letters from the passage

        var letterCount = 0
        for (var ltrIndex in letterArray) {
            if (ltrIndex < this.getCorrectLetterCount()) { // Skip all the correct letters
                continue
            }
    
            // A incorrect letter has already been found, mark the rest of the letters as incorrect
            if (letterCount) {
                letterCount++
                continue
            }

            // If the user has typed more characters than exist (def wrong)
            if (!passageLetterArray[ltrIndex]) {
                letterCount++;
                continue
            }

            // If typed letter does not match the passage letter
            if (letterArray[ltrIndex] != passageLetterArray[ltrIndex]) {
                letterCount++
                continue
            }
        }
        return letterCount
    }
    
    /**
     * Get whether the letter is visible
     * @param {Object} ltr - The letter element
     * @returns {Boolean}
     */
    isLetterVisible(ltr) {
        return !this.isLetterHiddenTop(ltr) && this.isLetterHiddenBottom(ltr)
    }

    /**
     * Get whether the letter is hidden above the passage element
     * @param {Object} ltr - The letter element
     * @returns {Boolean}
     */
    isLetterHiddenTop(ltr) {
        var lRect = ltr.getBoundingClientRect() // Letter ClientRectangle
        var pRect = this.passageWrapper.getBoundingClientRect() // Passage ClientRectangle
        return lRect.bottom < pRect.top // Whether the bottom of the letter is above the top of the rectangle
    }

    /**
     * Get whether the letter is hidden below the passage element
     * @param {Object} ltr - The letter element
     * @returns {Boolean}
     */
    isLetterHiddenBottom(ltr) {
        var lRect = ltr.getBoundingClientRect() // Letter ClientRectangle
        var pRect = this.passageWrapper.getBoundingClientRect() // Passage ClientRectangle
        return lRect.top > pRect.bottom // Whether the top of the letter is below the bottom of the rectangle
    }

    /**
     * Get the amount of letters  left to type
     * @returns {Number}
     */
    getLettersLeft() {
        return this.fullPassage.length - this.getCorrectLetterCount(true)
    }
}