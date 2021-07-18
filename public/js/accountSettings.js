var usernameInput = document.getElementsByClassName('username-input')[0]
var descriptionInput = document.getElementsByClassName('description-input')[0]
var avatarInput = document.getElementById('avatar-upload')
var avatarImage = document.getElementById('js-avatar')

var form = document.getElementById('form-js')
var socket = io()
var usernameExists = false

form.onsubmit = formSubmitEvent

usernameInput.oninput = () => {
    if (usernameInput.value != username) {
        usernameInput.classList.add('changedInput')
    } else {
        usernameInput.classList.remove('changedInput')
    }

    socket.emit('usernameExists', { currentUsername: username, target: usernameInput.value })
}

descriptionInput.oninput = () => {
    if (descriptionInput.value != description) {
        descriptionInput.classList.add('changedInput')
    } else {
        descriptionInput.classList.remove('changedInput')
    }
    formSubmitEvent(undefined, false)
}

avatarInput.onchange = () => {
    const [file] = avatarInput.files
    if (file) {
        avatarImage.src = URL.createObjectURL(file)
        avatarImage.classList.add('changedInput')
    }
}

socket.on('usernameExists', data => {
    if (data.username == usernameInput.value) {
        usernameExists = data.exists
        formSubmitEvent()
    }
})

function formSubmitEvent(event, displayUsernameAvailable) {
    var newUsername = usernameInput.value
    if (!newUsername.match('^[a-zA-Z0-9]+$')) {
        setUsernameStatus('Can only contain letters and numbers')
        if (event) event.preventDefault()
        return false
    }
    if (newUsername.length < 4) {
        setUsernameStatus('At least 4 characters')
        if (event) event.preventDefault()
        return false
    }
    if (newUsername.length > 20) {
        setUsernameStatus('Less than 20 characters')
        if (event) event.preventDefault()
        return false
    }
    if (!event && (displayUsernameAvailable != false)) setUsernameStatus(usernameExists ? 'Username already exists' : 'Username available')
    if (usernameExists) {
        if (event) event.preventDefault()
        return false
    }

    var newDescription = descriptionInput.value
    if (newDescription.length > 30) {
        setDescriptionStatus('Less than 30 characters')
        if (event) event.preventDefault()
        return false
    }

    setDescriptionStatus('')
    return true
}

function setUsernameStatus(status) { // TODO: Support correct and error colors
    document.getElementById('username-status').innerHTML = status
}

function setDescriptionStatus(status) { // TODO: Support correct and error colors
    document.getElementById('description-status').innerHTML = status
}