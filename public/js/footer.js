function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return unescape(parts.pop().split(';').shift());
}

function getKeybind(event) {
    var msg = `${event.ctrlKey ? "Ctrl+" : ""}${event.altKey ? "Alt+" : ""}${event.key}`
    if (event.key != "Control" && event.key != "Alt" && event.key != "Shift") {
        return msg
    }
}

document.onkeydown = (event) => {
    var keybind = getKeybind(event)
    if (!keybind) return; // Control, Alt, or Shift
    if (keybind == getCookie('newGame')) {
        window.location.pathname = '/game'
    } else if (keybind == getCookie('mainMenu')) {
        if (window.location.pathname != '/') {
            window.location.pathname = '/'
        }
    }
}

var accountNavbar = document.getElementsByClassName('nav-account-card')[0]
var accountInfo = document.getElementsByClassName('nav-account-info')[0]

accountNavbar.onclick = () => {
    if (accountInfo.style.opacity == 1) {
        accountInfo.style.opacity = 0
    } else {
        accountInfo.style.opacity = 1
    }
}