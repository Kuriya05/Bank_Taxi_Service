// cars.js — หน้า "รถยนต์": โชว์รูมรถ + ตารางเปรียบเทียบสเปก (ข้อมูลรถและราคาเริ่มต้นจาก fares.js)
(function () {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'th';
    const CARS = window.BT_CARS, FARES = window.BT_FARES;
    const DESC = {
        camry: {
            th: { lead: 'รถเก๋งซีดานหรู นั่งสบาย เหมาะสำหรับ 1-3 ที่นั่ง เดินทางเป็นส่วนตัว', fit: 'เดินทางคนเดียว · ทริปธุรกิจ' },
            en: { lead: 'Luxury sedan, comfortable and private, suitable for 1-3 passengers', fit: 'Solo trips · Business travel' }
        },
        fortuner: {
            th: { lead: 'รถ SUV พรีเมียม ลุยได้ทุกเส้นทาง พื้นที่กว้างขวาง รองรับ 4-5 ที่นั่ง', fit: 'ครอบครัว · สัมภาระเยอะ' },
            en: { lead: 'Premium SUV, suitable for all routes, spacious, and accommodates 4-5 passengers', fit: 'Families · Extra luggage' }
        },
        commuter: {
            th: { lead: 'รถตู้ VIP ปรับแต่งพิเศษนั่งสบาย เหมาะสำหรับเดินทางเป็นหมู่คณะ 9-10 ที่นั่ง', fit: 'หมู่คณะ · กรุ๊ปทัวร์' },
            en: { lead: 'Specially customized VIP van, comfortable and ideal for groups of 9-10 passengers', fit: 'Groups · Tours' }
        }
    };
    const T = lang === 'en' ? {
        seats: 'seats', driver: 'Professional, courteous driver', safe: 'Safe and reliable', from: 'From', thb: 'THB',
        book: 'Book this car', prices: 'See all route prices', zoom: 'Tap to enlarge', prev: 'Previous car', next: 'Next car',
        rows: ['Vehicle type', 'Passengers', 'Luggage', 'Driver', 'Best for', 'Starting fare', ''],
        driverShort: 'Included', bookShort: 'Book', booking: 'booking-en.html', services: 'services-en.html'
    } : {
        seats: 'ที่นั่ง', driver: 'คนขับมืออาชีพสุภาพ', safe: 'ปลอดภัยมั่นใจได้', from: 'เริ่มต้น', thb: 'บาท',
        book: 'จองรถคันนี้', prices: 'ดูราคาทุกเส้นทาง', zoom: 'แตะเพื่อขยายรูป', prev: 'รถคันก่อนหน้า', next: 'รถคันถัดไป',
        rows: ['ประเภทรถ', 'จำนวนผู้โดยสาร', 'สัมภาระ', 'คนขับ', 'เหมาะกับ', 'ราคาเริ่มต้น', ''],
        driverShort: 'มีคนขับให้', bookShort: 'จอง', booking: 'booking.html', services: 'services.html'
    };
    const money = n => n.toLocaleString('en-US');
    const minPrice = i => Math.min(...FARES.map(f => f.prices[i]));

    const room = document.getElementById('showroom');
    const compare = document.getElementById('compareTable');
    if (!room || !compare) return;

    const fromUrl = new URLSearchParams(location.search).get('car');
    let current = Math.max(0, CARS.findIndex(c => c.key === fromUrl));

    // ===== โชว์รูม =====
    room.innerHTML = `
        <div class="sr-tabs" role="tablist">
            ${CARS.map((c, i) => `<button type="button" role="tab" class="sr-tab" data-i="${i}" aria-selected="false">
                <i class="fa-solid ${['fa-car-side', 'fa-truck-pickup', 'fa-van-shuttle'][i]}"></i>
                <span><b>${c.name.replace('Toyota ', '')}</b><small>${c.seats} ${T.seats}</small></span>
            </button>`).join('')}
        </div>
        <div class="sr-stage">
            <div class="sr-visual">
                <span class="sr-watermark" aria-hidden="true"></span>
                <span class="sr-glow" aria-hidden="true"></span>
                <button type="button" class="sr-photo" aria-label="${T.zoom}"><img id="srImg" alt=""></button>
                <span class="sr-floor" aria-hidden="true"></span>
                <span class="sr-zoom"><i class="fa-solid fa-magnifying-glass-plus"></i> ${T.zoom}</span>
                <button type="button" class="sr-nav prev" aria-label="${T.prev}"><i class="fa-solid fa-chevron-left"></i></button>
                <button type="button" class="sr-nav next" aria-label="${T.next}"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="sr-info" aria-live="polite">
                <span class="sr-tag"></span>
                <h2 class="sr-name"></h2>
                <p class="sr-lead"></p>
                <div class="sr-specs"></div>
                <div class="sr-price"></div>
                <div class="sr-actions">
                    <a class="btn btn-primary sr-book"><i class="fa-solid fa-calendar-check"></i> ${T.book}</a>
                    <a class="btn btn-ghost sr-rates"><i class="fa-solid fa-tags"></i> ${T.prices}</a>
                </div>
            </div>
        </div>
        <div class="sr-progress">${CARS.map((_, i) => `<span data-i="${i}"></span>`).join('')}</div>`;

    // ===== ตารางเปรียบเทียบ =====
    const rows = [
        c => c.type[lang],
        c => `${c.seats} ${T.seats}`,
        c => c.bags[lang],
        () => `<i class="fa-solid fa-user-tie"></i> ${T.driverShort}`,
        c => DESC[c.key][lang].fit,
        (c, i) => `<b class="cmp-price">${money(minPrice(i))}</b> ${T.thb}`,
        c => `<a class="btn btn-primary cmp-book" href="${T.booking}?car=${c.key}">${T.bookShort}</a>`
    ];
    compare.innerHTML = `
        <div class="cmp-row cmp-head">
            <span></span>
            ${CARS.map((c, i) => `<button type="button" class="cmp-car" data-col="${i}"><img src="${c.img}" alt="" loading="lazy"><b>${c.name.replace('Toyota ', '')}</b></button>`).join('')}
        </div>
        ${rows.map((fn, r) => `
        <div class="cmp-row">
            <span class="cmp-label">${T.rows[r]}</span>
            ${CARS.map((c, i) => `<span class="cmp-cell" data-col="${i}">${fn(c, i)}</span>`).join('')}
        </div>`).join('')}`;

    // ===== สลับรถ =====
    const img = document.getElementById('srImg');
    function show(i, dir = 1) {
        current = (i + CARS.length) % CARS.length;
        const c = CARS[current], d = DESC[c.key][lang];
        room.querySelectorAll('.sr-tab').forEach((t, k) => t.setAttribute('aria-selected', String(k === current)));
        room.querySelectorAll('.sr-progress span').forEach((s, k) => s.classList.toggle('on', k === current));
        room.style.setProperty('--dir', dir);
        room.classList.remove('swap'); void room.offsetWidth; room.classList.add('swap');
        img.src = c.img;
        img.alt = c.name;
        room.querySelector('.sr-watermark').textContent = c.name.replace('Toyota ', '').toUpperCase();
        room.querySelector('.sr-tag').textContent = c.type[lang];
        room.querySelector('.sr-name').textContent = c.name;
        room.querySelector('.sr-lead').textContent = d.lead;
        room.querySelector('.sr-specs').innerHTML = `
            <span><i class="fa-solid fa-users"></i> ${c.seats} ${T.seats}</span>
            <span><i class="fa-solid fa-suitcase-rolling"></i> ${c.bags[lang]}</span>
            <span><i class="fa-solid fa-user-tie"></i> ${T.driver}</span>
            <span class="safe"><i class="fa-solid fa-shield-halved"></i> ${T.safe}</span>`;
        room.querySelector('.sr-price').innerHTML = `<small>${T.from}</small> <b>${money(minPrice(current))}</b> ${T.thb}`;
        room.querySelector('.sr-book').href = `${T.booking}?car=${c.key}`;
        room.querySelector('.sr-rates').href = `${T.services}?car=${c.key}`;
        compare.querySelectorAll('[data-col]').forEach(el => el.classList.toggle('col-active', Number(el.dataset.col) === current));
    }

    room.querySelector('.sr-tabs').addEventListener('click', e => {
        const t = e.target.closest('.sr-tab');
        if (t) show(Number(t.dataset.i), Number(t.dataset.i) >= current ? 1 : -1);
    });
    room.querySelector('.sr-nav.prev').addEventListener('click', () => show(current - 1, -1));
    room.querySelector('.sr-nav.next').addEventListener('click', () => show(current + 1, 1));
    compare.addEventListener('click', e => {
        const c = e.target.closest('.cmp-car');
        if (!c) return;
        show(Number(c.dataset.col), Number(c.dataset.col) >= current ? 1 : -1);
        room.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    document.addEventListener('keydown', e => {
        if (e.target.matches('input, select, textarea')) return;
        if (e.key === 'ArrowRight') show(current + 1, 1);
        if (e.key === 'ArrowLeft') show(current - 1, -1);
    });

    // ปัดซ้าย-ขวาบนมือถือ
    let touchX = null;
    const visual = room.querySelector('.sr-visual');
    visual.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    visual.addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        touchX = null;
    });

    // ขยายรูปรถ
    const modal = document.getElementById('imageModal');
    room.querySelector('.sr-photo').addEventListener('click', () => {
        document.getElementById('modalImg').src = img.src;
        document.getElementById('modalImg').alt = img.alt;
        modal.style.display = 'flex';
    });
    modal.addEventListener('click', () => { modal.style.display = 'none'; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.style.display = 'none'; });

    show(current);
})();
