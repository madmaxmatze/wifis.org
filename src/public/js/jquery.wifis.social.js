(function($) {
	var WifisSocial = (function($element, config) {
		init = function() {
			$element.mouseover(function() {
				$element.unbind("mouseover").addClass("activatedSocialArea");
				initTwitter($element.find(".socialPageTwitter"));
				initFacebook($element.find(".socialPageFacebook"));
				initGoogle($element.find(".socialPageGoogle"));
				// initFlattr($element.find(".socialPageFlattr"));
				initLinkedin($element.find(".socialPageLinkedin"));
				initTumblr($element.find(".socialPageTumblr"));
			});
		};

		initTwitter = function($twitter) {
			// https://dev.twitter.com/docs/tweet-button
			// data-via="wifis_org"
			// data-url="http://www.wifis.org"
			$twitter
					.html('<a href="https://twitter.com/share" class="twitter-share-button" data-url="http://www.wifis.org" data-counturl="http://www.wifis.org" data-hashtags="wifis" data-text="'
							+ config.translations.twitterMsg
							+ '" data-count="vertical" data-lang="'
							+ config.lang
							+ '"></a>'
							+ ' <br><a target="_blank" class="btn" href="http://twitter.com/wifis_org" title="Twitter Page"><div class="sprite icon icon-twitter"></div> Page</a>');
			$.getScript("http://platform.twitter.com/widgets.js");
		};

		initFacebook = function($facebook) {
			// https://developers.facebook.com/docs/reference/plugins/like/
			$facebook
					.html('<div id="fb-root"></div><div class="fb-like" data-href="https://www.facebook.com/wifis.org" data-send="true" data-layout="box_count" data-width="50" data-show-faces="false"></div>'
							+ ' <br><a target="_blank" class="btn" href="https://www.facebook.com/wifis.org" title="Facebook Page"><div class="sprite icon icon-facebookblue"></div> Page</a>');
			var facebookLang = (config.lang === "en" ? "en_US" : config.lang
					.toLowerCase()
					+ "_" + config.lang.toUpperCase());
			// getScript could not be used because it removes the hashtag!
			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id))
					return;
				js = d.createElement(s);
				js.src = "//connect.facebook.net/" + facebookLang
						+ "/all.js#xfbml=1&appId=194803573923224";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		};

		initGoogle = function($google) {
			// http://www.google.com/webmasters/+1/button/
			$google
					.html('<div class="g-plusone" data-size="tall" data-href="https://plus.google.com/117695499761775220519"></div>'
							+ ' <br><a target="_blank" class="btn" rel="publisher" href="https://plus.google.com/117695499761775220519"  title="Google+ Page"><div class="sprite icon icon-google-red"></div> Page</a>');
			window.___gcfg = {
				"lang" : config.lang
			};
			$.getScript("https://apis.google.com/js/plusone.js");
		};

		initFlattr = function($flattr) {
			$flattr
					.html('<a class="FlattrButton" style="display:none;" rev="flattr;" href="http://www.wifis.org"></a>'
							+ ' <br><a target="_blank" class="btn" href="http://flattr.com/thing/399819/Wifis-org" title="Flattr Page"><div class="sprite icon icon-flattr"></div> Page</a>');
			$.getScript("http://api.flattr.com/js/0.6/load.js?mode=auto");
		};

		initLinkedin = function($linkedin) {
			$linkedin
					.html('<script src="//platform.linkedin.com/in.js" type="text/javascript"> lang: en_US</script>'
							+ '<script type="IN/Share" data-url="www.wifis.org" data-counter="top"></script>'
							+ ' <br><a target="_blank" class="btn" href="http://www.linkedin.com/company/wifis-org" title="LinkedIn Company Page"><div class="sprite icon icon-linkedin"></div> Page</a>');
		};

		initTumblr = function($tumblr) {
			$tumblr
					.html('<a href="http://feeds.feedburner.com/wifis_org" target="_blank"><img src="http://feeds.feedburner.com/~fc/wifis_org?bg=99CCFF&amp;fg=444444&amp;anim=0" height="26" width="88" style="border:0" alt="" /></a>'
							// + ' <br><iframe class="btn" frameborder="0" border="0" scrolling="no" allowtransparency="true" height="25" width="114" src="http://platform.tumblr.com/v1/follow_button.html?button_type=2&tumblelog=wifis-org&color_scheme=dark"></iframe>'
							+ ' <br><a target="_blank" class="btn" href="http://blog.wifis.org" title="Tumblr Blog"><div class="sprite icon icon-tumblr"></div> Page</a>');
		};
		
		
		initPinspire = function($pinspire) {
			$pinspire
					.html('<a href="http://pinterest.com/pin/create/button/?url=http%3A%2F%2Fwww.wifis.org&media=http%3A%2F%2Fwww.wifis.org&description=www.wifis.org%20helps%20neighbors%20to%20get%20in%20touch%20through%20their%20Wi-Fi%20network.%20Its%20easy%2C%20free%20and%20might%20help%20to%20earn%20some%20extra%20money%20by%20sharing%20your%20Wi-Fi." class="pin-it-button" count-layout="horizontal"><img border="0" src="//assets.pinterest.com/images/PinExt.png" title="Pin It" /></a>'
							// + ' <br><iframe class="btn" frameborder="0" border="0" scrolling="no" allowtransparency="true" height="25" width="114" src="http://platform.tumblr.com/v1/follow_button.html?button_type=2&tumblelog=wifis-org&color_scheme=dark"></iframe>'
							+ ' <br><a target="_blank" class="btn" href="http://pinterest.com/wifisorg/pins/" title="Pinspire Page"><div class="sprite icon icon-pinspire"></div> Page</a>');
			$.getScript("//assets.pinterest.com/js/pinit.js");
		};
		
		

		init();
	});

	$.fn.wifisSocial = function(config) {
		new WifisSocial($(this), config);
		return this;
	};
})(jQuery);