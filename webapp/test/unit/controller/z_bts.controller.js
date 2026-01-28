/*global QUnit*/

sap.ui.define([
	"com/bts/zbts/controller/z_bts.controller"
], function (Controller) {
	"use strict";

	QUnit.module("z_bts Controller");

	QUnit.test("I should test the z_bts controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
