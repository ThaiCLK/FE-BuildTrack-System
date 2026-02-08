// sap.ui.define([
//     "sap/ui/core/mvc/Controller",
//     "sap/ui/model/json/JSONModel",
//     "sap/m/MessageBox",
//     "sap/m/MessageToast",
//     "sap/ui/core/UIComponent",
//     "sap/m/Dialog",
//     "sap/m/Button",
//     "sap/m/Label",
//     "sap/m/Input",
//     "sap/m/Select",
//     "sap/ui/core/Item",
//     "sap/m/DatePicker",
//     "sap/m/HBox"  
// ], function (Controller, JSONModel, MessageBox, MessageToast, Dialog, Button, Label, Input, Select, Item, DatePicker, HBox) {
//     "use strict";

//     return Controller.extend("com.bts.zbts.controller.ProjectManagement", {

//         // onInit: function () {
//         //     // 1. Load dữ liệu giả
//         //     var oModel = new JSONModel();
//         //     oModel.loadData(sap.ui.require.toUrl("com/bts/zbts/model/mock_projects.json"));
            
//         //     // Chạy logic kiểm tra ngày sau khi load data xong
//         //     oModel.attachRequestCompleted(function() {
//         //         this._checkAutoCloseProjects(oModel);
//         //     }.bind(this));

//         //     this.getView().setModel(oModel, "mock");
//         // },


//         // // --- LOGIC TỰ ĐỘNG ĐÓNG DỰ ÁN (AUTO-CLOSE) ---
//         // _checkAutoCloseProjects: function(oModel) {
//         //     var oData = oModel.getData();
//         //     if (!oData || !oData.Projects) return;

//         //     var aProjects = oData.Projects;
//         //     var oToday = new Date();
//         //     var bChanged = false;

//         //     aProjects.forEach(function(prj) {
//         //         if (!prj.EndDate) return;
//         //         var dEnd = new Date(prj.EndDate);
                
//         //         // Luôn so sánh và gán bằng "CLOSED" (in hoa)
//         //         if (oToday > dEnd && prj.Status !== "CLOSED") {
//         //             prj.Status = "CLOSED"; 
//         //             prj.StatusText = "Closed (Expired)"; 
//         //             bChanged = true;
//         //         }
//         //     });

//         //     if (bChanged) {
//         //         oModel.refresh();
//         //     }
//         // },

//         // Formatters
//         formatStatusText: function(sStatus) {
//             if (!sStatus) return "";
//             return sStatus.charAt(0).toUpperCase() + sStatus.slice(1).toLowerCase();
//         },

//         formatStatusState: function(sStatus) {
//             if (!sStatus) return "None";
//             switch (sStatus.toUpperCase()) {
//                 case "ACTIVE": return "Success";      
//                 case "PLANNING": return "Information"; 
//                 case "REVIEWED": return "Warning";    
//                 case "CLOSED": return "Error";        
//                 default: return "None";
//             }
//         },
        
//         formatProjectType: function(sType) {
//              if (!sType) return "";
//              return sType.charAt(0).toUpperCase() + sType.slice(1).toLowerCase();
//         },

//         // --- NAVIGATION ---
//         onPressProject: function(oEvent) {
//             // var sProjectID = oEvent.getSource().getBindingContext("mock").getProperty("ProjectID");
//             // Bỏ chữ "mock" đi để dùng model OData mặc định
//             var sProjectID = oEvent.getSource().getBindingContext().getProperty("ProjectID");
//             this.getOwnerComponent().getRouter().navTo("RouteProjectDetail", { projectID: sProjectID });
//         },
        
//         onAddProject: function () {
//             // ... (Code cũ của bạn)
//              var that = this;
//             if (this._oCreateDialog) {
//                 this._oCreateDialog.destroy();
//                 this._oCreateDialog = null;
//             }
//             this._oCreateDialog = new Dialog({
//                 title: "Create New Project",
//                 type: "Message",
//                 contentWidth: "600px",
//                 content: [
//                     new Label({ text: "Project Name", required: true }),
//                     new Input("newProjectName", { placeholder: "e.g. Metro Line 3" }),
//                     new Label({ text: "Project Type" }),
//                     new Select("newProjectType", {
//                         width: "100%",
//                         items: [
//                             new Item({ key: "ROAD", text: "Road" }),
//                             new Item({ key: "BRIDGE", text: "Bridge" }),
//                             new Item({ key: "BUILDING", text: "Building" }),
//                             new Item({ key: "TUNNEL", text: "Tunnel" }) 
//                         ],
//                         selectedKey: "ROAD"
//                     }),
//                     new Label({ text: "Timeline (Start - Est. End)" }),
//                     new HBox({
//                         alignItems: "Center",
//                         items: [
//                             new DatePicker("newStartDate", { 
//                                 width: "100%", placeholder: "Start Date", displayFormat: "yyyy-MM-dd", valueFormat: "yyyy-MM-dd",
//                                 change: function(oEvent) {
//                                     var sVal = oEvent.getParameter("value");
//                                     if (sVal) {
//                                         var dStart = new Date(sVal);
//                                         var dEnd = new Date(dStart);
//                                         dEnd.setFullYear(dEnd.getFullYear() + 1);
//                                         var sEndVal = dEnd.toISOString().split("T")[0];
//                                         sap.ui.getCore().byId("newEndDate").setValue(sEndVal);
//                                     }
//                                 }
//                             }),
//                             new Label({ text: " - ", width: "2rem", textAlign: "Center" }),
//                             new DatePicker("newEndDate", { width: "100%", placeholder: "Est. End Date", displayFormat: "yyyy-MM-dd", valueFormat: "yyyy-MM-dd" })
//                         ]
//                     }),
//                     new Label({ text: "Location" }),
//                     new Input("newLocation", { placeholder: "e.g. HCMC" })
//                 ],
//                 beginButton: new Button({ text: "Create", type: "Emphasized", press: function () { that._doCreateProject(); } }),
//                 endButton: new Button({ text: "Cancel", press: function () { that._oCreateDialog.close(); } }),
//                 afterClose: function() { that._oCreateDialog.destroy(); that._oCreateDialog = null; }
//             });
//             this._oCreateDialog.open();
//         },

//         // _doCreateProject: function () {
//         //     var sName = sap.ui.getCore().byId("newProjectName").getValue();
//         //     var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
//         //     var sLoc = sap.ui.getCore().byId("newLocation").getValue();
//         //     var sStart = sap.ui.getCore().byId("newStartDate").getValue();
//         //     var sEnd = sap.ui.getCore().byId("newEndDate").getValue();

//         //     if (!sName) { MessageToast.show("Name is required!"); return; }
//         //     if (!sStart) sStart = new Date().toISOString().slice(0, 10);
//         //     if (!sEnd) {
//         //         var d = new Date(sStart);
//         //         d.setFullYear(d.getFullYear() + 1);
//         //         sEnd = d.toISOString().slice(0, 10);
//         //     }

//         //     var sInitialStatus = "PLANNING";
//         //     var sInitialStatusText = "Planning";
//         //     var oEndDate = new Date(sEnd);
//         //     var oToday = new Date();
//         //     oToday.setHours(0, 0, 0, 0); 
//         //     if (oEndDate < oToday) { sInitialStatus = "CLOSED"; sInitialStatusText = "Closed"; }

//         //     var oViewModel = this.getView().getModel("mock");
//         //     var aCurrentProjects = oViewModel ? oViewModel.getProperty("/Projects") : [];
//         //     var iMaxID = 0;
//         //     if (aCurrentProjects) {
//         //         aCurrentProjects.forEach(function(prj) {
//         //             if (prj.ProjectID && prj.ProjectID.startsWith("PRJ-")) {
//         //                 var iNum = parseInt(prj.ProjectID.split("-")[1], 10);
//         //                 if (iNum > iMaxID) iMaxID = iNum;
//         //             }
//         //         });
//         //     }
//         //     var sNextID = "PRJ-" + ("000" + (iMaxID + 1)).slice(-3);
//         //     var oUserModel = this.getOwnerComponent().getModel("userInfo");
//         //     var sManagerName = oUserModel ? (oUserModel.getProperty("/name") || "Admin User") : "Admin User";

//         //     var oNewProject = {
//         //         "ProjectID": sNextID, "ProjectName": sName, "ProjectType": sType, "Location": sLoc || "TBD",
//         //         "StartDate": sStart, "EndDate": sEnd, "Status": sInitialStatus, "StatusText": sInitialStatusText,
//         //         "Manager": sManagerName, "WBS": []
//         //     };

//         //     var oComponentModel = this.getOwnerComponent().getModel("mock");
//         //     if (oComponentModel) {
//         //         var aCompProjects = oComponentModel.getProperty("/Projects");
//         //         if (!aCompProjects) aCompProjects = [];
//         //         var bExists = aCompProjects.some(function(p){ return p.ProjectID === sNextID; });
//         //         if (!bExists) {
//         //             aCompProjects.unshift(oNewProject);
//         //             oComponentModel.setProperty("/Projects", aCompProjects);
//         //             oComponentModel.refresh(true); 
//         //         }
//         //     }
//         //     if (oViewModel && oViewModel !== oComponentModel) {
//         //         var aViewProjects = oViewModel.getProperty("/Projects");
//         //         if (!aViewProjects) aViewProjects = [];
//         //         var bExistsView = aViewProjects.some(function(p){ return p.ProjectID === sNextID; });
//         //         if (!bExistsView) {
//         //             aViewProjects.unshift(oNewProject);
//         //             oViewModel.setProperty("/Projects", aViewProjects);
//         //             oViewModel.refresh(true);
//         //         }
//         //     }
//         //     this._oCreateDialog.close();
//         //     MessageToast.show("Created Project " + sNextID + " successfully!");
//         // },

//         _doCreateProject: function () {
//     var that = this;
//     // 1. Lấy dữ liệu từ các Input (Giữ nguyên code cũ của bạn)
//     var sName = sap.ui.getCore().byId("newProjectName").getValue();
//     var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
//     var sStart = sap.ui.getCore().byId("newStartDate").getValue(); // Dạng chuỗi "yyyy-MM-dd"
//     var sEnd = sap.ui.getCore().byId("newEndDate").getValue();
//     var sLoc = sap.ui.getCore().byId("newLocation").getValue();

//     if (!sName) { MessageToast.show("Name is required!"); return; }

//     // 2. Chuẩn bị dữ liệu để gửi đi (Payload)
//     // Lưu ý: OData cần đối tượng Date, không phải String
//     var oPayload = {
//         ProjectName: sName,
//         ProjectType: sType,
//         // Backend tự sinh ID nên không cần truyền ProjectID, hoặc truyền chuỗi rỗng
//         Status: "PLANNING", 
//         // Chuyển chuỗi ngày thành đối tượng Date
//         StartDate: sStart ? new Date(sStart) : new Date(),
//         EndDate: sEnd ? new Date(sEnd) : null
//         // Nếu Metadata có trường Location hoặc Address thì thêm vào:
//         // Address: sLoc 
//     };

//     // 3. Gọi OData Create
//     var oModel = this.getView().getModel(); // Lấy model OData
//     oModel.create("/ProjectSet", oPayload, {
//         success: function () {
//             MessageToast.show("Created successfully!");
//             that._oCreateDialog.close();
//             // Không cần refresh, OData Model tự cập nhật lại bảng
//         },
//         error: function () {
//             MessageBox.error("Error creating project.");
//         }
//     });
// },
//         onDeleteProject: function(oEvent) {
//     var oModel = this.getView().getModel();
//     // Lấy đường dẫn của dòng được chọn (VD: /ProjectSet(guid'...'))
//     var sPath = oEvent.getSource().getBindingContext().getPath(); 
    
//     MessageBox.confirm("Delete this project?", {
//         onClose: function(oAction) {
//             if (oAction === "OK") { 
//                 oModel.remove(sPath, {
//                     success: function() {
//                         MessageToast.show("Deleted successfully");
//                     },
//                     error: function() {
//                         MessageBox.error("Failed to delete.");
//                     }
//                 });
//             }
//         }
//     });
// },
        
//         onEditProject: function(oEvent) {
//             var that = this;
//             var oContext = oEvent.getSource().getBindingContext("mock");
//             var oRowData = oContext.getObject();
//             this._sEditPath = oContext.getPath();
//             var oCloneData = JSON.parse(JSON.stringify(oRowData));
//             if (oCloneData.StartDate) oCloneData.StartDate = new Date(oCloneData.StartDate);
//             if (oCloneData.EndDate) oCloneData.EndDate = new Date(oCloneData.EndDate);
//             var oEditModel = new JSONModel(oCloneData);

//             if (!this._oEditDialog) {
//                 this._oEditDialog = new Dialog({
//                     title: "Update Project",
//                     type: "Message",
//                     contentWidth: "500px",
//                     content: [
//                         new Label({ text: "Project Name", required: true }),
//                         new Input({ value: "{edit>/ProjectName}" }),
//                         new Label({ text: "Type", required: true }),
//                         new Select({
//                             selectedKey: "{edit>/ProjectType}",
//                             width: "100%",
//                             items: [
//                                 new Item({ key: "Road", text: "Road" }),
//                                 new Item({ key: "Bridge", text: "Bridge" }),
//                                 new Item({ key: "Building", text: "Building" }),
//                                 new Item({ key: "Tunnel", text: "Tunnel" })
//                             ]
//                         }),
//                         new Label({ text: "Location" }),
//                         new Input({ value: "{edit>/Location}" }),
//                         new Label({ text: "Timeline" }),
//                         new HBox({
//                             items: [
//                                 new DatePicker({ value: "{edit>/StartDate}", valueFormat:"yyyy-MM-dd", displayFormat:"yyyy-MM-dd", width: "100%" }),
//                                 new Label({ text: "-", width: "2rem", textAlign: "Center" }),
//                                 new DatePicker({ value: "{edit>/EndDate}", valueFormat:"yyyy-MM-dd", displayFormat:"yyyy-MM-dd", width: "100%" })
//                             ]
//                         })
//                     ],
//                     beginButton: new Button({ text: "Save", type: "Emphasized", press: function() { that._doUpdateProject(); } }),
//                     endButton: new Button({ text: "Cancel", press: function() { that._oEditDialog.close(); } })
//                 });
//             }
//             this._oEditDialog.setModel(oEditModel, "edit");
//             this._oEditDialog.open();
//         },

//         _doUpdateProject: function() {
//     var that = this;
//     var oEditModel = this._oEditDialog.getModel("edit");
//     var oUpdatedData = oEditModel.getData();
//     var oModel = this.getView().getModel(); // Model OData

//     // Chỉ gửi những trường cần sửa
//     var oPayload = {
//         ProjectName: oUpdatedData.ProjectName,
//         ProjectType: oUpdatedData.ProjectType,
//         StartDate: oUpdatedData.StartDate,
//         EndDate: oUpdatedData.EndDate,
//         Location: oUpdatedData.Location
//     };

//     oModel.update(this._sEditPath, oPayload, {
//         success: function() {
//             MessageToast.show("Project updated!");
//             that._oEditDialog.close();
//         },
//         error: function() {
//             MessageBox.error("Update failed.");
//         }
//     });
// }
//     });
// });


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
        onPressProject: function (oEvent) {
    var oItem = oEvent.getSource();
    var oCtx = oItem.getBindingContext(); 
    
    var sProjectID = oCtx.getProperty("ProjectId"); 

    console.log("ID thực tế lấy được:", sProjectID);

    if (sProjectID) {
        this.getOwnerComponent().getRouter().navTo("RouteProjectDetail", {
            // Tên tham số này phải khớp với manifest.json
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
                    })
                ],
                beginButton: new Button({ text: "Create", type: "Emphasized", press: function () { that._doCreateProject(); } }),
                endButton: new Button({ text: "Cancel", press: function () { that._oCreateDialog.close(); } }),
                afterClose: function() { that._oCreateDialog.destroy(); that._oCreateDialog = null; }
            });
            this._oCreateDialog.open();
        },

        _doCreateProject: function () {
            var that = this;
            var sName = sap.ui.getCore().byId("newProjectName").getValue();
            var sType = sap.ui.getCore().byId("newProjectType").getSelectedKey();
            var sStart = sap.ui.getCore().byId("newStartDate").getValue(); 
            var sEnd = sap.ui.getCore().byId("newEndDate").getValue();

            if (!sName) { MessageToast.show("Name is required!"); return; }

            var oPayload = {
                ProjectName: sName,
                ProjectType: sType,
                Status: "PLANNING", 
                StartDate: sStart ? new Date(sStart) : new Date(),
                EndDate: sEnd ? new Date(sEnd) : null,
                NavWBS: []
            };

            var oModel = this.getView().getModel(); 
            oModel.create("/ProjectSet", oPayload, {
                success: function () {
                    MessageToast.show("Created successfully!");
                    that._oCreateDialog.close();
                },
                error: function () {
                    MessageBox.error("Error creating project.");
                }
            });
        },

        onDeleteProject: function(oEvent) {
            var oModel = this.getView().getModel();
            var sPath = oEvent.getSource().getBindingContext().getPath(); 
            
            MessageBox.confirm("Delete this project?", {
                onClose: function(oAction) {
                    if (oAction === "OK") { 
                        oModel.remove(sPath, {
                            success: function() {
                                MessageToast.show("Deleted successfully");
                            },
                            error: function() {
                                MessageBox.error("Failed to delete.");
                            }
                        });
                    }
                }
            });
        },
        
        onEditProject: function(oEvent) {
            var that = this;
            var oContext = oEvent.getSource().getBindingContext(); // Đã bỏ "mock"
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
            var that = this;
            var oEditModel = this._oEditDialog.getModel("edit");
            var oUpdatedData = oEditModel.getData();
            var oModel = this.getView().getModel(); 

            var oPayload = {
                ProjectName: oUpdatedData.ProjectName,
                ProjectType: oUpdatedData.ProjectType,
                StartDate: oUpdatedData.StartDate,
                EndDate: oUpdatedData.EndDate
            };

            oModel.update(this._sEditPath, oPayload, {
                success: function() {
                    MessageToast.show("Project updated!");
                    that._oEditDialog.close();
                },
                error: function() {
                    MessageBox.error("Update failed.");
                }
            });
        }
    });
});