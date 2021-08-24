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

        this.characterPrefix = !isNaN(characterPrefix) ? characterPrefix : 100000000
        this.characterSuffix = !isNaN(characterSuffix) ? characterSuffix : 100000000

        this.currentWordIndex = 0 // Start the user at the first word
        this.confirmedText = '' // Text typed correctly locked after space was pressed
        this.secondsElapsed = 0 // Seconds of user being able to type

        this.textInput = document.getElementById('engine-input')
        this.passageElement = document.getElementById('engine-passage')
        this.passageWrapper = document.getElementById('engine-passage-wrapper')

        this.textInput.readOnly = 1
        this.textInput.value = ''
        this.textInput.placeholder = ''
        setInterval(() => { this.textInput.focus()} , 100)
        setInterval(() => { this.updatePassage() }, 500)

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
            if (this.engineRunning == 1) {
                this.secondsElapsed += this.intervalDelay / 1000
            }


            for (var cursor in this.cursors) {
                if (this.cursors[cursor].timeout != undefined) {
                    this.cursors[cursor].timeout -= this.intervalDelay
                    
                    if (this.cursors[cursor].timeout < 0) {
                        this.cursors[cursor].element.remove()
                        delete this.cursors[cursor]
                    }
                }
            }
            this.updateCursors()
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

    /*
    Passage
    */

    addPassage(text) {
        this.fullPassage+= text
    }

    getPassage() {
        return this.fullPassage
    }

    getPrefix() {
        return Math.max(this.getCursor('main').character - this.characterPrefix, 0)
    }

    getSuffix() {
        return Math.min(this.getCursor('main').character + this.characterSuffix)
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
            this.cursors[name].name = name
            document.getElementById("cursor-container").innerHTML += `<div class="cursor" id="cursor--${name}"></div>`
            this.cursors[name].element = function() {
                return document.getElementById(`cursor--${this.name}`)
            }

            if (name != 'main') {
                this.cursors[name].element().style.backgroundColor = 'gray'
            } else {
                this.cursors[name].element().style.zIndex = 1
                this.cursors[name].element().style.opacity = 0
                setTimeout(() => {
                    this.cursors[name].element().style.opacity = 1
                    this.cursors[name].element().style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }, 300)
            }
        }

        this.cursors[name].character = character
        
        if (timeout) {
            this.cursors[name].timeout = timeout
        }
    }


    updateCursors() {
        for (var cursorName in this.cursors) {
            var currentLetter
            var cursor = this.cursors[cursorName]
            for (var letterNum in document.getElementsByTagName('letter')) {
                var letter = document.getElementsByTagName('letter')[letterNum]

                if (letterNum == cursor.character - this.getPrefix()) {
                    currentLetter = letter
                    break;
                }
            }

            cursor.element().style.top = `${currentLetter.getBoundingClientRect().top}px`
            cursor.element().style.left = `${currentLetter.getBoundingClientRect().left}px`
            cursor.element().style.height = currentLetter.clientHeight + 'px'

        }
    }
    
    updatePassage() { // Each letter has it's own <span>
        var passageHTML = ''
        this.setCursor('main', Math.max(this.getCorrectLetterCount(), 0))
        var correctLettersLeft = this.getCorrectLetterCount() - Math.max(0, this.getLettersHidden())
        var incorrectLettersLeft = this.getIncorrectLetterCount()

        var currentLetterPlaced = false

        for (var word of this.getDisplayPassage().replaceAll(' ', '// ').split('//')) {

            passageHTML += `<word>`
            for (var letter of word) {
                var classToAdd = ''
    
                if (correctLettersLeft-- > 0) {
                    var classToAdd = 'correct'
                } else if (incorrectLettersLeft-- > 0) {
                    var classToAdd = 'incorrect'
                }
    
                if (classToAdd != 'correct' && !currentLetterPlaced) {
                    classToAdd+= ' current'
                    currentLetterPlaced = true
                }
    
                passageHTML += `<letter class='${classToAdd}'>${letter == " " ? '&nbsp' : letter}</letter>`
            }
            passageHTML += `</word>`
        }

        if (!currentLetterPlaced) { // The game has ended
            // Create a fake invisible character at the end so the cursor can stand behind that one
            passageHTML += `<letter class="current" style="opacity: 0">.</letter>`
        }

        this.passageElement.innerHTML = passageHTML


        /*
        We can optimize the engine using this but I am currently too lazy
        */
        var hiddenTopLetters = 0
        var hiddenBottomLetters = 0
        for (var letterNum in document.getElementsByTagName("letter")) {
            if (isNaN(letterNum)) {
                continue
            }
            var letterArray = document.getElementsByTagName("letter")

            if (this.isLetterHiddenBottom(letterArray[letterNum])) {
                hiddenBottomLetters++
            }

            if (this.isLetterHiddenTop(letterArray[letterNum])) {
                hiddenTopLetters++
            }
        }

        document.getElementsByClassName("current")[0].scrollIntoView()

        this.updateCursors()
    }

    /*
    Alert
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


    /*
    Helper methods
    */

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
    
    isLetterVisible(el) {
        var eRect = el.getBoundingClientRect()
        var pRect = this.passageElement.getBoundingClientRect()
        var isVisible = (eRect.top < pRect.bottom) && (eRect.bottom > pRect.top);
        return isVisible;
    }

    isLetterHiddenTop(el) {
        var eRect = el.getBoundingClientRect()
        var pRect = this.passageWrapper.getBoundingClientRect()
        return eRect.bottom < pRect.top;
    }

    isLetterHiddenBottom(el) {
        var eRect = el.getBoundingClientRect()
        var pRect = this.passageWrapper.getBoundingClientRect()
        return eRect.top > pRect.bottom;
    }

    getLettersLeft() {
        console.log(this.fullPassage.length - this.getCorrectLetterCount())
        return this.fullPassage.length - this.getCorrectLetterCount()
    }
}