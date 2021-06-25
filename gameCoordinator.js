var gameList = [];

function createGame(options, id) { // Leave for future games with random ids
    if (!id) id = findUnusedId();
    if (!id) {
        
    }
    var newGame = new Game(id, options, () => {
        gameList.splice(findGameById(id), 1);
    });
    gameList.push(newGame);
    return newGame;
}

function findGameById(id) {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].id == id) return gameList[i];
    }
    return undefined;
}

function findUnusedId() {
    for (var i = 0; i < 9999; i++) {
        if (!findGameById(i)) {
            return i;
        }
    }
    console.log('FATAL ERROR: Ran out of ids! Using random number from 1 to 1 million and praying it hasn\'t been used before')
    return Math.floor(Math.random() * 1000000)
}

function findGames() {
    return gameList;
}

function findUnstartedGame() {
    for (var i = 0; i < gameList.length; i++) {
        if (gameList[i].timeSinceStart < -1000) return gameList[i];
    }
    return undefined;
}

exports.findGameById = findGameById;
exports.findUnstartedGame = findUnstartedGame;
exports.createGame = createGame;
exports.findGames = findGames;

class Game {
    constructor(id, options, gameEndCallback) {
        this.options = options;
        this.id = id;
        this.gameEndCallback = gameEndCallback;
        this.text = "Once upon a time some stranger fell over a skateboard."

        setTimeout(() => {
            this.startGame();
        }, this.options.startIn);

        // Set startTime ahead of time
        this.startTime = new Date().getTime() + this.options.startIn;

        this.users = [];
    }

    startGame() {
        console.log(`Game ${this.id} started with ${this.users.length} players`);
        setTimeout(() => {
            this.endGame();
        }, this.options.gameLength);
    }

    endGame() {
        setTimeout(() => { // Don't delete game instantly
            this.gameEndCallback();
        }, this.gameDeleteDelay);
    }

    get timeSinceStart() {
        return new Date().getTime() - this.startTime;
    }

    get length() {
        return this.options.gameLength;
    }

    get gameOngoing() {
        return (timeSinceStart > 0) && (length > timeSinceStart);
    }

    // No removing users (no leaving game)
    addUser(user) {
        this.users.push(user);
    }
}