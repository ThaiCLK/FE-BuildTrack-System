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

        onAddProject: function () {
            var that = this;
            if (this._oCreateDialog) {
                this._oCreateDialog.destroy();
                this._oCreateDialog = null;
            }
            this._oCreateDialog = new Dialog({
                title: "Create New Project",
                type: "Message",
                contentWidth: "600px",
                content: [
                    new Label({ text: "Project ID", required: true }),
                    new Input("newProjectCode", {
                        placeholder: "e.g. PRJ-XXX", liveChange: function (oEvent) {
                            var sValue = oEvent.getParameter("value");
                            oEvent.getSource().setValue(sValue.toUpperCase());
                        }
                    }),
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
                    new HBox({
                        alignItems: "Center",
                        items: [
                            new DatePicker("newStartDate", {
                                width: "100%", placeholder: "Start Date", displayFormat: "yyyy-MM-dd", valueFormat: "yyyy-MM-dd",
                                change: function (oEvent) {
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
                            new DatePicker("newEndDate", { width: "100%", placeholder: "Est. End Date", displayFormat: "yyyy-MM-dd", valueFormat: "yyyy-MM-dd" })
                        ]
                    })
                ],
                beginButton: new Button({ text: "Create", type: "Emphasized", press: function () { that._doCreateProject(); } }),
                endButton: new Button({ text: "Cancel", press: function () { that._oCreateDialog.close(); } }),
                afterClose: function () { that._oCreateDialog.destroy(); that._oCreateDialog = null; }
            });
            this._oCreateDialog.open();
        },

        _doCreateProject: function () {
            var that = this;
            // 1. Lấy dữ liệu từ các control trong Dialog
            var sCode = sap.ui.getCore().byId("newProjectCode").getValue(); // Lấy Project ID mới thêm
            var sName = sap.ui.getCore().byId("newProjectName").getValue();
            var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
            var sStart = sap.ui.getCore().byId("newStartDate").getValue();
            var sEnd = sap.ui.getCore().byId("newEndDate").getValue();

            // 2. Kiểm tra dữ liệu bắt buộc (Validation)
            if (!sCode) {
                sap.m.MessageToast.show("Project ID is required!");
                return;
            }
            if (!sName) {
                sap.m.MessageToast.show("Name is required!");
                return;
            }

            // 3. Chuẩn bị Payload gửi lên Backend OData
            var oPayload = {
                ProjectCode: sCode, // Map đúng với thuộc tính hiển thị trên bảng
                ProjectName: sName,
                ProjectType: sType,
                Status: "PLANNING",
                StartDate: sStart ? new Date(sStart) : new Date(),
                EndDate: sEnd ? new Date(sEnd) : null,
                NavWBS: [] // Khởi tạo mảng trống cho Deep Insert nếu cần
            };

            // 4. Gọi OData Model để tạo mới
            var oModel = this.getView().getModel();
            oModel.create("/ProjectSet", oPayload, {
                success: function () {
                    sap.m.MessageToast.show("Project " + sCode + " created successfully!");
                    that._oCreateDialog.close();
                    // Refresh lại model để cập nhật danh sách mới lên Table
                    oModel.refresh(true);
                },
                error: function (oError) {
                    // Hiển thị chi tiết lỗi từ SAP Gateway nếu có
                    sap.m.MessageBox.error("Error creating project. Please check if ID already exists.");
                }
            });
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