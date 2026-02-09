sap.ui.define([
    "sap/ui/base/Object"
], function (BaseObject) {
    "use strict";

    const CONFIG = {
        PIXELS_PER_DAY: 5,
        STEP_LABEL: 8
    };

    return BaseObject.extend("com.bts.zbts.controller.delegate.WBSDelegate", {
        constructor: function (oController) {
            this._pixelsPerDay = CONFIG.PIXELS_PER_DAY;
            this._dChartStartDate = null;
        },

        _parseDate: function (value) {
            if (!value) return null;
            if (value instanceof Date) return value;
            var timestamp = Date.parse(value);
            if (!isNaN(timestamp)) return new Date(timestamp);
            if (typeof value === 'string' && value.includes('/')) {
                var parts = value.split('/');
                if (parts.length === 3) {
                    return new Date(parts[2], parseInt(parts[1], 10) - 1, parts[0]);
                }
            }
            return null;
        },

        _enrichWbsDates: function (aNodes) {
            var that = this;
            aNodes.forEach(function (node) {
                if (node.children && node.children.length > 0) {
                    that._enrichWbsDates(node.children);

                    var minStart = null;
                    var maxEnd = null;

                    node.children.forEach(function (child) {
                        var dStart = that._parseDate(child.PlanStartDate);
                        var dEnd = that._parseDate(child.PlanEndDate);

                        if (dStart) {
                            if (!minStart || dStart < minStart) minStart = dStart;
                        }
                        if (dEnd) {
                            if (!maxEnd || dEnd > maxEnd) maxEnd = dEnd;
                        }
                    });

                    if (minStart) node.PlanStartDate = minStart;
                    if (maxEnd) node.PlanEndDate = maxEnd;
                }
            });
        },

        prepareGanttData: function (aNodes) {
            this._enrichWbsDates(aNodes || []);
            return this._calculateGanttLogic(aNodes || []);
        },

        _calculateGanttLogic: function (aNodes) {
            var minDate = null;
            var maxDate = null;
            var that = this;

            var collectDates = function (nodes) {
                nodes.forEach(function (node) {
                    var dStart = that._parseDate(node.PlanStartDate);
                    var dEnd = that._parseDate(node.PlanEndDate);

                    if (dStart) {
                        if (!minDate || dStart < minDate) minDate = dStart;
                        if (!maxDate || dStart > maxDate) maxDate = dStart;
                    }
                    if (dEnd) {
                        if (!minDate || dEnd < minDate) minDate = dEnd;
                        if (!maxDate || dEnd > maxDate) maxDate = dEnd;
                    }
                    if (node.children && node.children.length > 0) {
                        collectDates(node.children);
                    }
                });
            };

            collectDates(aNodes);

            minDate = minDate || new Date();
            maxDate = maxDate || new Date();

            var chartStart = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
            chartStart.setHours(0, 0, 0, 0);
            this._dChartStartDate = chartStart;

            var chartEnd = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
            chartEnd.setHours(0, 0, 0, 0);

            var generated = this._generateTimeScale(chartStart, chartEnd);
            return {
                timeScale: generated.timeScale,
                totalWidth: generated.totalWidth,
                pixelsPerDay: this._pixelsPerDay,
                chartStartDate: chartStart
            };
        },

        _generateTimeScale: function (dStart, dEnd) {
            var timeScale = [];
            var totalDays = 0;
            var current = new Date(dStart);

            var MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            while (current.getTime() <= dEnd.getTime()) {
                var currentMonth = current.getMonth();
                var currentYear = current.getFullYear();
                var nextMonth = new Date(currentYear, currentMonth + 1, 1);
                var daysInThisMonth = [];
                var iterDate = new Date(current);

                while (iterDate.getTime() < nextMonth.getTime() && iterDate.getTime() <= dEnd.getTime()) {
                    var dayNum = iterDate.getDate();
                    var label = (dayNum === 1 || dayNum % CONFIG.STEP_LABEL === 0) ? String(dayNum) : "";

                    daysInThisMonth.push({
                        dayLabel: label,
                        dayWidth: this._pixelsPerDay + "px"
                    });

                    totalDays++;
                    iterDate.setDate(iterDate.getDate() + 1);
                }

                var shortYear = String(currentYear);
                var engMonthLabel = MONTH_NAMES[currentMonth] + " " + shortYear;

                timeScale.push({
                    monthLabel: engMonthLabel,
                    monthWidth: (daysInThisMonth.length * this._pixelsPerDay) + "px",
                    days: daysInThisMonth
                });
                current = nextMonth;
            }

            return {
                timeScale: timeScale,
                totalWidth: (totalDays * this._pixelsPerDay) + "px"
            };
        },

        calcMargin: function (sStart) {
            if (!sStart || !this._dChartStartDate) return "0px";
            var dStart = this._parseDate(sStart);
            if (!dStart) return "0px";
            dStart.setHours(0, 0, 0, 0);
            var diffDays = Math.round((dStart - this._dChartStartDate) / (1000 * 60 * 60 * 24));
            if (diffDays < 0) diffDays = 0;
            return (diffDays * this._pixelsPerDay) + "px";
        },

        calcWidth: function (sStart, sEnd) {
            if (!sStart || !sEnd) return "0px";
            var dStart = this._parseDate(sStart);
            var dEnd = this._parseDate(sEnd);
            if (!dStart || !dEnd) return "0px";
            dStart.setHours(0, 0, 0, 0);
            dEnd.setHours(0, 0, 0, 0);
            var diffDays = Math.round((dEnd.getTime() - dStart.getTime()) / (1000 * 3600 * 24));
            return ((diffDays + 1) * this._pixelsPerDay) + "px";
        }
    });
});