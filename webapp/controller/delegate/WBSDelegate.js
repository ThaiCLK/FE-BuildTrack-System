sap.ui.define([
    "sap/ui/base/Object",
    "sap/m/MessageToast"
], function (BaseObject, MessageToast) {
    "use strict";

    const CONFIG = {
        PIXELS_PER_DAY: 4, 
        ROW_HEIGHT: "32px",
        STEP_LABEL: 7 
    };

    return BaseObject.extend("com.bts.zbts.controller.delegate.WBSDelegate", {

        constructor: function (oController) {
            this._oController = oController;
        },

        prepareGanttData: function (aWBSNodes) {
            return this._calculateGanttLogic(aWBSNodes);
        },

        // --- 1. LOGIC TÍNH TOÁN CẤU TRÚC GANTT ---
        _calculateGanttLogic: function(aWBSNodes) {
            if (!aWBSNodes || aWBSNodes.length === 0) {
                return { 
                    chartStartDate: new Date(), 
                    timeScale: [], 
                    totalWidth: "100%", 
                    pixelsPerDay: CONFIG.PIXELS_PER_DAY,
                    rowHeight: CONFIG.ROW_HEIGHT
                };
            }

            var minDate = null, maxDate = null;
            var findMinMax = function (nodes) {
                nodes.forEach(node => {
                    var dStart = node.StartDate ? new Date(node.StartDate) : null;
                    var dEnd = node.EndDate ? new Date(node.EndDate) : null;
                    if (dStart) {
                        if (!minDate || dStart < minDate) minDate = dStart;
                        if (!maxDate || dStart > maxDate) maxDate = dStart;
                    }
                    if (dEnd) {
                        if (!minDate || dEnd < minDate) minDate = dEnd;
                        if (!maxDate || dEnd > maxDate) maxDate = dEnd;
                    }
                    if (node.children) findMinMax(node.children);
                });
            };
            findMinMax(aWBSNodes);

            if (!minDate) minDate = new Date();
            if (!maxDate) maxDate = new Date();

            // CHỐT NGÀY BẮT ĐẦU: Luôn bắt đầu từ mùng 1 của tháng chứa ngày nhỏ nhất
            var chartStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            chartStartDate.setHours(0, 0, 0, 0); 

            // CHỐT NGÀY KẾT THÚC: Luôn kết thúc vào ngày cuối cùng của tháng chứa ngày lớn nhất
            var chartEndDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
            chartEndDate.setHours(23, 59, 59, 999);

            this._dChartStartDate = chartStartDate;

            var aTimeScale = this._generateTimeScale(chartStartDate, chartEndDate);
            
            // Tính tổng số ngày thuần túy: (Cuối - Đầu) + 1
            var totalDays = this._getDaysDiff(chartStartDate, chartEndDate) + 1;
            var totalWidthPx = totalDays * CONFIG.PIXELS_PER_DAY;

            return {
                chartStartDate: chartStartDate,
                timeScale: aTimeScale,
                totalWidth: totalWidthPx + "px",
                pixelsPerDay: CONFIG.PIXELS_PER_DAY,
                rowHeight: CONFIG.ROW_HEIGHT
            };
        },

        // --- 2. TẠO HEADER (HIỂN THỊ CẢ THÁNG VÀ NGÀY) ---
        _generateTimeScale: function (dStart, dEnd) {
    var aScale = [];
    var current = new Date(dStart.getTime());
    var endChart = new Date(dEnd.getTime());
    
    // Đếm số ngày tuyệt đối từ đầu biểu đồ
    var absoluteDayIndex = 0; 
    var step = 5; 

    while (current <= endChart) {
        var year = current.getFullYear();
        var month = current.getMonth();
        var lastDayOfMonth = new Date(year, month + 1, 0);
        var boundaryDate = (lastDayOfMonth < endChart) ? lastDayOfMonth : endChart;

        var daysInBlock = this._getDaysDiff(current, boundaryDate) + 1;

        if (daysInBlock > 0) {
            var aDays = [];
            for (var d = 0; d < daysInBlock; d++) {
                var dayDate = new Date(current.getTime());
                dayDate.setDate(current.getDate() + d);
                var dayNum = dayDate.getDate();
                
                // KIỂM TRA NHỊP 5 NGÀY
                var bShowLabel = (absoluteDayIndex % step === 0);

                aDays.push({
                    // Nếu không đúng nhịp, để nhãn trống "" để giữ chỗ
                    label: bShowLabel ? (dayNum < 10 ? "0" + dayNum : "" + dayNum) : "",
                    // Độ rộng LUÔN LUÔN là PIXELS_PER_DAY (10px) để dóng hàng với Grid bên dưới
                    width: CONFIG.PIXELS_PER_DAY + "px"
                });

                absoluteDayIndex++;
            }

            aScale.push({
                label: current.toLocaleString('default', { month: 'short' }) + " '" + (year % 100),
                width: (daysInBlock * CONFIG.PIXELS_PER_DAY) + "px",
                days: aDays
            });
        }
        current = new Date(year, month + 1, 1);
    }
    return aScale;
},

        // --- 3. TÍNH TOÁN VỊ TRÍ VÀ ĐỘ RỘNG (CHỐT CHUẨN) ---
        
        // Hàm cốt lõi: Tính khoảng cách ngày không phụ thuộc múi giờ
        _getDaysDiff: function(d1, d2) {
            var date1 = new Date(d1);
            var date2 = new Date(d2);
            // Đưa về 12 giờ trưa để triệt tiêu sai số giờ/phút/giây
            date1.setHours(12, 0, 0, 0);
            date2.setHours(12, 0, 0, 0);
            
            var timeDiff = date2.getTime() - date1.getTime();
            return Math.round(timeDiff / (1000 * 3600 * 24));
        },

        calcMargin: function (sStart) {
            if (!sStart || !this._dChartStartDate) return "0px";
            var daysDiff = this._getDaysDiff(this._dChartStartDate, sStart);
            return (daysDiff * CONFIG.PIXELS_PER_DAY) + "px";
        },

        calcWidth: function (sStart, sEnd) {
            if (!sStart || !sEnd) return "0px";
            var daysDiff = this._getDaysDiff(sStart, sEnd) + 1;
            if (daysDiff <= 0) return "0px";
            return (daysDiff * CONFIG.PIXELS_PER_DAY) + "px";
        },

        // --- 4. CÁC HÀM THAO TÁC DỮ LIỆU ---
        _refreshGanttConfig: function(oView, aWBS) {
            var oGanttConfig = this.prepareGanttData(aWBS);
            var oConfigModel = oView.getModel("viewConfig");
            if (oConfigModel) {
                oConfigModel.setData(oGanttConfig, true);
            }
        },

        onAddNewTask: function() {
            var oView = this._oController.getView();
            var oModel = oView.getModel("viewData");
            var oTreeTable = oView.byId("wbsTreeTable");

            if (!oModel || !oTreeTable) return;

            var oData = oModel.getData();
            if (!oData.WBS) oData.WBS = [];

            var iSelectedIndex = oTreeTable.getSelectedIndex();
            var oNewItem = {
                "TaskID": "NEW_" + new Date().getTime(),
                "StartDate": new Date(),
                "EndDate": new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                "Type": "TASK",
                "children": []
            };

            if (iSelectedIndex < 0) {
                oNewItem.TaskName = "New Phase";
                oNewItem.Type = "PHASE";
                oData.WBS.push(oNewItem);
            } else {
                var oContext = oTreeTable.getContextByIndex(iSelectedIndex);
                var oParentNode = oContext.getObject();
                oNewItem.TaskName = "New Task";
                if (!oParentNode.children) oParentNode.children = [];
                oParentNode.children.push(oNewItem);
                oTreeTable.expand(iSelectedIndex);
            }

            oModel.refresh();
            this._refreshGanttConfig(oView, oData.WBS);
        },

        onDeleteTask: function() {
            var oView = this._oController.getView();
            var oModel = oView.getModel("viewData");
            var oTreeTable = oView.byId("wbsTreeTable");

            var iSelectedIndex = oTreeTable.getSelectedIndex();
            if (iSelectedIndex < 0) return;

            var oContext = oTreeTable.getContextByIndex(iSelectedIndex);
            var sPath = oContext.getPath();
            var aPathParts = sPath.split("/");
            var iIndexToDelete = parseInt(aPathParts.pop(), 10);
            var sParentPath = aPathParts.join("/");

            var aContainer = oModel.getProperty(sParentPath);
            if (Array.isArray(aContainer)) {
                aContainer.splice(iIndexToDelete, 1);
                oModel.refresh();
                oTreeTable.clearSelection();
                this._refreshGanttConfig(oView, oModel.getData().WBS);
            }
        }
    });
});