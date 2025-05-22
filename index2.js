import Board from "./src/board.js";
import { INITIAL_POSITIONS, PIECE_ARRAY } from "./src/config.js";
import GameState from "./src/GameState.js";
import PieceManager from "./src/pieces.js";

function newGame() {
    const state = new GameState();

    // puts down the board with different colored squares
    const board = new Board(state);
    board.buildBoard();
    
    // puts the pieces in their right positions on the board
    const pieceManager = new PieceManager(state);
    pieceManager.piecePlacement(INITIAL_POSITIONS, PIECE_ARRAY);

    // starts timers for both colors when it is their turn
    const wTime = state.timer.clock(600, document.getElementById("timer-white"), "w");
    const bTime = state.timer.clock(600, document.getElementById("timer-black"), "b");

    document.getElementById("flip-button").addEventListener("click", () => {
        board.flipBoard();
    })
};

newGame();