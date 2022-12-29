$(function() {
	$.wifisGeneral();	
	// $.wifisAnalytics(config);
	$("#addWifiForm").wifisForm(config);
	$(".navbar").wifisMenu();
	// $(".content .press").wifisPress();
	// $(".socialArea").wifisSocial(config);
	/*
    if (typeof wifisStatsData !== "undefined") {
		$("#wifisStats").wifisStats({
			data : wifisStatsData
		});
	}
    */
	$(".tipsContainer").wifisTips();
});