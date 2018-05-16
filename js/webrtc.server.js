var socket = io();
var caller = new window.RTCPeerConnection();

GetUserMedia();
GetRTCPeerConnection();
GetRTCSessionDescription();
GetRTCIceCandidate();


caller.onicecandidate = function (evt) {
    if (!evt.candidate) {
        return;
    }

    console.log("onicecandidate called");

    onIceCandidate(caller, evt);
}

caller.onaddstream = function (evt) {
    console.log("onaddstream called");

    if (window.URL) {
        document.getElementById("remoteview").src = window.URL.createObjectURL(evt.stream);
    } else {
        document.getElementById("remoteview").src = evt.stream;
    }
}

navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(function (stream) {
    if (window.URL) {
        document.getElementById("selfview").src = window.URL.createObjectURL(stream);
    } else {
        document.getElementById("selfview").src = stream;
    }

    caller.addStream(stream);
}).catch(function (evt) {
    console.log("Error occured!");
});

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
