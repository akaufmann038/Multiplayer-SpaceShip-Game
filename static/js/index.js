const shipLength = 80

const addText_button = document.getElementById("add-text")
const container_div = document.getElementById("message-log-container")
const message_input = document.getElementById("message")
const messageLog_div = document.getElementById("message-log-container")
const outerContainer_div = document.getElementById("container-div")
const container_body = document.getElementById("body-container")



// NOTE: when deploying, take argument out of io
//"http://127.0.0.1:5000/chat"
var socket = io("http://127.0.0.1:5000/chat")

// game class
class Game {
    constructor(user) {
        this.ship = { "top": 100, "left": 100, "angle": 0, "user": user } // object of ship with keys "top", "left", and angle
        this.rockets = [] // holds objects of rockets with keys "top" and "left"
        this.keyDown = { 87: false, 65: false, 68: false }
        this.rockets = [] // list of rockets
    }

    // updates the state of the game based on keyDown values
    updateState() {
        // w: 87, a: 65, d: 68, space: 32
        Object.keys(this.keyDown).forEach(element => {
            // w pressed, move forward
            if (this.keyDown[element] && element == 87) {
                this.moveShip()
            }
            // a pressed, counter clockwise rotation
            else if (this.keyDown[element] && element == 65) {
                this.rotateShip(false)
            }
            // d pressed, clockwise rotation
            else if (this.keyDown[element] && element == 68) {
                this.rotateShip(true)
            }
            // else if (this.keyDown[element] && element == 32) {
            //     this.shootRocket()
            // }
        })
    }

    shootRocket() {
        // get top and left based on top, left, and angle of ship
        var centerTop = this.ship["top"] + (shipLength / 2)
        var centerLeft = this.ship["left"] + (shipLength / 2)
        var angle = this.ship["angle"]

        var rocketTop = centerTop + Math.sin(this.toRadians(angle))
        var rocketLeft = centerLeft + Math.cos(this.toRadians(angle))

        console.log("top: " + rocketTop + " left: " + rocketLeft)
        var rocket = { "top": rocketTop, "left": rocketLeft }

        this.rockets.push(rocket)
    }

    // moves ship
    moveShip() {
        // get x and y scalars from rotation
        var xScalar = 4.5 * Math.sin(this.toRadians(this.ship["angle"]))
        var yScalar = 4.5 * Math.cos(this.toRadians(this.ship["angle"]))

        this.ship["left"] += xScalar
        this.ship["top"] -= yScalar
    }

    // rotates ship in specified direction
    rotateShip(clockwise) {
        // rate of change of rotation
        const diff = 2

        // if at 358, make 0
        if (this.ship["angle"] == 358 && clockwise) {
            this.ship["angle"] = 0
        }
        else if (this.ship["angle"] == 0 && !(clockwise)) {
            this.ship["angle"] = 358
        }
        else {
            if (clockwise) {
                this.ship["angle"] += diff
            }
            else if (!(clockwise)) {
                this.ship["angle"] -= diff
            }
        }
    }

    turnOnKey(key) {
        this.keyDown[key] = true
    }

    turnOffKey(key) {
        this.keyDown[key] = false
    }

    getCurrentUser() {
        return this.ship["user"]
    }

    getLeftPx() {
        return this.ship["left"] + "px"
    }

    getTopPx() {
        return this.ship["top"] + "px"
    }

    getDegree() {
        return "rotate(" + this.ship["angle"] + "deg)"
    }

    getShip() {
        return this.ship
    }

    getKeyDown() {
        return this.keyDown
    }

    launch() {
        this.ship["visible"] = true
    }

    toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    mappedData() {
        return { "ship": this.ship, "rockets": this.rockets }
    }
}

var game = null

document.addEventListener("DOMContentLoaded", () => {
    // SOCKET IO FUNCTIONS
    //----------------------------------------------------

    var socket = io.connect("http://" + document.domain + ":" + location.port, {
        transports: ['websocket']
    })

    socket.on("connect", function () {
        console.log("connected")
        socket.emit("connect-message")
    })

    socket.on("connect-message", function (user) {
        // creates game and sets the current user
        game = new Game(user)

        console.log("current user: " + game.getCurrentUser())
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

        // launch ship if this user typed in correct code
        if (msg.slice(nameEnd + 1) == " launch" && msg.slice(0, nameEnd) == game.getCurrentUser()) {
            launch()
        }
    });

    socket.on("ship-message", function (data) {
        // TODO
        updateView(data)
    })


    // EVENT LISTENERS
    //----------------------------------------------------

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

    container_body.addEventListener("keydown", function (event) {
        // w: 87, a: 65, d: 68, space: 32
        if (document.activeElement !== message_input) {
            // test for movement keys
            if (event.keyCode in game.getKeyDown()) {
                game.turnOnKey(event.keyCode)
            }
            // test for shoot key
            else if (event.keyCode == 32) {
                game.shootRocket()
            }
        }
    })

    container_body.addEventListener("keyup", function (event) {
        // resets key data to false if key is no longer being pressed
        if (event.keyCode in game.getKeyDown()) {
            game.turnOffKey(event.keyCode)
        }
    })


    //----------------------------------------------------

    function launch() {
        // make ship visible
        // this.game.launch()

        // start game loop
        gameLoop()
    }

    function updateScroll() {
        messageLog_div.scrollTop = messageLog_div.scrollHeight;
    }

    function updateView(data) {
        var shipData = data["ship"]

        var user = shipData["user"]
        var ship = document.getElementById("ship-" + user)

        // if ship does not exist, draw
        if (ship == null) {
            ship = document.createElement("img")
            ship.id = "ship-" + user
            ship.src = "/static/izzy.png"
            ship.alt = "Ship"
            ship.style.width = shipLength + "px"
            ship.style.height = shipLength + "px"
            ship.style.position = "absolute"
            ship.style.zIndex = "5"
            ship.style.backgroundColor = "blue"
            document.documentElement.appendChild(ship)
        }
        // update left, top, and rotation CSS properties
        ship.style.left = shipData["left"] + "px"
        ship.style.top = shipData["top"] + "px"
        ship.style.transform = "rotate(" + shipData["angle"] + "deg)"

        drawRockets(data)
    }

    function drawRockets(data) {
        for (let i = 0; i < data["rockets"].length; i++) {
            var rocket = document.getElementById(data["ship"]["user"] + "-rocket-" + i)

            if (rocket == null) {
                rocket = document.createElement("div")
                rocket.id = data["ship"]["user"] + "-rocket-" + i
                rocket.style.height = "10px"
                rocket.style.width = "10px"
                rocket.style.backgroundColor = "blue"
                rocket.style.borderRadius = "50%"
                rocket.style.position = "absolute"
                rocket.style.zIndex = "6"
                document.documentElement.appendChild(rocket)
            }
            rocket.style.left = data["rockets"][i]["left"] + "px"
            rocket.style.top = data["rockets"][i]["top"] + "px"
        }
    }

    // game loop
    function gameLoop() {
        // update game state based on keyDown data
        game.updateState()

        // send game state to the server
        socket.emit("ship-message", game.mappedData())

        setTimeout(gameLoop, 10)
    }
})










// OLD IMPLEMENTATION
// var currentUser = null

// keyDown = { 87: false, 65: false, 83: false, 68: false }

// document.addEventListener("DOMContentLoaded", () => {
//     var socket = io.connect("http://" + document.domain + ":" + location.port, {
//         transports: ['websocket']
//     })

//     function updateScroll() {
//         messageLog_div.scrollTop = messageLog_div.scrollHeight;
//     }

//     function launchShip(text, userName) {
//         if (text == " launch") {
//             // create image
//             var ship = document.createElement("img")
//             ship.id = "ship-" + userName
//             ship.src = "/static/izzy.png"
//             ship.alt = "Ship"
//             ship.style.width = "10%"
//             ship.style.height = "10%"
//             ship.style.position = "absolute"
//             ship.style.left = "350.55px"
//             ship.style.top = "200px"
//             ship.style.zIndex = "5"
//             ship.style.transform = "rotate(0deg)"

//             console.log("launch ship, currentUser: " + userName)
//             console.log(parseInt(ship.style.transform.substring(7, ship.style.transform.search("d"))))

//             document.documentElement.appendChild(ship)

//             // start game loop
//             gameLoop()
//         }
//     }

//     socket.on("connect", function () {
//         console.log("connected")
//         socket.emit("connect-message")
//     })

//     socket.on("connect-message", function (user) {
//         // sets the current user
//         currentUser = user
//         console.log("current user: " + currentUser)
//     })

//     socket.on('message', function (msg) {
//         console.log("message: " + msg)

//         // bold userName in message
//         nameEnd = msg.search(":");

//         // create new div container and set id
//         var messageContainer = document.createElement("div")
//         messageContainer.id = "message-sent-container"

//         // create p to contain message
//         var newP = document.createElement("p")
//         newP.id = "message-text"

//         // create bold element
//         var boldName = document.createElement("strong")

//         // create text nodes
//         var text = document.createTextNode(msg.slice(nameEnd + 1))

//         var userName = document.createTextNode(msg.slice(0, nameEnd + 1))

//         // append necessary elements
//         newP.innerHTML = "<strong>" + msg.slice(0, nameEnd + 1) + "</strong> " + msg.slice(nameEnd + 1)

//         messageContainer.appendChild(newP)
//         container_div.appendChild(messageContainer)

//         // bring scroll down
//         updateScroll()

//         // test for launched ship
//         // NOTE: problem is here. passing in name
//         launchShip(msg.slice(nameEnd + 1), msg.slice(0, nameEnd))
//     });

//     socket.on("ship-message", function (data) {
//         updateGame(data)
//     })

//     addText_button.addEventListener("click", function () {
//         // get input value and sent to server
//         var val = message_input.value
//         if (val != "") {
//             socket.emit("chat-message", val)
//         }

//         // clear input value
//         message_input.value = ""
//     })

//     message_input.addEventListener("keyup", function (event) {
//         // Number 13 is the "Enter" key on the keyboard
//         if (event.keyCode === 13) {
//             // Cancel the default action, if needed
//             event.preventDefault();
//             // Trigger the button element with a click
//             addText_button.click();
//         }
//     });


//     // add event listener for w key
//     container_body.addEventListener("keydown", function (event) {
//         // w: 87, a: 65, d: 68
//         if (document.activeElement !== message_input) {
//             // test for movement keys
//             if (event.keyCode in keyDown) {
//                 keyDown[event.keyCode] = true
//             }
//             // shoot if space bar is pressed
//             else if (event.keyCode == 32) {
//                 shoot()
//             }
//         }
//     })

//     container_body.addEventListener("keyup", function (event) {
//         // resets key data to false if key is no longer being pressed
//         if (event.keyCode in keyDown) {
//             keyDown[event.keyCode] = false
//         }
//     })

//     // gets ship of current user
//     function getShip(currUser) {
//         return document.getElementById("ship-" + currUser)
//     }

//     function moveShip(key, currUser) {
//         if (parseInt(key) == 87) {
//             var ship = getShip(currUser)

//             if (ship !== null) {
//                 // get ship angle
//                 var angle = parseInt(ship.style.transform.substring(7, ship.style.transform.search("d")))
//                 //console.log(ship.style.transform)

//                 // get x and y scalars from rotation
//                 var xScalar = 4.5 * Math.sin(toRadians(angle))
//                 var yScalar = 4.5 * Math.cos(toRadians(angle))

//                 // change ships location
//                 changeLocation(xScalar, yScalar, currUser)
//             }
//         }
//         else if (key == 65) {
//             changeDegree(-2, currUser)
//         }
//         else if (key == 68) {
//             changeDegree(2, currUser)
//         }
//     }

//     function changeLocation(xScalar, yScalar, currUser) {
//         //console.log("x: " + xScalar + " y: " + yScalar)
//         var ship = getShip(currUser)

//         // get current x and y
//         var currentX = parseFloat(ship.style.left.substring(0, ship.style.left.search("p")))
//         var currentY = parseFloat(ship.style.top.substring(0, ship.style.top.search("p")))

//         // update x and y
//         ship.style.left = currentX + xScalar + "px"
//         ship.style.top = currentY - yScalar + "px"
//         //console.log("new x: " + currentX + xScalar + " new y: " + currentY + yScalar)
//     }

//     function toRadians(angle) {
//         return angle * (Math.PI / 180);
//     }

//     // changes the rotation of the ship element
//     function changeDegree(diff, currUser) {
//         var ship = getShip(currUser)
//         if (ship !== null) {
//             // get current degree
//             var currentDegreeStyle = ship.style.transform
//             var currentDegreeNum = parseInt(currentDegreeStyle.substring(7, currentDegreeStyle.search("d")))

//             // change style
//             if (currentDegreeNum == 0 && diff == -1) {
//                 var newDegree = 358
//             }
//             else if (currentDegreeNum == 359 && diff == 1) {
//                 var newDegree = 1
//             }
//             else {
//                 var newDegree = currentDegreeNum + diff
//             }
//             ship.style.transform = "rotate(" + newDegree + "deg)"
//         }
//     }

//     // updates state of game based on keyDown
//     function updateGame(data) {

//         // based on current keyDowns, move ship appropriately
//         Object.keys(data["keyData"]).forEach(element => {
//             // if key is held down
//             if (data["keyData"][element]) {
//                 moveShip(element, data["user"])
//             }
//         })
//     }

//     function gameLoop() {
//         //console.log(performance.now())
//         // update state of game
//         // emit ship movement data to server
//         socket.emit("ship-message", { "keyData": keyDown, "user": currentUser })

//         // emit rocket data to server
//         socket.emit("rocket-message", { "rockets": rockets, "user": currentUser })

//         setTimeout(gameLoop, 10)
//     }
//     // PROBLEM: when alex launches ship, both alex and izzy's game loops start
//     // may be related to why izzy is able to control alex's ship
// })
