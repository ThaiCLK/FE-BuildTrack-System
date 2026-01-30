sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], function (JSONModel, Device) {
    "use strict";

    return {
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        // --- THÊM ĐOẠN NÀY ---
        createUserInfoModel: function () {
            var oModel = new JSONModel({
                username: "",
                role: "", // Ví dụ: 'PM' hoặc 'EMP'
                isManager: false // Flag để ẩn hiện nút
            });
            return oModel;
        }
        // ---------------------
    };
});