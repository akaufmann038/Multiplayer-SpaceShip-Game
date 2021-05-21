const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("message-log-container")
const message_input = document.getElementById("message")
const messageLog_div = document.getElementById("message-log-container")
const outerContainer_div = document.getElementById("container-div")
const container_body = document.getElementById("body-container")
var currentUser = null

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

function launchShip(text, userName) {
    if (text == " launch") {
        // create image
        var ship = document.createElement("img")
        ship.id = "ship-" + userName
        ship.src = "/static/izzy.png"
        ship.alt = "Ship"
        ship.style.width = "10%"
        ship.style.height = "10%"
        ship.style.position = "absolute"
        ship.style.left = "350.55px"
        ship.style.top = "200px"
        ship.style.zIndex = "5"
        ship.style.transform = "rotate(0deg)"

        console.log("launch ship, currentUser: " + userName)
        console.log(parseInt(ship.style.transform.substring(7, ship.style.transform.search("d"))))

        document.documentElement.appendChild(ship)

        // start game loop
        gameLoop()
    }
}

socket.on("connect", function () {
    console.log("connected")
    socket.emit("connect-message")
})

socket.on("connect-message", function (user) {
    // sets the current user
    currentUser = user
    console.log("current user: " + currentUser)
})

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
    // NOTE: problem is here. passing in name
    launchShip(msg.slice(nameEnd + 1), msg.slice(0, nameEnd))
});

socket.on("ship-message", function (data) {
    updateGame(data)
})

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

// gets ship of current user
function getShip(currUser) {
    console.log(currUser)
    return document.getElementById("ship-" + currUser)
}

function moveShip(key, currUser) {
    if (parseInt(key) == 87) {
        var ship = getShip(currUser)

        if (ship !== null) {
            console.log(currUser)

            // get ship angle
            var angle = parseInt(ship.style.transform.substring(7, ship.style.transform.search("d")))
            //console.log(ship.style.transform)

            // get x and y scalars from rotation
            var xScalar = 1.5 * Math.sin(toRadians(angle))
            var yScalar = 1.5 * Math.cos(toRadians(angle))

            // change ships location
            changeLocation(xScalar, yScalar, currUser)
        }
    }
    else if (key == 65) {
        changeDegree(-1, currUser)
    }
    else if (key == 68) {
        changeDegree(1, currUser)
    }
}

function changeLocation(xScalar, yScalar, currUser) {
    //console.log("x: " + xScalar + " y: " + yScalar)
    var ship = getShip(currUser)

    // get current x and y
    var currentX = parseFloat(ship.style.left.substring(0, ship.style.left.search("p")))
    var currentY = parseFloat(ship.style.top.substring(0, ship.style.top.search("p")))

    // update x and y
    ship.style.left = currentX + xScalar + "px"
    ship.style.top = currentY - yScalar + "px"
    //console.log("new x: " + currentX + xScalar + " new y: " + currentY + yScalar)
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

// changes the rotation of the ship element
function changeDegree(diff, currUser) {
    var ship = getShip(currUser)
    if (ship !== null) {
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
}

// updates state of game based on keyDown
function updateGame(data) {

    // based on current keyDowns, move ship appropriately
    Object.keys(data["keyData"]).forEach(element => {
        // if key is held down
        if (data["keyData"][element]) {
            moveShip(element, data["user"])
        }
    })
}

function gameLoop() {
    //console.log(performance.now())
    // update state of game
    // emit movement to server
    socket.emit("ship-message", { "keyData": keyDown, "user": currentUser })
    console.log("game loop active, current user: " + currentUser)

    setTimeout(gameLoop, 10)
}
// PROBLEM: when alex launches ship, both alex and izzy's game loops start
// may be related to why izzy is able to control alex's ship