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
var logout = document.querySelector("#logout-menu-item");
if (logout) {
    logout.setAttribute("href", "javascript: void(0)");
}

// wifis //////////////////////////////////////////////////////////////////
if (document.querySelectorAll(".wifiObj").length) {
    document.querySelector("#tipsContainer").classList.remove("js-hidden");
}

// wifi-form //////////////////////////////////////////////////////////////////
// document.querySelector(".home_page #addWifiForm .no-js-hidden").classList.remove("no-js-hidden");
const WifiForm = class {
    constructor(wifiForm) {
        this.wifiForm = wifiForm;

        if (this.wifiForm) {
            this.wifiInput = this.wifiForm.querySelector("#addWifiInput");
            this.wifiButton = this.wifiForm.querySelector("button");
            this.wifiInput.addEventListener('keyup', this.addWifiInputHandler.bind(this));
            this.wifiForm.addEventListener("submit", () => (this.createNewWifi(addWifiInput.value), false));
        }
    }

    addWifiInputHandler(event) {
        event.preventDefault();
        if (event.code != 'Enter') {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => { 
                this.validateWifiId(event.target.value);
            }, 400);
        }
    }

    getErrorMsgForCode(code) {
        if (config.translations.wifis.error[code]) {
            return config.translations.wifis.error[code];
        }
        return code || "";
    };

    setErrorMessage(message) {
        message = this.getErrorMsgForCode(message);
        console.log(message);
        console.log("this.wifiInput.value", this.wifiInput.value);
        console.log ("disabled", !this.wifiInput.value || message ? "true" : "false")
        this.wifiButton.classList.toggle("disabled", !this.wifiInput.value || message);
        this.wifiButton.querySelector(".caption").innerText = config.translations.wifis.test;  //[message ? "test" : "save"];
        this.wifiForm.querySelector(".help-inline").innerHTML = message || "";
    }

    validateWifiId(wifiId) {
        console.log("validateWifiId");
        this.setErrorMessage();
        
        if (!wifiId) {
            return this.setErrorMessage("noWifiIdDefined");
        } else if (wifiId.length < 3) {
            return this.setErrorMessage("wifiIdTooShort");
        } else if (wifiId.length > 20) {
            return this.setErrorMessage("wifiIdTooLong");
        } else if (/.*[^\w\-]+.*/.test(wifiId)) {
            return this.setErrorMessage("wrongWifiIdChars");
        }

        // var loader = document.querySelector(".loader");
        // loader.classList.toggle("hide", currentValidates === 0);
        this.wifiForm.classList.add("busy");

        fetch("/api/wifi/exists", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id" : wifiId})
        }).then(response => response.json()).then(json => {
            this.wifiForm.classList.remove("busy");

            if (json.success && !json.error) {
                json.error = "otherUsersWifi";
            }

            console.log (json);
            this.setErrorMessage(json.error);
            
            // if (addWifiInput.val() === wifiid) {
            //    setErrorMsg(data.error);
            //}
        });   
    }

    createNewWifi (wifiId) {
        this.setErrorMessage();

        fetch("/api/wifi/add", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id" : wifiId})
        }).then(response => response.json()).then(json => {
            if (json.success) {
                // find correct position
                var smallerElement = null;
                this.wifiForm.querySelectorAll(".wifiObj").forEach((element) => {
                    if (wifiId.toLowerCase() > element.getAttribute("id").substr(4)) {
                        smallerElement = element;
                    }
                });
                console.log ("smallerElement", smallerElement)

                var html = getNewWifiHtml(wifiId.toLowerCase(),
                wifiId);

                if (smallerElement) {
                    smallerElement.insertAdjacentHTML("afterend", html);
                } else {
                    this.wifiForm.insertAdjacentHTML("afterbegin", html);
                }

                // div.show(config.animationSpeed)
                this.setErrorMessage();
                this.wifiInput.value = "";
                // this.registerWifiListHandler();

                /*
                if ($(".wifiObj").length) {
                    $(".tipsContainer").show(500);
                }*/
            }
            this.setErrorMessage(json.error);
        });
    }

    getNewWifiHtml(wifiId, label) {
        return `
            <div class="control-group wifiObj" id="wifi${wifiId}">
                <div class="input-prepend input-append">
                    <span class="add-on">wifis.org/</span>
                    <span class="add-on wifiName" style="font-weight: bold">
                        <a href="/${label}">${label}</a>
                    </span>
                    <span class="add-on deleteButton">
                        <a class="sprite icon icon-delete" href="?action=delete&wifiid=${wifiId}" title="${config.translations.wifis.deleteButton}"></a>
                    </span>
                </div>
            </div>`;
    }
}

const wifiForm = new WifiForm(document.querySelector("#addWifiForm"));