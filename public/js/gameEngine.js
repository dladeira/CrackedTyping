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
    constructor (passage, onGameEnd, characterPrefix, characterSuffix) {
        this.fullPassage = passage.replace(/[\r\n\x0B\x0C\u0085\u2028\u2029]+/g, ' ').replace(/  +/g, ' ')
        this.onGameEnd = onGameEnd
        this.engineRunning = false
        this.intervalDelay = 200
        this.cursors = {}
        this.startedTyping = false

        this.characterPrefix = !isNaN(characterPrefix) ? characterPrefix : 100000000
        this.characterSuffix = !isNaN(characterSuffix) ? characterSuffix : 100000000

        this.currentWordIndex = 0 // Start the user at the first word
        this.confirmedText = '' // Text typed correctly locked after space was pressed
        this.secondsElapsed = 0 // Seconds of user being able to type

        this.textInput = document.getElementById('engine-input')
        this.passageElement = document.getElementById('engine-passage')

        this.textInput.readOnly = 1
        this.textInput.value = ''
        this.textInput.placeholder = ''

        this.textInput.oninput = (event) => {
            if (!this.startedTyping) {
                this.setEngineStatus('') // Clear start typing text
                this.startedTyping = true
            }

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
            if (this.engineRunning == 1) {
                this.secondsElapsed += this.intervalDelay / 1000
            }

            this.updatePassage()

            for (var cursor in this.cursors) {
                if (this.cursors[cursor].timeout != undefined) {
                    this.cursors[cursor].timeout -= this.intervalDelay
                    
                    if (this.cursors[cursor].timeout < 0) {
                        delete this.cursors[cursor]
                    }
                }
            }
        }, this.intervalDelay)

        this.updatePassage()
    }

    /*
    Engine manipulation
    */

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
            this.textInput.placeholder = 'Finished!'
        }
    }
    
    setEngineStatus(status) {
        this.textInput.placeholder = status
    }

    /*
    Passage
    */

    addPassage(text) {
        this.fullPassage+= text
    }

    getPassage() {
        return this.fullPassage
    }

    getDisplayPassage() {
        if (this.getCursor('main')) {
            return this.fullPassage.substring(this.getCursor('main').character - this.characterPrefix, this.getCursor('main').character + this.characterSuffix)
        }
        return this.fullPassage.substring(0, 200)
    }

    getLettersHidden() {
        if (this.getCursor('main')) {
            return this.getCursor('main').character - this.characterPrefix
        }
        return 0
    }

    /*
    Cursors
    */

    getCursor(name) {
        return this.cursors[name]
    }

    /**
     * @description Renders a cursor
     * 
     * @param {string} name - The unique name of the cursor ('main' name is reserved for the user's cursor)
     * @param {integer} character - The character that the cursor is currently on
     * @param {integer} timeout - If the cursor isn't updated again in X miliseconds then it gets removed
     */
    setCursor(name, character, timeout) {
        if (this.getCursor(name) == undefined) {
            this.cursors[name] = {}
        }

        this.cursors[name].character = character
        
        if (timeout) {
            this.cursors[name].timeout = timeout
        }
    }
    
    updatePassage() { // Each letter has it's own <span>
        var passageHTML = ''
        var letters = '';
        this.setCursor('main', Math.max(this.getCorrectLetterCount(), 0))
        var correctLettersLeft = this.getCorrectLetterCount() - Math.max(0, this.getLettersHidden())
        var incorrectLettersLeft = this.getIncorrectLetterCount()
    
        for (var letter of Array.from(this.getDisplayPassage())) {
            var classToAdd = ''
            if (correctLettersLeft-- > 0) {
                var classToAdd = 'correctLetter'
            } else if (incorrectLettersLeft-- > 0) {
                var classToAdd = 'incorrectLetter'
            }
            if (classToAdd == '') {
                passageHTML += `<span class='${classToAdd}' id='passage-scroll'>${letter}</span>`
            } else {
                passageHTML += `<span class='${classToAdd}'>${letter}</span>`
            }
            letters+= letter
        }

        var mainData // main cursor gets rendered on top of others

        for (var cursor in this.cursors) {
            var cursorData = this.cursors[cursor]
            if ((cursorData.character >= 0 && cursorData.character <= letters.length) || cursor == 'main') {
                if (cursor == 'main') {
                    mainData = cursorData
                    continue
                }
                passageHTML+= `<span class='cursor-container'>${letters.substring(0, Math.min(this.characterPrefix, mainData.character))}<span class='cursor other-cursor'>|</span>${letters.substring(Math.min(this.characterPrefix, mainData.character), this.getCursor('main').character + this.characterSuffix)}</span>`
            }
        }
        if (mainData) {
            passageHTML+= `<span class='cursor-container'>${letters.substring(0, Math.min(this.characterPrefix, mainData.character))}<span class='cursor'>|</span>${letters.substring(Math.min(this.characterPrefix, mainData.character), this.getCursor('main').character + this.characterSuffix)}</span>`
        }
        this.passageElement.innerHTML = passageHTML
        document.getElementById('passage-scroll').scrollIntoView() // TODO: NULL ERROR
    }

    getExpectedWord() {
        return this.fullPassage.split(' ')[this.currentWordIndex]
    }
    
    isTextFinished() {
        return (this.currentWordIndex + 1) > this.fullPassage.split(' ').length
    }
    
    onLastWord() {
        return this.getTotalTypedText().split(' ').filter(e => e).length  >= this.fullPassage.split(' ').length
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
        var passageLetterArray = Array.from(this.fullPassage)
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
        var passageLetterArray = Array.from(this.fullPassage)
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