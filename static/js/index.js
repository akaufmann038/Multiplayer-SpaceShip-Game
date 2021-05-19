const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("message-log-container")
const message_input = document.getElementById("message")
const chatContainer_div = document.getElementById("chat-container")
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

    function updateScroll(){
        chatContainer_div.scrollTop = chatContainer_div.scrollHeight;
    }
    

    
    socket.on('message', function(msg) {
        console.log("message: " + msg)

        // bold userName in message
        nameEnd = msg.search(":");

        // create new div container and set id
        var messageContainer = document.createElement("div")
        messageContainer.id = "message-sent-container"

        // create p to contain message
        var newP = document.createElement("p")
        newP.id = "message-text"

        // create bold element
        var boldName = document.createElement("strong")

        // create text nodes
        var text = document.createTextNode(msg.slice(nameEnd+1))
        var userName = document.createTextNode(msg.slice(0, nameEnd+1))

        // append necessary elements
        boldName.appendChild(userName)
        newP.appendChild(boldName)
        newP.appendChild(text)

        messageContainer.appendChild(newP)
        container_div.appendChild(messageContainer)

        // bring scroll down
        updateScroll()
    });

    addText_button.addEventListener("click", function() {
        // get input value and sent to server
        var val = message_input.value
        if (val != "") {
            socket.emit("chat-message", val)
        }

        // clear input value
        message_input.value = ""
    })

    message_input.addEventListener("keyup", function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
          // Cancel the default action, if needed
          event.preventDefault();
          // Trigger the button element with a click
          addText_button.click();
        }
      });
})

