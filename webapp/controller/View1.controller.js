sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Token",
	"sap/m/MessageToast"
], function (Controller, JSONModel, ColumnListItem, Label, Token, MessageToast) {
	"use strict";
	var url = "/sap/opu/odata/sap/ZPM_AMCR_PUNTO_MEDICION_INDIV_SRV/";

	function obtenerPuntoMedicion(punto) {
		return new Promise(function (resolve, reject) {

			var oDataModelIV = new sap.ui.model.odata.ODataModel(url, {
				json: true,
				headers: {
					"DataServiceVersion": "2.0",
					"Cache-Control": "no-cache, no-store",
					"Pragma": "no-cache"
				},
				metadataUrlParams: {
					"sap-lenguaje": "ES"
				},
				serviceUrlParams: {
					"sap-lenguaje": "ES"
				}
			});

			var puntoMedida = new sap.ui.model.Filter({
				path: "PuntoMedida",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: punto
			});

			oDataModelIV.read("/obtenerPuntoMedidaSet", {
				filters: [puntoMedida],
				success: function (res) {
					var oData = res;
					resolve(oData);
				},
				error: function () {
					this._showToast("Error obteniendo datos");
					MessageToast.show("Error obteniendo datos de transportes");
				}
			});
		});
	}

	return Controller.extend("punto_medicion_individual.punto_medicion_individual.controller.View1", {
		onInit: function () {
			this._oInput = this.getView().byId("puntoMedida");
			this.oColModel = new JSONModel(sap.ui.require.toUrl("punto_medicion_individual/punto_medicion_individual/util") +
				"/columnsModel.json");
		},
		onValueHelpRequested: function () {

			var aCols = this.oColModel.getData().cols;
			this._oValueHelpDialog = sap.ui.xmlfragment("punto_medicion_individual.punto_medicion_individual.fragments.MatchCode", this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oProductsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", "/puntosMedidaSet");
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", "/puntosMedidaSet", function () {
						return new ColumnListItem({
							cells: aCols.map(function (column) {
								return new Label({
									text: "{" + column.template + "}"
								});
							})
						});
					});
				}

				this._oValueHelpDialog.update();
			}.bind(this));

			var oToken = new Token();
			oToken.setKey(this._oInput.getSelectedKey());
			oToken.setText(this._oInput.getValue());
			this._oValueHelpDialog.setTokens([oToken]);
			this._oValueHelpDialog.open();
		},
		fillFormData: function () {
			var puntoMedida = this.byId("puntoMedida").getValue().split("(")[0].trim();
			obtenerPuntoMedicion(puntoMedida).then(function (res) {
				console.log(res)
			});
		},
		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oInput.setSelectedKey(aTokens[0].getKey());
			this._oValueHelpDialog.close();
		},
		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},
		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
			this.fillFormData();
		}
	});
});