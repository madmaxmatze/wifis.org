(function($) {
	var WifisPress = (function($element) {
		init = function() {
			$element.find("a.more").click(onclick).attr("href", "javascript:;");
		};

		onclick = function() {
			$(this).hide().parent().parent().find(
					"a:not(.more), li:not(.hasLogo) span").show("fast");
		};

		init();
	});

	$.fn.wifisPress = function() {
		new WifisPress($(this));
		return this;
	};
})(jQuery);