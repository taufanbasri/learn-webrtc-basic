const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
app.use(express.static('.'));

server.listen(3000, function () {
    console.log("connected to port 3000");
});

io.on('connection', function (client) {
    console.log("Connection established!");

    client.on("candidate", function (msg) {
        console.log("candidate message received!");
        client.broadcast.emit("candidate", msg);
    });

    client.on("sdp", function (msg) {
        console.log("sdp message broadcast!");
        client.broadcast.emit("sdp", msg);
    });

    client.on("desc", function (desc) {
        console.log("description received!");
        client.broadcast.emit("desc", desc);
    });

    client.on("answer", function (answer) {
        console.log("answer broadcast");
        client.broadcast.emit("answer", answer);
    });
});
