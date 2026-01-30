sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.ProjectDetail", {

        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteProjectDetail").attachPatternMatched(this._onObjectMatched, this);
        },

        // --- HÀM 1: CHẠY KHI VÀO TRANG ---
        _onObjectMatched: function (oEvent) {
            var sProjectID = oEvent.getParameter("arguments").projectID;
            
            // 1. Giả lập gọi Backend lấy dữ liệu dự án theo ID
            // (Thực tế bạn sẽ gọi OData read tại đây)
            this._loadProjectData(sProjectID);
        },

        _loadProjectData: function(sProjectID) {
            var oUserModel = this.getOwnerComponent().getModel("userInfo");
            var sUserRole = oUserModel.getProperty("/role"); // Ví dụ: "COMMANDER"

            // --- DATA MẪU (MOCK) ---
            // Đây là kết quả của việc "Auto Generate" từ Backend
            var oProjectData = {
                ProjectID: sProjectID,
                ProjectName: "Metro Line 1 Construction",
                Status: "NEW", // Các trạng thái: NEW -> REVIEWED -> APPROVED
                StatusState: "Warning",
                
                // CẤU TRÚC WBS TỰ ĐỘNG SINH RA (Engineer đã create xong)
                WBS: [
                    { TaskName: "Phase 1: Preparation", Type: "Phase", Status: "Open", children: [
                        { TaskName: "Site Clearing", Type: "Task", Status: "Open" },
                        { TaskName: "Fencing", Type: "Task", Status: "Open" }
                    ]},
                    { TaskName: "Phase 2: Foundation", Type: "Phase", Status: "Locked", children: [] }
                ]
            };

            // Nếu dự án đã được Commander duyệt, đổi status giả lập để test Consultant
            // oProjectData.Status = "REVIEWED"; 

            // --- LOGIC PHÂN QUYỀN (QUAN TRỌNG NHẤT) ---
            var oViewConfig = {
                visible: {
                    wbsSection: true,          // Mặc định hiện
                    btnCommanderApprove: false,
                    btnConsultantApprove: false
                }
            };

            // RULE 1: Consultant không được thấy khi dự án còn mới (Status = NEW)
            if (sUserRole === "CONSULTANT" && oProjectData.Status === "NEW") {
                oViewConfig.visible.wbsSection = false; 
                MessageToast.show("Dự án đang chờ Commander duyệt. Bạn chưa có quyền xem.");
            }

            // RULE 2: Commander chỉ thấy nút duyệt khi Status = NEW
            if (sUserRole === "COMMANDER" && oProjectData.Status === "NEW") {
                oViewConfig.visible.btnCommanderApprove = true;
            }

            // RULE 3: Consultant chỉ thấy nút duyệt khi Status = REVIEWED (Commander đã duyệt)
            if (sUserRole === "CONSULTANT" && oProjectData.Status === "REVIEWED") {
                oViewConfig.visible.btnConsultantApprove = true;
            }

            // Set Data lên View
            var oViewModel = new JSONModel(oProjectData);
            this.getView().setModel(oViewModel, "viewData");

            var oConfigModel = new JSONModel(oViewConfig);
            this.getView().setModel(oConfigModel, "viewConfig");
        },

        // --- HÀM XỬ LÝ NÚT BẤM ---
        
        onCommanderApprove: function() {
            // Logic: Commander bấm duyệt -> Chuyển trạng thái sang REVIEWED
            var oModel = this.getView().getModel("viewData");
            oModel.setProperty("/Status", "REVIEWED");
            oModel.setProperty("/StatusState", "Success");
            
            // Ẩn nút Commander đi
            this.getView().getModel("viewConfig").setProperty("/visible/btnCommanderApprove", false);
            
            MessageToast.show("Đã duyệt! Chuyển hồ sơ sang Consultant.");
            // Ở đây bạn sẽ gọi OData Update xuống backend để lưu trạng thái
        },

        onConsultantApprove: function() {
            // Logic: Consultant bấm duyệt -> Chuyển trạng thái sang APPROVED (DONE)
            var oModel = this.getView().getModel("viewData");
            oModel.setProperty("/Status", "APPROVED");
            oModel.setProperty("/StatusState", "Success");

            this.getView().getModel("viewConfig").setProperty("/visible/btnConsultantApprove", false);

            MessageToast.show("Consultant đã xác nhận. Dự án chính thức khởi chạy!");
        },

        onNavBack: function () {
            this.getOwnerComponent().getRouter().navTo("RouteProjectManagement");
        }
    });
});