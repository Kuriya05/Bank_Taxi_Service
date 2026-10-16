// services.js — หน้า "บริการและราคา": การ์ดเลือกรถ + ตารางเทียบราคา (ค้นหา / กรองจุดรับ) ข้อมูลจาก fares.js
(function () {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'th';
    const T = lang === 'en' ? {
        from: 'From', seats: 'seats', thb: 'THB', route: 'Route', all: 'All', pick: 'Pick-up',
        search: 'Search a route, e.g. Pattaya', empty: 'No route matches your search. Contact us for a custom quote.',
        book: 'Book', selected: 'Selected', choose: 'Choose this car', routes: 'routes',
        booking: 'booking-en.html'
    } : {
        from: 'เริ่มต้น', seats: 'ที่นั่ง', thb: 'บาท', route: 'เส้นทาง', all: 'ทั้งหมด', pick: 'จุดรับ',
        search: 'ค้นหาเส้นทาง เช่น พัทยา', empty: 'ไม่พบเส้นทางที่ค้นหา ติดต่อเราเพื่อสอบถามราคาเส้นทางอื่นได้เลย',
        book: 'จอง', selected: 'เลือกอยู่', choose: 'เลือกรถคันนี้', routes: 'เส้นทาง',
        booking: 'booking.html'
    };
    const CARS = window.BT_CARS, FARES = window.BT_FARES, PLACES = window.BT_PLACES;
    const money = n => n.toLocaleString('en-US');
    const carsBox = document.getElementById('svcCars');
    const board = document.getElementById('priceBoard');
    if (!carsBox || !board) return;

    const fromUrl = new URLSearchParams(location.search).get('car');
    const state = { car: Math.max(0, CARS.findIndex(c => c.key === fromUrl)), origin: 'all', q: '' };

    // ===== การ์ดเลือกรถ =====
    carsBox.innerHTML = CARS.map((c, i) => {
        const min = Math.min(...FARES.map(f => f.prices[i]));
        return `
        <button type="button" class="svc-car glass spotlight reveal" data-delay="${i + 1}" data-car="${i}" aria-pressed="false">
            <span class="svc-car-tag">${c.type[lang]}</span>
            <span class="svc-car-check"><i class="fa-solid fa-check"></i></span>
            <span class="svc-car-img"><img src="${c.img}" alt="${c.name}" loading="lazy"></span>
            <b class="svc-car-name">${c.name}</b>
            <span class="svc-car-meta"><span><i class="fa-solid fa-users"></i> ${c.seats} ${T.seats}</span><span><i class="fa-solid fa-suitcase-rolling"></i> ${c.bags[lang]}</span></span>
            <span class="svc-car-price"><small>${T.from}</small> <b>${money(min)}</b> ${T.thb}</span>
        </button>`;
    }).join('');

    // ===== แถบค้นหา + ชิปจุดรับ =====
    const origins = [...new Set(FARES.map(f => f.from))];
    board.innerHTML = `
        <div class="pb-tools">
            <label class="pb-search">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="search" id="pbSearch" placeholder="${T.search}" autocomplete="off" maxlength="40">
            </label>
            <div class="pb-chips" role="group" aria-label="${T.pick}">
                <button type="button" class="pb-chip active" data-origin="all">${T.all}</button>
                ${origins.map(o => `<button type="button" class="pb-chip" data-origin="${o}"><i class="fa-solid ${PLACES[o].icon}"></i> ${PLACES[o][lang]}</button>`).join('')}
            </div>
        </div>
        <div class="pb-table" role="table">
            <div class="pb-row pb-head" role="row">
                <span role="columnheader">${T.route}</span>
                ${CARS.map((c, i) => `<span role="columnheader" class="pb-col" data-col="${i}">${c.name.replace('Toyota ', '')}<small>${c.seats} ${T.seats}</small></span>`).join('')}
            </div>
            <div id="pbBody"></div>
            <p class="pb-empty" id="pbEmpty" hidden><i class="fa-solid fa-route"></i> ${T.empty}</p>
        </div>`;

    const body = document.getElementById('pbBody');
    body.innerHTML = FARES.map((f, r) => {
        const a = PLACES[f.from], b = PLACES[f.to];
        const search = [a.th, a.en, b.th, b.en].join(' ').toLowerCase();
        return `
        <div class="pb-row" role="row" data-origin="${f.from}" data-search="${search}" style="--r:${r}">
            <span class="pb-route" role="cell">
                <span class="pb-place"><i class="fa-solid ${a.icon}"></i> ${a[lang]}</span>
                <i class="fa-solid fa-arrow-right-long pb-arrow"></i>
                <span class="pb-place"><i class="fa-solid ${b.icon}"></i> ${b[lang]}</span>
            </span>
            ${f.prices.map((p, i) => `
            <a role="cell" class="pb-price" data-col="${i}" href="${T.booking}?car=${CARS[i].key}" aria-label="${T.book} ${CARS[i].name} ${a[lang]} - ${b[lang]} ${money(p)} ${T.thb}">
                <small class="pb-car">${CARS[i].name.replace('Toyota ', '')}</small>
                <b>${money(p)}</b><span>${T.thb}</span>
            </a>`).join('')}
        </div>`;
    }).join('');

    // ===== การทำงาน =====
    function render() {
        carsBox.querySelectorAll('.svc-car').forEach((el, i) => {
            el.classList.toggle('active', i === state.car);
            el.setAttribute('aria-pressed', String(i === state.car));
        });
        board.querySelectorAll('[data-col]').forEach(el => el.classList.toggle('col-active', Number(el.dataset.col) === state.car));
        let shown = 0;
        body.querySelectorAll('.pb-row').forEach(row => {
            const ok = (state.origin === 'all' || row.dataset.origin === state.origin)
                && (!state.q || row.dataset.search.includes(state.q));
            row.hidden = !ok;
            if (ok) row.style.setProperty('--r', shown++);
        });
        document.getElementById('pbEmpty').hidden = shown > 0;
        board.classList.remove('pb-anim'); void board.offsetWidth; board.classList.add('pb-anim');
        document.querySelectorAll('[data-book-selected]').forEach(a => { a.href = `${T.booking}?car=${CARS[state.car].key}`; });
    }

    carsBox.addEventListener('click', e => {
        const card = e.target.closest('.svc-car');
        if (!card) return;
        state.car = Number(card.dataset.car);
        render();
    });
    board.querySelector('.pb-chips').addEventListener('click', e => {
        const chip = e.target.closest('.pb-chip');
        if (!chip) return;
        board.querySelectorAll('.pb-chip').forEach(c => c.classList.toggle('active', c === chip));
        state.origin = chip.dataset.origin;
        render();
    });
    document.getElementById('pbSearch').addEventListener('input', e => {
        state.q = e.target.value.trim().toLowerCase();
        render();
    });

    render();
})();
