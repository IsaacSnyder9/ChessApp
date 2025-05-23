export default class MoveValidator {
  constructor(BoardArr, state) {
    this.state = state;
    this.BoardArr = BoardArr;
  }
  isSquareUnderAttack(square, color, checkKing = false) {
    const oppColor = color === "w" ? "b" : "w";
    const alivePieces = this.state.alivePieces;
    let isUnderAttack = false;
    let attackingPieces = [];

    const targetSquare = typeof square === "string" ? document.getElementById(square) : square;

    alivePieces.forEach((piece) => {
      if (piece.slice(0, 1) === oppColor) {
        const pieceId = document.getElementById(piece);
        if (this.isValidMove(pieceId, targetSquare, false)) {
          attackingPieces.push(piece);
          isUnderAttack = true;
        }
      }
    });
    if (checkKing) {
      console.log("attacking pieces: ", attackingPieces);
      this.state.checkingPieces = attackingPieces;
    }
    return isUnderAttack;
  }

  // takes letter code - 'a' code for alphabetical number
  letterToNumber(letter) {
    return letter.charCodeAt(0) - "a".charCodeAt(0) + 1;
  }

  canKingMove(king) {
    const squares = [
      [-1, 1],
      [0, 1],
      [1, 1],
      [-1, 0],
      [1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
    ];

    const kingColor = king.id[0];
    const kingSquare = king.parentElement.id;
    const kingLetterNum = this.letterToNumber(kingSquare[0]);
    const kingNum = parseInt(kingSquare[1]);
    let canMove = false;
    let arr = [];

    console.log(kingSquare);
    squares.forEach(([l, n]) => {
      const newLetterNum = kingLetterNum + l;
      const newNum = kingNum + n;

      if (newLetterNum <= 8 && newLetterNum >= 1 && newNum <= 8 && newNum >= 1) {
        const newSquareL = String.fromCharCode("a".charCodeAt(0) + parseInt(newLetterNum - 1));
        const newSquareN = String(parseInt(newNum));
        const newSquare = document.getElementById(newSquareL + newSquareN);
        arr.push(newSquareL + newSquareN);

        if (newSquare) {
          const isEmptyOrEnemy = !newSquare.children.length ? true : newSquare.children[0].id.slice(0, 1) !== kingColor;

          if (isEmptyOrEnemy) {
            if (!this.isSquareUnderAttack(newSquare, kingColor) && this.isValidMove(king, newSquare, false)) {
              canMove = true;
            }
          }
        }
      }
    });
    console.log("arr", arr);
    return canMove;
  }

  canCheckBeBlocked(king, atPieces) {
    if (atPieces.length !== 1) {
      return false;
    }
    const color = king.id.slice(0, 1);
    const kingSquare = king.parentElement;
    const attackingPieceId = document.getElementById(atPieces[0]);
    const squaresInbetween = atPieces[0].slice(1, 2) === "n" ? [attackingPieceId.parentElement.id] : this.isValidMove(attackingPieceId, kingSquare, false, true);
    const alivePieces = this.state.alivePieces;

    let canBlock = false;

    console.log("squaresinbetween ", squaresInbetween);

    squaresInbetween.forEach((sq) => {
      alivePieces.forEach((pi) => {
        if (pi.slice(0, 1) === color && pi !== king.id) {
          const piece = document.getElementById(pi);
          const square = document.getElementById(sq);
          if (this.isValidMove(piece, square, false)) {
            console.log("check can be blocked by ", pi);
            canBlock = true;
          }
        }
      });
    });

    return canBlock;
  }

  isValidMove(piece, target, activeMove = true, returnInBetween = false) {
    if (!piece || !target) {
      return false;
    }

    // activeMove means it will make it return just logic when false
    // returnInBetween makes it return an array of squares in between the piece and target
    const pieceType = piece.id.slice(0, 2);
    const pieceColor = piece.id.slice(0, 1);
    if (this.state.turn !== pieceColor && activeMove) {
      return false;
    }
    const currentSquare = piece.parentElement.id;
    const targetSquare = target.id;
    const currentNum = parseInt(currentSquare[1]);
    const targetNum = parseInt(targetSquare[1]);
    const currentLetter = currentSquare[0];
    const targetLetter = targetSquare[0];
    const currentLetterNum = this.letterToNumber(currentLetter);
    const targetLetterNum = this.letterToNumber(targetLetter);
    const numDiff = Math.abs(currentNum - targetNum);
    const letterDiff = Math.abs(currentLetterNum - targetLetterNum);

    // checks if the path is clear to move piece
    const isPathClear = (startN, endN, startL, endL) => {
      let pathClear = true;
      const squaresArr = [currentSquare];

      if (startN === endN) {
        let step = startL < endL ? 1 : -1;
        for (let i = startL + step; i !== endL; i += step) {
          const squareId = `${String.fromCharCode("a".charCodeAt(0) + i - 1)}${currentNum}`;
          if (returnInBetween) {
            squaresArr.push(squareId);
          }
          if (this.BoardArr[squareId].querySelector(".piece")) {
            if (returnInBetween) {
              squaresArr = [];
            }
            pathClear = false;
            break;
          }
        }
      } else if (startL === endL) {
        let step = startN < endN ? 1 : -1;
        for (let i = startN + step; i !== endN; i += step) {
          const squareId = `${currentLetter}${i}`;
          if (returnInBetween) {
            squaresArr.push(squareId);
          }
          if (this.BoardArr[squareId].querySelector(".piece")) {
            if (returnInBetween) {
              squaresArr = [];
            }
            pathClear = false;
            break;
          }
        }
      } else {
        let numStep = startN < endN ? 1 : -1;
        let letStep = startL < endL ? 1 : -1;
        let row = startN + numStep;
        let col = startL + letStep;
        while (row !== endN || col !== endL) {
          const squareId = `${String.fromCharCode("a".charCodeAt(0) + col - 1)}${row}`;
          if (returnInBetween) {
            squaresArr.push(squareId);
          }
          if (this.BoardArr[squareId].querySelector(".piece")) {
            if (returnInBetween) {
              squaresArr = [];
            }
            pathClear = false;
            break;
          }
          row += numStep;
          col += letStep;
        }
      }
      if (returnInBetween && squaresArr.length) {
        return squaresArr;
      }
      return pathClear;
    };

    const targetPiece = target.querySelector(".piece");

    if (activeMove) {
      const king = document.getElementById(`${pieceColor}k`);
      const originalParent = piece.parentElement;

      if (targetPiece) {
        targetPiece.remove();
      }
      target.appendChild(piece);

      console.log(piece, targetPiece);
      const wouldBeInCheck = this.isSquareUnderAttack(king.parentElement, pieceColor);

      originalParent.appendChild(piece);
      if (targetPiece) {
        target.appendChild(targetPiece);
      }

      if (wouldBeInCheck) {
        return false;
      }
    }

    if (targetPiece && targetPiece.id.slice(0, 1) === pieceColor) {
      return false;
    }

    // white pawn
    if (pieceType === "wp") {
      if (currentLetter === targetLetter && !target.querySelector(".piece")) {
        if (currentNum === 2 && currentLetter === targetLetter && currentNum + 2 === targetNum) {
          if (this.BoardArr[`${targetLetter}3`].querySelector(".piece") || target.querySelector(".piece")) {
            return false;
          }
          if (activeMove) {
            this.state.allowEnPessant = `w${targetLetter}3`;
            this.state.epSwitch = true;
          }
          return true;
        }
        return currentNum + 1 === targetNum;
      }
      if (letterDiff === 1 && currentNum + 1 === targetNum) {
        if (this.state.allowEnPessant === `b${targetLetter}${targetNum}`) {
          if (activeMove) {
            this.state.triggerEnPessant = true;
          }
          console.log(this.state.allowEnPessant)
          return true ;
        }
        return targetPiece && targetPiece.id.slice(0, 1) === "b";
      }
    }

    // black pawn
    if (pieceType === "bp") {
      if (currentLetter === targetLetter && !target.querySelector(".piece")) {
        if (currentNum === 7 && currentLetter === targetLetter && currentNum - 2 === targetNum) {
          if (this.BoardArr[`${targetLetter}6`].querySelector(".piece") || target.querySelector(".piece")) {
            return false;
          }
          if (activeMove) {
            this.state.allowEnPessant = `b${targetLetter}6`;
            console.log(this.state.allowEnPessant);
            this.state.epSwitch = true;
          }
          return true;
        }
        return currentNum - 1 === targetNum;
      }
      if (letterDiff === 1 && currentNum - 1 === targetNum) {
        if (this.state.allowEnPessant === `w${targetLetter}${targetNum}`) {
          if (activeMove) {
            this.state.triggerEnPessant = true;
          }
          return true;
        }
        return targetPiece && targetPiece.id.slice(0, 1) === "w";
      }
    }

    // rook
    if (pieceType === "wr" || pieceType === "br") {
      if (currentLetter === targetLetter || currentNum === targetNum) {
        if (isPathClear(currentNum, targetNum, currentLetterNum, targetLetterNum)) {
          if (activeMove) {
            if (piece.id === "wr") {
              this.state.hasWRook1Moved = true;
            }
            if (piece.id === "wr2") {
              this.state.hasWRook2Moved = true;
            }
            if (piece.id === "br") {
              this.state.hasBRook1Moved = true;
            }
            if (piece.id === "br2") {
              this.state.hasBRook2Moved = true;
            }
          }
          return true;
        }
      }
    }

    // knight
    if (pieceType === "wn" || pieceType === "bn") {
      return (numDiff === 2 && letterDiff === 1) || (letterDiff === 2 && numDiff === 1);
    }

    // bishop
    if (pieceType === "wb" || pieceType === "bb") {
      if (numDiff === letterDiff) {
        return isPathClear(currentNum, targetNum, currentLetterNum, targetLetterNum);
      }
    }

    // queen
    if (pieceType === "wq" || pieceType === "bq") {
      if (numDiff === letterDiff || currentLetter === targetLetter || currentNum === targetNum) {
        return isPathClear(currentNum, targetNum, currentLetterNum, targetLetterNum);
      }
    }

    // white king
    if (pieceType === "wk") {
      if (!activeMove || (!this.isSquareUnderAttack(targetSquare, "w") && activeMove)) {
        if (targetSquare === "c1" && !this.state.hasWKingMoved && !this.state.hasWRook1Moved) {
          if (isPathClear(currentNum, targetNum, currentLetterNum, 1)) {
            if (activeMove) {
              this.state.whiteQueenCastle = true;
              this.state.hasWKingMoved = true;
              this.state.hasWRook1Moved = true;
            }
            return true;
          }
        }
        if (targetSquare === "g1" && !this.state.hasWKingMoved && !this.state.hasWRook2Moved) {
          if (isPathClear(currentNum, targetNum, currentLetterNum, 8)) {
            if (activeMove) {
              this.state.whiteKingCastle = true;
              this.state.hasWKingMoved = true;
              this.state.hasWRook2Moved = true;
            }
            return true;
          }
        }
        if (numDiff <= 1 && letterDiff <= 1) {
          if (activeMove) {
            this.state.hasWKingMoved = true;
          }
          return true;
        }
      }
    }

    // black king
    if (pieceType === "bk") {
      if (!activeMove || (!this.isSquareUnderAttack(targetSquare, "b") && activeMove)) {
        if (targetSquare === "c8" && !this.state.hasBKingMoved && !this.state.hasBRook1Moved) {
          if (isPathClear(currentNum, targetNum, currentLetterNum, 1)) {
            if (activeMove) {
              this.state.blackQueenCastle = true;
              this.state.hasBKingMoved = true;
              this.state.hasBRook1Moved = true;
            }
            return true;
          }
        }
        if (targetSquare === "g8" && !this.state.hasBKingMoved && !this.state.hasBRook2Moved) {
          if (isPathClear(currentNum, targetNum, currentLetterNum, 8)) {
            if (activeMove) {
              this.state.blackKingCastle = true;
              this.state.hasBKingMoved = true;
              this.state.hasBRook2Moved = true;
            }
            return true;
          }
        }
        if (numDiff <= 1 && letterDiff <= 1) {
          if (activeMove) {
            this.state.hasBKingMoved = true;
          }
          return true;
        }
      }
    }

    return false;
  }
}
