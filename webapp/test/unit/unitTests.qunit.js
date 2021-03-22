/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"punto_medicion_individual/punto_medicion_individual/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});