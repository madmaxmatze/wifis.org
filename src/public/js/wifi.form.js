class WifiForm {
    constructor() {
        this.wifiForm = document.querySelector("#addWifiForm");
        if (this.wifiForm) {
            this.wifiButton = this.wifiForm.querySelector("button");
            this.wifiInput = this.wifiForm.querySelector("input");
            this.wifiForm.addEventListener('submit', event => this.creationHandler.apply(this, [event]));
            this.wifiForm.addEventListener('click', event => this.deletionHandler.apply(this, [event]));
            this.wifiInput.addEventListener("input", event => this.validationHandler.apply(this, [event]));
            this.wifiInput.addEventListener('focusout', () => { if (!this.wifiInput.value) this.setErrorMessage(); });
        }
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

    setErrorMessage(message) {
        this.wifiForm.classList.toggle("was-validated", !!message);
        if (this.wifiButton) {
            this.wifiButton.classList.toggle("disabled", message == "" || !!message);
        }

        var standardValidationErrors = ["valueMissing", "tooShort", "tooLong", "patternMismatch"];
        if (message && !standardValidationErrors.includes(message)) {
            this.wifiInput.setCustomValidity(message);
        }

        if (config?.translations?.wifis?.form?.error[message]) {
            message = config.translations.wifis.form.error[message];
        }
        this.wifiForm.querySelector(".invalid-feedback").innerHTML = message;
    }

    validationHandler(event) {
        event.preventDefault();

        var wifiId = this.wifiInput.value.toLowerCase();
        this.setErrorMessage();

        this.wifiInput.setCustomValidity("");
        var validity = this.wifiInput.validity;
        for (var errorType in validity) {
            if (errorType != "valid" && validity[errorType]) {
                return this.setErrorMessage(errorType);
            }
        }

        var myWifi = this.wifiForm.querySelector(`*[data-wifi-id='${wifiId}']`);
        if (myWifi) {
            return this.setErrorMessage("alreadyYours");
        }

        if (wifiId == this.wifiInput.dataset.lastValidatedWifiId) {
            return;
        }
        this.wifiInput.dataset.lastValidatedWifiId = wifiId;

        clearTimeout(this.timer);
        this.wifiForm.dataset.currentValidations++;

        this.timer = setTimeout(() => {
            this.timer = null;
            this.wifiAction("exists", wifiId).then(json => {
                if (this.wifiInput.value == wifiId) {
                    if (json.success && !json.error) {
                        json.error = "otherUsersWifi";
                    }
                    this.setErrorMessage(json.error);
                }
            }).finally(() => {
                if (!this.timer) {
                    this.wifiForm.dataset.currentValidations = 0;
                    this.wifiForm.classList.add("was-validated");
                }
            });
        }, 400); // only check 400ms after last key press
    }

    creationHandler(event) {
        event.preventDefault();

        var wifiLabel = this.wifiInput.value;
        if (wifiLabel && document.querySelector(".wifis_page")) {
            this.wifiAction("add", wifiLabel).then(json => {
                if (json.success) {
                    this.setErrorMessage();
                    this.wifiInput.value = "";
                    this.insertNewWifi(wifiLabel);
                } else {
                    alert(`Error adding '${wifiLabel}'`);
                }
            });
        }

        return false;
    }

    insertNewWifi(wifiLabel) {
        var wifiId = wifiLabel.toLowerCase();
        var newWifiHtml = `<div data-wifi-id="${wifiId}" style='height: 0; opacity: 0; visibility: hidden;'>
                <div class="input-group input-group-sm no-js-hidden mb-1">
                    <span class="input-group-text text-muted text-end d-block">wifis.org/</span>
                    <span class="input-group-text wifiName" style="font-weight: bold; background: white;">
                        <a target="_blank" href="/${wifiLabel}">${wifiLabel}</a>
                    </span>    
                    <span class="input-group-text deleteButton no-js-hidden border-0 bg-transparent" title="${config.translations.wifis.deleteButton}"></span>
                </div>
            </div>`;

        // find correct position to insert
        var smallerElement = null;
        this.wifiForm.querySelectorAll("*[data-wifi-id]").forEach(element =>
            smallerElement = wifiId > element.dataset.wifiId ? element : smallerElement
        );
        if (smallerElement) {
            smallerElement.insertAdjacentHTML("afterend", newWifiHtml);
        } else {
            this.wifiForm.insertAdjacentHTML("afterbegin", newWifiHtml);
        }

        var newWifi = document.querySelector(`*[data-wifi-id='${wifiId}']`);
        setTimeout(() => { /* needed! https://stackoverflow.com/a/55951970/1066081 */
            newWifi.style.visibility = 'visible';
            newWifi.style.height = '35px';
            newWifi.style.opacity = 1;
        }, 10);
    }

    deletionHandler(event) {
        if (event.target.classList.contains('deleteButton')) {
            event.preventDefault();

            var wifiObj = event.target.parentElement.parentElement;
            var wifiId = wifiObj.dataset.wifiId;
            wifiObj.style.height = "0px";

            this.wifiAction("delete", wifiId).then(json => {
                if (json.success) {
                    setTimeout(() => { wifiObj.remove(); }, 600); // animation need to first finish
                } else {
                    wifiObj.style.height = "35px";
                    alert(`error removing wifi '${wifiId}'`);
                }
            });
        }
    }
}

new WifiForm();