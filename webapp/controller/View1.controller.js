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
	"sap/ui/model/type/String",
	"sap/ui/layout/HorizontalLayout",
	"sap/ui/layout/VerticalLayout",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/core/ValueState"
], function (Controller, JSONModel, ColumnListItem, Label, Token, MessageToast, SearchField, Filter, FilterOperator, typeString,
	HorizonalLayout, VerticalLayout, Dialog, DialogType, Button, ButtonType, Text, ValueState) {

	"use strict";

	async function obtenerPuntoMedicion(punto, context) {
		return new Promise(function (resolve, reject) {

			const routes = context.getOwnerComponent().getModel("routesJson").getData().routes;
			const oResourceBundle = context.getView().getModel("i18n").getResourceBundle();
			const errorMsg = oResourceBundle.getText("serviceErrorMsg");

			const oDataModelIV = new sap.ui.model.odata.ODataModel(routes.service, {
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

			oDataModelIV.read(routes.puntoMedidaInd, {
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

	async function verificarLimites(punto, valorMedido, documento, context) {
		return new Promise(function (resolve, reject) {

			const routes = context.getOwnerComponent().getModel("routesJson").getData().routes;
			const oResourceBundle = context.getView().getModel("i18n").getResourceBundle();
			const errorMsg = oResourceBundle.getText("serviceErrorMsg");

			let response = {
				"crearAviso": false,
				"mensaje": ""
			};

			const oDataModelIV = new sap.ui.model.odata.ODataModel(routes.service, {
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

			oDataModelIV.read(routes.verificarLimites + "(PuntoMedida='" + punto + "',ValorMedido='" + valorMedido + "',Documento='" + documento +
				"')", {
					success: function (res) {
						if (res.CrearAviso) {
							response.crearAviso = true;
							resolve(response);
						} else {
							response.crearAviso = false;
							response.mensaje = "No crear aviso";
							resolve(response);
						}
					},
					error: function () {
						response.crearAviso = false;
						response.mensaje = "Error verificando limites";
						reject(response);
					}
				});

		});
	}

	async function successMesagge(mensaje, context) {
		return new Promise(function (resolve, reject) {
			try {
				context.oMessageMedicion = new Dialog({
					type: DialogType.Message,
					title: "Éxito",
					state: ValueState.Success,
					content: new Text({
						text: mensaje
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							resolve("OK");
							context.oMessageMedicion.close();
						}
					})
				});
				context.oMessageMedicion.open();
			} catch (err) {
				reject(err);
			}
		});
	}

	function errorMesagge(mensaje, context) {
		return new Promise(function (resolve, reject) {
			try {
				context.oMessageMedicion = new Dialog({
					type: DialogType.Message,
					title: "Error",
					state: ValueState.Error,
					content: new Text({
						text: mensaje
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "OK",
						press: function () {
							resolve("OK");
							context.oMessageMedicion.close();
						}
					})
				});
				context.oMessageMedicion.open();
			} catch (err) {
				reject(err);
			}
		});
	}

	async function avisoPopUp(context) {
		return new Promise(function (resolve, reject) {
			let resUser;
			try {
				context.oApproveDialog = new Dialog({
					type: DialogType.Message,
					title: "Creacion de aviso",
					content: new Text({
						text: "Valor de medida fuera de los límites esperados ¿desea generar un aviso?"
					}),
					beginButton: new Button({
						type: ButtonType.Emphasized,
						text: "Crear Aviso",
						press: function () {
							resUser = true;
							context.oApproveDialog.close();
							resolve(resUser);
						}
					}),
					endButton: new Button({
						text: "No crear aviso",
						press: function () {
							resUser = false;
							context.oApproveDialog.close();
							resolve(resUser);
						}
					})
				});
				context.oApproveDialog.open();
			} catch (err) {
				reject(err);
			}
		});
	}

	async function crearDocumentoMedida(punto, valorMedido, context) {

		return new Promise(function (resolve, reject) {

			const routes = context.getOwnerComponent().getModel("routesJson").getData().routes;
			const oResourceBundle = context.getView().getModel("i18n").getResourceBundle();
			const errorMsg = oResourceBundle.getText("serviceErrorMsg");

			let response = {
				"documento": "",
				"mensaje": ""
			};

			const oDataModelIV = new sap.ui.model.odata.ODataModel(routes.service, {
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

			oDataModelIV.read(routes.crearDocMedicion + "(PuntoMedida='" + punto + "',ValorMedido='" + valorMedido + "')", {
				success: function (res) {
					if (res.Documento) {
						response.documento = res.Documento;
						response.mensaje = "Documento de medida " + res.Documento + " creado correctamente";
						resolve(response);
					} else {
						response.mensaje = "Error al crear el documento de medida";
						reject(response);
					}
				},
				error: function (err) {
					console.log(err);
					response.mensaje = "Error al crear el documento de medida";
					reject(response);
				}
			});

		});

	}
	async function crearDocumentoAviso(punto, valorMedido, equipo, context) {
		return new Promise(function (resolve, reject) {

			const routes = context.getOwnerComponent().getModel("routesJson").getData().routes;

			let response = {
				"documento": "",
				"mensaje": ""
			};

			const oDataModelIV = new sap.ui.model.odata.ODataModel(routes.service, {
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

			oDataModelIV.read(routes.crearAviso + "(Equipo='" + equipo + "',PuntoMedida='" + punto + "',ValorMedido='" + valorMedido + "')", {
				success: function (res) {
					if (res.Aviso) {
						response.documento = res.Aviso;
						response.mensaje = "Aviso " + res.Aviso + " creado correctamente";
						resolve(response);
					} else {
						response.mensaje = "Error al crear aviso";
						reject(response);
					}
				},
				error: function (err) {
					console.log(err);
					response.mensaje = "Error al crear aviso";
					reject(response);
				}
			});

		});
	}

	return Controller.extend("punto_medicion_individual.punto_medicion_individual.controller.View1", {

		onInit: function () {
			const routes = this.getOwnerComponent().getModel("routesJson").getData().routes;
			this.byId("btnCrearDocumento").setEnabled(false);
			this._oInput = this.getView().byId("puntoMedida");
			this.oColModel = new JSONModel(sap.ui.require.toUrl(routes.modelColumnRoot) + "/columnsModel.json");
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

			const routes = this.getOwnerComponent().getModel("routesJson").getData().routes;
			this._oBasicSearchField = new SearchField({
				showSearchButton: false
			});

			let aCols = this.oColModel.getData().cols;
			this._oValueHelpDialog = sap.ui.xmlfragment(routes.fragmentPath, this);
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
					oTable.bindAggregation("rows", routes.puntosMedidaF4);
				}

				if (oTable.bindItems) {
					oTable.bindAggregation("items", routes.puntosMedidaF4, function () {
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

		onCrearDocumentoMedicion: async function () {
			let that = this;
			let crearAviso;
			const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			const emptyErrorMsg = oResourceBundle.getText("msgCampoPuntoMedidaEmpty");
			let valorMedido = this.byId("valorMedido").getValue();
			valorMedido = Number(valorMedido.replace(/[^0-9.-]+/g, ""));
			let puntoMedida = this.byId("puntoMedida").getValue().split("(")[0].trim();
			let equipo = this.byId("equipo").getValue();

			if (!puntoMedida) {
				MessageToast.show(emptyErrorMsg);
				return;
			}

			try {
				const documentoMedida = await crearDocumentoMedida(puntoMedida, valorMedido, that);
				const limitesResponse = await verificarLimites(puntoMedida, valorMedido, documentoMedida.documento, that);
				const notificarAviso = limitesResponse.crearAviso ? true : false;

				if (notificarAviso) {
					crearAviso = await avisoPopUp(that);
				}

				await successMesagge(documentoMedida.mensaje, that);

				if (crearAviso) {
					const documentoAviso = await crearDocumentoAviso(puntoMedida, valorMedido, equipo, that);
					await successMesagge(documentoAviso.mensaje, that);
				}
			} catch (err) {
				await errorMesagge(err.mensaje, that);
			}
			this.clearFormFileds();
		},

		fillFormData: async function () {

			let that = this;
			let puntoMedida = this.byId("puntoMedida").getValue().split("(")[0].trim();
			let formDescripcion = this.byId("descripcion");
			let formPosicionMedida = this.byId("posMedida");
			let formUnidad = this.byId("unidad");
			let formObjetoPuntoMedida = this.byId("objPuntoMedida");
			let formEquipo = this.byId("equipo");
			try {
				const oData = await obtenerPuntoMedicion(puntoMedida, that);
				let result = oData.results[0];
				formDescripcion.setValue(result.Descripcion);
				formPosicionMedida.setValue(result.PosicionMedida);
				formUnidad.setValue(result.Unidad);
				formObjetoPuntoMedida.setValue(result.ObjetoPtoMedida);
				formEquipo.setValue(result.Equipo);
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

		clearFormFileds: function () {
			this.byId("puntoMedida").setValue("");
			this.byId("descripcion").setValue("");
			this.byId("posMedida").setValue("");
			this.byId("unidad").setValue("");
			this.byId("objPuntoMedida").setValue("");
			this.byId("valorMedido").setValue("");
			this.byId("equipo").setValue("");
			this.byId("btnCrearDocumento").setEnabled(false);
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