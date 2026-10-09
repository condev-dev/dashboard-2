/* =============================================================================
   Dashboard UI layer
   - theme (light / dark) with persistence
   - responsive sidebar + collapsible menu groups
   - mobile bottom navigation active state
   - segmented controls, filter pills, counter widgets
   - toast notifications
   Loaded after jQuery / bootstrap / app.js
   ============================================================================= */
(function () {
    'use strict';

    var THEME_KEY = 'db-theme';
    var ROOT = document.documentElement;
    var FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

    /* اعداد ممکن است با ارقام فارسی نوشته شده باشند */
    function toAsciiDigits(text) {
        return String(text)
            .replace(/[\u06F0-\u06F9]/g, function (d) { return String(d.charCodeAt(0) - 0x06F0); })
            .replace(/[\u0660-\u0669]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
    }

    function toFaDigits(value) {
        return String(value).replace(/[0-9]/g, function (d) { return FA_DIGITS[+d]; });
    }

    /* ------------------------------------------------------------- theme ---- */
    function currentTheme() {
        try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; }
    }

    function applyTheme(mode) {
        var dark = mode === 'dark';
        document.body.classList.toggle('dark-mode', dark);
        ROOT.setAttribute('data-db-theme', dark ? 'dark' : 'light');

        var bootstrap = document.getElementById('bootstrap-style');
        var appStyle = document.getElementById('app-style');
        if (bootstrap) {
            bootstrap.setAttribute('href', dark ? 'assets/css/bootstrap-dark.min.css' : 'assets/css/bootstrap.min.css');
        }
        if (appStyle) {
            appStyle.setAttribute('href', dark ? 'assets/css/app-dark.css' : 'assets/css/app.css');
        }

        var light = document.getElementById('light-mode-switch');
        var darkSw = document.getElementById('dark-mode-switch');
        if (light) { light.checked = !dark; }
        if (darkSw) { darkSw.checked = dark; }

        // آیکون دکمه‌ی طرح در نوار بالا، حالت بعدی را نشان می‌دهد
        var toggleIcon = document.querySelector('#theme-toggle i');
        if (toggleIcon) {
            toggleIcon.className = 'mdi ' + (dark ? 'mdi-weather-sunny' : 'mdi-weather-night');
        }
        var toggle = document.getElementById('theme-toggle');
        if (toggle) {
            var label = dark ? 'تغییر به طرح روشن' : 'تغییر به طرح تیره';
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
        }

        try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* ignore */ }
    }

    function initTheme() {
        applyTheme(currentTheme());

        var toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', function () {
                applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
            });
        }

        var light = document.getElementById('light-mode-switch');
        var darkSw = document.getElementById('dark-mode-switch');
        if (light) {
            light.addEventListener('change', function () { if (light.checked) { applyTheme('light'); } });
        }
        if (darkSw) {
            darkSw.addEventListener('change', function () { if (darkSw.checked) { applyTheme('dark'); } });
        }
    }

    /* ----------------------------------------------------------- sidebar ---- */
    function initSidebar() {
        var toggle = document.getElementById('vertical-menu-btn');
        var overlay = document.querySelector('.sidebar-overlay');

        function isOpen() { return document.body.classList.contains('sidebar-enable'); }

        function sync() {
            if (toggle) { toggle.setAttribute('aria-expanded', isOpen() ? 'true' : 'false'); }
        }

        function closeSidebar() {
            document.body.classList.remove('sidebar-enable');
            sync();
        }

        // this is the ONLY handler for the hamburger (app.js used to bind it too
        // and the two toggles cancelled each other out on mobile)
        if (toggle) {
            toggle.setAttribute('aria-expanded', 'false');
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                document.body.classList.toggle('sidebar-enable');
                sync();
            });
        }

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }
        overlay.addEventListener('click', closeSidebar);

        // Esc closes the drawer; going back to the desktop layout also resets it
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) { closeSidebar(); }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth >= 992 && isOpen()) { closeSidebar(); }
        });
        // tapping a link inside the drawer closes it before the page changes
        var drawerLinks = document.querySelectorAll('.vertical-menu a[href]');
        Array.prototype.forEach.call(drawerLinks, function (a) {
            a.addEventListener('click', function () {
                if (window.innerWidth < 992) { closeSidebar(); }
            });
        });
        sync();

        // collapsible groups – the header only toggles, the sub-links navigate
        var toggles = document.querySelectorAll('.dash-menu .nav-toggle');
        Array.prototype.forEach.call(toggles, function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                var li = btn.closest('.nav-item');
                if (!li) { return; }
                var open = li.classList.toggle('open');
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });

        // mark active link + open its group
        var here = window.location.pathname.split('/').pop() || 'index.html';
        var links = document.querySelectorAll('.dash-menu a[href]');
        Array.prototype.forEach.call(links, function (a) {
            var href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
            if (!href || href === '#') { return; }
            if (href === here) {
                a.classList.add('active');
                var li = a.closest('.nav-item');
                if (li) { li.classList.add('menu-active'); }
                var group = a.closest('.nav-sub');
                if (group) {
                    var owner = group.closest('.nav-item');
                    if (owner) {
                        owner.classList.add('open');
                        var t = owner.querySelector('.nav-toggle');
                        if (t) { t.setAttribute('aria-expanded', 'true'); }
                    }
                }
            }
        });

        // mobile bottom navigation
        var bottom = document.querySelectorAll('.navigation-bottom .nav-btm-item');
        Array.prototype.forEach.call(bottom, function (a) {
            var href = (a.getAttribute('href') || '').split('?')[0];
            if (href === here) { a.classList.add('active'); }
        });
    }

    /* --------------------------------------------------------- segmented ---- */
    function initSegmented() {
        var groups = document.querySelectorAll('[data-segmented]');
        Array.prototype.forEach.call(groups, function (group) {
            var buttons = group.querySelectorAll('.segmented-item');
            Array.prototype.forEach.call(buttons, function (btn) {
                btn.addEventListener('click', function () {
                    Array.prototype.forEach.call(buttons, function (b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    var target = group.getAttribute('data-segmented');
                    var event;
                    try {
                        event = new CustomEvent('dashboard:segmented', {
                            detail: { group: target, value: btn.getAttribute('data-value'), label: btn.textContent.trim() }
                        });
                    } catch (e) { return; }
                    document.dispatchEvent(event);
                });
            });
        });
    }

    /* ------------------------------------------------------ filter pills ---- */
    function initFilters() {
        var groups = document.querySelectorAll('[data-filter-target]');
        Array.prototype.forEach.call(groups, function (group) {
            var selector = group.getAttribute('data-filter-target');
            var rows = document.querySelectorAll(selector);
            var pills = group.querySelectorAll('.pill');
            Array.prototype.forEach.call(pills, function (pill) {
                pill.addEventListener('click', function () {
                    Array.prototype.forEach.call(pills, function (p) { p.classList.remove('active'); });
                    pill.classList.add('active');
                    var value = pill.getAttribute('data-filter') || 'all';
                    var shown = 0;
                    Array.prototype.forEach.call(rows, function (row) {
                        var match = value === 'all' || row.getAttribute('data-status') === value;
                        row.style.display = match ? '' : 'none';
                        if (match) { shown++; }
                    });
                    var empty = document.querySelector(group.getAttribute('data-empty-target') || '');
                    if (empty) { empty.style.display = shown === 0 ? 'block' : 'none'; }
                });
            });
        });
    }

    /* --------------------------------------------------------- counters ---- */
    function initCounters() {
        var widgets = document.querySelectorAll('[data-counter]');
        Array.prototype.forEach.call(widgets, function (w) {
            var valueEl = w.querySelector('.counter-value');
            if (!valueEl) { return; }
            var min = parseInt(w.getAttribute('data-min') || '0', 10);
            var max = parseInt(w.getAttribute('data-max') || '100', 10);
            var step = parseInt(w.getAttribute('data-step') || '1', 10);
            var unit = w.getAttribute('data-unit') || '';

            function read() {
                var n = parseInt(toAsciiDigits(valueEl.textContent || '0').replace(/[^\d-]/g, ''), 10);
                return isNaN(n) ? 0 : n;
            }
            function write(n) {
                n = Math.max(min, Math.min(max, n));
                valueEl.textContent = unit ? toFaDigits(n) + ' ' + unit : toFaDigits(n);
            }
            var minus = w.querySelector('.counter-btn.minus');
            var plus = w.querySelector('.counter-btn.plus');
            if (minus) { minus.addEventListener('click', function () { write(read() - step); }); }
            if (plus) { plus.addEventListener('click', function () { write(read() + step); }); }
            write(read());
        });
    }

    /* ----------------------------------------------------------- toasts ---- */
    function toast(message, kind) {
        var stack = document.querySelector('.toast-stack');
        if (!stack) {
            stack = document.createElement('div');
            stack.className = 'toast-stack';
            document.body.appendChild(stack);
        }
        var el = document.createElement('div');
        el.className = 'db-toast';
        var icon = kind === 'error' ? 'mdi mdi-alert-circle-outline' : 'mdi mdi-check-circle-outline';
        el.innerHTML = '<span class="db-toast-icon"><i class="' + icon + '"></i></span><span></span>';
        el.lastChild.textContent = message;
        stack.appendChild(el);
        setTimeout(function () {
            el.style.transition = 'opacity .2s ease';
            el.style.opacity = '0';
            setTimeout(function () { if (el.parentNode) { el.parentNode.removeChild(el); } }, 220);
        }, 2600);
    }

    /* ------------------------------------------------------------ helpers -- */
    function initDemoButtons() {
        var nodes = document.querySelectorAll('[data-demo-message]');
        Array.prototype.forEach.call(nodes, function (node) {
            node.addEventListener('click', function (e) {
                if (node.tagName === 'A' && !node.getAttribute('href')) { e.preventDefault(); }
                toast(node.getAttribute('data-demo-message'));
            });
        });
    }

    /* --------------------------------------------------- view switch -------
       هر ماژول (مانیتورینگ / تنظیمات) یک نوار تب دارد؛ تب فعال و پنل متناظر
       همیشه هم‌گام نگه داشته می‌شوند و انتخابگر موبایل هم با تب‌ها سینک است. */
    function initViewSwitch() {
        var containers = document.querySelectorAll('.Button_Container[data-views]');
        Array.prototype.forEach.call(containers, function (container) {
            var views = container.getAttribute('data-views');
            if (!views) { return; }
            var tabs = container.querySelectorAll('button[data-target]');
            var select = container.querySelector('select');
            if (!tabs.length && !select) { return; }

            function show(target) {
                if (!target) { return; }
                Array.prototype.forEach.call(document.querySelectorAll(views), function (el) {
                    el.style.display = 'none';
                });
                var el = document.querySelector(target);
                if (el) { el.style.display = ''; }
                Array.prototype.forEach.call(tabs, function (b) {
                    var on = b.getAttribute('data-target') === target;
                    b.classList.toggle('selectedButton', on);
                    b.setAttribute('aria-selected', on ? 'true' : 'false');
                });
                if (select && select.value !== target) { select.value = target; }
                try {
                    document.dispatchEvent(new CustomEvent('dashboard:view', { detail: { target: target } }));
                } catch (e) { /* ignore */ }
            }

            Array.prototype.forEach.call(tabs, function (btn) {
                btn.setAttribute('role', 'tab');
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    show(btn.getAttribute('data-target'));
                });
            });

            if (select) {
                select.addEventListener('change', function () {
                    if (select.value) { show(select.value); }
                });
            }

            var active = container.querySelector('button.selectedButton') || tabs[0];
            if (active) { show(active.getAttribute('data-target')); }
        });
    }

    /* ------------------------------------------------------------ search ---- */
    function initSearch() {
        var box = document.querySelector('.app-search');
        var toggles = document.querySelectorAll('[data-search-toggle]');
        if (toggles.length && box) {
            Array.prototype.forEach.call(toggles, function (t) {
                t.addEventListener('click', function (e) {
                    e.preventDefault();
                    var open = box.classList.toggle('search-open');
                    if (open) { var i = box.querySelector('input'); if (i) { i.focus(); } }
                });
            });
        }
        if (!box) { return; }
        var input = box.querySelector('input');
        if (!input) { return; }

        var rows = document.querySelectorAll('table tbody tr, .searchable-item');
        if (!rows.length) { return; }
        var counter = document.querySelector('[data-search-count]');

        input.addEventListener('input', function () {
            var q = (input.value || '').trim().toLowerCase();
            var shown = 0;
            Array.prototype.forEach.call(rows, function (row) {
                var match = q === '' || (row.textContent || '').toLowerCase().indexOf(q) !== -1;
                row.style.display = match ? '' : 'none';
                if (match) { shown++; }
            });
            if (counter) { counter.textContent = String(shown); }
        });
    }

    /* ------------------------------------------- legacy inline helpers -------
       صفحات از onclick های قدیمی استفاده می‌کنند؛ اینجا پیاده‌سازی واقعی می‌شود. */
    window.SelectedButton = function (btn) {
        var group = btn.parentNode;
        if (!group) { return; }
        Array.prototype.forEach.call(group.querySelectorAll('.selectedButton'), function (b) {
            b.classList.remove('selectedButton');
        });
        btn.classList.add('selectedButton');
    };

    function stepCounter(el, delta) {
        var parent = el.parentNode;
        if (!parent) { return; }
        var valueEl = parent.children[1];
        if (!valueEl) { return; }
        var min = parseInt(parent.getAttribute('data-min') || '0', 10);
        var max = parseInt(parent.getAttribute('data-max') || '120', 10);
        var current = parseInt(toAsciiDigits(valueEl.textContent || '0').replace(/[^\d-]/g, ''), 10);
        if (isNaN(current)) { current = 0; }
        current = Math.max(min, Math.min(max, current + delta));
        valueEl.textContent = toFaDigits(current);
    }

    window.Plus = function (el) { stepCounter(el, 1); };
    window.Low = function (el) { stepCounter(el, -1); };


    /* -------------------------------------------------------- pagination ---- */
    function initPagination() {
        var bars = document.querySelectorAll('[data-pagination]');
        Array.prototype.forEach.call(bars, function (bar) {
            var selector = bar.getAttribute('data-target');
            var size = parseInt(bar.getAttribute('data-page-size') || '6', 10);
            if (!selector) { return; }
            var items = Array.prototype.slice.call(document.querySelectorAll(selector));
            if (!items.length) { return; }

            var pages = Math.ceil(items.length / size);
            var current = 1;
            var nav = document.createElement('ul');
            nav.className = 'pagination';
            nav.setAttribute('dir', 'ltr');
            bar.innerHTML = '';
            bar.appendChild(nav);
            var summary = document.querySelector(bar.getAttribute('data-pagination-summary') || '[data-pagination-summary]');

            function go(page) {
                if (page < 1 || page > pages) { return; }
                current = page;
                items.forEach(function (el, i) {
                    el.style.display = (Math.floor(i / size) + 1 === page) ? '' : 'none';
                });
                if (summary) {
                    var from = (page - 1) * size + 1;
                    var to = Math.min(page * size, items.length);
                    summary.textContent = 'نمایش ' + toFaDigits(from) + ' تا ' + toFaDigits(to) +
                        ' از ' + toFaDigits(items.length) + ' مورد';
                }
                draw();
            }

            function entry(label, page, opts) {
                opts = opts || {};
                var li = document.createElement('li');
                li.className = 'page-item' + (opts.active ? ' active' : '') + (opts.disabled ? ' disabled' : '');
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'page-link';
                btn.innerHTML = label;
                if (opts.disabled) {
                    btn.disabled = true;
                } else {
                    btn.addEventListener('click', function () { go(page); });
                }
                li.appendChild(btn);
                nav.appendChild(li);
            }

            function draw() {
                nav.innerHTML = '';
                entry('<i class="fa fa-angle-right"></i>', current - 1, { disabled: current === 1 });
                for (var p = 1; p <= pages; p++) {
                    entry(toFaDigits(p), p, { active: p === current });
                }
                entry('<i class="fa fa-angle-left"></i>', current + 1, { disabled: current === pages });
            }

            if (pages > 1) { go(1); } else { bar.innerHTML = ''; if (summary) { summary.textContent = 'نمایش ' + items.length + ' مورد'; } }
        });
    }

    /* ---------------------------------------- dropdown value pickers ------- */
    function initDropdownLabels() {
        var items = document.querySelectorAll('[data-set-label]');
        Array.prototype.forEach.call(items, function (item) {
            item.addEventListener('click', function () {
                var holder = item.closest('.dropdown') || item.closest('.btn-group');
                if (!holder) { return; }
                var toggle = holder.querySelector('[data-toggle="dropdown"]');
                if (!toggle) { return; }
                var icon = toggle.querySelector('i');
                var label = item.textContent.trim();
                toggle.textContent = label + ' ';
                if (icon) { toggle.appendChild(icon); }
                toast('مقدار انتخاب شد: ' + label);
            });
        });
    }


    /* ------------------------------------------------------------ survey ---- */
    function initSurvey() {
        var box = document.querySelector('[data-survey]');
        if (!box) { return; }
        var answers = box.querySelectorAll('[data-survey-answer]');
        if (!answers.length) { return; }

        var names = {};
        Array.prototype.forEach.call(answers, function (a) { names[a.name] = true; });
        var total = Object.keys(names).length;

        var progress = document.querySelector('[data-survey-progress]');
        var count = document.querySelector('[data-survey-count]');
        var avgEl = document.querySelector('[data-survey-average]');
        var FA = '۰۱۲۳۴۵۶۷۸۹';

        function toFa(text) {
            return String(text).replace(/[0-9]/g, function (d) { return FA[+d]; });
        }

        function update() {
            var sum = 0;
            var answered = 0;
            Array.prototype.forEach.call(answers, function (a) {
                if (a.checked) { sum += parseInt(a.value, 10) || 0; answered++; }
            });
            if (progress) { progress.style.width = (total ? Math.round((answered / total) * 100) : 0) + '%'; }
            if (count) { count.textContent = toFa(answered); }
            if (avgEl) {
                avgEl.textContent = answered
                    ? 'میانگین امتیاز شما: ' + toFa((sum / answered).toFixed(1).replace('.', '٫')) + ' از ۵'
                    : '';
            }
        }

        Array.prototype.forEach.call(answers, function (a) { a.addEventListener('change', update); });
        update();
    }

    function init() {
        initTheme();
        initSidebar();
        initSegmented();
        initFilters();
        initCounters();
        initSearch();
        initViewSwitch();
        initPagination();
        initDropdownLabels();
        initSurvey();
        initDemoButtons();
    }

    window.DashUI = {
        toast: toast,
        applyTheme: applyTheme,
        currentTheme: currentTheme,
        stepCounter: stepCounter
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
