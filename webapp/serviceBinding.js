function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZPM_AMCR_PUNTO_MEDICION_INDIV_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}