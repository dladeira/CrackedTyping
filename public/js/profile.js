var changeUsernameForm = document.getElementById("changeUsernameForm")
var changeUsernameInput = document.getElementById("changeUsernameInput")
var changeUsernameButton = document.getElementById("changeUsernameButton")
var socket = io()
var usernameExists = false

changeUsernameForm.onsubmit = submitUsernameEvent

changeUsernameInput.oninput = event => {
    socket.emit('usernameExists', changeUsernameInput.value)
}

socket.on('usernameExists', data => {
    if (data.username == changeUsernameInput.value) {
        usernameExists = data.exists
        setStatus(usernameExists ? "Username already exists" : "Username available")
    }
})

async function submitUsernameEvent(event) {
    var newUsername = changeUsernameInput.value
    if (!newUsername.match("^[a-zA-Z0-9]+$")) {
        setStatus("Can only contain letters and numbers")
        event.preventDefault()
        return
    }
    if (newUsername.length < 4) {
        setStatus("At least 4 characters")
        event.preventDefault()
        return
    }
    if (newUsername.length > 20) {
        setStatus("Less than 20 characters")
        event.preventDefault()
        return
    }

    if (usernameExists) {
        event.preventDefault()
        return
    }
}

function setStatus(status) { // TODO: Support correct and error colors
    document.getElementById("changeUsernameStatus").innerHTML = status;
}