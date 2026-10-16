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
