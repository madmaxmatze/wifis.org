(function($) {
	$.fn.wifisMenu = function() {
		var element = $(this);
		element.find("#logout-menu-item").attr("href", "javascript: void(0)")
				.attr("title", "");
		element.find(".googleLogin").click(function() {
			_gaq.push([ '_trackPageview', '/p/login/google' ]);
		});
		element.find(".facebookLogin").click(function() {
			_gaq.push([ '_trackPageview', '/p/login/facebook' ]);
		});
		return this;
	};
})(jQuery);