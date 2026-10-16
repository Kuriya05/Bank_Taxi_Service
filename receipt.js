// receipt.js — ตัวอย่างสลิป, สถานะปุ่มส่ง และ "ใบจองรถ" ให้ลูกค้าหลังจองสำเร็จ (ใช้ใน booking.html / booking-en.html)
(function () {
    const isEn = document.documentElement.lang === 'en';
    const T = isEn ? {
        title: 'Booking Confirmation', code: 'Booking No.', status: 'Status', pending: 'Awaiting slip check',
        issued: 'Issued', customer: 'Customer', phone: 'Phone', line: 'LINE ID', email: 'Email',
        trip: 'Trip details', date: 'Travel date', time: 'Pick-up time', car: 'Vehicle', route: 'Route',
        notes: 'Notes', payment: 'Payment', total: 'Total fare', deposit: 'Deposit paid', balance: 'Pay driver on the day',
        thb: 'THB', note: 'Please keep this booking confirmation. Our team will contact you to confirm your trip.',
        print: 'Print / Save PDF', home: 'Back to home', close: 'Close',
        sending: 'Sending…', slipPreview: 'Your slip', slipChange: 'Tap the field above to choose another file',
        errTimeout: 'Could not reach the booking system. Please check your internet connection and try again, or contact us on LINE / phone.',
        errDenied: 'The booking system is not accepting bookings right now. Please book with us on LINE or by phone: 087-585-4108.',
        errOther: 'Sending the booking failed. Please try again, or contact us on LINE / phone: 087-585-4108.',
        homeHref: 'index-en.html', locale: 'en-GB'
    } : {
        title: 'ใบจองรถ', code: 'เลขที่การจอง', status: 'สถานะ', pending: 'รอตรวจสอบสลิป',
        issued: 'ออกเมื่อ', customer: 'ข้อมูลผู้จอง', phone: 'เบอร์โทร', line: 'LINE ID', email: 'อีเมล',
        trip: 'รายละเอียดการเดินทาง', date: 'วันที่เดินทาง', time: 'เวลารับ', car: 'รถ', route: 'เส้นทาง',
        notes: 'หมายเหตุ', payment: 'การชำระเงิน', total: 'ค่าโดยสารทั้งหมด', deposit: 'มัดจำที่ชำระแล้ว', balance: 'ชำระกับคนขับวันเดินทาง',
        thb: 'บาท', note: 'กรุณาเก็บใบจองนี้ไว้เป็นหลักฐาน ทีมงานจะติดต่อกลับเพื่อยืนยันการเดินทางของคุณ',
        print: 'พิมพ์ / บันทึก PDF', home: 'กลับหน้าแรก', close: 'ปิด',
        sending: 'กำลังส่ง…', slipPreview: 'สลิปของคุณ', slipChange: 'แตะช่องด้านบนเพื่อเลือกไฟล์ใหม่',
        errTimeout: 'เชื่อมต่อระบบจองไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ หรือติดต่อเราทาง LINE / โทรศัพท์',
        errDenied: 'ระบบรับจองออนไลน์ขัดข้องชั่วคราว กรุณาจองผ่าน LINE หรือโทร 087-585-4108',
        errOther: 'ส่งข้อมูลการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง หรือติดต่อทาง LINE / โทร 087-585-4108',
        homeHref: 'index.html', locale: 'th-TH'
    };

    const esc = v => String(v == null || v === '' ? '-' : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const money = n => Number(n || 0).toLocaleString('en-US');

    // ===== ตัวอย่างสลิปใต้ช่องแนบไฟล์ =====
    window.previewSlip = function (event) {
        const input = event.target;
        let box = document.getElementById('slipPreview');
        if (!box) {
            box = document.createElement('div');
            box.id = 'slipPreview';
            box.className = 'slip-preview';
            input.insertAdjacentElement('afterend', box);
        }
        const file = input.files && input.files[0];
        if (!file) { box.innerHTML = ''; return; }
        const url = URL.createObjectURL(file);
        box.innerHTML = `<img src="${url}" alt=""><div><b>${T.slipPreview}</b><span>${esc(file.name)}</span><small>${T.slipChange}</small></div>`;
    };

    // ===== สถานะปุ่ม "ส่งหลักฐานการจอง" =====
    window.setBookingSending = function (on) {
        const btn = document.querySelector('#payment-section .btn-submit-glow');
        if (!btn) return;
        if (on) {
            btn.dataset.label = btn.innerHTML;
            btn.disabled = true;
            btn.classList.add('is-sending');
            btn.innerHTML = `<span class="spinner"></span> ${T.sending}`;
        } else if (btn.dataset.label) {
            btn.disabled = false;
            btn.classList.remove('is-sending');
            btn.innerHTML = btn.dataset.label;
        }
    };

    window.showBookingError = function (error) {
        const code = (error && (error.code || error.message)) || '';
        const msg = code === 'timeout' ? T.errTimeout : /permission/i.test(code) ? T.errDenied : T.errOther;
        let box = document.getElementById('bookingError');
        if (!box) {
            box = document.createElement('div');
            box.id = 'bookingError';
            box.className = 'booking-error';
            box.setAttribute('role', 'alert');
            document.querySelector('#payment-section .btn-submit-glow').insertAdjacentElement('beforebegin', box);
        }
        box.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <span>${msg}</span>`;
        box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // ===== ใบจองรถ =====
    window.showBookingReceipt = function (b) {
        const old = document.getElementById('receiptOverlay');
        if (old) old.remove();
        const balance = Math.max(Number(b.price || 0) - Number(b.deposit || 0), 0);
        const issued = new Date().toLocaleString(T.locale, { dateStyle: 'medium', timeStyle: 'short' });
        const travel = b.bookingDate ? new Date(b.bookingDate + 'T00:00:00').toLocaleDateString(T.locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';
        const code = String(b.id || '').slice(0, 8).toUpperCase();
        // "สุวรรณภูมิ - พัทยา / Suvarnabhumi - Pattaya (1,400 บาท/THB)" -> ส่วนที่เป็นภาษาของหน้านี้ ไม่มีราคาในวงเล็บ
        const routeParts = String(b.route || '').replace(/\s*\([^)]*\)\s*$/, '').split(' / ');
        const routeName = (isEn ? routeParts[1] : routeParts[0]) || routeParts[0];
        const row = (label, value, cls = '') => `<div class="r-row ${cls}"><span>${label}</span><b>${value}</b></div>`;

        const overlay = document.createElement('div');
        overlay.id = 'receiptOverlay';
        overlay.className = 'receipt-overlay';
        overlay.innerHTML = `
            <div class="receipt" role="dialog" aria-modal="true" aria-labelledby="receiptTitle">
                <div class="r-head">
                    <img src="logo-mark.svg" alt="">
                    <div>
                        <h2 id="receiptTitle">${T.title}</h2>
                        <p>Bank Taxi Service</p>
                    </div>
                    <span class="r-check"><i class="fa-solid fa-check"></i></span>
                </div>
                <div class="r-code">
                    <div><small>${T.code}</small><b>#${esc(code)}</b></div>
                    <div><small>${T.status}</small><span class="r-badge">${T.pending}</span></div>
                </div>
                <div class="r-section">
                    <h3>${T.trip}</h3>
                    <div class="r-route"><i class="fa-solid fa-route"></i> ${esc(routeName)}</div>
                    ${row(T.date, esc(travel))}
                    ${row(T.time, esc(b.bookingTime))}
                    ${row(T.car, esc(b.carLabel))}
                    ${b.notes ? row(T.notes, esc(b.notes)) : ''}
                </div>
                <div class="r-section">
                    <h3>${T.customer}</h3>
                    ${row(isEn ? 'Name' : 'ชื่อ', esc(b.name))}
                    ${row(T.phone, esc(b.phone))}
                    ${row(T.line, esc(b.lineid))}
                    ${row(T.email, esc(b.email))}
                </div>
                <div class="r-section r-pay">
                    <h3>${T.payment}</h3>
                    ${row(T.total, `${money(b.price)} ${T.thb}`)}
                    ${row(T.deposit, `− ${money(b.deposit)} ${T.thb}`, 'r-green')}
                    ${row(T.balance, `${money(balance)} ${T.thb}`, 'r-total')}
                </div>
                <p class="r-note">${T.note}</p>
                <div class="r-foot">
                    <span><i class="fa-solid fa-phone"></i> 087-585-4108</span>
                    <span><i class="fa-brands fa-line"></i> LINE Official</span>
                    <span>${T.issued} ${esc(issued)}</span>
                </div>
                <div class="r-actions">
                    <button type="button" class="btn btn-primary" data-act="print"><i class="fa-solid fa-print"></i> ${T.print}</button>
                    <a href="${T.homeHref}" class="btn btn-ghost"><i class="fa-solid fa-house"></i> ${T.home}</a>
                </div>
                <button type="button" class="r-close" data-act="close" aria-label="${T.close}"><i class="fa-solid fa-xmark"></i></button>
            </div>`;
        document.body.appendChild(overlay);
        document.body.classList.add('receipt-open');
        overlay.addEventListener('click', e => {
            const act = e.target.closest('[data-act]');
            if (act && act.dataset.act === 'print') window.print();
            if (act && act.dataset.act === 'close') location.reload();
        });
        overlay.querySelector('[data-act="print"]').focus();
    };
})();
