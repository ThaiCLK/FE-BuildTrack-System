sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/DatePicker",
    "sap/m/HBox"  
], function (Controller, JSONModel, MessageBox, MessageToast, UIComponent, Dialog, Button, Label, Input, Select, Item, DatePicker, HBox) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectManagement", {

        onInit: function () {
            // 1. KHỞI TẠO MOCK DATA CHO DANH SÁCH DỰ ÁN
            var oData = {
                ProjectSet: [
                    { ProjectId: "PRJ-001", ProjectCode: "PRJ-001", ProjectName: "Cầu vượt biển Tân Vũ", ProjectType: "BRIDGE", StartDate: new Date("2026-01-01"), EndDate: new Date("2026-12-31"), Status: "ACTIVE" },
                    { ProjectId: "PRJ-002", ProjectCode: "PRJ-002", ProjectName: "Cao tốc Bắc Nam - GĐ1", ProjectType: "ROAD", StartDate: new Date("2025-06-15"), EndDate: new Date("2027-06-15"), Status: "PLANNING" },
                    { ProjectId: "PRJ-003", ProjectCode: "PRJ-003", ProjectName: "Chung cư cao cấp S1", ProjectType: "BUILDING", StartDate: new Date("2025-01-01"), EndDate: new Date("2025-12-31"), Status: "CLOSED" },
                    { ProjectId: "PRJ-004", ProjectCode: "PRJ-004", ProjectName: "Hầm đường bộ đèo Cả", ProjectType: "TUNNEL", StartDate: new Date("2026-02-01"), EndDate: new Date("2028-02-01"), Status: "ACTIVE" },
                    { ProjectId: "PRJ-005", ProjectCode: "PRJ-005", ProjectName: "Sân bay quốc tế Long Thành", ProjectType: "ROAD", StartDate: new Date("2024-01-01"), EndDate: new Date("2030-01-01"), Status: "ACTIVE" }
                ]
            };

            // Set Model cục bộ (không dùng OData Model nữa)
            var oModel = new JSONModel(oData);
            this.getView().setModel(oModel); // Set làm default model cho View này
        },

        // --- FORMATTERS ---
        formatStatusText: function(sStatus) {
            if (!sStatus) return "";
            var map = { "ACTIVE": "Đang thực hiện", "PLANNING": "Đang lập kế hoạch", "CLOSED": "Đã đóng" };
            return map[sStatus] || sStatus;
        },

        formatStatusState: function(sStatus) {
            switch (sStatus) {
                case "ACTIVE": return "Success";      
                case "PLANNING": return "Information"; 
                case "CLOSED": return "Error";        
                default: return "None";
            }
        },
        
        formatProjectType: function(sType) {
             var map = { "ROAD": "Đường bộ", "BRIDGE": "Cầu", "BUILDING": "Xây dựng dân dụng", "TUNNEL": "Hầm" };
             return map[sType] || sType;
        },

        // --- NAVIGATION ---
        onPressProject: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var sProjectID = oCtx.getProperty("ProjectId"); 
            
            this.getOwnerComponent().getRouter().navTo("RouteProjectDetail", {
                projectID: sProjectID 
            });
        },
        
        // --- ADD PROJECT (MOCK) ---
        onAddProject: function () {
             var that = this;
            if (this._oCreateDialog) {
                this._oCreateDialog.destroy();
                this._oCreateDialog = null;
            }
            this._oCreateDialog = new Dialog({
                title: "Tạo dự án mới (Mock)",
                type: "Message",
                contentWidth: "500px",
                content: [
                    new Label({ text: "Tên dự án", required: true }),
                    new Input("newProjectName", { placeholder: "Ví dụ: Metro Line 3" }),
                    new Label({ text: "Loại dự án" }),
                    new Select("newProjectType", {
                        width: "100%",
                        items: [
                            new Item({ key: "ROAD", text: "Đường bộ" }),
                            new Item({ key: "BRIDGE", text: "Cầu" }),
                            new Item({ key: "BUILDING", text: "Xây dựng" }),
                            new Item({ key: "TUNNEL", text: "Hầm" }) 
                        ],
                        selectedKey: "ROAD"
                    }),
                    new Label({ text: "Thời gian (Bắt đầu - Kết thúc)" }),
                    new HBox({
                        alignItems: "Center",
                        items: [
                            new DatePicker("newStartDate", { width: "100%", placeholder: "Bắt đầu", displayFormat: "dd/MM/yyyy", valueFormat: "yyyy-MM-dd" }),
                            new Label({ text: " - ", width: "2rem", textAlign: "Center" }),
                            new DatePicker("newEndDate", { width: "100%", placeholder: "Kết thúc", displayFormat: "dd/MM/yyyy", valueFormat: "yyyy-MM-dd" })
                        ]
                    })
                ],
                beginButton: new Button({ text: "Tạo", type: "Emphasized", press: function () { that._doCreateProject(); } }),
                endButton: new Button({ text: "Hủy", press: function () { that._oCreateDialog.close(); } })
            });
            this._oCreateDialog.open();
        },

        _doCreateProject: function () {
            var sName = sap.ui.getCore().byId("newProjectName").getValue();
            var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
            var sStart = sap.ui.getCore().byId("newStartDate").getValue(); 
            var sEnd = sap.ui.getCore().byId("newEndDate").getValue();

            if (!sName) { MessageToast.show("Vui lòng nhập tên dự án!"); return; }

            // Thêm vào Model JSON cục bộ
            var oModel = this.getView().getModel();
            var aProjects = oModel.getProperty("/ProjectSet");
            
            var oNewProject = {
                ProjectId: "PRJ-" + (aProjects.length + 1).toString().padStart(3, '0'), // Fake ID
                ProjectCode: "PRJ-" + (aProjects.length + 1).toString().padStart(3, '0'),
                ProjectName: sName,
                ProjectType: sType,
                Status: "PLANNING", 
                StartDate: sStart ? new Date(sStart) : new Date(),
                EndDate: sEnd ? new Date(sEnd) : null
            };

            aProjects.push(oNewProject);
            oModel.setProperty("/ProjectSet", aProjects);

            MessageToast.show("Đã tạo dự án thành công (Mock)!");
            this._oCreateDialog.close();
        },

        // --- DELETE PROJECT (MOCK) ---
        onDeleteProject: function(oEvent) {
            var oModel = this.getView().getModel();
            var sPath = oEvent.getSource().getBindingContext().getPath(); // /ProjectSet/0
            var iIndex = parseInt(sPath.split("/").pop());

            MessageBox.confirm("Bạn có chắc muốn xóa dự án này?", {
                onClose: function(oAction) {
                    if (oAction === "OK") { 
                        var aProjects = oModel.getProperty("/ProjectSet");
                        aProjects.splice(iIndex, 1); // Xóa khỏi mảng
                        oModel.setProperty("/ProjectSet", aProjects);
                        MessageToast.show("Đã xóa thành công!");
                    }
                }
            });
        },
        
        // --- EDIT PROJECT (MOCK) ---
        onEditProject: function(oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext();
            var oRowData = oContext.getObject();
            this._sEditPath = oContext.getPath();
            
            // Clone data để bind vào Dialog edit
            var oCloneData = JSON.parse(JSON.stringify(oRowData));
            // Fix lỗi ngày tháng khi clone JSON
            if (oRowData.StartDate) oCloneData.StartDate = new Date(oRowData.StartDate);
            if (oRowData.EndDate) oCloneData.EndDate = new Date(oRowData.EndDate);

            var oEditModel = new JSONModel(oCloneData);

            if (!this._oEditDialog) {
                this._oEditDialog = new Dialog({
                    title: "Cập nhật dự án",
                    type: "Message",
                    contentWidth: "500px",
                    content: [
                        new Label({ text: "Tên dự án", required: true }),
                        new Input({ value: "{edit>/ProjectName}" }),
                        new Label({ text: "Loại", required: true }),
                        new Select({
                            selectedKey: "{edit>/ProjectType}",
                            width: "100%",
                            items: [
                                new Item({ key: "ROAD", text: "Đường bộ" }),
                                new Item({ key: "BRIDGE", text: "Cầu" }),
                                new Item({ key: "BUILDING", text: "Xây dựng" }),
                                new Item({ key: "TUNNEL", text: "Hầm" })
                            ]
                        }),
                        new Label({ text: "Thời gian" }),
                        new HBox({
                            items: [
                                new DatePicker({ value: "{edit>/StartDate}", displayFormat:"dd/MM/yyyy", width: "100%" }),
                                new Label({ text: "-", width: "2rem", textAlign: "Center" }),
                                new DatePicker({ value: "{edit>/EndDate}", displayFormat:"dd/MM/yyyy", width: "100%" })
                            ]
                        })
                    ],
                    beginButton: new Button({ text: "Lưu", type: "Emphasized", press: function() { that._doUpdateProject(); } }),
                    endButton: new Button({ text: "Hủy", press: function() { that._oEditDialog.close(); } })
                });
            }
            this._oEditDialog.setModel(oEditModel, "edit");
            this._oEditDialog.open();
        },

        _doUpdateProject: function() {
            var oEditModel = this._oEditDialog.getModel("edit");
            var oUpdatedData = oEditModel.getData();
            var oModel = this.getView().getModel(); 

            // Cập nhật lại vào Model chính
            oModel.setProperty(this._sEditPath + "/ProjectName", oUpdatedData.ProjectName);
            oModel.setProperty(this._sEditPath + "/ProjectType", oUpdatedData.ProjectType);
            oModel.setProperty(this._sEditPath + "/StartDate", oUpdatedData.StartDate);
            oModel.setProperty(this._sEditPath + "/EndDate", oUpdatedData.EndDate);

            MessageToast.show("Cập nhật thành công!");
            this._oEditDialog.close();
        }
    });
});