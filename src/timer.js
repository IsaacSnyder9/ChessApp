export default class clockManager {
    constructor(state) {
        this.state = state;
    }
    clock(duration, display, playerTurn) {
        let minutes
        let seconds
        let timeRemaining = duration
        const interval = setInterval(() => {
            if (this.state.turn === playerTurn) {
                minutes = parseInt(timeRemaining / 60, 10);
                seconds = parseInt(timeRemaining % 60, 10);

                display.textContent =
                    (minutes = minutes < 10 ? "0" + minutes : minutes) + ":" +
                    (seconds = seconds < 10 ? "0" + seconds : seconds)

                timeRemaining--;

                if (timeRemaining <= 0) {
                    clearInterval(interval)
                }
            }
        }, 1000)
        return interval
    }
    updateActiveTimerClass = (timerW, timerB) => {
        if (this.state.turn === "w") {
            document.getElementById(timerW).className = `${timerW} timer-white timer-white-active`
            document.getElementById(timerB).className = `${timerB} timer-black`
        } else {
            document.getElementById(timerB).className = `${timerB} timer-black timer-black-active`
            document.getElementById(timerW).className = `${timerW} timer-white`
        }
    }
    flipTimers() {

        this.state.whiteTimerId === "timer-2" ? this.state.whiteTimerId = "timer-1" : this.state.whiteTimerId = "timer-2";
        this.state.blackTimerId === "timer-2" ? this.state.blackTimerId = "timer-1" : this.state.blackTimerId = "timer-2";
    
        const whiteTimer = document.getElementById("timer-white");
        const blackTimer = document.getElementById("timer-black");
    
        document.getElementById(this.state.whiteTimerId).appendChild(whiteTimer);
        document.getElementById(this.state.blackTimerId).appendChild(blackTimer);
    }
    

}