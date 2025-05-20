import { CHESS_COORDINATES } from './config.js';
import { MoveHandler } from './MoveHandler.js';
import PieceManager from "./pieces.js";

export default class Board {
    constructor(state) {
        this.state = state;
        this.board = document.getElementById('board');
        this.BoardArr = state.coord;
        this.moveHandler = new MoveHandler(this.state);
    }

    buildBoard() {
        CHESS_COORDINATES.map((co, i) => {
            const divElement = document.createElement('div');
            const row = Math.floor(i / 8);
            const col = i % 8;

            divElement.className = 'square ';
            if ((row + col) % 2 !== 0) {
                divElement.className += 'square-2 '
            }
            divElement.id = `${co}`

            this.board.appendChild(divElement)
            this.state.coord[co] = divElement;

            divElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            divElement.addEventListener('drop', (e) => {
                this.moveHandler.handleDrop(e, this.state.coord);
                console.log(this.state.coord)
            }); 
        })
    }
    flipBoard() {
        const savePiecePositions = () => {
            const positions = {}
            Object.keys(this.state.coord).forEach((squareId) => {
                const piece = this.state.coord[squareId].querySelector('.piece');
                if (piece) {
                    positions[squareId] = piece.id;
                }
            });
            return positions
        }

        if(this.state.promotionInProgress === true){
            this.moveHandler.cancelPromotion();
        }

        const piecePositions = savePiecePositions();
        const savedPieceArray = Object.values(piecePositions)

        this.board.innerHTML = "";
        console.log(this.state.coord)
        this.state.coord = {}

        this.state.timer.flipTimers()
        this.state.timer.updateActiveTimerClass(this.state.whiteTimerId, this.state.blackTimerId)

        CHESS_COORDINATES.reverse();
        
        this.buildBoard();

        this.moveHandler = new MoveHandler(this.state)

        const reversePieceManager = new PieceManager(this.state)
        reversePieceManager.piecePlacement(piecePositions, savedPieceArray)
        this.state.getAlivePieces();
    }
}