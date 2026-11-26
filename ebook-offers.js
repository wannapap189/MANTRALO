/* Local proposal, 19 Nov 2026. Display prices never authorize payment or access. */
(() => {
  'use strict';
  const amounts = { 'seven-days':290, 'lucky-by-design':190, 'unlock-love':190, 'office-chakra':190, 'inner-radiance':190, 'crystal-harmony':190, 'crystal-water':99, 'crystal-healing':149 };
  const all = Object.keys(amounts);
  const life = ['lucky-by-design','unlock-love','office-chakra','inner-radiance'];
  const catalog = () => window.MANTRALO_LIBRARY_BOOKS || [];
  const freeze = offer => Object.freeze({ ...offer, bookIds:Object.freeze(offer.bookIds), status:'proposal', currency:'THB' });
  const singles = Object.freeze(all.map(id => freeze({ id:`ebook-${id}`, title:catalog().find(b => b.id === id)?.title || id, price:amounts[id], bookIds:[id], kind:'single', starterAllocation:id === 'seven-days' ? 290 : 0 })));
  const bundles = Object.freeze([
    freeze({ id:'life-four', title:'ชีวิตประจำวัน · 4 เล่ม', price:590, bookIds:life, kind:'bundle', starterAllocation:0 }),
    freeze({ id:'all-eight', title:'MANTRALO Complete · ครบ 8 เล่ม', price:1090, bookIds:all, kind:'bundle', starterAllocation:290 }),
    freeze({ id:'complete-seven', title:'เติมคลังอีก 7 เล่ม', price:800, bookIds:all.filter(id => id !== 'seven-days'), kind:'extension', starterAllocation:0 }),
    freeze({ id:'complete-from-four', title:'เติมจากชุดชีวิตประจำวันให้ครบ 8', price:500, bookIds:all.filter(id => !life.includes(id)), kind:'upgrade', requires:'life-four', starterAllocation:290 })
  ]);
  const offers = Object.freeze([...singles,...bundles]);
  const get = id => offers.find(o => o.id === id) || null;
  const books = offer => offer ? offer.bookIds.map(id => catalog().find(b => b.id === id)).filter(Boolean) : [];
  const listTotal = offer => offer ? offer.bookIds.reduce((sum,id) => sum + amounts[id],0) : 0;
  const savings = offer => offer ? listTotal(offer) - offer.price : 0;
  const escape = text => String(text).replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = number => Number(number).toLocaleString('th-TH');

  function renderSummary(id) {
    const offer = get(id);
    if (!offer) return '<div class="dialog-body"><h2 id="dialog-title">ไม่พบข้อเสนอนี้</h2><p>เลือกหนังสือดิจิทัลจากหน้ารวมราคาได้ค่ะ</p><a class="button button-primary" href="#/ebooks">ดูหนังสือดิจิทัลและแพ็กเกจ</a></div>';
    const selectedBook = offer.kind === 'single' ? books(offer)[0] : null;
    const readerContext = selectedBook?.solutionTitle
      ? `<div class="eo-summary-purpose"><h3>${escape(selectedBook.solutionTitle)}</h3><p>${escape(selectedBook.solutionCopy || selectedBook.description)}</p></div>`
      : '';
    const conditions = offer.requires
      ? '<p class="eo-condition">ข้อเสนอสำหรับผู้ซื้อชุดชีวิตประจำวัน 590 บาท ต้องตรวจรายการเดิมก่อนจ่ายเพิ่ม 500 บาท รวมสองครั้ง 1,090 บาท สิทธิ์นี้ยังไม่ถูกอนุมัติจากการเปิดหน้าสรุป</p>'
      : offer.id === 'complete-seven'
        ? '<p class="eo-condition">ชุดนี้ไม่มี 7 วัน 7 จักระ เหมาะกับผู้ที่มีเล่มนี้จากหนังสือ ชุดเริ่มต้นดิจิทัล หรือคอร์สแล้ว หากยังไม่มี เลือกชุดครบ 8 เล่ม 1,090 บาทได้</p>'
        : '';
    const courseNote = offer.starterAllocation
      ? '<p>ตามข้อเสนอ ส่วน ชุดเริ่มต้นดิจิทัล 290 บาทใช้ขอตรวจเครดิตคอร์สได้สูงสุด 290 บาทหนึ่งครั้ง เมื่อผ่านการตรวจและได้เครดิตเต็ม จ่ายเพิ่ม <strong>2,610 บาท</strong> จากคอร์ส 2,900 บาท ไม่สะสมกับเครดิตหนังสือเดิม</p>'
      : '<p>ยอดของหนังสือดิจิทัลหรือชุดนี้ไม่เพิ่มเครดิตคอร์ส หากมีรายการหนังสือหรือ ชุดเริ่มต้นดิจิทัล เดิมที่เข้าเงื่อนไข ยังขอตรวจเครดิตจากรายการนั้นได้</p>';
    return `<div class="dialog-body eo-summary"><span class="eyebrow">ตัวอย่างข้อเสนอ · ยังไม่รับชำระเงิน</span><h2 id="dialog-title">${escape(offer.title)}</h2><div class="eo-summary-price">${money(offer.price)} <small>บาท</small></div><p>หนังสือดิจิทัล PDF ${offer.bookIds.length} เล่ม · ไม่มีการจัดส่งเล่มพิมพ์</p>${readerContext}${conditions}<h3>รายการที่อยู่ในชุดนี้</h3><ul>${books(offer).map(book => `<li>${escape(book.title)}</li>`).join('')}</ul>${offer.bookIds.length > 1 ? `<p class="muted">รวมราคาแยกตามข้อเสนอนี้ ${money(listTotal(offer))} บาท · ประหยัด ${money(savings(offer))} บาท</p>` : ''}<div class="eo-summary-credit"><h3>เมื่ออยากเรียนคอร์ส 12 บท</h3>${courseNote}<a href="#/course" class="text-link">ดูคอร์สและเงื่อนไขเครดิต</a></div>${offer.id === 'ebook-seven-days' ? '<p>ชอบอ่านเล่มจริง? <a href="#/book">หนังสือ 290 บาทแถมหนังสือดิจิทัลเล่มเดียวกัน</a> ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ จึงไม่ต้องซื้อหนังสือดิจิทัลซ้ำ</p>' : ''}<p>มีคู่มือ Checklist และบันทึก 7 วันให้ทุกคนดาวน์โหลดฟรี แยกจากหนังสือดิจิทัลที่เลือก</p><a href="#/library?section=free" class="text-link">เปิดเอกสารฝึกฟรี 3 ชิ้น</a><p class="dialog-footnote">กำลังตรวจฉบับส่งมอบและวิธีรับไฟล์ หน้านี้ไม่สร้างคำสั่งซื้อ ไม่เรียกเก็บเงิน และไม่เปิดสิทธิ์อัตโนมัติ</p><div class="contact-id">@emcthai</div><button type="button" class="button button-primary" data-copy-line>คัดลอก LINE ID เพื่อสอบถาม</button></div>`;
  }
  function renderBridge(context) {
    const set = get('complete-seven');
    const complete = get('all-eight');
    return `<section class="eo-bridge container" aria-label="อ่านต่อในห้องสมุด MANTRALO"><div><span class="eyebrow">YOUR NEXT CHAPTER</span><h2>มี 7 วัน 7 จักระแล้ว<br>เติมเรื่องที่อยากรู้ได้อีก</h2><p>${context === 'course' ? 'ข้อเสนอคอร์สรวม ชุดเริ่มต้นดิจิทัล และหนังสือดิจิทัล 7 วัน 7 จักระไว้แล้ว' : 'ชุดหนังสือ 290 บาทแถมหนังสือดิจิทัล 7 วัน 7 จักระเล่มเดียวกัน'} จึงเลือกชุดเติมอีก 7 เล่มได้โดยไม่ซื้อเล่มเดิมซ้ำ</p><a href="#/ebooks" class="text-link">ดูราคาและเนื้อหาหนังสือดิจิทัลทั้ง 8 เล่ม</a></div><div class="eo-bridge-card"><span>เติมคลังอีก 7 เล่ม · ราคาเสนอ</span><strong>${money(set.price)} <small>บาท</small></strong><p>Lucky by Design · Unlock Love · Office Chakra · เปล่งประกายภายใน และคริสตัล 3 เล่ม</p><a href="#/ebooks?offer=complete-seven" class="button button-primary">ดูชุดเติมอีก 7 เล่ม</a><small>หากยังไม่มี ชุดเริ่มต้นดิจิทัล เลือกชุดครบ 8 เล่ม ${money(complete.price)} บาทได้ ชุดเติม 7 เล่มไม่เพิ่มเครดิตคอร์ส</small></div></section>`;
  }
  window.MANTRALO_EBOOK_OFFERS = Object.freeze({ singles, bundles, get, books, listTotal, savings, renderSummary, renderBridge, coursePrice:2900, creditMax:290 });
})();
