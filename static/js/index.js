const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("container-div")
const message_input = document.getElementById("message")
// NOTE: when deploying, take argument out of io
//"http://127.0.0.1:5000/chat"
var socket = io("http://127.0.0.1:5000/chat")

document.addEventListener("DOMContentLoaded", () => {
    var socket = io.connect("http://" + document.domain + ":" + location.port, {
        transports: ['websocket']
    })

    socket.on('connect', function() {
        socket.emit("Connect Message", "has joined");

        // socket.on('disconnect', function() {
        //     console.log("disconnect")
        //     socket.emit("Disconnect Message", "has disconnected")
        // })s
    });

    
    socket.on('message', function(msg) {
        console.log("message: " + msg)
        var newP = document.createElement("p")
        var text = document.createTextNode(msg)
        newP.appendChild(text)
        container_div.appendChild(newP)
    });

    addText_button.addEventListener("click", function() {
        var val = message_input.value
        socket.emit("Chat Message", val)
        //socket.send(val)
    })
})

