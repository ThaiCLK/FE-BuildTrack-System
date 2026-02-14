sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.App", {
        onInit: function () {
            // MOCK: Bỏ qua gọi Backend, set cứng quyền Admin
            var oUserModel = this.getOwnerComponent().getModel("userInfo");
            
            // Giả lập dữ liệu user
            oUserModel.setData({
                username: "Mock User (Admin)",
                canCreateProject: true,
                canReviewStructure: true,
                canCheckScope: true,
                isManager: true
            });

            // Điều hướng ngay lập tức vào trang danh sách dự án
            this.getOwnerComponent().getRouter().navTo("RouteProjectManagement");
        }
    });
});