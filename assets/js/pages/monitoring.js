/* =============================================================================
   Monitoring pages – shared behaviour
   - نمایش زنده مقادیر سنسورها (دمو)
   - به‌روزرسانی ساعت آخرین نمونه‌گیری
   - سوئیچ بین بخش‌های هر ماژول
   ============================================================================= */
(function () {
    'use strict';

    /* ------------------------------------------- live values (demo only) ---- */
    function liveValues() {
        var nodes = document.querySelectorAll('[data-live-value]');
        if (!nodes.length) { return; }

        function tick() {
            Array.prototype.forEach.call(nodes, function (node) {
                var base = parseFloat(node.getAttribute('data-live-value'));
                var spread = parseFloat(node.getAttribute('data-live-spread') || '0.6');
                var decimals = parseInt(node.getAttribute('data-live-decimals') || '1', 10);
                var unit = node.getAttribute('data-live-unit') || '';
                var min = node.getAttribute('data-live-min');
                var max = node.getAttribute('data-live-max');

                var value = base + (Math.random() * 2 - 1) * spread;
                if (min !== null) { value = Math.max(parseFloat(min), value); }
                if (max !== null) { value = Math.min(parseFloat(max), value); }
                value = value.toFixed(decimals);

                node.textContent = unit ? value + ' ' + unit : value;
                node.classList.add('is-updated');
                setTimeout(function () { node.classList.remove('is-updated'); }, 400);
            });
        }

        tick();
        setInterval(tick, 5000);
    }

    function liveClock() {
        var nodes = document.querySelectorAll('[data-live-clock]');
        if (!nodes.length) { return; }

        function pad(n) { return n < 10 ? '0' + n : String(n); }

        function tick() {
            var now = new Date();
            var text = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
            Array.prototype.forEach.call(nodes, function (n) { n.textContent = text; });
        }
        tick();
        setInterval(tick, 1000);
    }

    /* ------------------------------------------- Persian digits on the dial -
       Range.js writes the raw latin value into data-value (which the ring
       renders through `content: attr(data-value)`); mirror it with Persian
       digits so it matches the rest of the interface. */
    function localizeRangeDial() {
        var wrap = document.querySelector('.RangeContainer .c-rng__wrapper');
        if (!wrap || !window.MutationObserver) { return; }

        function toFa(value) {
            return String(value === null || value === undefined ? '' : value)
                .replace(/[0-9]/g, function (digit) { return '۰۱۲۳۴۵۶۷۸۹'.charAt(parseInt(digit, 10)); });
        }

        function sync() {
            var current = wrap.getAttribute('data-value');
            if (current === null) { return; }
            var next = toFa(current);
            if (current !== next) { wrap.setAttribute('data-value', next); }
        }

        sync();
        new MutationObserver(sync).observe(wrap, { attributes: true, attributeFilter: ['data-value'] });
    }

    /* module section switching lives in dashboard-ui.js (shared by all pages) */

    function init() {
        liveValues();
        liveClock();
        localizeRangeDial();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
