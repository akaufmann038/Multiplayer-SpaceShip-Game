const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("message-log-container")
const message_input = document.getElementById("message")
// NOTE: when deploying, take argument out of io
//"http://127.0.0.1:5000/chat"
var socket = io("http://127.0.0.1:5000/chat")

document.addEventListener("DOMContentLoaded", () => {
    var socket = io.connect("http://" + document.domain + ":" + location.port, {
        transports: ['websocket']
    })

    // socket.on('connect', function() {
    //     socket.emit("connect-message", "has joined");
    //     console.log("test")
    // });

    
    socket.on('message', function(msg) {
        console.log("message: " + msg)
        // create new div container
        var messageContainer = document.createElement("div")
        messageContainer.id = "message-sent-container"
        
        // create p to contain message
        var newP = document.createElement("p")
        newP.id = "message-text"

        // append necessary elements
        var text = document.createTextNode(msg)
        newP.appendChild(text)
        messageContainer.appendChild(newP)
        container_div.appendChild(messageContainer)
    });

    addText_button.addEventListener("click", function() {
        var val = message_input.value
        socket.emit("chat-message", val)
    })
})

