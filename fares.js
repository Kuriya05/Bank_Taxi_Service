// fares.js — ราคาและข้อมูลรถ (แก้ราคาที่ไฟล์นี้ที่เดียว ใช้ทั้งหน้าแรกและหน้าบริการและราคา ทั้งไทย/อังกฤษ)
// หมายเหตุ: หน้าจองรถ (booking.html / booking-en.html) ยังมีตารางราคาของตัวเองใน routeData ต้องแก้ให้ตรงกันด้วย
window.BT_CARS = [
    { key: 'camry',    name: 'Toyota Camry',    seats: '1-3',  img: 'https://img1.pic.in.th/images/camry.png',
      bags: { th: 'กระเป๋า 2-3 ใบ', en: '2-3 bags' },
      type: { th: 'รถเก๋งซีดาน', en: 'Sedan' } },
    { key: 'fortuner', name: 'Toyota Fortuner', seats: '4-5',  img: 'https://img1.pic.in.th/images/fortuner.png',
      bags: { th: 'กระเป๋า 4-5 ใบ', en: '4-5 bags' },
      type: { th: 'รถ SUV', en: 'SUV' } },
    { key: 'commuter', name: 'Toyota Commuter', seats: '9-10', img: 'https://img2.pic.in.th/commuter.png',
      bags: { th: 'กระเป๋าใบใหญ่ 8-10 ใบ', en: '8-10 large bags' },
      type: { th: 'รถตู้ VIP', en: 'VIP van' } }
];

// from / to: รหัสสถานที่ (ใช้กรอง) · prices: [Camry, Fortuner, Commuter] หน่วยบาท
window.BT_PLACES = {
    bkk: { th: 'สุวรรณภูมิ', en: 'Suvarnabhumi', icon: 'fa-plane' },
    dmk: { th: 'ดอนเมือง', en: 'Don Mueang', icon: 'fa-plane' },
    utp: { th: 'อู่ตะเภา', en: 'U-Tapao', icon: 'fa-plane' },
    pty: { th: 'พัทยา', en: 'Pattaya', icon: 'fa-umbrella-beach' },
    hhn: { th: 'หัวหิน', en: 'Hua Hin', icon: 'fa-umbrella-beach' },
    ryg: { th: 'ระยอง', en: 'Rayong', icon: 'fa-location-dot' },
    kch: { th: 'เกาะช้าง', en: 'Koh Chang', icon: 'fa-ship' },
    city: { th: 'กรุงเทพ', en: 'Bangkok', icon: 'fa-city' }
};

window.BT_FARES = [
    { from: 'bkk',  to: 'pty',  prices: [1000, 1400, 1800] },
    { from: 'bkk',  to: 'hhn',  prices: [1800, 2500, 2700] },
    { from: 'bkk',  to: 'ryg',  prices: [1800, 2500, 2700] },
    { from: 'bkk',  to: 'kch',  prices: [3500, 4000, 4500] },
    { from: 'dmk',  to: 'pty',  prices: [1400, 1800, 2200] },
    { from: 'utp',  to: 'pty',  prices: [800, 1200, 1300] },
    { from: 'pty',  to: 'city', prices: [1200, 1600, 1900] },
    { from: 'pty',  to: 'dmk',  prices: [1400, 1800, 2200] },
    { from: 'pty',  to: 'bkk',  prices: [1000, 1400, 1800] },
    { from: 'city', to: 'pty',  prices: [1200, 1600, 1900] }
];

// ชื่อเส้นทางตามภาษา เช่น "สุวรรณภูมิ - พัทยา"
window.btRouteName = (fare, lang) => `${window.BT_PLACES[fare.from][lang]} - ${window.BT_PLACES[fare.to][lang]}`;
