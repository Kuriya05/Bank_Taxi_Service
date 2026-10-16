// booking-summary.js — หน้าจองรถ: แถบขั้นตอน + กล่องสรุปการจองที่อัปเดตทันทีระหว่างกรอก
// อ่านค่าจากฟอร์มอย่างเดียว ไม่ยุ่งกับการบันทึกการจอง (Firebase / ใบจอง อยู่ในสคริปต์ของหน้าและ receipt.js)
(function () {
    const card = document.querySelector('.booking-card');
    const form = document.getElementById('bookingForm');
    if (!card || !form) return;
    const isEn = document.documentElement.lang === 'en';
    const lang = isEn ? 'en' : 'th';
    const T = isEn ? {
        steps: ['Your details', 'Trip', 'Pay deposit', 'Confirmation'],
        sections: ['Your details', 'Trip details', 'Anything else?'],
        title: 'Booking summary', live: 'Updates as you type',
        noCar: 'No vehicle selected yet', seeCars: 'Compare vehicles',
        trip: 'Trip', route: 'Route', date: 'Date', time: 'Pick-up time', pickRoute: 'Choose a route',
        price: 'Price', total: 'Total fare', deposit: 'Deposit (pay now)', balance: 'Pay driver on the day',
        you: 'Your details', name: 'Name', phone: 'Phone', line: 'LINE ID', email: 'Email', notes: 'Notes',
        rules: ['400 THB deposit by PromptPay', 'Deposit is non-refundable if you cancel', 'Booking confirmation right after sending the slip'],
        help: 'Need help?', thb: 'THB', seats: 'seats', locale: 'en-GB', cars: 'cars-en.html'
    } : {
        steps: ['ข้อมูลผู้จอง', 'การเดินทาง', 'ชำระมัดจำ', 'รับใบจอง'],
        sections: ['ข้อมูลผู้จอง', 'รายละเอียดการเดินทาง', 'ข้อมูลเพิ่มเติม'],
        title: 'สรุปการจอง', live: 'อัปเดตอัตโนมัติขณะกรอก',
        noCar: 'ยังไม่ได้เลือกรถ', seeCars: 'ดูรถทั้งหมด',
        trip: 'การเดินทาง', route: 'เส้นทาง', date: 'วันที่', time: 'เวลารับ', pickRoute: 'เลือกเส้นทาง',
        price: 'ราคา', total: 'ค่าโดยสารทั้งหมด', deposit: 'มัดจำ (โอนตอนจอง)', balance: 'ชำระกับคนขับวันเดินทาง',
        you: 'ข้อมูลผู้จอง', name: 'ชื่อ', phone: 'เบอร์โทร', line: 'LINE ID', email: 'อีเมล', notes: 'หมายเหตุ',
        rules: ['มัดจำ 400 บาท ผ่าน PromptPay', 'ยกเลิกการเดินทาง ไม่คืนค่ามัดจำ', 'รับใบจองทันทีหลังส่งสลิป'],
        help: 'สอบถามเพิ่มเติม', thb: 'บาท', seats: 'ที่นั่ง', locale: 'th-TH', cars: 'cars.html'
    };
    const DEPOSIT = 400;
    const $ = id => document.getElementById(id);
    const esc = v => String(v ?? '').replace(/[&<>"'`]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' })[ch]);
    const money = n => Number(n || 0).toLocaleString('en-US');

    // ===== แถบขั้นตอน =====
    const steps = document.createElement('ol');
    steps.className = 'book-steps reveal';
    steps.innerHTML = T.steps.map((s, i) => `<li data-step="${i}"><span class="bs-dot"><b>${i + 1}</b><i class="fa-solid fa-check"></i></span><span class="bs-label">${s}</span></li>`).join('');
    card.before(steps);

    // ===== วางฟอร์มคู่กับกล่องสรุป =====
    const layout = document.createElement('div');
    layout.className = 'booking-layout';
    card.before(layout);
    layout.appendChild(card);
    const aside = document.createElement('aside');
    aside.className = 'booking-summary glass reveal';
    aside.setAttribute('aria-label', T.title);
    layout.appendChild(aside);

    // หัวข้อแบ่งหมวดในฟอร์ม
    const sectionBefore = (el, text, icon) => {
        if (!el) return;
        const h = document.createElement('h3');
        h.className = 'form-section';
        h.innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;
        el.before(h);
    };
    sectionBefore(form.querySelector('.form-row'), T.sections[0], 'fa-user');
    sectionBefore($('bookingDate') && $('bookingDate').closest('.form-row'), T.sections[1], 'fa-route');
    sectionBefore($('notes') && $('notes').closest('.form-group'), T.sections[2], 'fa-pen');

    // ===== สร้างเนื้อหาสรุป =====
    function routeName() {
        const sel = $('route');
        if (!sel || !sel.value || sel.selectedIndex < 0) return '';
        const parts = sel.options[sel.selectedIndex].text.replace(/\s*\([^)]*\)\s*$/, '').split(' / ');
        return (isEn ? parts[1] : parts[0]) || parts[0];
    }
    function travelDate() {
        const v = $('bookingDate').value;
        if (!v) return '';
        return new Date(v + 'T00:00:00').toLocaleDateString(T.locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    const row = (label, value, empty = '—') => `<div class="sum-row"><span>${label}</span><b class="${value ? '' : 'empty'}">${value ? esc(value) : empty}</b></div>`;

    function render() {
        const car = (window.BT_CARS || []).find(c => c.key === $('car').value);
        const price = Number($('route').value) || 0;
        const route = routeName();
        const [from, to] = route ? route.split(' - ') : ['', ''];

        aside.innerHTML = `
            <div class="sum-head">
                <h3><i class="fa-solid fa-receipt"></i> ${T.title}</h3>
                <span class="sum-live"><span class="live-dot"></span> ${T.live}</span>
            </div>
            <div class="sum-car ${car ? '' : 'is-empty'}">
                ${car ? `
                    <img src="${car.img}" alt="${car.name}">
                    <div>
                        <span class="sum-tag">${car.type[lang]}</span>
                        <b>${car.name}</b>
                        <small><i class="fa-solid fa-users"></i> ${car.seats} ${T.seats} · <i class="fa-solid fa-suitcase-rolling"></i> ${car.bags[lang]}</small>
                    </div>` : `
                    <span class="sum-car-icon"><i class="fa-solid fa-car-side"></i></span>
                    <div><b>${T.noCar}</b><a href="${T.cars}">${T.seeCars} <i class="fa-solid fa-arrow-right"></i></a></div>`}
            </div>
            <div class="sum-section">
                <h4>${T.trip}</h4>
                ${route ? `<div class="sum-route"><span><i class="fa-solid fa-location-dot"></i> ${esc(from)}</span><i class="fa-solid fa-arrow-down-long"></i><span><i class="fa-solid fa-flag-checkered"></i> ${esc(to)}</span></div>` : row(T.route, '', T.pickRoute)}
                ${row(T.date, travelDate())}
                ${row(T.time, $('bookingTime').value)}
            </div>
            <div class="sum-section sum-price">
                <h4>${T.price}</h4>
                ${row(T.total, price ? `${money(price)} ${T.thb}` : '')}
                ${row(T.deposit, price ? `${money(DEPOSIT)} ${T.thb}` : '')}
                <div class="sum-total"><span>${T.balance}</span><b>${price ? money(Math.max(price - DEPOSIT, 0)) : '0'} <small>${T.thb}</small></b></div>
            </div>
            <div class="sum-section">
                <h4>${T.you}</h4>
                ${row(T.name, $('name').value.trim())}
                ${row(T.phone, $('phone').value.trim())}
                ${row(T.line, $('lineid').value.trim())}
                ${row(T.email, $('email').value.trim())}
                ${$('notes').value.trim() ? row(T.notes, $('notes').value.trim()) : ''}
            </div>
            <ul class="sum-rules">${T.rules.map(r => `<li><i class="fa-solid fa-circle-check"></i> ${r}</li>`).join('')}</ul>
            <div class="sum-help">
                <span>${T.help}</span>
                <a href="tel:0875854108"><i class="fa-solid fa-phone"></i> 087-585-4108</a>
                <a href="https://line.me/ti/p/4wD6IYASNu" target="_blank" rel="noopener"><i class="fa-brands fa-line"></i> LINE</a>
            </div>`;
        updateSteps();
        fitSticky();
    }

    // ===== กล่องสรุปไม่มีแถบเลื่อนของตัวเอง =====
    // สั้นกว่าจอ: ค้างอยู่ใต้ header · ยาวกว่าจอ: เลื่อนไปพร้อมหน้าเว็บ แล้วค้างเมื่อเห็นท้ายกล่อง
    const HEADER_GAP = 92, BOTTOM_GAP = 16;
    function fitSticky() {
        // เว้นที่ให้แถบปุ่มติดต่อด้านล่างจอ (ถ้าแสดงอยู่) จะได้ไม่บังท้ายกล่อง
        const bar = document.querySelector('.floating-contact');
        const barRect = bar ? bar.getBoundingClientRect() : null;
        const barH = barRect && barRect.width > innerWidth * 0.6 ? innerHeight - barRect.top : 0;
        const top = Math.min(HEADER_GAP, innerHeight - aside.offsetHeight - BOTTOM_GAP - barH);
        aside.style.setProperty('--sum-top', top + 'px');
    }
    addEventListener('resize', fitSticky);

    // ===== ความคืบหน้า =====
    function updateSteps() {
        const personal = $('name').value.trim() && /^[0-9]{10}$/.test($('phone').value) && $('lineid').value.trim() && $('email').checkValidity() && $('email').value;
        const trip = $('bookingDate').value && $('bookingTime').value && $('car').value && $('route').value;
        const paying = getComputedStyle($('payment-section')).display !== 'none';
        const done = document.body.classList.contains('receipt-open');
        const state = [!!personal, !!trip, done, done];
        const current = done ? 3 : paying ? 2 : !personal ? 0 : !trip ? 1 : 2;
        steps.querySelectorAll('li').forEach((li, i) => {
            li.classList.toggle('done', state[i] && i !== current);
            li.classList.toggle('current', i === current);
        });
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    // เส้นทางและราคาถูกเปลี่ยนจากสคริปต์ของหน้า (เลือกรถจากลิงก์ ?car=) จึงคอยดูการเปลี่ยนแปลงด้วย
    const mo = new MutationObserver(render);
    mo.observe($('route'), { childList: true });
    mo.observe($('price-display'), { childList: true, characterData: true, subtree: true });
    new MutationObserver(updateSteps).observe($('payment-section'), { attributes: true, attributeFilter: ['style'] });
    new MutationObserver(updateSteps).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('DOMContentLoaded', render);
    render();
})();
