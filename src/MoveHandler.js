import MoveValidator from "./MoveValidation.js"

export class MoveHandler {
    constructor(state) {
        this.state = state
        this.BoardArr = this.state.coord;
        this.validation = new MoveValidator(this.BoardArr, this.state);
        this.storedPiece = null;
        this.storedSquare = null;
        this.dialog = document.getElementById('promotion-dialog');

    }

    handleDrop(e, coordArr) {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        let target = e.target;
        const piece = document.getElementById(data)
        const pieceType = piece.id.slice(0, 2);
        const pieceColor = piece.id.slice(0, 1);
        if (target.tagName === 'IMG') {
            target = target.parentElement;
        }
        const targetNumber = target.id.slice(1, 2);
        if (this.validation.isValidMove(piece, target) && this.state.turn === pieceColor) {
            console.log(pieceType, targetNumber, target)

            this.state.removeCheck();

            if (pieceType === "wp" && targetNumber === "8" || pieceType === "bp" && targetNumber === "1") {
                this.state.promotionInProgress = true;
                console.log("promotion");
                this.handlePromotion(piece, target)
            }

            if (this.state.triggerEnPessant) {
                const captureRow = pieceColor === 'w' ? parseInt(target.id[1]) - 1 : parseInt(target.id[1]) + 1;
                const captureSquare = `${target.id[0]}${captureRow}`;
                const capturedPawn = coordArr[captureSquare].querySelector('.piece');

                if (capturedPawn) {
                    capturedPawn.remove();
                }
            }
            if (this.state.whiteQueenCastle) {
                document.getElementById('d1').appendChild(document.getElementById('wr'))
            }
            if (this.state.whiteKingCastle) {
                document.getElementById('f1').appendChild(document.getElementById('wr2'))
            }
            if (this.state.blackQueenCastle) {
                document.getElementById('d8').appendChild(document.getElementById('br'))
            }
            if (this.state.blackKingCastle) {
                document.getElementById('f8').appendChild(document.getElementById('br2'))
            }

            if (!this.state.promotionInProgress) {
                if (target.querySelector('.piece')) {
                    console.log("alive pieces ", this.state.alivePieces)
                    target.querySelector('.piece').remove();
                    this.state.getAlivePieces()
                }
                target.appendChild(piece);

                this.state.updateTurn();

                const currentKing = document.getElementById(this.state.turn + 'k')
                const kingSquare = currentKing.parentElement
                console.log("king square: ", kingSquare)

                if (this.validation.isSquareUnderAttack(kingSquare, this.state.turn, true)) {
                    this.state.handleCheck(currentKing);
                    if (!this.validation.canKingMove(currentKing)) {
                        if (!this.validation.canCheckBeBlocked(currentKing, this.state.checkingPieces)) {
                            console.log('checkmate!')
                        }
                    }
                    this.state.turn === 'w' ? this.whiteInCheck = true : this.blackInCheck = true;
                }

                this.state.resetEnPassant();
            }
        }
    };

    handlePromotion(piece, square) {
        const squareRect = square.getBoundingClientRect();
        const color = piece.id.slice(0, 1);

        this.dialog.style.left = `${squareRect.left}px`;
        this.dialog.style.top = `${squareRect.bottom}px`;

        this.storedPiece = piece;
        this.storedSquare = square;


        this.dialog.querySelectorAll('.promotion-piece').forEach(img => {
            img.src = `./images/${color}${img.dataset.piece}.png`;
        });

        this.dialog.classList.remove('hidden');
        let promotionPawn = piece;

        this.dialog.querySelectorAll('.promotion-piece').forEach(img => {
            img.onclick = () => {
                const newPiece = document.createElement('img');
                const pieceType = img.dataset.piece;
                const pieceId = `${color}${pieceType}${Date.now()}`;

                newPiece.src = img.src;
                newPiece.id = pieceId;
                newPiece.className = 'piece';
                newPiece.draggable = true;

                newPiece.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', pieceId);
                });

                promotionPawn.remove();
                if (square.querySelector('.piece')) {
                    square.querySelector('.piece').remove();
                }
                square.appendChild(newPiece);
                this.dialog.classList.add('hidden');

                this.storedPiece = null;
                this.storedSquare = null;

                this.state.promotionInProgress = false;
                this.state.updateTurn();
                updateActiveTimerClass(whiteTimerId, blackTimerId);
            };
        });
    }

    cancelPromotion() {
        this.dialog.classList.add('hidden');
        this.storedPiece = null;
        this.storedSquare = null;
        this.state.promotionInProgress = false;
    }

}
