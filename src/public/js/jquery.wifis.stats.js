//wifis stats
(function($) {
	var WifisStats = (function($element, stats) {
		var config = {
			startColor : [ 140, 185, 255 ], // 0.00
			endColor : [ 0, 0, 0 ]
		};

		init = function() {
			google.load('visualization', '1',
					{
						packages : [ "corechart", 'table', 'annotatedtimeline',
								'geochart' ],
						callback : function() {
							drawTimeChart('.timeChart',
									stats.data.longtermGrowth, getMarkers());
							drawTable('.citiesTable', "Cities",
									stats.data.cities);
							// drawTable("Countries", stats.data.countries);
							drawTypesPie('.typesPie', stats.data.types);
							drawHistogramChart('.histogramChart',
									stats.data.histogram);
							drawMap(".countriesMap");
						}
					});
		};

		drawHistogramChart = function(cssSelector, rawData) {
			var histogramContainer = $element.find(cssSelector).get(0),
				histogramChart = null,
				histogramData = null;
			
			if (histogramContainer && rawData) {
				histogramChart = new google.visualization.ColumnChart(histogramContainer),

				histogramData = new google.visualization.DataTable();
				histogramData.addColumn('string', 'Wifis per account');
				histogramData.addColumn('number', 'Wifis Count');
				histogramData.addRows(rawData);

				histogramChart.draw(histogramData, {
					vAxis : {
						logScale : true
					},
					legend : {
						position : 'none'
					}
				// title: 'Number of Wifis per account'
				// hAxis: {title: 'Year', titleTextStyle: {color: 'red'}}
				});
			}
		};

		drawTypesPie = function(cssSelector, rawData) {
			var typesContainer = $element.find(cssSelector).get(0),
				typesData = null,
				typesChart = null;
			
			if (typesContainer && rawData) {
				typesData = new google.visualization.DataTable();
				typesData.addColumn('string', 'Type');
				typesData.addColumn('number', 'User');
				typesData.addRows(rawData);

				typesChart = new google.visualization.PieChart(typesContainer);
				typesChart.draw(typesData, {
					colors : [ '#f1b78d', '#e1660b', '#8dc3f1', '#0b7de1' ],
					legend : {
						position : 'bottom'
					}
				// ,title: 'Account Type'
				});
			}
		};

		drawTable = function(cssSelector, tableHeader, rawData) {
			var tableContainer = $element.find(cssSelector).get(0);
			if (tableContainer && rawData) {
				var tableData = new google.visualization.DataTable();
				tableData.addColumn('string', tableHeader);
				tableData.addColumn('number', 'Users');
				tableData.addRows(rawData);

				var table = new google.visualization.Table(tableContainer);
				table.draw(tableData, {
					showRowNumber : true,
					sortColumn : 1,
					sortAscending : false
				});
			}
		};

		getNumberOfDay = function(y, m, d) {
			return Math.round((new Date(y, m - 1, d)).getTime()
					/ (24 * 60 * 60 * 1000));
		};

		getMarkers = function() {
			var markers = {};

			markers[getNumberOfDay(2011, 11, 15)] = [
					'<a href="http://www.googlewatchblog.de/2011/11/opt-out-google-wlan/" target="_blank">GoogleWatchBlog</a>',
					"First footnote" ];
			markers[getNumberOfDay(2011, 12, 15)] = [
					'<a href="http://boingboing.net/2011/12/16/say-wi-fi-hi.html" target="_blank">boingboing.net</a>',
					"First major blog" ];
			markers[getNumberOfDay(2011, 12, 23)] = [
					'<a href="http://thenextweb.com/apps/2011/12/23/turn-your-wifi-network-into-a-private-messaging-service-with-wifis/" target="_blank">TheNextWeb.com</a>',
					"Copied worldwide" ];
			markers[getNumberOfDay(2012, 1, 5)] = [
					'<a href="http://www.golem.de/1201/88811.html" target="_blank">golem.de</a>',
					"First major german blog" ];
			markers[getNumberOfDay(2012, 1, 8)] = [
					'<a href="http://bandaancha.eu/articulos/deja-tus-vecinos-hagan-ofertas-acceder-8228" target="_blank">bandaancha.eu</a>',
					"Big spanish forum" ];
			markers[getNumberOfDay(2012, 3, 19)] = [
					'<a href="http://lifehacker.ru/2012/03/20/wifis/" target="_blank">LiveHacker.ru</a>',
					"First article in Russia" ];
			markers[getNumberOfDay(2012, 12, 17)] = [
					'<a href="http://news.ycombinator.com/item?id=4932829" target="_blank">HackerNews</a>',
					"THE HackerNews" ];

			return markers;
		};

		drawTimeChart = function(cssSelector, longtermData, markers) {
			var timeContainer = $element.find(cssSelector).get(0),
			 	timeChart = null;
			if (timeContainer && longtermData) {
				$(timeContainer)
						.before(
								'<div style="position: absolute; top: 0px; right: 0px;" class="timechartSwitcher pagination">'
										+ '<ul>'
										+ '<li class=""><a href="javascript: void(0);">Abs</a></li>'
										+ '<li class="active"><a href="javascript: void(0);">Rel</a></li>'
										+ '</ul>' + '</div>');

				var longtermSumData = [];
				for ( var i = 0; i < longtermData.length; i++) {
					var mark = markers[longtermData[i][0]];
					longtermData[i][0] = new Date(longtermData[i][0]
							* (24 * 60 * 60 * 1000));
					longtermData[i][4] = (mark ? mark[0] : undefined);
					longtermData[i][5] = (mark ? mark[1] : undefined);
					longtermSumData[i] = longtermData[i].slice(0);
					if (i) {
						longtermSumData[i][1] += longtermSumData[i - 1][1];
						longtermSumData[i][2] += longtermSumData[i - 1][2];
						longtermSumData[i][3] += longtermSumData[i - 1][3];
					}
				}

				var data = {
					relative : getDrawTimeChartData(longtermData),
					absolute : getDrawTimeChartData(longtermSumData)
				};

				timeChart = new google.visualization.AnnotatedTimeLine(
						timeContainer);

				var startDate = new Date();
				startDate.setDate(startDate.getDate() - 14);

				var options = {
					displayDateBarSeparator : true,
					allowHtml : true,
					displayRangeSelector : true,
					displayAnnotations : true,
					displayExactValues : true,
					scaleType : 'maximized',
					zoomStartTime : startDate
				};

				timeChart.draw(data.relative, options);
				// chart.hideDataColumns(2);

				var isRelative = false;
				$(".timechartSwitcher li a").click(
						function() {
							var range = chart.getVisibleChartRange();
							options.zoomStartTime = range.start;
							options.zoomEndTime = range.end;
							timeChart.draw(data[(isRelative ? "relative"
									: "absolute")], options);
							$(".timechartSwitcher li").toggleClass("active");
							isRelative = !isRelative;
						});
			}
		};

		getDrawTimeChartData = function(rawData) {
			var data = new google.visualization.DataTable();
			data.addColumn('date', 'Date');
			data.addColumn('number', 'Messages');
			data.addColumn('number', 'Wifis');
			data.addColumn('number', 'Account');
			data.addColumn('string', 'title3');
			data.addColumn('string', 'text3');
			data.addRows(rawData);
			return data;
		};

		getDataTableForData = function(data) {
			var dataTable = new google.visualization.DataTable();
			dataTable.addColumn('string', 'Country');
			dataTable.addColumn('number', 'Value');
			dataTable.addColumn({
				type : 'string',
				role : 'tooltip'
			});
			dataTable.addRows(data);
			return dataTable;
		};

		drawMap = function(cssSelector) {
			prepareCountryStats();

			$element
					.find(cssSelector)
					.html(
							'<div class="map" style="position: absolute; left: -20px; top: -90px; width: 650px; height: 410px;"></div>'
									+ '<div class="pie" style="position: absolute; right: -10px; top: 20px; width: 300px; height: 300px;"></div>');

			var max = 5;
			if (stats.data.countries) {
				max = stats.data.totalCount / 10;
			}
			var seriesData;
			if (stats.data.countries) {
				seriesData = stats.data.countries;
			}
			if (stats.data.countriesRelative) {
				seriesData = stats.data.countriesRelative;
			}
			drawMapChart(".map", seriesData, max);
			drawMapPieChart(".pie", stats.data.countryPieData);
		};

		drawMapChart = function(cssSelector, rawData, max) {
			var container = $element.find(cssSelector).get(0);
			if (container && rawData) {
				var mapChart = new google.visualization.GeoChart(container);
				mapChart.draw(getDataTableForData(rawData), {
					colorAxis : {
						colors : [ '#' + getColorStringForPercentage(0),
								'#' + getColorStringForPercentage(1) ],
						maxValue : max
					},
					legend : {
						textStyle : {
							color : 'blue',
							fontSize : 1
						}
					}
				// backgroundColor : "transparent"
				});
			}
		};

		drawMapPieChart = function(cssSelector, rawData) {
			var container = $element.find(cssSelector).get(0)
			if (container && rawData) {
				var pieChart = new google.visualization.PieChart(container);

				var colors = [];
				for ( var i = 0; i <= rawData.length; i++) {
					colors.push(getColorStringForPercentage(1 - i
							/ rawData.length));
				}

				pieChart.draw(getDataTableForData(rawData), {
					colors : colors,
					backgroundColor : "transparent",
					// legend : {position : "none"},
					chartArea : {
						left : 10,
						top : 10,
						width : 240,
						height : 240
					}
				});
			}
		};

		prepareCountryStats = function() {
			stats.data.countryPieData = [];
			stats.data.totalCount = 0;

			var percentAboveThreshold = 0, countAboveThreshold = 0, otherCountriesValue = 0;
			if (stats.data.countries) {
				totalCountries = stats.data.countries.length;
				$.each(stats.data.countries, function(index, value) {
					stats.data.totalCount += value[1];
				});
				$.each(stats.data.countries, function(index, value) {
					var percent = value[1] / stats.data.totalCount * 100;
					value[2] = value[1] + " ("
							+ (Math.round(percent * 10) / 10) + "%)";
					if (percent >= 1) {
						percentAboveThreshold += percent;
						countAboveThreshold++;
						stats.data.countryPieData.push([ value[0]["f"],
								value[1], "aaa" ]);
					}
				});
				otherCountriesValue = Math
						.round((1 - percentAboveThreshold / 100)
								* stats.data.totalCount);
			}

			if (stats.data.countriesRelative) {
				totalCountries = stats.data.countriesRelative.length;
				$.each(stats.data.countriesRelative, function(index, value) {
					if (value.length == 1) {
						value[1] = 1;
						value[2] = "less then 1% of all users";
					} else {
						value[2] = value[1] + "% of all users";
						percentAboveThreshold += value[1];
						countAboveThreshold++;
						stats.data.countryPieData.push(value);
					}
				});
				otherCountriesValue = Math.round(100 - percentAboveThreshold);
			}

			if (percentAboveThreshold < 99) {
				stats.data.countryPieData.push([
						{
							"f" : (totalCountries - countAboveThreshold)
									+ " others countries",
							"v" : "XX"
						}, otherCountriesValue, "---" ]);
			}
		};

		// helper functions
		getColorStringForPercentage = function(value) {
			return componentToHex(config.startColor[0]
					- (config.startColor[0] - config.endColor[0])
					* Math.min(value, 1))
					+ componentToHex(config.startColor[1]
							- (config.startColor[1] - config.endColor[1])
							* Math.min(value, 1))
					+ componentToHex(config.startColor[2]
							- (config.startColor[2] - config.endColor[2])
							* Math.min(value, 1));
		};

		componentToHex = function(c) {
			var hex = Math.round(c).toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		};

		init();
		// return {};
	});

	$.fn.wifisStats = function(stats) {
		if (typeof stats !== 'undefined') {
			new WifisStats($(this), stats);
		}
		return this;
	};

})(jQuery);