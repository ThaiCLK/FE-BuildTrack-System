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
], function (Controller, JSONModel, MessageBox, MessageToast, Dialog, Button, Label, Input, Select, Item, DatePicker, HBox) {
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
        },

        // --- ĐÃ BỎ: _onRouteMatched và onTabSelect vì không còn TabBar ở màn hình này ---

        // --- LOGIC TỰ ĐỘNG ĐÓNG DỰ ÁN (AUTO-CLOSE) ---
        _checkAutoCloseProjects: function(oModel) {
            var oData = oModel.getData();
            if (!oData || !oData.Projects) return;

            var aProjects = oData.Projects;
            var oToday = new Date();
            var bChanged = false;

            aProjects.forEach(function(prj) {
                if (!prj.EndDate) return;
                var dEnd = new Date(prj.EndDate);
                
                // Luôn so sánh và gán bằng "CLOSED" (in hoa)
                if (oToday > dEnd && prj.Status !== "CLOSED") {
                    prj.Status = "CLOSED"; 
                    prj.StatusText = "Closed (Expired)"; 
                    bChanged = true;
                }
            });

            if (bChanged) {
                oModel.refresh();
            }
        },

        // Formatters
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
        
        formatProjectType: function(sType) {
             if (!sType) return "";
             return sType.charAt(0).toUpperCase() + sType.slice(1).toLowerCase();
        },

        // --- NAVIGATION ---
        onPressProject: function(oEvent) {
            var sProjectID = oEvent.getSource().getBindingContext("mock").getProperty("ProjectID");
            this.getOwnerComponent().getRouter().navTo("RouteProjectDetail", { projectID: sProjectID });
        },

        // --- CÁC LOGIC CÒN LẠI (Create, Edit, Delete) GIỮ NGUYÊN ---
        // (Copy nguyên phần logic Create, Edit, Delete từ code cũ của bạn vào đây)
        // ... (onAddProject, _doCreateProject, onEditProject, _doUpdateProject, onDeleteProject...)
        
        onAddProject: function () {
            // ... (Code cũ của bạn)
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
                                change: function(oEvent) {
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
                    }),
                    new Label({ text: "Location" }),
                    new Input("newLocation", { placeholder: "e.g. HCMC" })
                ],
                beginButton: new Button({ text: "Create", type: "Emphasized", press: function () { that._doCreateProject(); } }),
                endButton: new Button({ text: "Cancel", press: function () { that._oCreateDialog.close(); } }),
                afterClose: function() { that._oCreateDialog.destroy(); that._oCreateDialog = null; }
            });
            this._oCreateDialog.open();
        },

        _doCreateProject: function () {
            // ... (Giữ nguyên logic tạo dự án cũ của bạn)
            var sName = sap.ui.getCore().byId("newProjectName").getValue();
            var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
            var sLoc = sap.ui.getCore().byId("newLocation").getValue();
            var sStart = sap.ui.getCore().byId("newStartDate").getValue();
            var sEnd = sap.ui.getCore().byId("newEndDate").getValue();

            if (!sName) { MessageToast.show("Name is required!"); return; }
            if (!sStart) sStart = new Date().toISOString().slice(0, 10);
            if (!sEnd) {
                var d = new Date(sStart);
                d.setFullYear(d.getFullYear() + 1);
                sEnd = d.toISOString().slice(0, 10);
            }

            var sInitialStatus = "PLANNING";
            var sInitialStatusText = "Planning";
            var oEndDate = new Date(sEnd);
            var oToday = new Date();
            oToday.setHours(0, 0, 0, 0); 
            if (oEndDate < oToday) { sInitialStatus = "CLOSED"; sInitialStatusText = "Closed"; }

            var oViewModel = this.getView().getModel("mock");
            var aCurrentProjects = oViewModel ? oViewModel.getProperty("/Projects") : [];
            var iMaxID = 0;
            if (aCurrentProjects) {
                aCurrentProjects.forEach(function(prj) {
                    if (prj.ProjectID && prj.ProjectID.startsWith("PRJ-")) {
                        var iNum = parseInt(prj.ProjectID.split("-")[1], 10);
                        if (iNum > iMaxID) iMaxID = iNum;
                    }
                });
            }
            var sNextID = "PRJ-" + ("000" + (iMaxID + 1)).slice(-3);
            var oUserModel = this.getOwnerComponent().getModel("userInfo");
            var sManagerName = oUserModel ? (oUserModel.getProperty("/name") || "Admin User") : "Admin User";

            var oNewProject = {
                "ProjectID": sNextID, "ProjectName": sName, "ProjectType": sType, "Location": sLoc || "TBD",
                "StartDate": sStart, "EndDate": sEnd, "Status": sInitialStatus, "StatusText": sInitialStatusText,
                "Manager": sManagerName, "WBS": []
            };

            var oComponentModel = this.getOwnerComponent().getModel("mock");
            if (oComponentModel) {
                var aCompProjects = oComponentModel.getProperty("/Projects");
                if (!aCompProjects) aCompProjects = [];
                var bExists = aCompProjects.some(function(p){ return p.ProjectID === sNextID; });
                if (!bExists) {
                    aCompProjects.unshift(oNewProject);
                    oComponentModel.setProperty("/Projects", aCompProjects);
                    oComponentModel.refresh(true); 
                }
            }
            if (oViewModel && oViewModel !== oComponentModel) {
                var aViewProjects = oViewModel.getProperty("/Projects");
                if (!aViewProjects) aViewProjects = [];
                var bExistsView = aViewProjects.some(function(p){ return p.ProjectID === sNextID; });
                if (!bExistsView) {
                    aViewProjects.unshift(oNewProject);
                    oViewModel.setProperty("/Projects", aViewProjects);
                    oViewModel.refresh(true);
                }
            }
            this._oCreateDialog.close();
            MessageToast.show("Created Project " + sNextID + " successfully!");
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
        
        onEditProject: function(oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext("mock");
            var oRowData = oContext.getObject();
            this._sEditPath = oContext.getPath();
            var oCloneData = JSON.parse(JSON.stringify(oRowData));
            var oEditModel = new JSONModel(oCloneData);

            if (!this._oEditDialog) {
                this._oEditDialog = new Dialog({
                    title: "Update Project",
                    type: "Message",
                    contentWidth: "500px",
                    content: [
                        new Label({ text: "Project Name", required: true }),
                        new Input({ value: "{edit>/ProjectName}" }),
                        new Label({ text: "Type", required: true }),
                        new Select({
                            selectedKey: "{edit>/ProjectType}",
                            width: "100%",
                            items: [
                                new Item({ key: "Road", text: "Road" }),
                                new Item({ key: "Bridge", text: "Bridge" }),
                                new Item({ key: "Building", text: "Building" }),
                                new Item({ key: "Tunnel", text: "Tunnel" })
                            ]
                        }),
                        new Label({ text: "Location" }),
                        new Input({ value: "{edit>/Location}" }),
                        new Label({ text: "Timeline" }),
                        new HBox({
                            items: [
                                new DatePicker({ value: "{edit>/StartDate}", valueFormat:"yyyy-MM-dd", displayFormat:"yyyy-MM-dd", width: "100%" }),
                                new Label({ text: "-", width: "2rem", textAlign: "Center" }),
                                new DatePicker({ value: "{edit>/EndDate}", valueFormat:"yyyy-MM-dd", displayFormat:"yyyy-MM-dd", width: "100%" })
                            ]
                        })
                    ],
                    beginButton: new Button({ text: "Save", type: "Emphasized", press: function() { that._doUpdateProject(); } }),
                    endButton: new Button({ text: "Cancel", press: function() { that._oEditDialog.close(); } })
                });
            }
            this._oEditDialog.setModel(oEditModel, "edit");
            this._oEditDialog.open();
        },

        _doUpdateProject: function() {
            var oEditModel = this._oEditDialog.getModel("edit");
            var oUpdatedData = oEditModel.getData();
            var oMainModel = this.getView().getModel("mock");
            oMainModel.setProperty(this._sEditPath, oUpdatedData);
            MessageToast.show("Project updated!");
            this._oEditDialog.close();
        }
    });
});