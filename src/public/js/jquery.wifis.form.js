(function($) {
	var WifisForm = (function($element, config) {
		var addWifiInput = $element.find(".addWifiInput"), currentValidates = 0, validationUsed = false, defaults = {
			animationSpeed : 250
		};

		init = function() {
			config = jQuery.extend({}, defaults, config);
			registerSubmitHandler();
			registerWifiListHandler();
			addWifiInput.keyup(addWifiInputKeyUpHandler);
			setErrorMsg();
		};

		registerSubmitHandler = function() {
			if ($element.parent(".wifichecker").size() === 0) {
				$element.submit(function() {
					createNewWifi(addWifiInput.val());
					return false;
				});
			} else {
				$element.submit(function() {
					return ($element.find("button:submit:enabled").size() > 0);
				});
			}
		};

		registerWifiListHandler = function() {
			$element.find(".wifiObj:not(.wifiObjExtended)").each(
					function(key, object) {
						var $wifiObj = $(this);
						$wifiObj.addClass("wifiObjExtended");
						$wifiObj.hover(function() {
							$wifiObj.addClass("hover");
						}, function() {
							$wifiObj.removeClass("hover");
						});
						$wifiObj.find(".deleteButton a").attr("href",
								"javascript: void(0);").click(function() {
							removeWifiClickHandler($wifiObj);
						});
					});
		};

		removeWifiClickHandler = function($wifiObj) {
            $wifiObj.hide(config.animationSpeed);
			removeWifi($wifiObj.attr("id").substr(4));
			setErrorMsg();
			addWifiInput.focus();
			return false;
		};

		removeWifi = function(wifiid) {
            $.post("/api/wifi/delete", {
				"id" : wifiid
			}, function(data, textStatus, jqXHR) {
                if (data.success) {
					window.setTimeout(function() {
						$("#wifi" + wifiid).remove();
             		}, config.animationSpeed);
				} else {
                    $("#wifi" + wifiid).show(config.animationSpeed);
                }
			}, "json");
		};

		addWifiInputKeyUpHandler = function(event) {
			if (event.keyCode !== '13') {
				var wifiId = addWifiInput.val();
				if (wifiId) {
					$(this).doTimeout(
							'text-type',
							(currentValidates + 1) * config.animationSpeed
									* 2, function() {
								validate(wifiId);
							});
				} else {
					setErrorMsg();
				}
			}
		};

		validate = function(wifiid) {
			if (!validationUsed) {
				validationUsed = true;
				_gaq.push([ '_trackEvent', 'ajax', 'validateWifiId' ]);
			}

			if (!wifiid) {
				return setErrorMsg("noWifiIdDefined");
			} else if (wifiid.length < 3) {
				return setErrorMsg("wifiIdTooShort");
			} else if (wifiid.length > 20) {
				return setErrorMsg("wifiIdTooLong");
			} else if (/.*[^\w\-]+.*/.test(wifiid)) {
				return setErrorMsg("wrongWifiIdChars");
			} else if ($("#wifi" + wifiid.toLowerCase()).length) {
				return setErrorMsg("alreadyYourWifi");
			}

            currentValidates++;
            var loader = $element.find(".loader");
            loader.toggleClass ("hide", currentValidates === 0);
            $.post("/api/wifi/exists", {
                "id" : wifiid
            }, function(data, textStatus, jqXHR) {
                currentValidates--;
                loader.toggleClass ("hide", currentValidates === 0);
                if (data.success && !data.error) {
                    data.error = "otherUsersWifi";
                }
                if (addWifiInput.val() === wifiid) {
                    setErrorMsg(data.error);
                }
            }, "json");
		};

		createNewWifi = function(wifiid) {
			setErrorMsg();

			$.post("/api/wifi/add", {
				"id" : wifiid
			},
					function(data, textStatus, jqXHR) {
						if (data.wifi) {
							var div = getNewWifiDiv(data.wifi.id,
									data.wifi.label);

							// find correct position
							var smallerElement = null;
							$element.children(".wifiObj").each(
									function() {
										if (wifiid.toLowerCase() > $(this)
												.attr("id").substr(4)) {
											smallerElement = $(this);
										} else {
											return false;
										}
									});

							if (smallerElement) {
								div.insertAfter(smallerElement);
							} else {
								$element.prepend(div);
							}

							div.show(config.animationSpeed)
							setErrorMsg();
							addWifiInput.val("").focus();
							registerWifiListHandler();

							if ($(".wifiObj").length) {
								$(".tipsContainer").show(500);
							}
						}
						setErrorMsg(data.error);
					}, "json");
		};

		getNewWifiDiv = function(id, label) {
			var html = '<div class="control-group wifiObj" id="wifi' + id
					+ '">';
			html += '<div class="input-prepend input-append">';
			html += '<span class="add-on">wifis.org/</span>';
			html += '<span class="add-on wifiName" style="font-weight: bold">';
			html += '<a href="/' + label + '">' + label + '</a>';
			html += '</span>';
			html += '<span class="add-on deleteButton">';
			html += '<a class="sprite icon icon-delete" href="/p/wifis?action=delete&wifiid='
					+ id
					+ '" title="'
					+ config.translations.wifis.deleteButton
					+ '"></a>';
			html += '</span>';
			html += '</div></div>';
			return $(html).hide();
		};

		getErrorMsgForCode = function(code) {
			if (config.translations.wifis.error[code]) {
				code = config.translations.wifis.error[code];
			}
			return code;
		};

		setErrorMsg = function(msg) {
			if (!msg) {
				msg = "";
			}
			if (addWifiInput.val() === addWifiInput.attr("title")) {
				msg = "";
			}

			msg = getErrorMsgForCode(msg);

			$element.find(".control-group:last").toggleClass("error",
					(msg != ""));

			var possibleToSubmit = (msg == ""
					&& addWifiInput.val() !== addWifiInput.attr("title") && addWifiInput
					.val() !== "");

			$element.find(".btn").toggleClass("btn-info", possibleToSubmit)
					.toggleClass("btn-danger", msg != "");

			if (possibleToSubmit) {
				msg = '<span style="color: green">'
						+ config.translations.wifis.error.none + '</span>';
			}

			$element.find("button:submit").attr("value",
					config.translations.wifis[possibleToSubmit ? "save" : "test"])
					.attr("disabled", !possibleToSubmit);
			$element.find(".help-inline").html(msg);
		};

		init();
	});

	$.fn.wifisForm = function(config) {
		new WifisForm($(this), config);
		return this;
	};
})(jQuery);