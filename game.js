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
        console.log(`Game ${this.id} started!`);
        setTimeout(() => {
            this.endGame();
        }, this.options.gameLength);
    }

    endGame() {
        console.log(`Game ${this.id} ended!`);
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

    // No removing users (you join you play or gay)
    addUser(user) {
        this.users.push(user);
    }
}

module.exports = Game;