var socket = io()

String.prototype.replaceLast = (what, replacement) => {
    if (this.lastIndexOf(what) == this.length - 1) {
        var pcs = this.split(what);
        var lastPc = pcs.pop();
        return pcs.join(what) + replacement + lastPc;
    }
    return this;
};

class Game {
    constructor (passage, onGameEnd) {
        this.passage = passage
        this.onGameEnd = onGameEnd
        this.engineRunning = false
        this.intervalDelay = 100
        
        this.currentWordIndex = 0 // Start the user at the first word
        this.confirmedText = '' // Text typed correctly locked after space was pressed
        this.secondsElapsed = 0 // Seconds of user being able to type

        this.textInput = document.getElementById('engine-input')
        this.passageElement = document.getElementById('engine-passage')

        this.textInput.readOnly = 1
        this.textInput.value = ''
        this.textInput.placeholder = ''

        this.textInput.oninput = (event) => {
            var wordInputed = this.textInput.value.substring(0, this.textInput.value.length - 1)
            if (this.onLastWord())
                wordInputed = this.textInput.value
            if (event.data == ' ' || this.onLastWord()) {
                if (this.getExpectedWord() == wordInputed) {
                    this.textInput.value = ''
                    this.confirmedText += wordInputed + ' '
                    this.currentWordIndex++
                    if (this.isTextFinished()) {
                        this.onGameEnd()
                        this.stopEngine()
                    }
                }
            }
            this.updatePassage()
        }

        setInterval(() => {
            this.secondsElapsed += this.intervalDelay / 1000
            this.updatePassage()
        }, this.intervalDelay)

        this.updatePassage()
    }

    startEngine() {
        if (!this.engineRunning) {
            this.engineRunning = true
            this.textInput.readOnly = 0
            this.textInput.value = ''
            this.textInput.placeholder = 'Start typing!'
        }
    }
    
    stopEngine() {
        if (this.engineRunning) {
            this.engineRunning = false
            this.textInput.readOnly = 1
            this.textInput.value = ''
            this.textInput.placeholder = 'Finished!'
        }
    }
    
    setEngineStatus(status) {
        this.textInput.placeholder = status
    }

    addPassage(text) {
        this.passage+= text
    }

    getPassage() {
        return this.passage
    }
    
    /*
        Each word has it's own <span> tag to allow styles
        for individual words and hilighting of the active
        word
    */
    updatePassage() { // Each word has it's own <span>
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
        passageHTML+= `<span id='cursor-container'>${cursorLetters}<span id='cursor'>|</span>${postCursorPlacementLetters}</span>`
        this.passageElement.innerHTML = passageHTML

        if (cursorLetters == '' && this.getCorrectLetterCount() != 0) { // Game ended
            cursorLetters = letters
        }
    }

    getExpectedWord() {
        return this.passage.split(' ')[this.currentWordIndex]
    }
    
    isTextFinished() {
        return (this.currentWordIndex + 1) > this.passage.split(' ').length
    }
    
    onLastWord() {
        return this.getTotalTypedText().split(' ').filter(e => e).length  >= this.passage.split(' ').length
    }
    
    getTotalTypedText() {
        return this.confirmedText + this.textInput.value
    }
    
    getWPM() {
        var wordsTyped = this.confirmedText.split(' ').length - 1
        var wpm = Math.round(wordsTyped / (this.secondsElapsed / 60))
        return (isNaN(wpm) || wpm == 'Infinity' ? 0 : wpm) // WPM is 'Infinity' if secondsElapsed is 0
    }
    
    getCorrectLetterCount() {
        var letterCount = 0
        var letterArray = Array.from(this.getTotalTypedText())
        var passageLetterArray = Array.from(this.passage)
        for (var i in letterArray) {
            if (letterArray[i] == passageLetterArray[i]) {
                letterCount++
            } else {
                break
            }
        }
        return letterCount
    }
    
    getIncorrectLetterCount() {
        var letterCount = 0
        var letterArray = Array.from(this.getTotalTypedText())
        var passageLetterArray = Array.from(this.passage)
        var incorrectLetterFound = false
        for (var i in letterArray) {
            if (i < this.getCorrectLetterCount()) // Skip all the correct letters
                continue
    
            // 2nd condition : If the user has typed more characters than exist, def wrong
            if (letterArray[i] != passageLetterArray[i] || !passageLetterArray[i] || incorrectLetterFound) {
                incorrectLetterFound++
                letterCount++
            } else {
                break
            }
        }
        return letterCount
    }
}