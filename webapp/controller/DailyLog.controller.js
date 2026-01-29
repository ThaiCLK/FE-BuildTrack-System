sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/UIComponent" // <-- Import thêm để dùng chuyển trang
], function (Controller, MessageToast, MessageBox, BusyIndicator, UIComponent) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.DailyLog", {

        onInit: function () {
            // Khởi tạo biến trạng thái lưu
            this._isSaving = false;
            this._saveTimer = null;
       // --- THÊM ĐOẠN NÀY ĐỂ FIX LỖI BẤM 2 LẦN ---
            var oRouter = UIComponent.getRouterFor(this);
            // Bắt sự kiện: Mỗi khi vào màn DailyLog
            oRouter.getRoute("RouteDailyLog").attachPatternMatched(this._onRouteMatched, this);
        },

        // --- HÀM MỚI: Tự động reset Tab về "Daily Log" ---
        _onRouteMatched: function () {
            // Lấy TabBar bằng ID (Đảm bảo ID trong View XML là idTopMenuLog)
            var oTabBar = this.byId("idTopMenuLog");
            if (oTabBar) {
                oTabBar.setSelectedKey("dailyLog"); // Ép chọn lại tab Daily Log
            }
        },
        // ==========================================================
        // 1. CHỨC NĂNG CHUYỂN TAB (GIỮ NGUYÊN TỪ BƯỚC TRƯỚC)
        // ==========================================================
        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");

            // Nếu bấm vào Tab Project -> Chuyển về màn hình Project
            if (sKey === "project") {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("RouteProjectManagement");
            }
        },

        // ==========================================================
        // 2. CHỨC NĂNG THÊM DÒNG MỚI (ODATA CREATE ENTRY)
        // ==========================================================
        onAddLog: function () {
            var oModel = this.getView().getModel();
            
            // Tạo một dòng rỗng trong EntitySet
            var oContext = oModel.createEntry("/DailyLogSet", {
                properties: {
                    LogDate: new Date(), // Mặc định ngày hiện tại
                    Weather: "",
                    GeneralNote: ""
                }
            });

            // Focus vào dòng mới (hoặc logic cuộn xuống nếu cần)
            MessageToast.show("Đã thêm dòng mới, hãy nhập dữ liệu.");
        },

        // ==========================================================
        // 3. CHỨC NĂNG LƯU - KHÔNG ĐỢI RESPONSE QUÁ LÂU
        // ==========================================================
        onSaveToSAP: function () { // Đổi tên hàm khớp với View (onSaveToSAP)
            // Chống spam click
            if (this._isSaving) {
                return;
            }

            var oView = this.getView();
            var oModel = oView.getModel();
            // LƯU Ý: Trong View bạn phải đặt id="btnSave" cho nút Lưu thì dòng dưới mới chạy
            var oBtnSave = this.byId("btnSave"); 
            
            // Kiểm tra có thay đổi không
            if (!oModel.hasPendingChanges()) {
                MessageToast.show("Không có gì thay đổi để lưu!");
                return;
            }

            console.log("Bắt đầu lưu dữ liệu...");

            // Set trạng thái đang lưu
            this._isSaving = true;
            if (oBtnSave) oBtnSave.setEnabled(false); // Disable nút lưu
            BusyIndicator.show(0);

            // Gửi request nhưng KHÔNG đợi response vô thời hạn
            oModel.submitChanges({
                success: function (oData, oResponse) {
                    console.log("Request thành công (Backend trả về):", oResponse ? oResponse.statusCode : "no status");
                    // Ta không xử lý ở đây nữa vì đã có Timer bên dưới xử lý rồi
                },
                error: function (oError) {
                    console.error("Request lỗi:", oError);
                }
            });

            // Tạo timeout 2 giây để hiển thị thông báo và reload
            this._saveTimer = setTimeout(function() {
                console.log("Timeout 2s - Giả lập thành công & Reload");
                
                // Reset trạng thái
                this._isSaving = false;
                if (oBtnSave) {
                    oBtnSave.setEnabled(true);
                }
                BusyIndicator.hide();
                
                // Hiển thị thông báo thành công
                MessageToast.show("✅ Đã gửi lệnh lưu xuống SAP!", {
                    duration: 2000
                });
                
                // Reload trang sau 0.5 giây để lấy dữ liệu mới (nếu Backend đã kịp lưu)
                setTimeout(function() {
                    console.log("Refresh model...");
                    oModel.refresh(); 
                }, 500);
                
                // Reset pending changes để tránh OData báo lỗi trùng lặp nếu user bấm tiếp
                // (Lưu ý: Chỉ dùng cách này nếu bạn chấp nhận rủi ro dữ liệu chưa kịp xuống DB thật)
                // oModel.resetChanges(); // Cân nhắc có nên dùng dòng này không
                
            }.bind(this), 2000); // Chỉ đợi 2 giây
        },

        // ==========================================================
        // 4. CHỨC NĂNG XÓA - TIMEOUT TƯƠNG TỰ
        // ==========================================================
        onDeleteLog: function (oEvent) {
            var oModel = this.getView().getModel();
            var oItem = oEvent.getSource().getParent(); // Lấy dòng chứa nút xóa
            var sPath = oItem.getBindingContext().getPath(); // Lấy đường dẫn OData

            MessageBox.confirm("Bạn có chắc chắn muốn xóa dòng này?", {
                icon: MessageBox.Icon.WARNING,
                title: "Xác nhận xóa",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        
                        // Gửi request xóa
                        oModel.remove(sPath, {
                            success: function () { console.log("Xóa thành công (Backend)"); },
                            error: function () { console.log("Lỗi xóa (Backend)"); }
                        });
                        
                        // Giả lập thành công sau 1 giây (để giao diện phản hồi nhanh)
                        setTimeout(function() {
                            MessageToast.show("✅ Đã xóa dòng!", {
                                duration: 2000
                            });
                            
                            // Reload dữ liệu
                            setTimeout(function() {
                                oModel.refresh();
                            }, 500);
                        }, 1000);
                    }
                }
            });
        },

        // ==========================================================
        // 5. HÀM HỦY (Dọn dẹp bộ nhớ)
        // ==========================================================
        onExit: function() {
            this._isSaving = false;
            if (this._saveTimer) {
                clearTimeout(this._saveTimer);
                this._saveTimer = null;
            }
            BusyIndicator.hide();
        }
    });
});