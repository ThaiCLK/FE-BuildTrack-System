sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, MessageBox, History) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectDetail", {

        onInit: function () {
            var oViewConfig = new JSONModel({
                visible: { btnSave: true }
            });
            this.getView().setModel(oViewConfig, "viewConfig");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);
        },

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
                urlParameters: {
                    "$expand": "NavWBS/NavWBSPlan" 
                },
                success: function (oData) {
                    oView.setBusy(false);

                    var aFlatWBS = (oData.NavWBS && oData.NavWBS.results) ? oData.NavWBS.results : [];
                    var aTreeData = this._transformToTree(aFlatWBS);

                    var oDetailModel = new JSONModel({
                        ProjectId: oData.ProjectId,
                        ProjectCode: oData.ProjectCode,
                        ProjectName: oData.ProjectName,
                        WBS: aTreeData 
                    });
                    oView.setModel(oDetailModel, "viewData");

                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    console.error("Load Project Error:", oError);
                    MessageBox.error("Không thể tải dữ liệu dự án từ hệ thống.");
                }
            });
        },

        _transformToTree: function(arr) {
            var nodes = {};
            var tree = [];
            
            arr.forEach(function(obj) {
                var aPlans = [];
                if (obj.NavWBSPlan && obj.NavWBSPlan.results) {
                    aPlans = obj.NavWBSPlan.results.map(function(plan) {
                        return {
                            ...plan,
                            Type: 'PLAN', 
                            // Thống nhất trường hiển thị là DisplayName
                            DisplayName: plan.WbsPlanName || "Không có tiêu đề kế hoạch",
                            CustomId: plan.PlanId,
                            StatusText: "Đã lập lịch",
                            StatusState: "Success",
                            children: [] 
                        };
                    });
                }

                nodes[obj.WbsId] = { 
                    ...obj, 
                    Type: 'WBS',
                    DisplayName: obj.WbsName, // Thống nhất trường hiển thị
                    CustomId: obj.WbsCode,
                    StatusText: obj.IsActive ? 'Hoạt động' : 'Đã đóng',
                    StatusState: obj.IsActive ? 'Success' : 'Error',
                    children: aPlans, 
                    CreatedDate: obj.CreatedOn ? new Date(obj.CreatedOn) : null
                };
            });

            arr.forEach(function(obj) {
                if (obj.ParentId && nodes[obj.ParentId]) {
                    nodes[obj.ParentId].children.push(nodes[obj.WbsId]);
                } else if (!obj.ParentId) {
                    tree.push(nodes[obj.WbsId]);
                }
            });
            return tree;
        },

        formatDate: function(dateValue) {
            if (!dateValue) return "";
            var oDate = new Date(dateValue);
            return oDate.toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            if (oHistory.getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("RouteProjectManagement", {}, true);
            }
        },

        onAddNewTask: function() { MessageBox.information("Chức năng demo"); },
        onDeleteTask: function() { MessageBox.warning("Chức năng demo"); },
        onSaveProject: function() { MessageToast.show("Đã lưu thay đổi"); }
    });
});