// http://twitter.github.com/bootstrap/javascript.html#dropdown
// modified by mathias nitzsche
!function($) {
	$.fn.dropdown = function(selector) {
		return $(selector).each(function() {
			/*
			 * $(this).mouseover(function() { console.log ("sdfsdf");
			 * clearMenus(); $(this).addClass('open'); });
			 */
			$(this).hover(function() {
				clearMenus();
				$(this).addClass('open');
			}, function() {
				clearMenus();
				$(this).removeClass('open');
			});
		});
	};
	var d = 'a.menu, .dropdown-toggle';
	function clearMenus() {
		$(d).parent('li').removeClass('open');
	}
	$(function() {
		$('html').bind("click", clearMenus);
		$('body').dropdown(".dropdown");
	});
}(window.jQuery || window.ender);