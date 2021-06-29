var changeDescriptionForm = document.getElementById("changeDescriptionForm")
var changeDescriptionInput = document.getElementById("changeDescriptionInput")
var changeDescriptionButton = document.getElementById("changeDescriptionButton")

var changeUsernameForm = document.getElementById("changeUsernameForm")
var changeUsernameInput = document.getElementById("changeUsernameInput")
var changeUsernameButton = document.getElementById("changeUsernameButton")
var socket = io()
var usernameExists = false

changeUsernameForm.onsubmit = submitUsernameEvent
changeDescriptionForm.onsubmit = submitDescriptionEvent

changeUsernameInput.oninput = event => {
    socket.emit('usernameExists', changeUsernameInput.value)
}

socket.on('usernameExists', data => {
    if (data.username == changeUsernameInput.value) {
        usernameExists = data.exists
        setUsernameStatus(usernameExists ? "Username already exists" : "Username available")
    }
})

function submitUsernameEvent(event) {
    var newUsername = changeUsernameInput.value
    if (!newUsername.match("^[a-zA-Z0-9]+$")) {
        setUsernameStatus("Can only contain letters and numbers")
        event.preventDefault()
        return
    }
    if (newUsername.length < 4) {
        setUsernameStatus("At least 4 characters")
        event.preventDefault()
        return
    }
    if (newUsername.length > 20) {
        setUsernameStatus("Less than 20 characters")
        event.preventDefault()
        return
    }

    if (usernameExists) {
        event.preventDefault()
        return
    }
}

function submitDescriptionEvent(event) {
    var newDescription = changeDescriptionInput.value
    if (newDescription.length < 1) {
        setDescriptionStatus("At least 1 character")
        event.preventDefault()
        return
    }
    if (newDescription.length > 250) {
        setDescriptionStatus("Less than 250 characters")
        event.preventDefault()
        return
    }
}

function setUsernameStatus(status) { // TODO: Support correct and error colors
    document.getElementById("changeUsernameStatus").innerHTML = status;
}

function setDescriptionStatus(status) { // TODO: Support correct and error colors
    document.getElementById("changeDescriptionStatus").innerHTML = status;
}