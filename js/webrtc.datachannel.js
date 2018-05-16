GetUserMedia();
GetRTCPeerConnection();
GetRTCSessionDescription();
GetRTCIceCandidate();

var socket = io();
var caller = new window.RTCPeerConnection();
var remoteCaller = new window.RTCPeerConnection();
var dataChannel = caller.createDataChannel('myChannel');
var remoteDataChannel;
var remoteUserMessage = document.getElementById("remoteUser");
var sendMessage = document.getElementById("self");

caller.ondatachannel = function (channel) {
    remoteDataChannel = channel.channel;
}

dataChannel.onopen = function () {
    console.log("Channel Opened");
}

dataChannel.onclose = function () {
    console.log("Channel Closed");
}

dataChannel.onmessage = function (event) {
    remoteUserMessage.value = event.data;
}

dataChannel.onerror = function () {

};

caller.onicecandidate = function (evt) {
    if (!evt.candidate) {
        return;
    }

    console.log("onicecandidate called");

    onIceCandidate(caller, evt);
};

caller.onaddstream = function (evt) {
    console.log("onaddstream called");
}

function GetRTCIceCandidate() {
    window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate || window.msRTCIceCandidate;

    return window.RTCIceCandidate;
}

function GetUserMedia() {
    return navigator.mediaDevices.getUserMedia;
}

function GetRTCPeerConnection() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.msRTCPeerConnection;

    return window.RTCPeerConnection;
}

function GetRTCSessionDescription() {
    window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription || window.msRTCSessionDescription;

    return window.RTCSessionDescription;
}

document.getElementById("makeCall").addEventListener("click", function () {
    caller.createOffer().then(function (desc) {
        caller.setLocalDescription(new RTCSessionDescription(desc));

        socket.emit("sdp", JSON.stringify({"sdp": desc}));
    });
});

sendMessage.addEventListener("keyup", function (evt) {
    remoteDataChannel.send(sendMessage.value);
});

function onIceCandidate(peer, evt) {
    if (evt.candidate) {
        socket.emit("candidate", JSON.stringify({"candidate": evt.candidate}));
    }
}

socket.on("connect", function (client) {
    console.log("connected!");

    socket.on("candidate", function (msg) {
        console.log("candidate received");
        caller.addIceCandidate(new RTCIceCandidate(JSON.parse(msg).candidate));
    });

    socket.on("sdp", function (msg) {
        console.log("sdp received");

        var sessionDesc = new RTCSessionDescription(JSON.parse(msg).sdp);

        caller.setRemoteDescription(sessionDesc);
        caller.createAnswer().then(function (sdp) {
            caller.setLocalDescription(new RTCSessionDescription(sdp));

            socket.emit("answer", JSON.stringify({"sdp": sdp}));
        });
    });

    socket.on("answer", function (answer) {
        console.log("answer received");

        caller.setRemoteDescription(JSON.parse(answer).sdp);
    });
});
