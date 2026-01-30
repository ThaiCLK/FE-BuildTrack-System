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
    "sap/m/TextArea",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/DatePicker",
    "sap/m/HBox"  // <--- QUAN TRỌNG: Thư viện bắt buộc để dùng HBox
], function (Controller, JSONModel, MessageBox, MessageToast, UIComponent, Dialog, Button, Label, Input, TextArea, Select, Item, DatePicker, HBox) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectManagement", {

        onInit: function () {
            // 1. Load dữ liệu giả
            var oModel = new JSONModel();
            oModel.loadData(sap.ui.require.toUrl("com/bts/zbts/model/mock_projects.json"));
            
            // Chạy logic kiểm tra ngày sau khi load data xong
            oModel.attachRequestCompleted(function() {
                this._checkAutoCloseProjects(oModel);
            }.bind(this));

            this.getView().setModel(oModel, "mock");

            // 2. Kích hoạt Router để xử lý thanh Toolbar (Tab Bar)
            var oRouter = UIComponent.getRouterFor(this);
            // Sử dụng đúng tên Route như code cũ của bạn
            oRouter.getRoute("RouteProjectManagement").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            // Hàm này đảm bảo khi vào trang, Tab "Project" sẽ được chọn sáng lên
            var oTabBar = this.byId("idTopMenuProject");
            if (oTabBar) { 
                oTabBar.setSelectedKey("project"); 
            }
        },

        onTabSelect: function (oEvent) {
            // Xử lý khi bấm vào các Tab (Daily Log, Report...)
            var sKey = oEvent.getParameter("key");
            if (sKey === "dailyLog") {
                this.getOwnerComponent().getRouter().navTo("RouteDailyLog");
            }
        },

        // --- LOGIC TỰ ĐỘNG ĐÓNG DỰ ÁN (AUTO-CLOSE) ---
        _checkAutoCloseProjects: function(oModel) {
            var oData = oModel.getData();
            if (!oData || !oData.Projects) return;

            var aProjects = oData.Projects;
            var oToday = new Date();
            var bChanged = false;

            aProjects.forEach(function(prj) {
                if (!prj.EndDate) return; // Bỏ qua nếu không có ngày kết thúc

                var dEnd = new Date(prj.EndDate);
                // Nếu quá hạn và chưa đóng -> Đóng luôn
                if (oToday > dEnd && prj.Status !== "Closed") {
                    prj.Status = "Closed";
                    bChanged = true;
                }
            });

            if (bChanged) {
                oModel.refresh();
                // Tắt thông báo popup để đỡ phiền, chỉ log vào console
                console.log("Auto-closed expired projects.");
            }
        },

        // --- POPUP TẠO MỚI (Đã sửa lỗi HBox và Layout) ---
        onAddProject: function () {
            var that = this;
            
            // Xóa dialog cũ để tránh lỗi ID trùng lặp
            if (this._oCreateDialog) {
                this._oCreateDialog.destroy();
                this._oCreateDialog = null;
            }

            this._oCreateDialog = new Dialog({
                title: "Create New Project",
                type: "Message",
                contentWidth: "600px", // Popup rộng rãi hơn
                content: [
                    new Label({ text: "Project Name", required: true }),
                    new Input("newProjectName", { placeholder: "e.g. Metro Line 3" }),
                    
                    new Label({ text: "Project Type" }),
                    new Select("newProjectType", {
                        width: "100%",
                        items: [
                            new Item({ key: "ROAD", text: "Road" }),
                            new Item({ key: "BRIDGE", text: "Bridge" }),
                            new Item({ key: "BUILDING", text: "Building" }),
                            new Item({ key: "TUNNEL", text: "Tunnel" }) 
                        ],
                        selectedKey: "ROAD"
                    }),

                    new Label({ text: "Timeline (Start - Est. End)" }),
                    // HBox giúp 2 ô ngày tháng nằm ngang hàng
                    new HBox({
                        alignItems: "Center",
                        items: [
                            new DatePicker("newStartDate", { 
                                width: "100%", 
                                placeholder: "Start Date", 
                                displayFormat: "yyyy-MM-dd", 
                                valueFormat: "yyyy-MM-dd",
                                change: function(oEvent) {
                                    // Tự động cộng 1 năm cho EndDate
                                    var sVal = oEvent.getParameter("value");
                                    if (sVal) {
                                        var dStart = new Date(sVal);
                                        var dEnd = new Date(dStart);
                                        dEnd.setFullYear(dEnd.getFullYear() + 1);
                                        var sEndVal = dEnd.toISOString().split("T")[0];
                                        sap.ui.getCore().byId("newEndDate").setValue(sEndVal);
                                    }
                                }
                            }),
                            new Label({ text: " - ", width: "2rem", textAlign: "Center" }),
                            new DatePicker("newEndDate", { 
                                width: "100%", 
                                placeholder: "Est. End Date", 
                                displayFormat: "yyyy-MM-dd", 
                                valueFormat: "yyyy-MM-dd" 
                            })
                        ]
                    }),

                    new Label({ text: "Location" }),
                    new Input("newLocation", { placeholder: "e.g. HCMC" })
                ],
                beginButton: new Button({
                    text: "Create",
                    type: "Emphasized",
                    press: function () { that._doCreateProject(); }
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () { that._oCreateDialog.close(); }
                }),
                afterClose: function() {
                    that._oCreateDialog.destroy();
                    that._oCreateDialog = null;
                }
            });

            this._oCreateDialog.open();
        },

        // --- XỬ LÝ LƯU DỰ ÁN ---
        _doCreateProject: function () {
            var sName = sap.ui.getCore().byId("newProjectName").getValue();
            var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
            var sLoc = sap.ui.getCore().byId("newLocation").getValue();
            var sStart = sap.ui.getCore().byId("newStartDate").getValue();
            var sEnd = sap.ui.getCore().byId("newEndDate").getValue();

            if (!sName) { MessageToast.show("Name is required!"); return; }
            
            // Xử lý ngày mặc định
            if (!sStart) sStart = new Date().toISOString().slice(0, 10);
            if (!sEnd) {
                var d = new Date(sStart);
                d.setFullYear(d.getFullYear() + 1);
                sEnd = d.toISOString().slice(0, 10);
            }

            // Tạo ID mới (Tự tăng)
            var oModel = this.getView().getModel("mock");
            var aProjects = oModel.getProperty("/Projects");
            var iMaxID = 0;
            aProjects.forEach(function(prj) {
                if (prj.ProjectID && prj.ProjectID.startsWith("PRJ-")) {
                    var iNum = parseInt(prj.ProjectID.split("-")[1], 10);
                    if (iNum > iMaxID) iMaxID = iNum;
                }
            });
            var sNextID = "PRJ-" + ("000" + (iMaxID + 1)).slice(-3);

            // Thêm vào danh sách
            var oNewProject = {
                "ProjectID": sNextID,
                "ProjectName": sName,
                "ProjectType": sType,
                "Location": sLoc || "TBD",
                "StartDate": sStart,
                "EndDate": sEnd, 
                "Status": "Planning", // Mặc định là Planning
                "WBS": []
            };

            aProjects.unshift(oNewProject);
            oModel.refresh();
            this._oCreateDialog.close();
            MessageToast.show("Created Project: " + sNextID);
        },

        // --- CÁC HÀM HỖ TRỢ KHÁC ---
        formatStatusState: function(sStatus) {
            switch (sStatus) {
                case "Active": return "Success";
                case "Reviewed": return "Warning";
                case "Planning": return "Information";
                case "Closed": return "None";
                default: return "None";
            }
        },

        formatProjectType: function(sType) {
            if (!sType) return "";
            return sType.charAt(0).toUpperCase() + sType.slice(1).toLowerCase();
        },

        onPressProject: function(oEvent) {
            var sProjectID = oEvent.getSource().getBindingContext("mock").getProperty("ProjectID");
            this.getOwnerComponent().getRouter().navTo("RouteProjectDetail", { projectID: sProjectID });
        },

        onDeleteProject: function(oEvent) {
             var oModel = this.getView().getModel("mock");
             var aProjects = oModel.getProperty("/Projects");
             var sPath = oEvent.getSource().getParent().getParent().getBindingContext("mock").getPath();
             var iIndex = parseInt(sPath.split("/").pop());
             
             MessageBox.confirm("Delete this project?", {
                onClose: function(oAction) {
                    if (oAction === "OK") { 
                        aProjects.splice(iIndex, 1); 
                        oModel.refresh(); 
                    }
                }
            });
        },
        
        onShowFullText: function(oEvent) {
            try { oEvent.cancelBubble(); } catch (e) {}
            var sText = oEvent.getSource().getText();
            MessageBox.information(sText, { title: "Full Details" });
        },
        
        onApproveStructure: function() {},
        onRejectStructure: function() {},
        onConfirmCheck: function() {}
    });
});