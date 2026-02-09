// sap.ui.define([
//     "sap/ui/base/Object",
//     "sap/m/MessageToast"
// ], function (BaseObject, MessageToast) {
//     "use strict";

//     const CONFIG = {
//         PIXELS_PER_DAY: 5, 
//         ROW_HEIGHT: "32px",
//         STEP_LABEL: 10      
//     };

//     return BaseObject.extend("com.bts.zbts.controller.delegate.WBSDelegate", {

//         constructor: function (oController) {
//             this._oController = oController;
//             this._pixelsPerDay = CONFIG.PIXELS_PER_DAY;
//             this._dChartStartDate = null;
//         },

//         prepareGanttData: function (aWBSNodes) {
//             // Xử lý trường hợp dữ liệu OData V2 có bọc trong results
//             let rawData = aWBSNodes;
//             if (aWBSNodes && aWBSNodes.results) {
//                 rawData = aWBSNodes.results;
//             }
//             return this._calculateGanttLogic(rawData || []);
//         },

//         // Thay thế method _calculateGanttLogic
// _calculateGanttLogic: function(aNodes) {
//     if (!aNodes || aNodes.length === 0) {
//         let dNow = new Date();
//         this._dChartStartDate = new Date(dNow.getFullYear(), dNow.getMonth(), 1);
//         return { 
//             timeScale: [], 
//             totalWidth: "100%", 
//             pixelsPerDay: this._pixelsPerDay,
//             chartStartDate: this._dChartStartDate 
//         };
//     }

//     // Hàm đệ quy để tìm min/max date
//     const findMinMaxRecursive = (nodes, result) => {
//         nodes.forEach(node => {
//             if (node.StartDate) {
//                 const dStart = new Date(node.StartDate);
//                 if (!result.min || dStart < result.min) result.min = dStart;
//                 if (!result.max || dStart > result.max) result.max = dStart;
//             }
//             if (node.EndDate) {
//                 const dEnd = new Date(node.EndDate);
//                 if (!result.min || dEnd < result.min) result.min = dEnd;
//                 if (!result.max || dEnd > result.max) result.max = dEnd;
//             }
//             // Đệ quy vào children
//             if (node.children && node.children.length > 0) {
//                 findMinMaxRecursive(node.children, result);
//             }
//         });
//     };

//     const result = { min: null, max: null };
//     findMinMaxRecursive(aNodes, result);

//     const minDate = result.min || new Date();
//     const maxDate = result.max || new Date();

//     // Bắt đầu từ đầu tháng của minDate
//     const chartStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
//     this._dChartStartDate = chartStartDate;

//     // Kết thúc vào cuối tháng của maxDate + 1 tháng buffer
//     const chartEndDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
    
//     const aTimeScale = this._generateTimeScale(chartStartDate, chartEndDate);
//     const totalDays = Math.round((chartEndDate - chartStartDate) / (1000 * 3600 * 24)) + 1;

//     return {
//         chartStartDate: chartStartDate,
//         timeScale: aTimeScale,
//         totalWidth: Math.max(totalDays * this._pixelsPerDay, 100) + "px",
//         pixelsPerDay: this._pixelsPerDay
//     };
// },

// // Thêm method để debug
// logGanttData: function(aWBSNodes) {
//     console.log("WBS Data for Gantt:", aWBSNodes);
//     const config = this.prepareGanttData(aWBSNodes);
//     console.log("Gantt Config:", config);
//     return config;
// },

// _generateTimeScale: function (dStart, dEnd) {
//     var aScale = [];
//     var current = new Date(dStart.getTime());
//     var endChart = new Date(dEnd.getTime());
    
//     // Đếm số ngày tuyệt đối từ đầu biểu đồ
//     var absoluteDayIndex = 0; 
//     var step = 5; 

//     while (current <= endChart) {
//         var year = current.getFullYear();
//         var month = current.getMonth();
//         var lastDayOfMonth = new Date(year, month + 1, 0);
//         var boundaryDate = (lastDayOfMonth < endChart) ? lastDayOfMonth : endChart;

//         var daysInBlock = this._getDaysDiff(current, boundaryDate) + 1;

//         if (daysInBlock > 0) {
//             var aDays = [];
//             for (var d = 0; d < daysInBlock; d++) {
//                 var dayDate = new Date(current.getTime());
//                 dayDate.setDate(current.getDate() + d);
//                 var dayNum = dayDate.getDate();
                
//                 // KIỂM TRA NHỊP 5 NGÀY
//                 var bShowLabel = (absoluteDayIndex % step === 0);

//                 aDays.push({
//                     // Nếu không đúng nhịp, để nhãn trống "" để giữ chỗ
//                     label: bShowLabel ? (dayNum < 10 ? "0" + dayNum : "" + dayNum) : "",
//                     // Độ rộng LUÔN LUÔN là PIXELS_PER_DAY (10px) để dóng hàng với Grid bên dưới
//                     width: CONFIG.PIXELS_PER_DAY + "px"
//                 });

//                 absoluteDayIndex++;
//             }

//             aScale.push({
//                 label: current.toLocaleString('default', { month: 'short' }) + " '" + (year % 100),
//                 width: (daysInBlock * CONFIG.PIXELS_PER_DAY) + "px",
//                 days: aDays
//             });
//         }
//         current = new Date(year, month + 1, 1);
//     }
//     return aScale;
// },

//         calcMargin: function (sStart) {
//             if (!sStart || !this._dChartStartDate) return "0px";
//             var d1 = new Date(this._dChartStartDate).setHours(0,0,0,0);
//             var d2 = new Date(sStart).setHours(0,0,0,0);
//             var diff = Math.round((d2 - d1) / (1000 * 3600 * 24));
//             return (diff * this._pixelsPerDay) + "px";
//         },

//         calcWidth: function (sStart, sEnd) {
//             if (!sStart || !sEnd) return "0px";
//             var d1 = new Date(sStart).setHours(0,0,0,0);
//             var d2 = new Date(sEnd).setHours(0,0,0,0);
//             var diff = Math.round((d2 - d1) / (1000 * 3600 * 24)) + 1;
//             return (Math.max(diff, 1) * this._pixelsPerDay) + "px";
//         },

//         _refreshGantt: function() {
//             var oView = this._oController.getView();
//             var oData = oView.getModel("viewData").getData();
//             // Lấy dữ liệu từ NavWBS (kết quả từ Database)
//             var aWBS = oData.NavWBS || []; 
//             var oNewConfig = this.prepareGanttData(aWBS);
//             oView.getModel("viewConfig").setData(oNewConfig, true);
//         },

//         onZoomIn: function() {
//             this._pixelsPerDay += 3;
//             this._refreshGantt();
//         },

//         onZoomOut: function() {
//             if (this._pixelsPerDay > 4) {
//                 this._pixelsPerDay -= 3;
//                 this._refreshGantt();
//             }
//         }
//     });
// });