var newGame = document.getElementById('keybind-newGame')
var mainMenu = document.getElementById('keybind-mainMenu')

newGame.value = getCookie('newGame')
mainMenu.value = getCookie('mainMenu')

newGame.onfocus = (event) => {
    console.log(event)
}

document.onkeydown = (event) => {
    if (newGame == document.activeElement) {
        newGame.value = getKeybind(event)
    } else if (mainMenu == document.activeElement) {
        mainMenu.value = getKeybind(event)
    }
}