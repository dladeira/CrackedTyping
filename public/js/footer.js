document.onkeydown = (event) => {
    if (event.altKey) {
        if (event.key == 'n') {
            window.location.pathname = '/game'
        } else if (event.key == 'm') {
            if (window.location.pathname != '/') {
                window.location.pathname = '/'
            }
        }
    }
}