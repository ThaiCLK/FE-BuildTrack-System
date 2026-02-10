sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "com/bts/zbts/controller/delegate/WBSDelegate"
], function (Controller, JSONModel, MessageToast, MessageBox, History, WBSDelegate) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectDetail", {

        isMilestone: function (sStart, sEnd) {
            if (!sStart || !sEnd) return false;
            var dStart = this._parseDate(sStart);
            var dEnd = this._parseDate(sEnd);
            if (!dStart || !dEnd || isNaN(dStart) || isNaN(dEnd)) return false;
            return dStart.toDateString() === dEnd.toDateString();
        },

        calcLeft: function (sStart, sEnd) {
            if (!sStart) return "0px";
            var baseMargin = this.calcMargin(sStart);
            if (this.isMilestone(sStart, sEnd)) {
                var pixels = this._oWBSDelegate._pixelsPerDay || 20;
                var offset = pixels / 2 - 8; // center milestone (16px width)
                return (parseFloat(baseMargin) + offset) + "px";
            }
            return baseMargin;
        },

        isNormalBar: function (sStart, sEnd) {
            return !!sStart && !!sEnd && !this.isMilestone(sStart, sEnd);
        },

        isMilestoneVisible: function (sStart, sEnd) {
            return !!sStart && !!sEnd && this.isMilestone(sStart, sEnd);
        },
        _parseDate: function (sDate) {
            if (!sDate) return null;
            var parts = sDate.split('/');
            if (parts.length === 3) {
                // dd/mm/yyyy → year, month-1, day
                return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            return new Date(sDate); // fallback
        },

        onInit: function () {
            this._oWBSDelegate = new WBSDelegate(this);

            var oViewConfig = new JSONModel({
                visible: { btnSave: true },
                totalWidth: "100%",
                timeScale: []
            });
            this.getView().setModel(oViewConfig, "viewConfig");

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        calcMargin: function (sStart) {
            if (!sStart) return "0px";
            var sResult = this._oWBSDelegate.calcMargin(sStart);
            return sResult ? sResult : "0px";
        },

        calcWidth: function (sStart, sEnd) {
            if (!sStart || !sEnd) return "0px";
            var sResult = this._oWBSDelegate.calcWidth(sStart, sEnd);
            return sResult ? sResult : "0px";
        },

        formatDate: function (dateValue) {
            if (!dateValue) return "";
            var oDate = new Date(dateValue);
            return oDate.toLocaleDateString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
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
                urlParameters: { "$expand": "NavWBS/NavWBSPlan" },
                success: function (oData) {
                    oView.setBusy(false);

                    var aFlatWBS = (oData.NavWBS && oData.NavWBS.results) ? oData.NavWBS.results : [];
                    var aTreeData = this._transformToTree(aFlatWBS);

                    var oDetailModel = new JSONModel({
                        ProjectId: oData.ProjectId || "",
                        ProjectCode: oData.ProjectCode || "",
                        ProjectName: oData.ProjectName || "",
                        WBS: aTreeData || []
                    });
                    oView.setModel(oDetailModel, "viewData");

                    try {
                        var oGanttConfig = this._oWBSDelegate.prepareGanttData(aTreeData);
                        this.getView().getModel("viewConfig").setData(oGanttConfig || {
                            timeScale: [],
                            dayScale: [],
                            totalWidth: "4000px",
                            pixelsPerDay: 20
                        }, true);
                    } catch (e) {
                        console.error("Gantt error:", e);
                        this.getView().getModel("viewConfig").setData({
                            timeScale: [],
                            dayScale: [],
                            totalWidth: "4000px",
                            pixelsPerDay: 20
                        }, true);
                    }
                }.bind(this),
                error: function (oError) {
                    oView.setBusy(false);
                    MessageBox.error("Không thể tải dữ liệu dự án.");
                }
            });
        },

        _transformToTree: function (arr) {
            var nodes = {};
            var tree = [];

            arr.forEach(function (obj) {
                var aPlans = [];
                if (obj.NavWBSPlan && obj.NavWBSPlan.results) {
                    aPlans = obj.NavWBSPlan.results.map(function (plan) {
                        return {
                            ...plan,
                            Type: 'PLAN',
                            DisplayName: plan.WbsPlanName || "Không có tiêu đề",
                            CustomId: plan.PlanId,
                            StatusText: "Đã lập lịch",
                            StatusState: "Success",
                            PlanStartDate: plan.PlanStartDate,
                            PlanEndDate: plan.PlanEndDate,
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
                    PlanStartDate: obj.PlanStartDate,
                    PlanEndDate: obj.PlanEndDate,
                    children: aPlans
                };
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

        onGanttTaskClick: function (oEvent) {
            // 1. Lấy Context của dòng được click
            var oRowContext = oEvent.getParameter("rowBindingContext");
            if (!oRowContext) {
                return; // Click vào vùng trắng không có dữ liệu
            }

            // 2. Lấy dữ liệu dòng đó
            var oData = oRowContext.getObject();

            // 3. (Tùy chọn) Chỉ hiện popup nếu click vào Task (Type = PLAN), bỏ qua WBS Folder
            if (oData.Type !== "PLAN") {
                return;
            }

            // 4. Lấy DOM reference của ô được click để định vị Popover hiển thị ngay tại đó
            var oControl = oEvent.getParameter("cellDomRef");

            // 5. Load Fragment và hiển thị
            var oView = this.getView();

            // Kiểm tra xem Popover đã được tạo chưa, nếu chưa thì tạo mới
            if (!this._pWBSPopover) {
                this._pWBSPopover = sap.ui.core.Fragment.load({
                    id: oView.getId(),
                    name: "com.bts.zbts.view.fragments.WBSDetailPopover", // Đường dẫn đến file ở Bước 1
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover); // Kết nối với View để dùng chung Model
                    return oPopover;
                }.bind(this));
            }

            this._pWBSPopover.then(function (oPopover) {
                // Bind Element: Gán dữ liệu của dòng vừa click vào Popover
                oPopover.bindElement({
                    path: oRowContext.getPath(),
                    model: "viewData" // Tên model chứa dữ liệu WBS
                });

                // Mở Popover ngay tại vị trí click
                oPopover.openBy(oControl);
            });
        },

        // Hàm đóng Popover (gắn vào nút Đóng trong Fragment)
        onCloseWBSPopover: function () {
            this._pWBSPopover.then(function (oPopover) {
                oPopover.close();
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

        onAddNewTask: function () { MessageBox.information("Chức năng demo"); },
        onDeleteTask: function () { MessageBox.warning("Chức năng demo"); },
        onSaveProject: function () { MessageToast.show("Đã lưu thay đổi"); }
    });
});