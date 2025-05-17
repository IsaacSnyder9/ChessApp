
const board = document.getElementById('board');
const chessCoordinates = [
    "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
    "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
    "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
    "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
    "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
    "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
    "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
    "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"
]
let coord = {};
let turn = "w"

// saves all the positions of the pieces and returns them as an object
const savePiecePositions = () => {
    const positions = {}
    Object.keys(coord).forEach((squareId) => {
        const piece = coord[squareId].querySelector('.piece');
        if (piece) {
            positions[squareId] = piece.id;
        }
    });
    return positions
}

// saves positions in an object, deletes the board, reverses the coordinates,
// rebuilds the board and sets the positions of pieces.
const flipBoard = () => {
    const piecePositions = savePiecePositions();
    console.log("piecepositions", piecePositions)
    const savedPieceArray = Object.values(piecePositions)
    console.log(savedPieceArray)

    board.innerHTML = "";
    coord = {};

    flipTimers();

    chessCoordinates.reverse();

    chessCoordinates.map((co, i) => {
        const divElement = document.createElement('div'),
            row = Math.floor(i / 8),
            col = i % 8;

        divElement.className = 'square ';
        if ((row + col) % 2 !== 0) {
            divElement.className += 'square-2 '
        }
        divElement.id = `${co}`
        board.appendChild(divElement)
        coord[co] = divElement;

        divElement.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        divElement.addEventListener('drop', (e) => {
            e.preventDefault();
            const data = e.dataTransfer.getData('text/plain');
            let target = e.target;
            const piece = document.getElementById(data)
            const pieceColor = piece.id.slice(0, 1);
            if (target.tagName === 'IMG') {
                target = target.parentElement;
            }
            if (isValidMove(piece, target) && turn === pieceColor) {
                console.log(pieceType, targetNumber, target)
                if(promotionInProgress){
                    handlePromotion(storedPiece, storedSquare)
                }
                if (pieceType === "wp" && targetNumber === "8" || pieceType === "bp" && targetNumber === "1") {
                    promotionInProgress = true;
                    console.log("promotion");
    
    
                    handlePromotion(piece, target)
                }
    
                if (triggerEnPessant) {
                    const captureRow = pieceColor === 'w' ? parseInt(target.id[1]) - 1 : parseInt(target.id[1]) + 1;
                    const captureSquare = `${target.id[0]}${captureRow}`;
                    const capturedPawn = coord[captureSquare].querySelector('.piece');
    
                    if (capturedPawn) {
                        capturedPawn.remove();
                    }
                }
                if (whiteQueenCastle) {
                    document.getElementById('d1').appendChild(document.getElementById('wr'))
                }
                if (whiteKingCastle) {
                    document.getElementById('f1').appendChild(document.getElementById('wr2'))
                }
                if (blackQueenCastle) {
                    document.getElementById('d8').appendChild(document.getElementById('br'))
                }
                if (blackKingCastle) {
                    document.getElementById('f8').appendChild(document.getElementById('br2'))
                }
    
                if (!promotionInProgress) {
                    if (target.querySelector('.piece')) {
                        target.querySelector('.piece').remove();
                    }
    
                    target.appendChild(piece);
                    turn = turn === "w" ? "b" : "w";
                    updateActiveTimerClass(whiteTimerId, blackTimerId);
                    // if the switch is true make it false once it is false en pessant cannot happen
                    epSwitch ? epSwitch = false : (allowEnPessant = null, triggerEnPessant = false)
                }
            }
        });

    })
    console.log("coord", coord)
    pieceplacement(piecePositions, savedPieceArray);
}

// coundown timer that sets the time in by seconds and outputs standard format to the display
const clock = (duration, display, playerTurn) => {
    let minutes
    let seconds
    let timeRemaining = duration
    const interval = setInterval(() => {
        if (turn === playerTurn) {
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


let wTime = clock(600, document.getElementById("timer-white"), "w")
let bTime = clock(600, document.getElementById("timer-black"), "b")

let whiteTimerId = "timer-1"
let blackTimerId = "timer-2"

// updates timers to visualy indicate what timer is actively decrementing
const updateActiveTimerClass = (timerW, timerB) => {
    if (turn === "w") {
        document.getElementById(timerW).className = `${timerW} timer-white timer-white-active`
        document.getElementById(timerB).className = `${timerB} timer-black`
    } else {
        document.getElementById(timerB).className = `${timerB} timer-black timer-black-active`
        document.getElementById(timerW).className = `${timerW} timer-white`
    }
}

// flips the timers by changing the classes of each timer and the id of its children
const flipTimers = () => {

    whiteTimerId === "timer-2" ? whiteTimerId = "timer-1" : whiteTimerId = "timer-2";
    blackTimerId === "timer-2" ? blackTimerId = "timer-1" : blackTimerId = "timer-2";
    updateActiveTimerClass(whiteTimerId, blackTimerId);

    const whiteTimer = document.getElementById("timer-white");
    const blackTimer = document.getElementById("timer-black");

    document.getElementById(whiteTimerId).appendChild(whiteTimer);
    document.getElementById(blackTimerId).appendChild(blackTimer);
}

let promotionInProgress = false;
// board creation and drop event
chessCoordinates.map((co, i) => {
    const divElement = document.createElement('div'),
        row = Math.floor(i / 8),
        col = i % 8;

    divElement.className = 'square ';
    if ((row + col) % 2 !== 0) {
        divElement.className += 'square-2 '
    }
    divElement.id = `${co}`
    board.appendChild(divElement)
    coord[co] = divElement;

    divElement.addEventListener('dragover', (e) => {
        e.preventDefault();
    });
    divElement.addEventListener('drop', (e) => {
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
        if (isValidMove(piece, target) && turn === pieceColor) {
            console.log(pieceType, targetNumber, target)
            if (pieceType === "wp" && targetNumber === "8" || pieceType === "bp" && targetNumber === "1") {
                promotionInProgress = true;
                console.log("promotion");
                handlePromotion(piece, target)
            }

            if (triggerEnPessant) {
                const captureRow = pieceColor === 'w' ? parseInt(target.id[1]) - 1 : parseInt(target.id[1]) + 1;
                const captureSquare = `${target.id[0]}${captureRow}`;
                const capturedPawn = coord[captureSquare].querySelector('.piece');

                if (capturedPawn) {
                    capturedPawn.remove();
                }
            }
            if (whiteQueenCastle) {
                document.getElementById('d1').appendChild(document.getElementById('wr'))
            }
            if (whiteKingCastle) {
                document.getElementById('f1').appendChild(document.getElementById('wr2'))
            }
            if (blackQueenCastle) {
                document.getElementById('d8').appendChild(document.getElementById('br'))
            }
            if (blackKingCastle) {
                document.getElementById('f8').appendChild(document.getElementById('br2'))
            }

            if (!promotionInProgress) {
                if (target.querySelector('.piece')) {
                    target.querySelector('.piece').remove();
                }

                target.appendChild(piece);
                turn = turn === "w" ? "b" : "w";
                updateActiveTimerClass(whiteTimerId, blackTimerId);
                // if the switch is true make it false once it is false en pessant cannot happen
                epSwitch ? epSwitch = false : (allowEnPessant = null, triggerEnPessant = false)
            }
        }
    });
})

document.getElementById("flip-button").addEventListener("click", () => {
    flipBoard();
})

// piece placement
const initialPositions = {
    "a1": "wr", "b1": "wn", "c1": "wb", "d1": "wq", "e1": "wk", "f1": "wb2", "g1": "wn2", "h1": "wr2",
    "a2": "wp", "b2": "wp2", "c2": "wp3", "d2": "wp4", "e2": "wp5", "f2": "wp6", "g2": "wp7", "h2": "wp8",
    "a7": "bp", "b7": "bp2", "c7": "bp3", "d7": "bp4", "e7": "bp5", "f7": "bp6", "g7": "bp7", "h7": "bp8",
    "a8": "br", "b8": "bn", "c8": "bb", "d8": "bq", "e8": "bk", "f8": "bb2", "g8": "bn2", "h8": "br2"
};

console.log("initialpositions", initialPositions)

// piece movement and drag event
const pieceArray = ['wp', 'wp2', 'wp3', 'wp4', 'wp5', 'wp6', 'wp7', 'wp8', 'bp', 'bp2', 'bp3', 'bp4', 'bp5', 'bp6', 'bp7', 'bp8', 'wr', 'wr2', 'br', 'br2', 'wn', 'wn2', 'bn', 'bn2', 'wb', 'wb2', 'bb', 'bb2', 'wq', 'bq', 'wk', 'bk'];

// piece placement and image creation
function pieceplacement(obj, arr) {
    Object.keys(obj).forEach(pi => {
        const pieceName = obj[pi];
        const piecePlace = document.createElement('img');
        piecePlace.src = `./images/${pieceName.slice(0, 2)}.png`;
        piecePlace.className = 'piece';
        piecePlace.id = `${pieceName}`
        coord[pi].appendChild(piecePlace);
    });
    // piece movement
    arr.map(p => {
        const piece = document.getElementById(p)
        piece.addEventListener('dragstart', (e) => {
            e.dataTransfer.setDqata('text/plain', e.target.id);
        });
    });

}

pieceplacement(initialPositions, pieceArray);

let storedPiece = null;
let storedSquare = null;
const handlePromotion = (piece, square) => {
    const dialog = document.getElementById('promotion-dialog');
    const squareRect = square.getBoundingClientRect();
    const color = piece.id.slice(0, 1);

    dialog.style.left = `${squareRect.left}px`;
    dialog.style.top = `${squareRect.bottom}px`;

    storedPiece = piece;
    storedSquare = square;

    dialog.querySelectorAll('.promotion-piece').forEach(img => {
        img.src = `./images/${color}${img.dataset.piece}.png`;
    });

    dialog.classList.remove('hidden');
    let promotionPawn = piece;

    dialog.querySelectorAll('.promotion-piece').forEach(img => {
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
            dialog.classList.add('hidden');

            storedPiece = null;
            storedSquare = null;

            promotionInProgress = false;
            turn = turn === "w" ? "b" : "w";
            updateActiveTimerClass(whiteTimerId, blackTimerId);
        };
    });
}

// move calculation and validation
let allowEnPessant = null;
let triggerEnPessant = false;
let epSwitch = false;


let hasWKingMoved = false;
let hasBKingMoved = false;
let hasWRook1Moved = false;
let hasWRook2Moved = false;
let hasBRook1Moved = false;
let hasBRook2Moved = false;
let whiteQueenCastle = false;
let whiteKingCastle = false;
let blackQueenCastle = false
let blackKingCastle = false;


const isValidMove = (piece, target) => {
    const pieceType = piece.id.slice(0, 2);
    const pieceColor = piece.id.slice(0, 1);
    const currentSquare = piece.parentElement.id;
    const targetSquare = target.id;
    const currentNum = parseInt(currentSquare[1]);
    const targetNum = parseInt(targetSquare[1]);
    const currentLetter = currentSquare[0];
    const targetLetter = targetSquare[0];

    // takes letter code - 'a' code for alphabetical number
    const letterToNumber = (letter) => letter.charCodeAt(0) - 'a'.charCodeAt(0) + 1;

    const currentLetterNum = letterToNumber(currentLetter);
    const targetLetterNum = letterToNumber(targetLetter);

    const numDiff = Math.abs(currentNum - targetNum);
    const letterDiff = Math.abs(currentLetterNum - targetLetterNum);

    // checks if the path is clear to move piece
    const isPathClear = (startN, endN, startL, endL) => {
        let pathClear = true;
        if (startN === endN) {
            let step = startL < endL ? 1 : -1;
            for (let i = startL + step; i !== endL; i += step) {
                const squareId = `${String.fromCharCode('a'.charCodeAt(0) + i - 1)}${currentNum}`;
                if (coord[squareId].querySelector('.piece')) {
                    console.log("not a valid move!")
                    pathClear = false;
                    break;
                }
            }
        }
        else if (startL === endL) {
            let step = startN < endN ? 1 : -1;
            for (let i = startN + step; i !== endN; i += step) {
                const squareId = `${currentLetter}${i}`;
                if (coord[squareId].querySelector('.piece')) {
                    console.log("not a valid move!")
                    pathClear = false;
                    break;
                }
            }
        }
        else {
            let numStep = startN < endN ? 1 : -1;
            let letStep = startL < endL ? 1 : -1;
            let row = startN + numStep;
            let col = startL + letStep;
            while (row !== endN && col !== endN) {
                const squareId = `${String.fromCharCode('a'.charCodeAt(0) + col - 1)}${row}`;
                if (coord[squareId].querySelector('.piece')) {
                    console.log("not a valid move!")
                    pathClear = false;
                    break;
                }
                row += numStep;
                col += letStep;
            }
        }
        return pathClear
    }

    const targetPiece = target.querySelector('.piece');
    if (targetPiece && targetPiece.id.slice(0, 1) === pieceColor) {
        return false;
    }

    // white pawn
    if (pieceType === 'wp') {
        if (currentLetter === targetLetter) {
            if (currentNum === 2 && currentLetter === targetLetter && currentNum + 2 === targetNum) {
                allowEnPessant = `${targetLetter}3`
                console.log(allowEnPessant);
                epSwitch = true;
                return true;
            }
            return currentNum + 1 === targetNum
        }
        if (letterDiff === 1 && currentNum + 1 === targetNum) {
            if (allowEnPessant === `${targetLetter}${targetNum}`) {
                triggerEnPessant = true;
                return true;
            }
            return targetPiece && targetPiece.id.slice(0, 1) === 'b';
        }
    }

    // black pawn
    if (pieceType === 'bp') {
        if (currentLetter === targetLetter) {
            if (currentNum === 7 && currentLetter === targetLetter && currentNum - 2 === targetNum) {
                allowEnPessant = `${targetLetter}6`
                console.log(allowEnPessant);
                epSwitch = true;
                return true;
            }
            return currentNum - 1 === targetNum
        }
        if (letterDiff === 1 && currentNum - 1 === targetNum) {
            if (allowEnPessant === `${targetLetter}${targetNum}`) {
                triggerEnPessant = true;
                return true;
            }
            return targetPiece && targetPiece.id.slice(0, 1) === 'w';
        }
    }


    // rook
    if (pieceType === 'wr' || pieceType === 'br') {
        if (currentLetter === targetLetter || currentNum === targetNum) {
            if (isPathClear(currentNum, targetNum, currentLetterNum, targetLetterNum)) {
                if (piece.id === 'wr') {
                    hasWRook1Moved = true;
                }
                if (piece.id === 'wr2') {
                    hasWRook2Moved = true;
                }
                if (piece.id === 'br') {
                    hasBRook1Moved = true;
                }
                if (piece.id === 'br2') {
                    hasBRook2Moved = true;
                }
                return true
            }
        }
    }

    // knight
    if (pieceType === 'wn' || pieceType === 'bn') {
        return numDiff === 2 && letterDiff === 1 || letterDiff === 2 && numDiff === 1
    }

    // bishop
    if (pieceType === 'wb' || pieceType === 'bb') {
        if (numDiff === letterDiff) {
            return isPathClear(currentNum, targetNum, currentLetterNum, targetLetterNum)
        }
    }

    // queen 
    if (pieceType === 'wq' || pieceType === 'bq') {
        if (numDiff === letterDiff || currentLetter === targetLetter || currentNum === targetNum) {
            return isPathClear(currentNum, targetNum, currentLetterNum, targetLetterNum)
        }
    }

    // white king
    if (pieceType === 'wk') {
        if (targetSquare === 'c1' && !hasWKingMoved && !hasWRook1Moved) {
            if (isPathClear(currentNum, targetNum, currentLetterNum, 1)) {
                whiteQueenCastle = true;
                hasWKingMoved = true;
                hasWRook1Moved = true;
                return true
            }
        }
        if (targetSquare === 'g1' && !hasWKingMoved && !hasWRook2Moved) {
            if (isPathClear(currentNum, targetNum, currentLetterNum, 8)) {
                whiteKingCastle = true;
                hasWKingMoved = true;
                hasWRook2Moved = true;
                return true
            }
        }
        if (numDiff <= 1 && letterDiff <= 1) {
            hasWKingMoved = true;
            return true;
        }

    }

    // black king
    if (pieceType === 'bk') {
        if (targetSquare === 'c8' && !hasBKingMoved && !hasBRook1Moved) {
            if (isPathClear(currentNum, targetNum, currentLetterNum, 1)) {
                blackQueenCastle = true;
                hasBKingMoved = true;
                hasBRook1Moved = true;
                return true
            }
        }
        if (targetSquare === 'g8' && !hasBKingMoved && !hasBRook2Moved) {
            if (isPathClear(currentNum, targetNum, currentLetterNum, 8)) {
                blackKingCastle = true;
                hasBKingMoved = true;
                hasBRook2Moved = true;
                return true
            }
        }
        if (numDiff <= 1 && letterDiff <= 1) {
            hasBKingMoved = true;
            return true;
        }
    }

    return false;
};

/* 

    TO DO

    * Pawn promotion
        - when reversing while promition is in progress the whole thing softlocks
        - when reversing there is no promotion diologue
    * King Checks
    * organization

*/