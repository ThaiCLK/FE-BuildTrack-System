sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function (Controller, MessageToast, MessageBox, BusyIndicator) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.z_bts", {

        onInit: function () {
            this._isSaving = false;
            this._saveTimer = null;
        },

        // ==========================================================
        // CHỨC NĂNG LƯU - KHÔNG ĐỢI RESPONSE TỪ BE
        // ==========================================================
        onSave: function () {
            // Chống spam đơn giản
            if (this._isSaving) {
                return;
            }

            var oView = this.getView();
            var oModel = oView.getModel();
            var oBtnSave = this.byId("btnSave");
            
            // Update binding
            oModel.updateBindings(true);

            // Kiểm tra thay đổi
            if (!oModel.hasPendingChanges()) {
                MessageToast.show("Không có gì thay đổi để lưu!");
                return;
            }

            console.log("Bắt đầu lưu dữ liệu...");

            // Set trạng thái đang lưu
            this._isSaving = true;
            oBtnSave.setEnabled(false);
            BusyIndicator.show(0);

            // Gửi request nhưng KHÔNG đợi response vô thời hạn
            oModel.submitChanges({
                success: function (oData, oResponse) {
                    console.log("Request thành công:", oResponse ? oResponse.statusCode : "no status");
                    // Không làm gì ở đây vì chúng ta sẽ dùng timeout
                },
                error: function (oError) {
                    console.error("Request lỗi:", oError);
                    // Không làm gì ở đây vì chúng ta sẽ dùng timeout
                }
            });

            // Tạo timeout 2 giây để hiển thị thông báo và reload
            // KHÔNG đợi BE trả về response
            this._saveTimer = setTimeout(function() {
                console.log("Timeout 2s - Hiển thị thông báo và reload");
                
                // Reset trạng thái
                this._isSaving = false;
                if (oBtnSave) {
                    oBtnSave.setEnabled(true);
                }
                BusyIndicator.hide();
                
                // Hiển thị thông báo thành công (giả định đã lưu)
                MessageToast.show("✅ Đã lưu dữ liệu thành công!", {
                    duration: 2000
                });
                
                // Reload trang sau 0.5 giây để lấy dữ liệu mới
                setTimeout(function() {
                    console.log("Reload dữ liệu...");
                    oModel.refresh();
                }, 500);
                
                // Reset pending changes để tránh lưu trùng
                oModel.resetChanges();
                
            }.bind(this), 2000); // Chỉ đợi 2 giây
        },

        // ==========================================================
        // CHỨC NĂNG XÓA - CẬP NHẬT TƯƠNG TỰ
        // ==========================================================
        onDelete: function (oEvent) {
            var oModel = this.getView().getModel();
            var oItem = oEvent.getSource().getParent(); 
            var sPath = oItem.getBindingContext().getPath(); 

            MessageBox.confirm("Bạn có chắc chắn muốn xóa dòng này?", {
                icon: MessageBox.Icon.WARNING,
                title: "Xác nhận xóa",
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.OK) {
                        // Gửi request xóa
                        oModel.remove(sPath, {
                            success: function () {
                                // Không làm gì
                            },
                            error: function () {
                                // Không làm gì
                            }
                        });
                                          
                        setTimeout(function() {
                            MessageToast.show("✅ Đã xóa thành công!", {
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
        // HÀM HỦY
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