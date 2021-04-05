sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/Token",
	"sap/m/MessageToast",
	"sap/m/SearchField",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/type/String"
], function (Controller, JSONModel, ColumnListItem, Label, Token, MessageToast, SearchField, Filter, FilterOperator, typeString) {
	"use strict";

	async function obtenerPuntoMedicion(punto, context) {
		return new Promise(function (resolve, reject) {

			const oResourceBundle = context.getView().getModel("i18n").getResourceBundle();
			const service = oResourceBundle.getText("service");
			const puntoMedicionSet = oResourceBundle.getText("getPuntoMedida");
			const errorMsg = oResourceBundle.getText("errorMsg");

			const oDataModelIV = new sap.ui.model.odata.ODataModel(service, {
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

			let puntoMedida = new sap.ui.model.Filter({
				path: "PuntoMedida",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: punto
			});

			oDataModelIV.read(puntoMedicionSet, {
				filters: [puntoMedida],
				success: function (res) {
					resolve(res);
				},
				error: function () {
					reject(errorMsg);
				}
			});
		});
	}

	return Controller.extend("punto_medicion_individual.punto_medicion_individual.controller.View1", {

		onInit: function () {

			const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			const colModelRoot = oResourceBundle.getText("modelColumnRoot");

			this.byId("btnCrearDocumento").setEnabled(false);
			this._oInput = this.getView().byId("puntoMedida");
			this.oColModel = new JSONModel(sap.ui.require.toUrl(colModelRoot) + "/columnsModel.json");
		},

		onFilterBarSearch: function (oEvent) {
			let aSelectionSet = oEvent.getParameter("selectionSet");
			let aFilters = aSelectionSet.reduce(function (aResult, oControl) {
				if (oControl.getValue()) {
					aResult.push(new Filter({
						path: oControl.getName(),
						operator: FilterOperator.EQ,
						value1: oControl.getValue()
					}));
				}
				return aResult;
			}, []);
			this._filterTable(new Filter({
				filters: aFilters,
				and: true
			}));
		},

		onValueHelpRequested: function () {

			const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			const fragmentPath = oResourceBundle.getText("fragmentPath");
			const matchCode = oResourceBundle.getText("getMatchCode");

			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			let aCols = this.oColModel.getData().cols;
			this._oValueHelpDialog = sap.ui.xmlfragment(fragmentPath, this);
			this.getView().addDependent(this._oValueHelpDialog);

			this._oValueHelpDialog.setRangeKeyFields([{
				label: "Numero punto medicion",
				key: "NumPtoMedicion",
				type: "string",
				typeInstance: new typeString({}, {
					maxLength: 12
				})
			}]);

			var oFilterBar = this._oValueHelpDialog.getFilterBar();
			oFilterBar.setFilterBarExpanded(false);
			oFilterBar.setBasicSearch(this._oBasicSearchField);

			this._oValueHelpDialog.getTableAsync().then(function (oTable) {
				oTable.setModel(this.oProductsModel);
				oTable.setModel(this.oColModel, "columns");

				if (oTable.bindRows) {
					oTable.bindAggregation("rows", matchCode);
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", matchCode, function () {
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

			let oToken = new Token();
			oToken.setKey(this._oInput.getSelectedKey());
			oToken.setText(this._oInput.getValue());
			this._oValueHelpDialog.setTokens([oToken]);
			this._oValueHelpDialog.open();
		},

		onValorMedidoLiveChange: function () {
			let valorMedido = this.byId("valorMedido");
			let isNotEmpty = valorMedido.getValue();
			let btnCrearDoc = this.byId("btnCrearDocumento");
			let state = isNotEmpty ? true : false;
			btnCrearDoc.setEnabled(state);
		},

		onCrearDocumentoMedicion: function () {
			let puntoMedida = this.byId("puntoMedida").getValue().split("(")[0].trim();
			if (!puntoMedida) {
				MessageToast.show("Campo Punto de Medida no puede estar vacio");
				return;
			}
		},

		fillFormData: async function () {

			let that = this;
			let puntoMedida = this.byId("puntoMedida").getValue().split("(")[0].trim();
			let formDescripcion = this.byId("descripcion");
			let formPosicionMedida = this.byId("posMedida");
			let formUnidad = this.byId("unidad");
			let formObjetoPuntoMedida = this.byId("objPuntoMedida");

			try {
				const oData = await obtenerPuntoMedicion(puntoMedida, that);
				let result = oData.results[0];
				formDescripcion.setValue(result.Descripcion);
				formPosicionMedida.setValue(result.PosicionMedida);
				formUnidad.setValue(result.Unidad);
				formObjetoPuntoMedida.setValue(result.ObjetoPtoMedida);
			} catch (err) {
				MessageToast.show(err);
			}
		},

		onValueHelpOkPress: function (oEvent) {
			let aTokens = oEvent.getParameter("tokens");
			this._oInput.setSelectedKey(aTokens[0].getKey());
			this._oValueHelpDialog.close();
		},

		onValueHelpCancelPress: function () {
			this._oValueHelpDialog.close();
		},

		onValueHelpAfterClose: function () {
			this._oValueHelpDialog.destroy();
			let puntoMedida = this.byId("puntoMedida").getValue().split("(")[0].trim();
			if (puntoMedida) {
				this.fillFormData();
			}
		},

		_filterTable: function (oFilter) {
			var oValueHelpDialog = this._oValueHelpDialog;

			oValueHelpDialog.getTableAsync().then(function (oTable) {
				if (oTable.bindRows) {
					oTable.getBinding("rows").filter(oFilter);
				}

				if (oTable.bindItems) {
					oTable.getBinding("items").filter(oFilter);
				}

				oValueHelpDialog.update();
			});
		}
		
	});
});