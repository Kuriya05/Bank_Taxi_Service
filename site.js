// site.js — ลูกเล่นที่ใช้ร่วมกันทุกหน้า (พื้นหลัง, header, scroll reveal, สปอตไลต์, สไลด์โชว์)
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const baht = n => n.toLocaleString('en-US');

function animateNumber(el, from, to, ms = 600) {
    if (reduceMotion || from === to) { el.textContent = baht(to); return; }
    const start = performance.now();
    const step = now => {
        const t = Math.min((now - start) / ms, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = baht(Math.round(from + (to - from) * eased));
        if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

// ===== Header + ถนนแสดงความคืบหน้า =====
(function () {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    function onScroll() {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? (scrollY / max) * 100 : 0;
        header.style.setProperty('--p', p.toFixed(2) + '%');
        header.classList.toggle('scrolled', scrollY > 20);
    }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// ===== เมนูนำทาง: แถบไฮไลต์เลื่อนตามเมาส์ (คอม) + แผงเมนูสไลด์ (มือถือ) =====
(function () {
    const header = document.getElementById('siteHeader');
    const nav = header && header.querySelector('.nav-menu');
    if (!nav) return;
    const isEn = document.documentElement.lang === 'en';
    const links = [...nav.querySelectorAll('a')];

    // --- คอม: แถบสีฟ้าเลื่อนไปอยู่ใต้เมนูที่ชี้ แล้วกลับมาที่หน้าปัจจุบันเมื่อเอาเมาส์ออก
    const pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.prepend(pill);
    const active = nav.querySelector('a.active');
    function moveTo(link) {
        if (!link || !nav.offsetWidth) return;
        pill.style.setProperty('--x', link.offsetLeft + 'px');
        pill.style.setProperty('--w', link.offsetWidth + 'px');
        links.forEach(a => a.classList.toggle('lit', a === link));
    }
    links.forEach(a => a.addEventListener('mouseenter', () => moveTo(a)));
    nav.addEventListener('mouseleave', () => moveTo(active));
    addEventListener('resize', () => moveTo(active));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveTo(active));
    requestAnimationFrame(() => { moveTo(active); requestAnimationFrame(() => nav.classList.add('pill-ready')); });

    // --- มือถือ: แผงเมนูสไลด์จากด้านขวา
    const SUB = isEn
        ? { index: 'Back to the start', services: 'Fares for every route', cars: 'Camry · Fortuner · Commuter', booking: 'Book online, get a receipt', contact: 'Phone · LINE · WhatsApp' }
        : { index: 'กลับสู่หน้าหลัก', services: 'ตารางราคาทุกเส้นทาง', cars: 'Camry · Fortuner · Commuter', booking: 'จองออนไลน์ พร้อมใบจอง', contact: 'โทร · LINE · WhatsApp' };
    const pageKey = href => (href.split('/').pop().replace('-en', '').split('.')[0] || 'index');
    const bookingHref = isEn ? 'booking-en.html' : 'booking.html';

    const drawer = document.createElement('aside');
    drawer.className = 'nav-drawer';
    drawer.id = 'navDrawer';
    drawer.setAttribute('aria-label', isEn ? 'Site menu' : 'เมนูเว็บไซต์');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML = `
        <div class="drawer-head">
            <img src="logo-mark.svg" alt="">
            <div><b>Bank <span>Taxi</span> Service</b><small>${isEn ? 'Airport transfers 24/7' : 'รถรับส่งสนามบิน 24 ชั่วโมง'}</small></div>
            <button type="button" class="drawer-close" aria-label="${isEn ? 'Close menu' : 'ปิดเมนู'}"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <nav class="drawer-links">
            ${links.map((a, i) => {
                const key = pageKey(a.getAttribute('href'));
                const icon = a.querySelector('i') ? a.querySelector('i').className : 'fa-solid fa-circle';
                return `<a href="${a.getAttribute('href')}" class="drawer-link k-${key}${a.classList.contains('active') ? ' active' : ''}" style="--i:${i}">
                    <span class="d-icon"><i class="${icon}"></i></span>
                    <span class="d-text"><b>${a.textContent.trim()}</b><small>${SUB[key] || ''}</small></span>
                    <i class="fa-solid fa-chevron-right d-arrow"></i>
                </a>`;
            }).join('')}
        </nav>
        <div class="drawer-foot">
            <a href="${bookingHref}" class="btn btn-primary"><i class="fa-solid fa-car-side"></i> ${isEn ? 'Book a ride now' : 'จองรถเลย'}</a>
            <div class="drawer-quick">
                <a href="tel:0875854108"><i class="fa-solid fa-phone"></i> 087-585-4108</a>
                <a href="https://line.me/ti/p/4wD6IYASNu" target="_blank" rel="noopener"><i class="fa-brands fa-line"></i> LINE</a>
            </div>
        </div>`;
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.append(backdrop, drawer);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-toggle';
    btn.setAttribute('aria-label', isEn ? 'Menu' : 'เมนู');
    btn.setAttribute('aria-controls', 'navDrawer');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><span></span><span></span>';
    header.querySelector('.header-wrapper').appendChild(btn);

    function setOpen(open) {
        document.body.classList.toggle('drawer-open', open);
        btn.setAttribute('aria-expanded', String(open));
        drawer.setAttribute('aria-hidden', String(!open));
        if (open) drawer.querySelector('.drawer-link.active, .drawer-link').focus({ preventScroll: true });
    }
    btn.addEventListener('click', () => setOpen(!document.body.classList.contains('drawer-open')));
    drawer.querySelector('.drawer-close').addEventListener('click', () => { setOpen(false); btn.focus(); });
    backdrop.addEventListener('click', () => setOpen(false));
    drawer.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
    matchMedia('(min-width: 861px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
})();

// ===== Scroll reveal + ตัวเลขนับขึ้น =====
function revealEl(el) {
    if (el.classList.contains('in')) return;
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(n => animateNumber(n, 0, Number(n.dataset.count), 1400));
}
function initReveal(root = document) {
    const els = root.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { els.forEach(revealEl); return; }
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            revealEl(entry.target);
            io.unobserve(entry.target);
        });
    }, { threshold: 0.12 });
    els.forEach(el => {
        // ส่วนที่อยู่ในจอแรกแสดงทันที ไม่ต้องรอ observer
        if (el.getBoundingClientRect().top < innerHeight) revealEl(el);
        else io.observe(el);
    });
}

// ===== สปอตไลต์ตามเมาส์ (พื้นหลัง + ขอบการ์ด) =====
(function () {
    const bgSpot = document.getElementById('bgSpot');
    addEventListener('pointermove', e => {
        if (bgSpot) {
            bgSpot.style.setProperty('--sx', e.clientX + 'px');
            bgSpot.style.setProperty('--sy', e.clientY + 'px');
        }
        const card = e.target.closest && e.target.closest('.spotlight');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
})();

// ===== สไลด์โชว์รถ (ถ้าหน้านั้นมี #cinemaSlider) =====
const SLIDE_MS = 5000;
let slideIndex = 0;
let slideTimer;
const slider = document.getElementById('cinemaSlider');

function showSlide(index) {
    if (!slider) return;
    const slides = slider.querySelectorAll('.slide-item');
    const dots = slider.querySelectorAll('.dot');
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === slideIndex));
    dots.forEach((d, i) => {
        d.classList.remove('active');
        if (i === slideIndex) { void d.offsetWidth; d.classList.add('active'); }
    });
    const now = document.getElementById('slideNow');
    if (now) now.textContent = String(slideIndex + 1).padStart(2, '0');
}
function startTimer() { slideTimer = setInterval(() => showSlide(slideIndex + 1), SLIDE_MS); }
function resetTimer() { clearInterval(slideTimer); startTimer(); }
function moveSlide(n) { showSlide(slideIndex + n); resetTimer(); }
function currentSlide(n) { showSlide(n); resetTimer(); }

if (slider) {
    slider.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    slider.addEventListener('mouseenter', () => clearInterval(slideTimer));
    slider.addEventListener('mouseleave', resetTimer);

    // ปัดซ้าย-ขวาบนมือถือ
    let touchX = null;
    slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) moveSlide(dx < 0 ? 1 : -1);
        touchX = null;
    });

    // ปุ่มลูกศรบนคีย์บอร์ด
    document.addEventListener('keydown', e => {
        if (e.target.matches('input, select, textarea')) return;
        if (e.key === 'ArrowRight') moveSlide(1);
        if (e.key === 'ArrowLeft') moveSlide(-1);
    });

    startTimer();
}

// รันหลัง script ของหน้า (ที่อาจสร้างการ์ดเพิ่ม) ทำงานเสร็จ
document.addEventListener('DOMContentLoaded', () => initReveal());
