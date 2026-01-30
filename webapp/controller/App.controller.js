sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.App", {
        onInit: function () {
            // Gọi hàm kiểm tra quyền ngay khi app chạy
            this._checkUserRole();
        },

        _checkUserRole: function() {
            var oDataModel = this.getOwnerComponent().getModel();
            var oUserModel = this.getOwnerComponent().getModel("userInfo");
            var oRouter = this.getOwnerComponent().getRouter();
            
            // Gọi vào đúng đường dẫn bạn vừa test thành công
            var sPath = "/UserRoleSet('Current')"; 

            sap.ui.core.BusyIndicator.show(0);

            oDataModel.read(sPath, {
                success: function(oData) {
                    sap.ui.core.BusyIndicator.hide();
                    
                    // ... bên trong success: function(oData) { ...

    var sRole = oData.Role; // Ví dụ: "ENGINEER"

    // 1. Reset tất cả quyền về FALSE trước (để tránh bị lưu cache của user trước)
    var oPermissions = {
        username: oData.Username,
        role: sRole,
        canCreateProject: false,  // Cho Step 1, 2 (Engineer)
        canReviewStructure: false, // Cho Step 4 (Commander)
        canCheckScope: false,      // Cho Step 5 (Consultant)
        isManager: false           // Để điều hướng trang
    };

    // 2. Bật quyền theo Role (Dựa trên ảnh To-Be Process của bạn)
    switch (sRole) {
        case "ENGINEER":
            oPermissions.canCreateProject = true;
            oPermissions.isManager = false; // Vào Daily Log hoặc trang nhập liệu
            break;

        case "COMMANDER":
            oPermissions.canReviewStructure = true;
            oPermissions.isManager = true; // Vào trang Quản lý
            break;

        case "CONSULTANT":
            oPermissions.canCheckScope = true;
            oPermissions.isManager = true; // Vào trang Quản lý
            break;

        case "ADMIN": // Admin làm được hết
            oPermissions.canCreateProject = true;
            oPermissions.canReviewStructure = true;
            oPermissions.canCheckScope = true;
            oPermissions.isManager = true;
            break;
            
        default:
            // Role lạ thì không cho làm gì cả
            break;
    }

    // 3. Set dữ liệu vào Model "userInfo" để View sử dụng
    oUserModel.setData(oPermissions); 
    
    // 4. Điều hướng (Giữ nguyên logic cũ của bạn)
    if (oPermissions.isManager) {
        oRouter.navTo("RouteProjectManagement");
    } else {
        // Nếu là Engineer, bạn có thể muốn điều hướng đến trang Tạo dự án
        // Ở đây tạm thời cho về DailyLog hoặc trang Project tùy bạn thiết kế
        oRouter.navTo("RouteProjectManagement"); // Ví dụ cho Engineer vào đây để nhập liệu
    }
    

                },
                error: function(oError) {
                    sap.ui.core.BusyIndicator.hide();
                    // Mẹo: Nếu lỗi, hãy mở Console (F12) để xem chi tiết
                    sap.m.MessageToast.show("Không kết nối được Backend.");
                }
            });
        }
    });
});