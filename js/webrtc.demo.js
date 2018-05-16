var vid = document.getElementsByTagName("video")[0];
console.log(vid);

function GetUserMedia() {
    // navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    //
    // return navigator.getUserMedia;
    return navigator.mediaDevices.getUserMedia;

}

function showWebcam() {
    var userMedia = GetUserMedia();
    if (userMedia) {
        // navigator.getUserMedia({video: true, audio: true}, function (stream) {
        //     vid.srcObject = stream;
        // }, function (error) {
        //     console.log("There was an error in GetUserMedia!!!");
        // })

        navigator.mediaDevices.getUserMedia({video: true, audio: false}).then(function (stream) {
            vid.srcObject = stream;
        }).catch(function (err) {
            console.log("There was an error in GetUserMedia!!!");
        });
    }
}

document.getElementById("btnShowCamera").addEventListener("click", function (event) {
    console.log('kepijit');
    showWebcam();
});
