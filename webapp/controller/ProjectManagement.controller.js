sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent"
], function (Controller, JSONModel, MessageBox, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectManagement", {

        onInit: function () {
            // 1. Load dữ liệu giả (Giữ nguyên)
            var oModel = new JSONModel();
            oModel.loadData(sap.ui.require.toUrl("com/bts/zbts/model/mock_projects.json"));
            this.getView().setModel(oModel, "mock");

            // --- THÊM ĐOẠN NÀY ĐỂ FIX LỖI BẤM 2 LẦN ---
            // Lấy Router
            var oRouter = UIComponent.getRouterFor(this);
            // Bắt sự kiện: Mỗi khi router "RouteProjectManagement" được gọi, thì chạy hàm _onRouteMatched
            oRouter.getRoute("RouteProjectManagement").attachPatternMatched(this._onRouteMatched, this);
        },

        // --- HÀM MỚI: Tự động reset Tab về "Project" khi vào trang này ---
        _onRouteMatched: function () {
            // Lấy cái TabBar bằng ID (Đảm bảo ID trong View XML là idTopMenuProject)
            var oTabBar = this.byId("idTopMenuProject");
            if (oTabBar) {
                oTabBar.setSelectedKey("project"); // Ép chọn lại tab Project
            }
        },

        // --- Sự kiện chuyển Tab (Giữ nguyên) ---
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            if (sKey === "dailyLog") {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteDailyLog");
            }
        },

        // ... (Các hàm Thêm/Sửa/Xóa giữ nguyên không đổi) ...
        onAddProject: function () { MessageToast.show("Chức năng Thêm mới!"); },
        onEditProject: function (oEvent) { MessageToast.show("Sửa"); },
        onDeleteProject: function (oEvent) { MessageToast.show("Xóa"); }
    });
});