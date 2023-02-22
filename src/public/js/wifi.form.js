// TODO: rework form js!

class WifiForm {
    constructor(wifiForm) {
        if (wifiForm) {
            this.wifiForm = wifiForm;
            this.wifiInput = this.wifiForm.querySelector("#addWifiInput");
            this.wifiInput.addEventListener('keyup', (event) => {
                event.preventDefault();
                this.validateWifiId(event.target.value);
            });
            this.wifiInput.addEventListener('focusout', (event) => {
                if (!this.wifiInput.value) {
                    this.setErrorMessage();
                }
            });
            this.registerWifiDeleteHandler();
            // this.wifiButton = this.wifiForm.querySelector("button");
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
        var wifiId = wifiObj.getAttribute("data-wifiid");
        wifiObj.style.height = 0;
        wifiObj.style.visibility = 'hidden';

        this.wifiAction("delete", wifiId).then(json => {
            if (json.success) {
                setTimeout(() => { /* animation should first finish */
                    wifiObj.remove();
                }, 600);
            } else {
                wifiObj.style.height = "auto";
                alert(`error removing wifi '${wifiId}'`);
            }
        });
    }

    setErrorMessage(message) {
        this.wifiForm.classList.toggle("was-validated", !!message);
      
        if (config?.translations?.wifis?.form?.error[message]) {
            message = config.translations.wifis.form.error[message];
        }

        this.wifiForm.querySelector(".invalid-feedback").innerHTML = message || "";
    }

    validateWifiId(wifiId) {
        if (wifiId == this.wifiInput.dataset.lastValidatedWifiId) {
            return
        }

        this.wifiInput.dataset.lastValidatedWifiId = wifiId;
        this.setErrorMessage();
        this.wifiInput.setCustomValidity("");
      
        var validity = this.wifiInput.validity;
        for (var errorType in validity) {
            if (errorType != "valid" && validity[errorType]) {
                return this.setErrorMessage(errorType);
            }
        }

        clearTimeout(this.timer);
        this.wifiForm.dataset.currentvalidations++;

        this.timer = setTimeout(() => {
            this.timer = null;
            this.wifiAction("exists", wifiId).then(json => {
                if (json.success && !json.error) {
                    json.error = "otherUsersWifi";
                    this.wifiInput.setCustomValidity("json.error");
                }
                if (addWifiInput.value == wifiId) {
                    this.setErrorMessage(json.error);
                }
            }).finally(() => {
                if (!this.timer) {
                    this.wifiForm.dataset.currentvalidations = 0;
                    this.wifiForm.classList.add("was-validated");
                }
            });
        }, 400); // only check 400ms after last key press
    }

    async wifiAction(action, wifiId) {
        return fetch(`/api/wifi/${action}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "id": wifiId })
        }).then(response => response.json());
    }

    createNewWifiHandler(event) {
        event.preventDefault();

        var wifiId = this.wifiInput.value;

        this.setErrorMessage();

        this.wifiAction("add", wifiId).then(json => {
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