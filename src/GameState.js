import clockManager from "./timer.js";

export default class GameState {
    constructor() {
        this.turn = "w"
        this.coord = {};
        this.timer = new clockManager(this)
        this.alivePieces = []

        this.whiteTimerId = "timer-1"
        this.blackTimerId = "timer-2"

        this.allowEnPessant = null;
        this.triggerEnPessant = false;
        this.epSwitch = false;
        this.promotionInProgress = false;

        this.hasWKingMoved = false;
        this.hasBKingMoved = false;
        this.hasWRook1Moved = false;
        this.hasWRook2Moved = false;
        this.hasBRook1Moved = false;
        this.hasBRook2Moved = false;
        this.whiteQueenCastle = false;
        this.whiteKingCastle = false;
        this.blackQueenCastle = false
        this.blackKingCastle = false;

        this.whiteInCheck = false;
        this.blackInCheck = false;
        this.checkingPieces = [];
        this.checkedSquare = null;
        this.checkedSquareClasses = null;
    }

    updateTurn() {
        this.turn = this.turn === "w" ? "b" : "w";
        this.timer.updateActiveTimerClass(this.whiteTimerId, this.blackTimerId);

    }

    resetEnPassant() {
        if (this.epSwitch) {
            this.epSwitch = false;
        } else {
            this.allowEnPessant = null;
            this.triggerEnPessant = false;
        }
    }

    getAlivePieces() {
        const pieces = document.querySelectorAll('.piece')
        const alivePieceIds = Array.from(pieces).map(p => p.id)

        this.alivePieces = alivePieceIds
    }

    handleCheck(king) {
        const kingSquare = king.parentElement
        const kingColor = king.id.slice(0, 1)

        if (this.checkedSquare) {
            document.getElementById(this.checkedSquare).className = this.checkedSquareClasses;
        }
        this.checkedSquare = kingSquare.id
        this.checkedSquareClasses = kingSquare.className
        kingSquare.className += ' square-check';
        kingColor === 'w' ? this.whiteInCheck = true : this.blackInCheck = true
    }
    removeCheck() {
        if (this.checkedSquare) {
            document.getElementById(this.checkedSquare).className = this.checkedSquareClasses;
            this.checkedSquare = null;
            this.checkedSquareClasses = null;
            this.whiteInCheck = false;
            this.blackInCheck = false;
        }
    }
}
