var game = new Chess();
var config = {
  "draggable":true,
  "position":"start",
  "onDragStart":onDragStart,
  "onDrop":onDrop,
  "onSnapEnd":onSnapEnd
}
var board = Chessboard("board", config)

var $status = $('#status')

var positions = [];
var move = 0;

var resigned = false;

var playingOnline = false;

positions.push(game.fen());
var pieceMapping = ["r", "n", "b", "q", "k", "b", "n", "r", "p", "p", "p", "p", "p", "p", "p", "p"]
var black_original_squares = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8","a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]
var black_corresponding_squares = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8","a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]

var white_original_squares = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1","a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]
var white_corresponding_squares = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1","a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]

var colors = ["w", "b"];
var personal_color = "";

var socket = io();
console.log(socket);

var opponentJoined = false;
var code;
var role;
let link = window.location.href;

var rematchers = 0
function rematchRequest(){
  console.log("REMATCH STARTED")
  if (url.indexOf("online") == -1 && url.indexOf("join") == -1){
    window.location.reload();
  }
  else{
    socket.emit("rematch", [code, role]);
  }
}

socket.on("rematch", function(msg){

  if (msg[0] == code){
    rematchers += 1;
    document.getElementById("newGameBtn").innerHTML = "Yes, rematch" + " (" + rematchers + ")";
    if (role == msg[1]){
      document.getElementById("newGameBtn").disabled = true;
    }
    if (rematchers == 2){
      game = new Chess();
      positions = [];
      positions.push(game.fen());
      move = 0;
      resigned = false;
      pieceMapping = ["r", "n", "b", "q", "k", "b", "n", "r", "p", "p", "p", "p", "p", "p", "p", "p"]
      black_original_squares = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8","a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]
      black_corresponding_squares = ["a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8","a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"]

      white_original_squares = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1","a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]
      white_corresponding_squares = ["a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1","a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"]
      board.position(game.fen());
      if (role == "creator"){
        personal_color = colors[Math.round(Math.random())];  
        if (personal_color == "b"){
          board.orientation("black");
        }
        else{
          board.orientation("white");
        }
      }
      else{
        window.location.reload();
      }
    }

  }

});

if (link.indexOf("online") != -1 || link.indexOf("join") != -1){
  personal_color = "w";
  console.log("HI");
  code = link.slice(link.indexOf("?") + 1, link.length);
  if (link.indexOf("online") != -1){
    var num = Math.round(Math.random());
    personal_color = colors[num];
    console.log(num);
    console.log(personal_color);
    role = "creator";
    $status.html("Opponent not connected. Waiting for opponent to join...");
    if (personal_color == "b"){
      board.orientation("black");
    }
    else{
      board.orientation("white");
    }
  }
  else{
    role = "joiner";
  }

  socket.emit("getColor", [code, role]);
  
}

socket.on('getColor', function(msg){
  if (msg[0] == code && role != msg[1]){
    opponentJoined = true;
    if (personal_color == "b"){
      board.orientation("black");
      $status.html("White to Move (Waiting for opponent...)")
    }
    else{
      board.orientation("white");
      $status.html("White to Move (Your turn!)");
    }
    if (personal_color == "w"){
      console.log("HERE");
      socket.emit("getColor_response", [code, role, "b", game.fen(), white_corresponding_squares, white_original_squares, black_original_squares, black_corresponding_squares]);
    }
    else{
      console.log("HERE");
      socket.emit("getColor_response", [code, role, "w", game.fen(), white_corresponding_squares, white_original_squares, black_original_squares, black_corresponding_squares]);
    }
  }
});

socket.on("resign", function(msg){
  if (msg == code){
    if (personal_color == "w"){
      document.getElementById("winnerStatement").innerHTML = "White wins by resignation.";
    }
    else{
      document.getElementById("winnerStatement").innerHTML = "Black wins by resignation.";
    }
    window.setTimeout(function(){
      document.getElementById("endModal").style.display = "block";
    }, 1000);
  }
})

socket.on("getColor_response", function(msg){
  if (msg[0] == code && role != msg[1]){
    console.log(msg);
    console.log("Accepted");
    personal_color = msg[2];
    console.log(personal_color);
    if (personal_color == "b"){
      board.orientation("black");
    }
    else{
      board.orientation("white");
    }
    game.load(msg[3]);
    board.position(game.fen(), true);
    positions.push(game.fen());
    move = positions.length - 1;

    white_corresponding_squares = msg[4];
    white_original_squares = msg[5];
    console.log(msg[7]);
    black_corresponding_squares = msg[7];
    black_original_squares = msg[6];

    updateStatus();
  }
});

socket.on("positionUpdate", function(msg){
  if (msg[0] == code){
    if (personal_color == msg[2]){
      positions.push(msg[1]);
      game.load(msg[1]);
      board.position(game.fen(), true);
      move = positions.length - 1;

      white_corresponding_squares = msg[3];
      white_original_squares = msg[4];
      black_corresponding_squares = msg[6];
      black_original_squares = msg[5];

      updateStatus();
    }
  }
})

function onDragStart (source, piece, position, orientation) {

    if (move != positions.length - 1) return false

    if (game.turn() != personal_color && playingOnline){
      return false;
    }

    // do not pick up pieces if the game is over
    if (game.game_over()) return false
  
    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }
  
  function onDrop (source, target) {
    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
  
    // illegal move
    if (move === null) return 'snapback'
  
    updateStatus()
  }

  function onSnapEnd () {
    board.position(game.fen());
    move += 1
    let history = game.history({verbose: true})
    var currentMove = history[history.length - 1]
    var oldSquare = currentMove.from;
    var newSquare = currentMove.to;
    if (currentMove.color == "w"){
        let index = white_corresponding_squares.indexOf(oldSquare)
        white_corresponding_squares[index] = newSquare;

        if (currentMove.flags.indexOf("p") != -1){
            let arrIndex = white_corresponding_squares.indexOf(newSquare);
            white_original_squares[arrIndex] = "d1";
            pieceMapping[arrIndex] = "q"
        }

        if (currentMove.flags.indexOf("c") != -1 || currentMove.flags.indexOf("e") != -1){
            let arrIndex = black_corresponding_squares.indexOf(newSquare);
            var ogSquare = black_original_squares[arrIndex];
            console.log(ogSquare);
            if (ogSquare.indexOf("7") != -1){
                ogSquare = newSquare.slice(0,1) + "7";
            }
            if (game.get(ogSquare) === null){
                game.put({type: pieceMapping[arrIndex], color: "b"}, ogSquare);
                game.load(game.fen());
                black_corresponding_squares[arrIndex] = ogSquare;
                board.position(game.fen(), true);
            }
        }
    }
    else{
        let index = black_corresponding_squares.indexOf(oldSquare)
        black_corresponding_squares[index] = newSquare;

        if (currentMove.flags.indexOf("p") != -1){
            let arrIndex = black_corresponding_squares.indexOf(newSquare);
            black_original_squares[arrIndex] = "d8";
            pieceMapping[arrIndex] = "q"
        }

        if (currentMove.flags.indexOf("c") != -1 || currentMove.flags.indexOf("e") != -1){
            let arrIndex = white_corresponding_squares.indexOf(newSquare);
            var ogSquare = white_original_squares[arrIndex];
            console.log(ogSquare);
            if (ogSquare.indexOf("2") != -1){
                ogSquare = newSquare.slice(0,1) + "2";
            }
            if (game.get(ogSquare) == null){
                game.put({type: pieceMapping[arrIndex], color: "w"}, ogSquare);
                game.load(game.fen());
                white_corresponding_squares[arrIndex] = ogSquare;
                board.position(game.fen(), true);
            }
        }

        
    }

    positions.push(game.fen());
    if (game.turn() != personal_color && playingOnline){
      socket.emit("positionUpdate", [code, game.fen(), game.turn(), white_corresponding_squares, white_original_squares, black_original_squares, black_corresponding_squares]);
    }

  }


  function updateStatus () {
    var status = ''
    if (move != positions.length - 1){
        status = "Viewing position from " + ((positions.length - 1) - move) + " move(s) ago"
        $status.html(status);
        return;
    }
  
    var moveColor = 'White'
    if (game.turn() === 'b') {
      moveColor = 'Black'
    }
  
    // checkmate?
    if (game.in_checkmate()) {
      status = 'Game over, ' + moveColor + ' is in checkmate.'
      if (moveColor == "Black"){
        document.getElementById("winnerStatement").innerHTML = "White wins by checkmate.";
      }
      else{
        document.getElementById("winnerStatement").innerHTML = "Black wins by checkmate.";
      }
      window.setTimeout(function(){
        document.getElementById("endModal").style.display = "block";
      }, 1000);
    }

    else if (resigned){
      socket.emit("resign", code);
      if (personal_color == "w"){
        document.getElementById("winnerStatement").innerHTML = "Black wins by resignation.";
      }
      else{
        document.getElementById("winnerStatement").innerHTML = "White wins by resignation.";
      }
      window.setTimeout(function(){
        document.getElementById("endModal").style.display = "block";
      }, 1000);
    }
  
    // draw?
    else if (game.in_draw()) {
      status = 'Game over, drawn position'
      document.getElementById("winnerStatement").innerHTML = "It's a draw.";
      window.setTimeout(function(){
        document.getElementById("endModal").style.display = "block";
      }, 1000);
    }
  
    // game still on
    else {
      status = moveColor + ' to move'

      if (playingOnline){
        if (game.turn() != personal_color){
          status += " (Waiting for opponent...)";
        }
        else{
          status += " (Your turn!)";
        }
      }
  
      // check?
      if (game.in_check()) {
        status += ', ' + moveColor + ' is in check'
      }
    }
  
    $status.html(status)
  }

$("#back").on('click', function(){
    console.log("HI")
    if (move != 0){
        move -= 1;
        game.load(positions[move]);
        board.position(game.fen(), true);
        updateStatus();
    }
})

$("#forward").on("click", function(){
    console.log("HI")
    if (move < positions.length - 1){
        move += 1;
        game.load(positions[move]);
        board.position(game.fen(), true);
        updateStatus();
    }
})