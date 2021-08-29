function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    let expires = 'expires='+ d.toUTCString()
    let sameSite = 'SameSite=Lax'
    document.cookie = cname + '=' + cvalue + ';' + sameSite + ';' + expires + ';path=/'
}

function getCookie(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
}

function hideCookieBar() {
    document.getElementById('cookie-bar').style.display = 'none'
}

document.getElementById('cookie-accept').onclick = () => {
    setCookie('cookiesAccepted', true, 365)
    hideCookieBar()
}

document.getElementById('cookie-decline').onclick = () => {
    // i hope this is a legal way of preventing people from denying cookies
    window.location.href = 'about:blank'
}

// Hide the bar if cookies are accepted
if (getCookie('cookiesAccepted')) {
    hideCookieBar()
}