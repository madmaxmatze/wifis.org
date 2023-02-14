// TODO: rework form js!

class WifiForm {
    constructor(wifiForm) {
        if (wifiForm) {
            this.wifiForm = wifiForm;
            this.wifiInput = this.wifiForm.querySelector("#addWifiInput");
            this.wifiInput.addEventListener('keyup', this.addWifiInputHandler.bind(this));
            this.registerWifiDeleteHandler();
            this.wifiButton = this.wifiForm.querySelector("button");
        }
    }

    registerWifiDeleteHandler() {
        Array.from(this.wifiForm.querySelectorAll("*[data-wifiid] .deleteButton")).forEach(element => {
            element.removeEventListener("click", this.deleteWifiHandler);
            element.addEventListener('click', this.deleteWifiHandler);
        });
    }

    deleteWifiHandler(event) {
        event.preventDefault();
        var wifiObj = event.target.parentElement.parentElement;
        console.log ("wifiObj", wifiObj);
        var wifiId = wifiObj.getAttribute("data-wifiid");
        wifiObj.style.height = 0;
        wifiObj.style.visibility = 'hidden';
        console.log ("call wifi delete: " + wifiId);

        fetch("/api/wifi/delete", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id" : wifiId})
        }).then(response => response.json()).then(json => {
            console.log (json);
            
            if (json.success) {
                setTimeout(() => { /* animation should first finish */
                    wifiObj.remove();
                }, 600);
            } else {
                wifiObj.style.height = "auto";
                alert (`error removing wifi '${wifiId}'`);
            }
        });
    }

    addWifiInputHandler(event) {
        event.preventDefault();
        if (event.code != 'Enter') {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => { 
                this.validateWifiId(event.target.value);
            }, 400); // only check 400ms after last key press
        }
    }

    getErrorMsgForCode(code) {
        if (config.translations.wifis.error[code]) {
            return config.translations.wifis.error[code];
        }
        return code || "";
    }

    setErrorMessage(message) {
        message = this.getErrorMsgForCode(message);
        console.log(message);
        console.log("this.wifiInput.value", this.wifiInput.value);
        console.log ("disabled", !this.wifiInput.value || message ? "true" : "false");
        
        this.wifiButton.classList.toggle("disabled", !this.wifiInput.value || message);
        this.wifiInput.classList.toggle("is-invalid", !!message);
        // this.wifiButton.querySelector(".caption").innerText = config.translations.wifis.test;  //[message ? "test" : "save"];
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

        this.wifiForm.dataset.currentvalidations++;
        fetch("/api/wifi/exists", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({"id" : wifiId})
        }).then(response => response.json()).then(json => {
            console.log (json);
            if (json.success && !json.error) {
                json.error = "otherUsersWifi";
            }
            if (addWifiInput.value === wifiId) {
                this.setErrorMessage(json.error);
            }
        })
        .finally(() => {
            this.wifiForm.dataset.currentvalidations--;
        });   
    }

    createNewWifiHandler (event) {
        event.preventDefault();
        
        var wifiId = this.wifiInput.value;

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
                var smallerElement = Array.from(this.wifiForm.querySelectorAll("*[data-wifiid]")).reduce((smaller, element) => (
                    wifiId > element.getAttribute("data-wifiid") ? element : smaller
                ), null);

                var html = this.getNewWifiHtml(wifiId.toLowerCase(), wifiId);
                if (smallerElement) {
                    smallerElement.insertAdjacentHTML("afterend", html);
                } else {
                    this.wifiForm.insertAdjacentHTML("afterbegin", html);
                }

                var newWifi = document.querySelector(`*[data-wifiid='${wifiId}']`)

                setTimeout(() => { /* needed! https://stackoverflow.com/a/55951970/1066081 */
                    newWifi.style.visibility = 'visible';
                    newWifi.style.height = '35px';
                    newWifi.style.opacity = 1;
                }, 10);
                
                this.setErrorMessage();
                this.wifiInput.value = "";
                this.registerWifiDeleteHandler();
            }
            this.setErrorMessage(json.error);
        });
    }

    getNewWifiHtml(wifiId, label) {
        return `
            <div data-wifiid="${wifiId}" style='height: 0; opacity: 0; visibility: hidden;'>
                <div class="input-group input-group-sm no-js-hidden mb-1">
                    <span class="input-group-text text-muted text-end d-block">wifis.org/</span>
                    <span class="input-group-text wifiName" style="font-weight: bold; background: white;">
                        <a target="_blank" href="/${label}">${label}</a>
                    </span>    
                    <span class="input-group-text deleteButton no-js-hidden border-0 bg-transparent" title="${config.translations.wifis.deleteButton}"></span>
                </div>
            </div>`;
    }
}

new WifiForm(document.querySelector("#addWifiForm"));