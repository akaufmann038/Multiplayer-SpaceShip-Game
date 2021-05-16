const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("container-div")
const message_input = document.getElementById("message")
var socket = io.connect("https://hillside-chat.herokuapp.com/chat");

addText_button.addEventListener("click", function() {
    var val = message_input.value
    if (val == "close") {
        socket.send("client disconnected!")
        socket.close()
    }
    socket.send(val)
})

socket.on('connect', function() {
    socket.send("User is connected!");
});

socket.on('message', function(msg) {
    msg.header("Access-Control-Allow-Origin", "*")
    msg.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    console.log("message: " + msg)
    var newP = document.createElement("p")
    var text = document.createTextNode(msg)
    newP.appendChild(text)
    container_div.appendChild(newP)
});