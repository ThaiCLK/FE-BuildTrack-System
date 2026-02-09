sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    // "sap/ui/core/UIComponent",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    "sap/ui/core/Item",
    "sap/m/DatePicker",
    "sap/m/HBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"

], function (Controller, JSONModel, MessageBox, MessageToast, Dialog, Button, Label, Input, Select, Item, DatePicker, HBox, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectManagement", {

        // --- NAVIGATION ---
        onPressProject: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext();

            var sProjectID = oCtx.getProperty("ProjectId");

            console.log("ID thực tế lấy được:", sProjectID);

            if (sProjectID) {
                this.getOwnerComponent().getRouter().navTo("RouteProjectDetail", {
                    projectID: sProjectID
                });
            } else {
                console.error("Không lấy được ProjectId. Hãy kiểm tra lại tên trường trong console log!");
            }
        },

        // --- SEARCH FUNCTION ---
        onSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("newValue");
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(function () {
                var aFilters = [];
                if (sQuery && sQuery.length > 0) {
                    aFilters.push(new sap.ui.model.Filter("ProjectName", sap.ui.model.FilterOperator.Contains, sQuery));
                }
                var oTable = this.byId("idProjectsTable");
                var oBinding = oTable.getBinding("items");

                if (oBinding) {
                    oBinding.filter(aFilters);
                }
            }.bind(this), 300);
        },
        formatStatusText: function (sStatus) {
            if (!sStatus) return "";
            return sStatus.charAt(0).toUpperCase() + sStatus.slice(1).toLowerCase();
        },
        formatStatusState: function (sStatus) {
            if (!sStatus) return "None";
            switch (sStatus.toUpperCase()) {
                case "ACTIVE": return "Success";
                case "PLANNING": return "Information";
                case "REVIEWED": return "Warning";
                case "CLOSED": return "Error";
                default: return "None";
            }
        },
        formatProjectType: function (sType) {
            if (!sType) return "";
            return sType.charAt(0).toUpperCase() + sType.slice(1).toLowerCase();
        },

        // --- INITIALIZATION ---
        onInit: function () {
            var oTempData = {
                project: {
                    ProjectCode: "",
                    ProjectName: "",
                    ProjectType: "ROAD",
                    StartDate: null,
                    EndDate: null
                },
                wbs: {
                    WbsCode: "",
                    WbsName: ""
                },
                plan: {
                    WbsPlanName: "",
                    PlanStartDate: null,
                    PlanEndDate: null,
                    PlanQty: "",
                    Status: "DRAFT"
                }
            };
            var oLocalModel = new sap.ui.model.json.JSONModel(oTempData);
            this.getView().setModel(oLocalModel, "temp");
        },

        // --- CREATE DEEP PROJECT STRUCTURE ---
        onAddProject: function () {
            var that = this;
            if (this._oCreateDialog) {
                this._oCreateDialog.destroy();
                this._oCreateDialog = null;
            }

            // Khởi tạo IconTabBar để chia Tab
            var oIconTabBar = new sap.m.IconTabBar({
                expandable: false,
                items: [
                    // TAB 1: THÔNG TIN PROJECT (Giữ nguyên hoặc tinh chỉnh nhẹ)
                    new sap.m.IconTabFilter({
                        key: "project",
                        icon: "sap-icon://product",
                        text: "Project",
                        content: [
                            new sap.ui.layout.form.SimpleForm({
                                editable: true,
                                layout: "ResponsiveGridLayout",
                                labelSpanL: 3, labelSpanM: 3,
                                columnsL: 1, columnsM: 1,
                                content: [
                                    new sap.m.Label({ text: "Project Code", required: true }),
                                    new sap.m.Input("newProjectCode", { placeholder: "e.g. PRJ-XXX" }),
                                    new sap.m.Label({ text: "Project Name", required: true }),
                                    new sap.m.Input("newProjectName", { placeholder: "e.g. Metro Line 3" }),
                                    new sap.m.Label({ text: "Project Type" }),
                                    new sap.m.Select("newProjectType", {
                                        items: [
                                            new sap.ui.core.Item({ key: "ROAD", text: "Road" }),
                                            new sap.ui.core.Item({ key: "BRIDGE", text: "Bridge" }),
                                            new sap.ui.core.Item({ key: "BUILDING", text: "Building" }),
                                            new sap.ui.core.Item({ key: "TUNNEL", text: "Tunnel" })
                                        ]
                                    }),
                                    new sap.m.Label({ text: "Timeline" }),
                                    new sap.m.DatePicker("newStartDate", { placeholder: "Start Date" }),
                                    new sap.m.DatePicker("newEndDate", { placeholder: "End Date" })
                                ]
                            })
                        ]
                    }),

                    // TAB 2: THÔNG TIN WBS (2 TRƯỜNG THEO JSON)
                    new sap.m.IconTabFilter({
                        key: "wbs",
                        icon: "sap-icon://org-chart",
                        text: "WBS",
                        content: [
                            new sap.ui.layout.form.SimpleForm({
                                editable: true,
                                layout: "ResponsiveGridLayout",
                                labelSpanL: 3, labelSpanM: 3,
                                content: [
                                    new sap.m.Label({ text: "WBS Code", required: true }),
                                    new sap.m.Input("newWBSCode", { placeholder: "e.g. WBS-ENG-01" }),
                                    new sap.m.Label({ text: "WBS Name", required: true }),
                                    new sap.m.Input("newWBSName", { placeholder: "e.g. Engineering and Design" })
                                ]
                            })
                        ]
                    }),

                    // TAB 3: THÔNG TIN WBS PLAN (5 TRƯỜNG THEO JSON)
                    new sap.m.IconTabFilter({
                        key: "plan",
                        icon: "sap-icon://official-service",
                        text: "WBS Plan",
                        content: [
                            new sap.ui.layout.form.SimpleForm({
                                editable: true,
                                layout: "ResponsiveGridLayout",
                                labelSpanL: 4, labelSpanM: 4,
                                content: [
                                    new sap.m.Label({ text: "Plan Name", required: true }),
                                    new sap.m.Input("newPlanName", { placeholder: "e.g. Geological Survey" }),

                                    new sap.m.Label({ text: "Plan Start Date" }),
                                    new sap.m.DatePicker("newPlanStartDate"),

                                    new sap.m.Label({ text: "Plan End Date" }),
                                    new sap.m.DatePicker("newPlanEndDate"),

                                    new sap.m.Label({ text: "Plan Quantity" }),
                                    new sap.m.Input("newPlanQty", { type: "Number", placeholder: "e.g. 10" }),

                                    // new sap.m.Label({ text: "Unit" }), // Thêm trường Unit để đẩy đủ bộ dữ liệu
                                    // new sap.m.Input("newUnitCode", { placeholder: "e.g. DAY" }),

                                    new sap.m.Label({ text: "Status" }),
                                    new sap.m.Select("newPlanStatus", {
                                        items: [
                                            new sap.ui.core.Item({ key: "DRAFT", text: "Draft" }),
                                            new sap.ui.core.Item({ key: "APPROVED", text: "Approved" })
                                        ]
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });

            this._oCreateDialog = new sap.m.Dialog({
                title: "Create Deep Project Structure",
                contentWidth: "600px", // Giảm chiều rộng lại một chút cho cân đối
                contentHeight: "auto", // Để auto để tránh khoảng trắng thừa phía dưới
                content: [oIconTabBar],
                beginButton: new sap.m.Button({
                    text: "Create All",
                    type: "Emphasized",
                    press: function () { that._doCreateProjectDeep(); }
                }),
                endButton: new sap.m.Button({
                    text: "Cancel",
                    press: function () { that._oCreateDialog.close(); }
                }),
                afterClose: function () {
                    that._oCreateDialog.destroy();
                    that._oCreateDialog = null;
                }
            });

            this._oCreateDialog.open();
        },

        _doCreateProjectDeep: function () {
            var that = this;
            var oModel = this.getView().getModel();

            // 1. Thu thập dữ liệu từ UI
            var oPayload = {
                ProjectCode: sap.ui.getCore().byId("newProjectCode").getValue(),
                ProjectName: sap.ui.getCore().byId("newProjectName").getValue(),
                ProjectType: sap.ui.getCore().byId("newProjectType").getSelectedKey(),
                StartDate: this._formatDateToOData(sap.ui.getCore().byId("newStartDate").getDateValue()),
                EndDate: this._formatDateToOData(sap.ui.getCore().byId("newEndDate").getDateValue()),
                Status: "PLANNING",

                // Cấu trúc lồng nhau NavWBS
                NavWBS: [{
                    WbsCode: sap.ui.getCore().byId("newWBSCode").getValue(),
                    WbsName: sap.ui.getCore().byId("newWBSName").getValue(),

                    // Cấu trúc lồng nhau NavWBSPlan (5 trường)
                    NavWBSPlan: [{
                        WbsPlanName: sap.ui.getCore().byId("newPlanName").getValue(),
                        PlanStartDate: this._formatDateToOData(sap.ui.getCore().byId("newPlanStartDate").getDateValue()),
                        PlanEndDate: this._formatDateToOData(sap.ui.getCore().byId("newPlanEndDate").getDateValue()),
                        PlanQty: sap.ui.getCore().byId("newPlanQty").getValue(),
                        Status: sap.ui.getCore().byId("newPlanStatus").getSelectedKey()
                    }]
                }]
            };

            // 2. Validation cơ bản
            if (!oPayload.ProjectCode || !oPayload.NavWBS[0].WbsCode || !oPayload.NavWBS[0].NavWBSPlan[0].WbsPlanName) {
                MessageToast.show("Please fill required fields in all tabs!");
                return;
            }

            // 3. Gọi hàm Create Deep
            oModel.create("/ProjectSet", oPayload, {
                success: function () {
                    MessageToast.show("Deep Project Structure created!");
                    that._oCreateDialog.close();
                    oModel.refresh();
                },
                error: function (oError) {
                    var sMsg = "Error creating deep structure.";
                    try {
                        var oResponse = JSON.parse(oError.responseText);
                        sMsg = oResponse.error.message.value;
                    } catch (e) { }
                    MessageBox.error(sMsg);
                }
            });
        },
        _formatDateToOData: function (oDate) {
            if (!oDate) return null;
            // Đảm bảo trả về đối tượng Date để OData Model tự convert sang Edm.DateTime
            return oDate;
        },
        onDeleteProject: function (oEvent) {
            var oModel = this.getView().getModel();
            var sPath = oEvent.getSource().getBindingContext().getPath();

            MessageBox.confirm("Delete this project?", {
                onClose: function (oAction) {
                    if (oAction === "OK") {
                        oModel.remove(sPath, {
                            success: function () {
                                MessageToast.show("Deleted successfully");
                            },
                            error: function () {
                                MessageBox.error("Failed to delete.");
                            }
                        });
                    }
                }
            });
        },

        onEditProject: function (oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext();
            var oRowData = oContext.getObject();
            this._sEditPath = oContext.getPath();

            var oCloneData = JSON.parse(JSON.stringify(oRowData));
            if (oCloneData.StartDate) oCloneData.StartDate = new Date(oCloneData.StartDate);
            if (oCloneData.EndDate) oCloneData.EndDate = new Date(oCloneData.EndDate);
            var oEditModel = new JSONModel(oCloneData);

            if (!this._oEditDialog) {
                this._oEditDialog = new Dialog({
                    title: "Update Project",
                    type: "Message",
                    contentWidth: "500px",
                    content: [
                        new Label({ text: "Project ID" }),
                        new Input({
                            value: "{edit>/ProjectCode}",
                            editable: true // Đổi thành false nếu đây là Key trong hệ thống
                        }),
                        new Label({ text: "Project Name", required: true }),
                        new Input({ value: "{edit>/ProjectName}" }),

                        new Label({ text: "Type", required: true }),
                        new Select({
                            selectedKey: "{edit>/ProjectType}",
                            width: "100%",
                            items: [
                                new Item({ key: "ROAD", text: "Road" }),
                                new Item({ key: "BRIDGE", text: "Bridge" }),
                                new Item({ key: "BUILDING", text: "Building" }),
                                new Item({ key: "TUNNEL", text: "Tunnel" })
                            ]
                        }),
                        new Label({ text: "Timeline" }),
                        new HBox({
                            items: [
                                new DatePicker({ value: "{edit>/StartDate}", valueFormat: "yyyy-MM-dd", displayFormat: "yyyy-MM-dd", width: "100%" }),
                                new Label({ text: "-", width: "2rem", textAlign: "Center" }),
                                new DatePicker({ value: "{edit>/EndDate}", valueFormat: "yyyy-MM-dd", displayFormat: "yyyy-MM-dd", width: "100%" })
                            ]
                        })
                    ],
                    beginButton: new Button({ text: "Save", type: "Emphasized", press: function () { that._doUpdateProject(); } }),
                    endButton: new Button({ text: "Cancel", press: function () { that._oEditDialog.close(); } })
                });
            }
            this._oEditDialog.setModel(oEditModel, "edit");
            this._oEditDialog.open();
        },

        _doUpdateProject: function () {
            var that = this;
            var oData = this._oEditDialog.getModel("edit").getData();
            var oModel = this.getView().getModel();

            // Chuẩn bị dữ liệu gửi đi (Payload)
            var oPayload = {
                ProjectName: oData.ProjectName,
                ProjectCode: oData.ProjectCode,
                ProjectType: oData.ProjectType,
                StartDate: oData.StartDate,
                EndDate: oData.EndDate
            };

            // Thực hiện Update tới Backend
            // this._sEditPath đã được lưu từ onEditProject (ví dụ: /ProjectSet(guid'...') )
            oModel.update(this._sEditPath, oPayload, {
                success: function () {
                    sap.m.MessageToast.show("Cập nhật thành công!");
                    that._oEditDialog.close();
                    oModel.refresh(); // Làm mới bảng để thấy dữ liệu mới
                },
                error: function (oError) {
                    sap.m.MessageBox.error("Lỗi khi cập nhật dữ liệu.");
                }
            });
        }
    });
});