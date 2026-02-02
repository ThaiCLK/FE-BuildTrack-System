sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/bts/zbts/controller/delegate/WBSDelegate" // Import Delegate
], function (Controller, JSONModel, MessageToast, MessageBox, History, WBSDelegate) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectDetail", {

        onInit: function () {
            // 1. Khởi tạo Delegate và truyền 'this' (Controller) vào để Delegate có thể truy cập View/Model
            this._wbsDelegate = new WBSDelegate(this);

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sProjectID = oEvent.getParameter("arguments").projectID;
            this._loadProjectData(sProjectID);
        },

        _loadProjectData: function (sProjectID) {
            var oMainModel = this.getOwnerComponent().getModel("mock");
            var aProjects = oMainModel.getProperty("/Projects");
            var oSelectedProject = aProjects.find(function (project) {
                return project.ProjectID === sProjectID;
            });

            if (!oSelectedProject) {
                MessageToast.show("Project not found!");
                return;
            }

            // Clone dữ liệu để xử lý cục bộ
            var oProjectData = JSON.parse(JSON.stringify(oSelectedProject));

            // Convert chuỗi ngày tháng sang Object (Để DatePicker và tính toán hoạt động)
            this._convertDateStringsToObjects(oProjectData.WBS);

            // Logic kiểm tra trạng thái CLOSED (Logic nghiệp vụ)
            if (oProjectData.EndDate) {
                var oEndDate = new Date(oProjectData.EndDate);
                var oToday = new Date();
                if (oEndDate < oToday) {
                    oProjectData.Status = "CLOSED";
                }
            }

            // --- [QUAN TRỌNG] GỌI DELEGATE ĐỂ CHUẨN BỊ DỮ LIỆU GANTT ---
            // Delegate sẽ tính toán ngày bắt đầu/kết thúc biểu đồ, độ rộng, và TimeScale
            var oGanttData = this._wbsDelegate.prepareGanttData(oProjectData.WBS);

            // --- CẤU HÌNH VIEW ---
            var sUserRole = this.getOwnerComponent().getModel("userInfo").getProperty("/role");
            
            var oViewConfig = {
                // Config cho Gantt Chart (Lấy từ kết quả tính toán của Delegate)
                chartStartDate: oGanttData.chartStartDate,
                chartEndDate: oGanttData.chartEndDate,
                timeScale: oGanttData.timeScale,
                totalWidth: oGanttData.totalWidth,
                pixelsPerDay: oGanttData.pixelsPerDay, // Binding biến này để Trigger Zoom

                // Config hiển thị nút bấm
                visible: {
                    wbsSection: true,
                    btnCommanderApprove: false,
                    btnConsultantApprove: false
                },
                editable: {
                    generalInfo: false
                }
            };

            // Logic phân quyền (Giữ nguyên)
            if (oProjectData.Status === "CLOSED") {
                oViewConfig.visible.btnCommanderApprove = false;
                oViewConfig.visible.btnConsultantApprove = false;
                oViewConfig.editable.generalInfo = false;
            } else {
                if (sUserRole === "CONSULTANT" && oProjectData.Status === "PLANNING") {
                    oViewConfig.visible.wbsSection = false;
                }
                if ((sUserRole === "ENGINEER" || sUserRole === "ADMIN") && oProjectData.Status === "PLANNING") {
                    oViewConfig.editable.generalInfo = true;
                }
                if ((sUserRole === "COMMANDER" || sUserRole === "ADMIN") && oProjectData.Status === "PLANNING") {
                    oViewConfig.visible.btnCommanderApprove = true;
                }
                if ((sUserRole === "CONSULTANT" || sUserRole === "ADMIN") && oProjectData.Status === "REVIEWED") {
                    oViewConfig.visible.btnConsultantApprove = true;
                }
            }

            // Set Models
            var oViewModel = new JSONModel(oProjectData);
            this.getView().setModel(oViewModel, "viewData");

            var oConfigModel = new JSONModel(oViewConfig);
            this.getView().setModel(oConfigModel, "viewConfig");
        },

        // Helper: Convert Date String -> Object
        _convertDateStringsToObjects: function(aNodes) {
            if (!aNodes) return;
            var that = this;
            aNodes.forEach(function(node) {
                if (node.StartDate && typeof node.StartDate === 'string') node.StartDate = new Date(node.StartDate);
                if (node.EndDate && typeof node.EndDate === 'string') node.EndDate = new Date(node.EndDate);
                if (node.children) that._convertDateStringsToObjects(node.children);
            });
        },

        // ============================================================
        // BRIDGE METHODS: GANTT CHART & ZOOM (Gọi sang Delegate)
        // ============================================================

        /**
         * Formatter: Tính độ rộng thanh Gantt
         * XML gọi: .calcWidth(...)
         */
        calcWidth: function(dStart, dEnd, iPixelsPerDay) {
            return this._wbsDelegate.calcWidth(dStart, dEnd, iPixelsPerDay);
        },

        /**
         * Formatter: Tính lề trái thanh Gantt
         * XML gọi: .calcMargin(...)
         */
        calcMargin: function(dStart, dChartStart, iPixelsPerDay) {
            return this._wbsDelegate.calcMargin(dStart, dChartStart, iPixelsPerDay);
        },

        /**
         * Action: Zoom In
         */
        onZoomIn: function() {
            this._wbsDelegate.onZoomIn();
        },

        /**
         * Action: Zoom Out
         */
        onZoomOut: function() {
            this._wbsDelegate.onZoomOut();
        },

        /**
         * Action: Thêm Task mới
         */
        onAddNewTask: function() {
            this._wbsDelegate.onAddNewTask();
        },

        /**
         * Action: Khi thay đổi ngày trên DatePicker -> Cập nhật lại biểu đồ
         */
        onDateChange: function() {
            this._wbsDelegate.onDateChange();
        },

        // ============================================================
        // LOGIC CHUNG (Approve, Reject, NavBack...) - Không cần Delegate
        // ============================================================

        onCommanderApprove: function() {
            var oModel = this.getView().getModel("viewData");
            var oConfigModel = this.getView().getModel("viewConfig");
            var sUserRole = this.getOwnerComponent().getModel("userInfo").getProperty("/role");

            MessageBox.confirm("Approve plan and submit to Consultant (Status: REVIEWED)?", {
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        oModel.setProperty("/Status", "REVIEWED");
                        oConfigModel.setProperty("/visible/btnCommanderApprove", false);
                        
                        if (sUserRole === "ADMIN") {
                            oConfigModel.setProperty("/visible/btnConsultantApprove", true);
                            MessageToast.show("Moved to REVIEWED. Admin can continue.");
                        } else {
                            MessageToast.show("Approved! Waiting for Consultant.");
                        }
                    }
                }
            });
        },

        onConsultantApprove: function() {
            var oModel = this.getView().getModel("viewData");
            var oConfigModel = this.getView().getModel("viewConfig");

            MessageBox.confirm("Final approval? Project will become ACTIVE.", {
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        oModel.setProperty("/Status", "ACTIVE");
                        oConfigModel.setProperty("/visible/btnConsultantApprove", false);
                        MessageToast.show("Project is now ACTIVE!");
                    }
                }
            });
        },

        onReject: function() {
            MessageToast.show("Project Rejected (Logic not implemented yet)");
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteProjectManagement", {}, true);
            }
        },

        // Formatter Status (Thuần View, giữ tại Controller)
        formatStatusText: function(sStatus) {
            if (!sStatus) return "";
            return sStatus.charAt(0).toUpperCase() + sStatus.slice(1).toLowerCase();
        },
        formatStatusState: function(sStatus) {
            if (!sStatus) return "None";
            switch (sStatus.toUpperCase()) {
                case "ACTIVE": return "Success";       
                case "PLANNING": return "Information"; 
                case "REVIEWED": return "Warning";     
                case "CLOSED": return "Error";         
                default: return "None";
            }
        },
        formatStatusIcon: function(sStatus) {
            if (sStatus && sStatus.toUpperCase() === "CLOSED") {
                return "sap-icon://locked";
            }
            return "";
        },
        // com/bts/zbts/controller/ProjectDetail.controller.js

onSaveProject: function() {
    // Gọi hàm xử lý bên Delegate để giữ Controller gọn gàng
    this._wbsDelegate.onSaveProject();
},
onDeleteTask: function() {
    this._wbsDelegate.onDeleteTask();
},
    });
});