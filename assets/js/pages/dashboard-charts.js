/* =============================================================================
   Dashboard charts (index.html)
   داده‌های نمونه متناسب با سامانه مدیریت تیکت - مبتنی بر Chart.js
   ============================================================================= */
(function () {
    'use strict';

    var palette = {
        primary: '#0059FF',
        success: '#21D59B',
        warning: '#FFC700',
        orange: '#FA9600',
        danger: '#F0142E',
        info: '#57B8FF',
        gray: '#7E84A3'
    };

    var AXIS_COLOR = '#7E85A2';
    var GRID_COLOR = 'rgba(126,133,162,.16)';
    var FONT = 'inherit';

    /* ------------------------------------------------- توزیع وضعیت تیکت ها -- */
    var statusData = [
        { label: 'خاتمه یافته', value: 268, color: palette.success },
        { label: 'در دست اقدام', value: 58, color: palette.orange },
        { label: 'دریافتی جدید', value: 42, color: palette.info },
        { label: 'ارجاع شده', value: 34, color: palette.primary },
        { label: 'ارسالی جدید', value: 26, color: palette.warning },
        { label: 'بایگانی شده', value: 32, color: palette.gray }
    ];

    var total = statusData.reduce(function (sum, item) { return sum + item.value; }, 0);

    function buildLegend() {
        var holder = document.getElementById('ticketStatusLegend');
        if (!holder) { return; }
        holder.innerHTML = '';
        statusData.forEach(function (item) {
            var li = document.createElement('li');
            li.innerHTML = '<span class="legend-swatch"></span>' +
                '<span class="legend-label"></span>' +
                '<span class="legend-value"></span>';
            li.querySelector('.legend-swatch').style.backgroundColor = item.color;
            li.querySelector('.legend-label').textContent = item.label;
            li.querySelector('.legend-value').textContent = item.value;
            holder.appendChild(li);
        });
    }

    function initStatusChart() {
        var canvas = document.getElementById('ticketStatusChart');
        if (!canvas || typeof Chart === 'undefined') { return; }

        var center = document.querySelector('.donut-center strong, .chart-padding-center');
        if (center) { center.textContent = String(total); }

        new Chart(canvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: statusData.map(function (i) { return i.label; }),
                datasets: [{
                    data: statusData.map(function (i) { return i.value; }),
                    backgroundColor: statusData.map(function (i) { return i.color; }),
                    borderWidth: 0
                }]
            },
            options: {
                cutoutPercentage: 72,
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                tooltips: {
                    callbacks: {
                        label: function (item, data) {
                            var value = data.datasets[0].data[item.index];
                            var percent = Math.round((value / total) * 100);
                            return ' ' + data.labels[item.index] + ': ' + value + ' تیکت (' + percent + '٪)';
                        }
                    }
                }
            }
        });
    }

    /* ------------------------------------------------------ روند تیکت ها ---- */
    var trend = {
        month: {
            range: 'بازه: ۶ ماه گذشته',
            categories: ['اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر'],
            received: [186, 204, 231, 258, 243, 276],
            referred: [64, 71, 88, 96, 82, 104]
        },
        week: {
            range: 'بازه: ۶ هفته گذشته',
            categories: ['هفته ۱', 'هفته ۲', 'هفته ۳', 'هفته ۴', 'هفته ۵', 'هفته ۶'],
            received: [58, 63, 71, 66, 74, 69],
            referred: [19, 22, 26, 21, 28, 24]
        },
        day: {
            range: 'بازه: ۶ روز گذشته',
            categories: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'],
            received: [12, 15, 18, 14, 21, 16],
            referred: [4, 6, 7, 5, 9, 6]
        }
    };

    var trendChart = null;

    function buildTrendChart(mode) {
        var canvas = document.getElementById('trendChart');
        if (!canvas || typeof Chart === 'undefined') { return; }

        var data = trend[mode] || trend.month;
        var rangeLabel = document.getElementById('trendRange');
        if (rangeLabel) { rangeLabel.textContent = data.range; }

        var series = [
            { label: 'دریافتی جدید', data: data.received, backgroundColor: palette.success },
            { label: 'ارجاع شده', data: data.referred, backgroundColor: palette.primary }
        ];

        if (trendChart) {
            trendChart.data.labels = data.categories;
            trendChart.data.datasets.forEach(function (dataset, i) {
                dataset.data = series[i].data;
            });
            trendChart.update();
            return;
        }

        trendChart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: { labels: data.categories, datasets: series },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: { display: false },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (item, d) {
                            return ' ' + d.datasets[item.datasetIndex].label + ': ' + item.yLabel + ' تیکت';
                        }
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: { display: false, drawBorder: false },
                        ticks: { fontColor: AXIS_COLOR, fontSize: 11, fontFamily: FONT }
                    }],
                    yAxes: [{
                        gridLines: { color: GRID_COLOR, drawBorder: false, zeroLineColor: GRID_COLOR },
                        ticks: {
                            beginAtZero: true,
                            fontColor: AXIS_COLOR,
                            fontSize: 11,
                            fontFamily: FONT
                        }
                    }]
                },
                barPercentage: 0.72,
                categoryPercentage: 0.68
            }
        });
    }

    document.addEventListener('dashboard:segmented', function (e) {
        if (e.detail && e.detail.group === 'trend') {
            buildTrendChart(e.detail.value);
        }
    });

    function init() {
        buildLegend();
        initStatusChart();
        buildTrendChart('month');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
