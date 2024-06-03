
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row,rowindex)=>{
        row.forEach((square,squareindex)=>{
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + squareindex) % 2 === 0 ? "light" : "dark"
            );

            if (square){
                const pieceElement =  document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    square.color === "w" ? "white" : "black"
                );
                pieceElement.innerHTML = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e)=>{
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement;
                        sourceSquare = {row:rowindex, col : squareindex};
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                pieceElement.addEventListener("dragend",(e)=>{
                    draggedPiece = null;
                    sourceSquare = null;
                })

                squareElement.appendChild(pieceElement);
            }
            
            squareElement.addEventListener("dragover", function(e){
                e.preventDefault();
            })

            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if(draggedPiece){
                    const targerSource = {
                        row : parseInt(squareElement.dataset.row),
                        col : parseInt(squareElement.dataset.col),
                    }
                    handleMove(sourceSquare,targerSource)

                }
            })
            boardElement.appendChild(squareElement)
        })
    })  
   
};

const handleMove = (source,target) => {
    const move = {
        from : `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to : `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion : "q",
    };
    socket.emit("move", move)
};

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♟",
        r: "♜",
        n: "♞",
        b: "♝",
        q: "♛",
        k: "♚",
        P: "♙",
        R: "♖",
        N: "♘",
        B: "♗",
        Q: "♕",
        K: "♔",
    };
    return unicodePieces[piece.type] || ";"
};

socket.on("playerRole", function(role){
    playerRole = role;
    renderBoard();
});

socket.on("spectaorRole", function(){
    playerRole = null;
    renderBoard();
})

socket.on("boardState", function(fen) {
    chess.load(fen);
})

socket.on("move", function(move){
    chess.nove(move);
    renderBoard();
})
renderBoard();