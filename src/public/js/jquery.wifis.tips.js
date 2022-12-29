(function($) {
	var WifisTips = (function($element) {
		var tipWasClicked = false;

		init = function() {
			if ($(".wifiObj").length) {
				$element.show();
			}
			$element.find(".tip .headline").click(onclick);
		};

		onclick = function() {
			var headline = $(this);
			if (headline.hasClass("headline")) {
				if (!tipWasClicked) {
					tipWasClicked = true;
				}
				$(this).siblings(".text").slideToggle(200, function() {
					$(this).parent().toggleClass("active");
				});
			}
		};

		init();
	});

	$.fn.wifisTips = function() {
        new WifisTips($(this));
		return this;
	};
})(jQuery);