var _gaq = _gaq || [];

/*(function($) {
	var WifisAnalytics = (function(config) {
		var defaults = {};

		init = function() {
			config = jQuery.extend({}, defaults, config);
			
			if (config.analytics.enabled) {
				_gaq.push([ '_setAccount', config.analytics.account ]);
				_gaq.push([ '_setDomainName', config.analytics.domain ]);
	
				if (config.analytics.view === "wifi") {
					_gaq.push([ '_trackPageview', '/wifi' ]);
				} else {
					_gaq.push([ '_trackPageview' ]);
				}
				
				if (config.analytics.events.indexOf("account_login") > -1) {
					_gaq.push([ '_trackEvent', 'account', 'login' ]);
				}
				
				if (config.analytics.events.indexOf("account_create") > -1) {
					_gaq.push([ '_trackEvent', 'account', 'create' ]);
				}
				
				$.ajaxSetup({cache: true});
				$.getScript("https://www.google-analytics.com/ga.js");
				$.ajaxSetup({cache: false});
			}
		};

		init();
		// return {};
	});

	$.wifisAnalytics = function(config) {
		new WifisAnalytics(config)
		return this;
	};
})(jQuery);
 */