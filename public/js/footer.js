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
        window.location.pathname = '/casual'
    } else if (keybind == getCookie('mainMenu')) {
        if (window.location.pathname != '/') {
            window.location.pathname = '/'
        }
    }
}

if (getCookie('loggedIn') != 'false') {
    var accountNavbar = document.getElementsByClassName('account-nav')[0]
    var accountInfo = document.getElementsByClassName('account-menu')[0]

    var ignoreNavClose = false

    accountNavbar.onclick = () => {
        // When the accountNavbar is clicked <body> is also clicked,
        // by using ignoreNavClose we ignore all clicks on the body which close
        // the menu for 150ms after the accountNavbar is clicked
        //
        // After 150ms if <body> is clicked it closes the menu
        ignoreNavClose = true
        setTimeout(() => {
            ignoreNavClose = false
        }, 150)

        if (accountInfo.style.display == 'block') {
            accountInfo.style.display = 'none'
        } else {
            accountInfo.style.display = 'block'
        }
    }

    document.body.onclick = event => {
        if (!ignoreNavClose) {
            if (accountInfo.style.display == 'block') {
                accountInfo.style.display = 'none'
            }
        }
    }
}