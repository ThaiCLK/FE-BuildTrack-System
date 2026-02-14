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
            // Gọi hàm load giả lập
            this._loadMockProjectData(sProjectID);
        },

        _loadMockProjectData: function (sProjectID) {
            var oView = this.getView();
            oView.setBusy(true);

            // Giả lập độ trễ mạng
            setTimeout(function() {
                oView.setBusy(false);

                // --- DỮ LIỆU MOCK CẤU TRÚC WBS ---
                var aMockWBS = [
                    {
                        WbsId: "W1", WbsCode: "WBS-01", WbsName: "Hạng mục chung", ParentId: null, IsActive: true, CreatedOn: new Date(),
                        NavWBSPlan: { results: [] }
                    },
                    {
                        WbsId: "W1-1", WbsCode: "WBS-01.1", WbsName: "Chuẩn bị mặt bằng", ParentId: "W1", IsActive: true, CreatedOn: new Date(),
                        NavWBSPlan: { results: [
                            { PlanId: "P1", WbsPlanName: "Phát quang cây cối", PlanStartDate: new Date("2026-01-10"), PlanEndDate: new Date("2026-01-15") },
                            { PlanId: "P2", WbsPlanName: "San lấp sơ bộ", PlanStartDate: new Date("2026-01-16"), PlanEndDate: new Date("2026-01-20") }
                        ]}
                    },
                    {
                        WbsId: "W2", WbsCode: "WBS-02", WbsName: "Thi công móng trụ T1", ParentId: null, IsActive: true, CreatedOn: new Date(),
                        NavWBSPlan: { results: [] }
                    },
                    {
                        WbsId: "W2-1", WbsCode: "WBS-02.1", WbsName: "Cọc khoan nhồi", ParentId: "W2", IsActive: true, CreatedOn: new Date(),
                        NavWBSPlan: { results: [
                            { PlanId: "P3", WbsPlanName: "Khoan tạo lỗ D1500", PlanStartDate: new Date("2026-02-01"), PlanEndDate: new Date("2026-02-05") },
                            { PlanId: "P4", WbsPlanName: "Hạ lồng thép", PlanStartDate: new Date("2026-02-06"), PlanEndDate: new Date("2026-02-06") },
                            { PlanId: "P5", WbsPlanName: "Đổ bê tông cọc", PlanStartDate: new Date("2026-02-07"), PlanEndDate: new Date("2026-02-07") }
                        ]}
                    },
                    {
                        WbsId: "W2-2", WbsCode: "WBS-02.2", WbsName: "Bệ trụ", ParentId: "W2", IsActive: false, CreatedOn: new Date(),
                        NavWBSPlan: { results: [] }
                    }
                ];

                // Chuyển đổi dữ liệu phẳng thành cây (Tree)
                var aTreeData = this._transformToTree(aMockWBS);

                var oDetailModel = new JSONModel({
                    ProjectId: sProjectID,
                    ProjectCode: sProjectID,
                    ProjectName: "Dự án Mock " + sProjectID, // Tên giả theo ID
                    WBS: aTreeData 
                });
                oView.setModel(oDetailModel, "viewData");

            }.bind(this), 500); // Delay 0.5s cho cảm giác thật
        },

        _transformToTree: function(arr) {
            var nodes = {};
            var tree = [];
            
            // Bước 1: Tạo Map và xử lý Children (Plan)
            arr.forEach(function(obj) {
                var aPlans = [];
                if (obj.NavWBSPlan && obj.NavWBSPlan.results) {
                    aPlans = obj.NavWBSPlan.results.map(function(plan) {
                        return {
                            ...plan,
                            Type: 'PLAN', 
                            DisplayName: plan.WbsPlanName || "Không có tên",
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
                    DisplayName: obj.WbsName,
                    CustomId: obj.WbsCode,
                    StatusText: obj.IsActive ? 'Hoạt động' : 'Đã đóng',
                    StatusState: obj.IsActive ? 'Success' : 'Error',
                    children: aPlans, // Gắn plan làm con của WBS
                    CreatedDate: obj.CreatedOn
                };
            });

            // Bước 2: Xây dựng cấu trúc cây (WBS cha - con)
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

        onAddNewTask: function() { 
            MessageToast.show("Đã thêm công việc giả lập!");
            // Logic thêm vào Tree Model ở đây nếu cần test
        },
        onDeleteTask: function() { MessageToast.show("Đã xóa (Mock)!"); },
        onSaveProject: function() { MessageToast.show("Đã lưu dữ liệu giả lập thành công!"); }
    });
});