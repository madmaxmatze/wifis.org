(function($) {
	$
			.extend({
				wifisGeneral : function() {
					// facebook redirect: https://stackoverflow.com/q/7131909
					if (window.location.hash == '#_=_') {
						window.location.hash = '';
					}

					// to prevent error in browsers which not support
					// console.log
					if (typeof window.console === "undefined") {
						window.console = {
							log : function() {
							}
						};
					}
					window.console
							.log("Wifis.org ♥ developer - help us https://www.wifis.org/p/languages");
				}
			});
})(jQuery);