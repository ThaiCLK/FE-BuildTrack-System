sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/DatePicker",
    "sap/m/TextArea",
    "sap/m/ComboBox",
    "sap/m/RadioButton",
    "sap/m/RadioButtonGroup",
    "sap/ui/core/Item",
    "sap/ui/core/Title",
    "sap/ui/layout/form/SimpleForm",
    "sap/ui/layout/GridData"
], function (Controller, JSONModel, MessageToast, MessageBox, Dialog, Button, Label, Input, DatePicker, TextArea, ComboBox, RadioButton, RadioButtonGroup, Item, Title, SimpleForm, GridData) {
    "use strict";

    return Controller.extend("com.bts.zbts.controller.DailyLog", {

        onInit: function () {
            var oData = {
                ui: {
                    editMode: false,
                    isSelected: false
                },
                ZLOG_WORK: [
                    { 
                        wbs_id: "WBS01", wbs_name: "Cọc khoan nhồi T1", 
                        log_date: new Date("2026-02-09"), location_name: "Trụ T1", 
                        description: "Thi công cọc khoan nhồi đại trà cọc D1500",
                        weather_am_idx: 0, weather_pm_idx: 1, 
                        man_cbkt: 2, man_cn: 15,
                        eq_mayxuc: 2, eq_cancau: 1, eq_bua: 0, eq_maylu: 0,
                        eq_catuon: 1, eq_mayhan: 2, eq_damdui: 4, eq_oto: 5,
                        qty_done: 10, unit: "md"
                    },
                    { 
                        wbs_id: "WBS02", wbs_name: "Đổ bê tông lót móng", 
                        log_date: new Date("2026-02-10"), location_name: "Hố móng T1", 
                        description: "Đổ bê tông lót móng M100 dày 10cm",
                        weather_am_idx: 2, weather_pm_idx: 2, 
                        man_cbkt: 1, man_cn: 8,
                        eq_mayxuc: 0, eq_cancau: 0, eq_bua: 0, eq_maylu: 0,
                        eq_catuon: 0, eq_mayhan: 0, eq_damdui: 0, eq_oto: 2,
                        qty_done: 25, unit: "m3"
                    },
                    { 
                        wbs_id: "WBS03", wbs_name: "Lắp dựng cốt thép bệ", 
                        log_date: new Date("2026-02-11"), location_name: "Bệ trụ T1", 
                        description: "Gia công và lắp dựng cốt thép bệ trụ",
                        weather_am_idx: 0, weather_pm_idx: 0,
                        man_cbkt: 2, man_cn: 20,
                        eq_mayxuc: 0, eq_cancau: 1, eq_bua: 0, eq_maylu: 0,
                        eq_catuon: 2, eq_mayhan: 4, eq_damdui: 0, eq_oto: 0,
                        qty_done: 5.5, unit: "tấn"
                    },
                    { 
                        wbs_id: "WBS04", wbs_name: "Lắp dựng ván khuôn", 
                        log_date: new Date("2026-02-12"), location_name: "Bệ trụ T1", 
                        description: "Lắp dựng ván khuôn thép định hình",
                        weather_am_idx: 1, weather_pm_idx: 1, 
                        man_cbkt: 1, man_cn: 12,
                        eq_mayxuc: 0, eq_cancau: 1, eq_bua: 0, eq_maylu: 0,
                        eq_catuon: 0, eq_mayhan: 2, eq_damdui: 0, eq_oto: 1,
                        qty_done: 40, unit: "m2"
                    },
                    { 
                        wbs_id: "WBS05", wbs_name: "Đổ bê tông bệ trụ", 
                        log_date: new Date("2026-02-13"), location_name: "Bệ trụ T1", 
                        description: "Đổ bê tông thương phẩm M300",
                        weather_am_idx: 0, weather_pm_idx: 2, 
                        man_cbkt: 3, man_cn: 15,
                        eq_mayxuc: 0, eq_cancau: 1, eq_bua: 0, eq_maylu: 0,
                        eq_catuon: 0, eq_mayhan: 0, eq_damdui: 4, eq_oto: 0,
                        qty_done: 120, unit: "m3"
                    },
                    { 
                        wbs_id: "WBS06", wbs_name: "Tháo dỡ ván khuôn", 
                        log_date: new Date("2026-02-15"), location_name: "Bệ trụ T1", 
                        description: "Tháo dỡ ván khuôn và bảo dưỡng bê tông",
                        weather_am_idx: 1, weather_pm_idx: 1, 
                        man_cbkt: 1, man_cn: 6,
                        eq_mayxuc: 0, eq_cancau: 1, eq_bua: 0, eq_maylu: 0,
                        eq_catuon: 0, eq_mayhan: 0, eq_damdui: 0, eq_oto: 1,
                        qty_done: 1, unit: "ca"
                    }
                ],
                MasterData: {
                    ZWBS: [
                        { wbs_id: "WBS01", wbs_name: "Cọc khoan nhồi T1" },
                        { wbs_id: "WBS02", wbs_name: "Đổ bê tông lót móng" },
                        { wbs_id: "WBS03", wbs_name: "Lắp dựng cốt thép bệ" },
                        { wbs_id: "WBS04", wbs_name: "Lắp dựng ván khuôn" },
                        { wbs_id: "WBS05", wbs_name: "Đổ bê tông bệ trụ" },
                        { wbs_id: "WBS06", wbs_name: "Tháo dỡ ván khuôn" }
                    ]
                }
            };
            this.getView().setModel(new JSONModel(oData), "dailyLogModel");
        },

        onLogItemSelect: function(oEvent) {
            var oItem = oEvent.getParameter("listItem");
            var oContext = oItem.getBindingContext("dailyLogModel");
            
            var oDetail = this.byId("idDailyLogDetailContainer");
            oDetail.setBindingContext(oContext, "dailyLogModel");

            var oModel = this.getView().getModel("dailyLogModel");
            oModel.setProperty("/ui/isSelected", true);
            oModel.setProperty("/ui/editMode", false);
        },

        onAddLog: function() {
            var that = this;
            var oModel = this.getView().getModel("dailyLogModel");
            
            var oNewModel = new JSONModel({
                log_date: new Date(), wbs_id: "", 
                weather_am_idx: 0, weather_pm_idx: 0, 
                man_cbkt: 0, man_cn: 0,
                eq_mayxuc: 0, eq_cancau: 0, eq_bua: 0, eq_maylu: 0,
                eq_catuon: 0, eq_mayhan: 0, eq_damdui: 0, eq_oto: 0, 
                description: "", location_name: "", qty_done: 0, unit: ""
            });

            var oForm = new SimpleForm({
                editable: true,
                layout: "ResponsiveGridLayout",
                labelSpanXL: 4, labelSpanL: 4, labelSpanM: 4,
                adjustLabelSpan: false,
                columnsXL: 2, columnsL: 2, columnsM: 2,
                content: [
                    // 1. THÔNG TIN CHUNG
                    new Title({ text: "Thông tin chung" }),
                    
                    new Label({ text: "Ngày báo cáo", required: true }),
                    new DatePicker({ value: "{new>/log_date}", displayFormat: "dd/MM/yyyy" }),

                    new Label({ text: "Hạng mục", required: true }),
                    new ComboBox({ 
                        width: "100%", 
                        selectedKey: "{new>/wbs_id}", 
                        items: { 
                            path: "dailyLogModel>/MasterData/ZWBS", 
                            template: new Item({ key: "{dailyLogModel>wbs_id}", text: "{dailyLogModel>wbs_name}" }) 
                        } 
                    }),

                    new Label({ text: "Thời tiết (Sáng)" }),
                    new RadioButtonGroup({ 
                        columns: 3, 
                        selectedIndex: "{new>/weather_am_idx}", 
                        buttons: [ new RadioButton({text:"Nắng"}), new RadioButton({text:"Mát mẻ"}), new RadioButton({text:"Mưa"}) ] 
                    }),

                    new Label({ text: "Thời tiết (Chiều)" }),
                    new RadioButtonGroup({ 
                        columns: 3, 
                        selectedIndex: "{new>/weather_pm_idx}", 
                        buttons: [ new RadioButton({text:"Nắng"}), new RadioButton({text:"Mát mẻ"}), new RadioButton({text:"Mưa"}) ] 
                    }),

                    new Label({ text: "Nhân lực (CBKT/CN)" }),
                    new Input({ value: "{new>/man_cbkt}", type: "Number", placeholder: "CBKT", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),
                    new Input({ value: "{new>/man_cn}", type: "Number", placeholder: "CN", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),

                    // 2. MÁY MÓC THIẾT BỊ
                    new Title({ text: "Máy móc thiết bị" }),

                    new Label({ text: "Máy xúc / Cần cẩu" }),
                    new Input({ value: "{new>/eq_mayxuc}", type: "Number", placeholder: "Máy xúc", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),
                    new Input({ value: "{new>/eq_cancau}", type: "Number", placeholder: "Cần cẩu", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),

                    new Label({ text: "Búa / Máy lu" }),
                    new Input({ value: "{new>/eq_bua}", type: "Number", placeholder: "Búa", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),
                    new Input({ value: "{new>/eq_maylu}", type: "Number", placeholder: "Máy lu", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),

                    new Label({ text: "Cắt uốn / Máy hàn" }),
                    new Input({ value: "{new>/eq_catuon}", type: "Number", placeholder: "Cắt uốn", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),
                    new Input({ value: "{new>/eq_mayhan}", type: "Number", placeholder: "Máy hàn", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),

                    new Label({ text: "Đầm dùi / Ô tô" }),
                    new Input({ value: "{new>/eq_damdui}", type: "Number", placeholder: "Đầm dùi", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),
                    new Input({ value: "{new>/eq_oto}", type: "Number", placeholder: "Ô tô", layoutData: new GridData({ span: "XL2 L2 M2 S4" }) }),

                    // 3. CHI TIẾT
                    new Title({ text: "Chi tiết thực hiện" }),
                    
                    new Label({ text: "Mô tả công việc" }),
                    new TextArea({ value: "{new>/description}", rows: 3 }),

                
                ]
            });

            var oDialog = new Dialog({
                title: "Thêm Nhật Ký Thi Công",
                contentWidth: "800px",
                content: [ oForm ],
                beginButton: new Button({
                    text: "Lưu", type: "Emphasized",
                    press: function() {
                        var oNewData = oNewModel.getData();
                        if (!oNewData.wbs_id) { MessageToast.show("Vui lòng chọn Hạng mục!"); return; }
                        
                        var oWbs = oModel.getProperty("/MasterData/ZWBS").find(function(i) { return i.wbs_id === oNewData.wbs_id; });
                        oNewData.wbs_name = oWbs ? oWbs.wbs_name : "";
                        
                        var aLogs = oModel.getProperty("/ZLOG_WORK");
                        aLogs.push(oNewData);
                        oModel.setProperty("/ZLOG_WORK", aLogs);
                        
                        oDialog.close();
                        MessageToast.show("Thêm thành công!");
                    }
                }),
                endButton: new Button({ text: "Hủy", press: function() { oDialog.close(); } }),
                afterClose: function() { oDialog.destroy(); }
            });

            oDialog.setModel(oNewModel, "new");
            oDialog.setModel(oModel, "dailyLogModel");
            oDialog.open();
        },

        // --- CÁC HÀM SỬA / XÓA ---
        onToggleEditMode: function() {
            this.getView().getModel("dailyLogModel").setProperty("/ui/editMode", true);
        },
        onSaveEdit: function() {
            this.getView().getModel("dailyLogModel").setProperty("/ui/editMode", false);
            MessageToast.show("Đã lưu thay đổi!");
        },
        onCancelEdit: function() {
            this.getView().getModel("dailyLogModel").setProperty("/ui/editMode", false);
        },
        onDeleteLog: function() {
            var that = this;
            var oTable = this.byId("idDailyLogList");
            var oItem = oTable.getSelectedItem();
            if (!oItem) return;
            MessageBox.confirm("Bạn có chắc muốn xóa nhật ký này?", { 
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var sPath = oItem.getBindingContext("dailyLogModel").getPath();
                        var i = parseInt(sPath.split("/").pop());
                        var aData = that.getView().getModel("dailyLogModel").getProperty("/ZLOG_WORK");
                        aData.splice(i, 1);
                        that.getView().getModel("dailyLogModel").setProperty("/ZLOG_WORK", aData);
                        that.getView().getModel("dailyLogModel").setProperty("/ui/isSelected", false);
                        oTable.removeSelections();
                        MessageToast.show("Đã xóa!");
                    }
                }
            });
        }
    });
});