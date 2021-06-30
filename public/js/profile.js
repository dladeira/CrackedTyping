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
        if (submitUsernameEvent())
            setUsernameStatus(usernameExists ? "Username already exists" : "Username available")
        usernameExists = data.exists
    }
})

function submitUsernameEvent(event, allowDuplicateUsernames) {
    var newUsername = changeUsernameInput.value
    if (!newUsername.match("^[a-zA-Z0-9]+$")) {
        setUsernameStatus("Can only contain letters and numbers")
        if (event) event.preventDefault()
        return false
    }
    if (newUsername.length < 4) {
        setUsernameStatus("At least 4 characters")
        if (event) event.preventDefault()
        return false
    }
    if (newUsername.length > 20) {
        setUsernameStatus("Less than 20 characters")
        if (event) event.preventDefault()
        return false
    }

    if (usernameExists && !allowDuplicateUsernames) {
        if (event) event.preventDefault()
        return false
    }

    return true
}

function submitDescriptionEvent(event) {
    var newDescription = changeDescriptionInput.value
    if (newDescription.length > 30) {
        setDescriptionStatus("Less than 30 characters")
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