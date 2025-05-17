

export default class PieceManager {
    constructor(state) {
        this.state = state
        this.BoardArr = this.state.coord
    }
    piecePlacement(obj, arr) {
        this.state.alivePieces = arr
        console.log("alive pieces", this.state.alivePieces)
        Object.keys(obj).forEach(pi => {
            const pieceName = obj[pi];
            const piecePlace = document.createElement('img');
            piecePlace.src = `./images/${pieceName.slice(0, 2)}.png`;
            piecePlace.className = 'piece';
            piecePlace.id = `${pieceName}`
            this.BoardArr[pi].appendChild(piecePlace);
        });
        // piece movement
        arr.map(p => {
            const piece = document.getElementById(p)
            piece.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', e.target.id);
            });
        });

    }
}