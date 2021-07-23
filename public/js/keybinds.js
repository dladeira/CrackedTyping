var newGame = document.getElementById('js-newGame')
var mainMenu = document.getElementById('js-mainMenu')

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