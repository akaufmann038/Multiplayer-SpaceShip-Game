const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("message-log-container")
const message_input = document.getElementById("message")
const messageLog_div = document.getElementById("message-log-container")
const outerContainer_div = document.getElementById("container-div")
const container_body = document.getElementById("body-container")
// NOTE: when deploying, take argument out of io
//"http://127.0.0.1:5000/chat"
var socket = io("http://127.0.0.1:5000/chat")


var socket = io.connect("http://" + document.domain + ":" + location.port, {
    transports: ['websocket']
})

function updateScroll() {
    messageLog_div.scrollTop = messageLog_div.scrollHeight;
}

function launchShip(text) {
    if (text == " launch") {
        // create image
        var ship = document.createElement("img")
        ship.id = "ship"
        ship.src = "/static/izzy.png"
        ship.alt = "Ship"
        ship.style.width = "10%"
        ship.style.height = "10%"
        ship.style.position = "absolute"
        ship.style.left = "100px"
        ship.style.top = "200px"
        ship.style.zIndex = "5"

        document.documentElement.appendChild(ship)

        // start game loop
        gameLoop()
    }
}

socket.on('message', function (msg) {
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
    var text = document.createTextNode(msg.slice(nameEnd + 1))
    var userName = document.createTextNode(msg.slice(0, nameEnd + 1))

    // append necessary elements
    boldName.appendChild(userName)
    newP.appendChild(boldName)
    newP.appendChild(text)

    messageContainer.appendChild(newP)
    container_div.appendChild(messageContainer)

    // bring scroll down
    updateScroll()

    // test for launched ship
    launchShip(msg.slice(nameEnd + 1))
});

addText_button.addEventListener("click", function () {
    // get input value and sent to server
    var val = message_input.value
    if (val != "") {
        socket.emit("chat-message", val)
    }

    // clear input value
    message_input.value = ""
})

message_input.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        addText_button.click();
    }
});

function update(progress) {
    
}

// add event listener for w key
container_body.addEventListener("keydown", function (event) {
    if (document.activeElement !== message_input) {
        if (event.keyCode == 87) {
            var ship = document.getElementById("ship")
            var currentLeft = ship.style.left
            var numLeft = parseInt(currentLeft.substring(0, currentLeft.search("p")))

            ship.style.left = (numLeft + 5) + "px"
            console.log(ship.style.left)
        }
    }
})


function gameLoop() {
    console.log(performance.now())

    
    setTimeout(gameLoop, 10)
}