function setCookie(cname, cvalue, exdays) {
    const d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    let expires = "expires="+ d.toUTCString()
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"
}
 
function getCookie(cname) {
    let name = cname + "=";
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
    document.getElementById("cookiebar").style.display = "none"
}

function acceptCookies() {
    setCookie("cookiesAccepted", 1, 365)
    hideCookieBar()
}

function declineCookies() {
    window.location.href = "about:blank" // i hope this is a legal way of preventing people from denying cookies
}

console.log("checking if accepted cookies..")
if(getCookie("cookiesAccepted") == 1) {
    hideCookieBar()
}