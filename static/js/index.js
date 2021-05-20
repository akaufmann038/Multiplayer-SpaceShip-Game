const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("message-log-container")
const message_input = document.getElementById("message")
const messageLog_div = document.getElementById("message-log-container")
const outerContainer_div = document.getElementById("container-div")
const container_body = document.getElementById("body-container")

keyDown = { 87: false, 65: false, 83: false, 68: false }

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
        ship.style.left = "350.55px"
        ship.style.top = "200px"
        ship.style.zIndex = "5"
        ship.style.transform = "rotate(0deg)"

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
    newP.innerHTML = "<strong>" + msg.slice(0, nameEnd + 1) + "</strong> " + msg.slice(nameEnd + 1)

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


// add event listener for w key
container_body.addEventListener("keydown", function (event) {
    // w: 87, a: 65, s: 83, d: 68


    if (document.activeElement !== message_input) {
        if (event.keyCode in keyDown) {
            keyDown[event.keyCode] = true
        }
    }
})

container_body.addEventListener("keyup", function (event) {
    if (event.keyCode in keyDown) {
        keyDown[event.keyCode] = false
    }
})

// resets all of the keyDown values to false
function resetKeyDown() {
    Object.keys(keyDown).forEach(element => {
        keyDown[element] = false
    })
}
function moveShip(key) {
    if (parseInt(key) == 87) {
        var ship = document.getElementById("ship")

        // get ship angle
        var angle = parseInt(ship.style.transform.substring(7, ship.style.transform.search("d")))
        //console.log(ship.style.transform)

        // get x and y scalars from rotation
        var xScalar = 1.5 * Math.sin(toRadians(angle))
        var yScalar = 1.5 * Math.cos(toRadians(angle))

        // change ships location
        changeLocation(xScalar, yScalar)



        // console.log("move up")
        // var currentTopStyle = ship.style.top
        // var currentTopNum = parseInt(currentTopStyle.substring(0, currentTopStyle.search("p")))
        // console.log(currentTopNum)

        // // change top style
        // ship.style.top = currentTopNum + 1 + "px"

        // console.log(ship.style.top)
    }
    else if (key == 65) {
        changeDegree(-1)
    }
    else if (key == 68) {
        changeDegree(1)
    }
}

function changeLocation(xScalar, yScalar) {
    //console.log("x: " + xScalar + " y: " + yScalar)
    var ship = document.getElementById("ship")

    // get current x and y
    var currentX = parseFloat(ship.style.left.substring(0, ship.style.left.search("p")))
    var currentY = parseFloat(ship.style.top.substring(0, ship.style.top.search("p")))

    // update x and y
    ship.style.left = currentX + xScalar + "px"
    ship.style.top = currentY - yScalar + "px"
    //console.log("new x: " + currentX + xScalar + " new y: " + currentY + yScalar)
}

function toRadians (angle) {
    return angle * (Math.PI / 180);
  }

// changes the rotation of the ship element
function changeDegree(diff) {
    var ship = document.getElementById("ship")

    // get current degree
    var currentDegreeStyle = ship.style.transform
    var currentDegreeNum = parseInt(currentDegreeStyle.substring(7, currentDegreeStyle.search("d")))

    // change style
    if (currentDegreeNum == 0 && diff == -1) {
        var newDegree = 359
    }
    else if (currentDegreeNum == 359 && diff == 1) {
        var newDegree = 0
    }
    else {
        var newDegree = currentDegreeNum + diff
    }
    ship.style.transform = "rotate(" + newDegree + "deg)"
}

// updates state of game based on keyDown
function updateGame() {

    // based on current keyDowns, move ship appropriately
    Object.keys(keyDown).forEach(element => {
        // if key is held down
        if (keyDown[element]) {
            moveShip(element)
        }
    })
}

function gameLoop() {
    //console.log(performance.now())
    // update state of game
    updateGame()

    setTimeout(gameLoop, 1)
}