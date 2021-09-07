const { prototype } = require('events');
var express = require('express');
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);

app.use("/", express.static(__dirname + "/public"));

app.use("/online", express.static(__dirname + "/public"));

app.use("/join", express.static(__dirname + "/public"));


app.get("/createonline", function(req, res){
    var code = "";
    for (var i = 0; i < 6; i++){
        let num = Math.floor(Math.random() * 10);
        code += num.toString();
    }
    res.redirect("/online?" + code);
});

io.on("connection", function(socket){

    console.log("NEW ONE");

    socket.on("getColor", function(msg){
        console.log("HI");
        io.emit("getColor", msg);
    });

    socket.on("getColor_response", function(msg){
        io.emit('getColor_response', msg);
    });

    socket.on("positionUpdate", function(msg){
        io.emit('positionUpdate', msg);
    });

    socket.on("resign", function(msg){
        io.emit("resign", msg);
    });

    socket.on("rematch", function(msg){
        io.emit("rematch", msg);
    });


});

app.get("/", function(req, res){
    res.sendFile(__dirname + "/home.html");
});

app.get("/socket.io", function(req, res){
    res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.min.js");
})

app.get("/online", function(req, res){
    res.sendFile(__dirname + "/home.html");
});

app.get("/join", function(req, res){
    res.sendFile(__dirname + "/home.html");
});

server.listen("3432" || process.env.PORT, function(){
    console.log("Server running");
});