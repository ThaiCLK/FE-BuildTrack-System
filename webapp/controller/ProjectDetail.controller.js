sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/bts/zbts/controller/delegate/WBSDelegate",
    "sap/ui/core/Fragment",
    "sap/ui/core/format/DateFormat"
], function (Controller, JSONModel, MessageToast, MessageBox, History, WBSDelegate, Fragment, DateFormat) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectDetail", {

        /* =========================================================== */
        /* LIFECYCLE METHODS                                           */
        /* =========================================================== */

        onInit: function () {
            // Khởi tạo Delegate để xử lý toàn bộ logic Gantt/WBS
            this._oWBSDelegate = new WBSDelegate(this);

            // Model cấu hình giao diện tổng thể
            var oViewConfig = new JSONModel({
                visible: { btnSave: true },
                totalWidth: "100%",
                timeScale: []
            });
            this.getView().setModel(oViewConfig, "viewConfig");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        /* =========================================================== */
        /* ROUTING & DATA LOADING                                      */
        /* =========================================================== */

        _onObjectMatched: function (oEvent) {
            var sProjectID = oEvent.getParameter("arguments").projectID;
            if (sProjectID) {
                this._loadProjectData(sProjectID);
            }
        },

        _loadProjectData: function (sProjectID) {
            var oView = this.getView();
            var oMainModel = this.getOwnerComponent().getModel();
            oView.setBusy(true);

            var sPath = "/ProjectSet(ProjectId=guid'" + sProjectID + "')";

            oMainModel.read(sPath, {
                urlParameters: { "$expand": "NavWBS/NavWBSPlan" },
                success: function (oData) {
                    oView.setBusy(false);

                    /* --- PHẦN WBS LOGIC: Đã chuyển sang Delegate --- */
                    var aFlatWBS = (oData.NavWBS && oData.NavWBS.results) ? oData.NavWBS.results : [];
                    var aTreeData = this._transformToTree(aFlatWBS); // Chuyển đổi dữ liệu cây

                    // Model hiển thị dữ liệu lên màn hình
                    var oDetailModel = new JSONModel({
                        ProjectId: oData.ProjectId || "",
                        ProjectCode: oData.ProjectCode || "",
                        ProjectName: oData.ProjectName || "",
                        WBS: aTreeData || []
                    });
                    oView.setModel(oDetailModel, "viewData");

                    // Tính toán Gantt thông qua Delegate
                    try {
                        var oGanttConfig = this._oWBSDelegate.prepareGanttData(aTreeData);
                        this.getView().getModel("viewConfig").setData(oGanttConfig, true);
                    } catch (e) {
                        console.error("Gantt computation failed:", e);
                    }
                    /* ----------------------------------------------- */

                }.bind(this),
                error: function () {
                    oView.setBusy(false);
                    MessageBox.error("Không thể tải dữ liệu dự án.");
                }
            });
        },

        /**
         * Chuyển đổi OData Results thành cấu trúc lồng nhau
         * (Note: Có thể move hàm này vào Delegate nếu muốn Controller sạch hơn nữa)
         */
        _transformToTree: function (arr) {
            var nodes = {};
            var tree = [];
            arr.forEach(function (obj) {
                var aPlans = [];
                if (obj.NavWBSPlan && obj.NavWBSPlan.results) {
                    aPlans = obj.NavWBSPlan.results.map(function (plan) {
                        return Object.assign({}, plan, {
                            Type: 'PLAN',
                            DisplayName: plan.WbsPlanName || "No Title",
                            CustomId: plan.PlanId,
                            StatusText: "Đã lập lịch",
                            StatusState: "Success",
                            children: []
                        });
                    });
                }
                nodes[obj.WbsId] = Object.assign({}, obj, {
                    Type: 'WBS', DisplayName: obj.WbsName, CustomId: obj.WbsCode,
                    StatusText: obj.IsActive ? 'Hoạt động' : 'Đã đóng',
                    StatusState: obj.IsActive ? 'Success' : 'Error',
                    children: aPlans
                });
            });
            arr.forEach(function (obj) {
                if (obj.ParentId && nodes[obj.ParentId]) {
                    nodes[obj.ParentId].children.push(nodes[obj.WbsId]);
                } else if (!obj.ParentId) {
                    tree.push(nodes[obj.WbsId]);
                }
            });
            return tree;
        },

        /* =========================================================== */
        /* WBS & GANTT HELPERS (Bridge to Delegate)                    */
        /* =========================================================== */
        // Các hàm này được View XML gọi, Controller đóng vai trò trung gian gọi Delegate

        calcMargin: function (sStart) {
            return this._oWBSDelegate.calcMargin(sStart) || "0px";
        },

        calcWidth: function (sStart, sEnd) {
            return this._oWBSDelegate.calcWidth(sStart, sEnd) || "0px";
        },

        /* =========================================================== */
        /* EVENT HANDLERS (WBS & POPOVER)                              */
        /* =========================================================== */

        onGanttTaskClick: function (oEvent) {
            this._oWBSDelegate.onOpenWBSPopover(oEvent, this);
        },

        onCloseWBSPopover: function () {
            this._oWBSDelegate.onClosePopover();
        }  ,
        /* =========================================================== */
        /* GENERAL ACTIONS & FORMATTERS                                */
        /* =========================================================== */

        onNavBack: function () {
            var oHistory = History.getInstance();
            if (oHistory.getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteProjectManagement", {}, true);
            }
        },

        formatDate: function (dateValue) {
            if (!dateValue) return "";
            return DateFormat.getDateInstance({ pattern: "dd/MM/yyyy" }).format(new Date(dateValue));
        },

        formatTime: function (oTime) {
            if (!oTime) return "";
            var oTimeFormat = DateFormat.getTimeInstance({ pattern: "HH:mm:ss" });
            if (oTime.ms !== undefined) return oTimeFormat.format(new Date(oTime.ms), true);
            return oTimeFormat.format(oTime instanceof Date ? oTime : new Date(oTime));
        },

        onSaveProject: function () { MessageToast.show("Đã lưu thay đổi"); },
        onAddNewTask: function () { MessageBox.information("Chức năng demo"); }
    });
});