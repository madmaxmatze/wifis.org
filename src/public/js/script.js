// libs
// source: https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
function delay(fn, ms) {
    window.timer = 0;
    return function(...args) {
        clearTimeout(window.timer);
        window.timer = setTimeout(fn.bind(this, ...args), ms || 0);
    }
}



// general
console.log("Wifis.org ♥ developer - join https://github.com/madmaxmatze/wifis.org");

location.hash = location.hash.replace(/^\#\_\=\_$/, "");    // facebook redirect: https://stackoverflow.com/q/7131909

// press //////////////////////////////////////////////////////////////////
document.querySelectorAll(".press a.more").forEach(moreLink => 
    moreLink.addEventListener('click', (event) => {
    	event.preventDefault();
        moreLink.parentElement.parentElement.querySelectorAll("li").forEach(link => link.classList.remove("js-hidden"));
        moreLink.remove();
    }, false)
);

// menu //////////////////////////////////////////////////////////////////
document.querySelector("#logout-menu-item").setAttribute("href", "javascript: void(0)");

// wifis //////////////////////////////////////////////////////////////////
if (document.querySelectorAll(".wifiObj").length) {
    document.querySelector("#tipsContainer").classList.remove("js-hidden");
}

// WifiForm
// document.querySelector(".home_page #addWifiForm .no-js-hidden").classList.remove("no-js-hidden");

document.querySelector("#addWifiInput").addEventListener('keyup', (event) => {
    console.log (event);
    if (event.code == 'Enter') {
        event.preventDefault();
    } else {   
        delay(function () {
            console.log (event.target.value);
        }, 1000)();
    }
});