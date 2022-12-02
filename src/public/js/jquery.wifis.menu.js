(function($) {
	$.fn.wifisMenu = function() {
		var element = $(this);
		element.find("#logout-menu-item").attr("href", "javascript: void(0)")
				.attr("title", "");
		return this;
	};
})(jQuery);