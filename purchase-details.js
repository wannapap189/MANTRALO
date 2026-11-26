/* Shipping THB 59 and course access 12 months approved by owner on 2026-11-26. Delivery integration remains a proposal; local preview only. */
(() => {
  const translations = {};
  window.MANTRALO_EN_PURCHASE = translations;
  const t = (th,en) => { translations[th]=en; return th; };
  const previewLink = kind => `<p><a class="text-link pd-preview-link" href="/post-purchase.html?product=${kind}&status=pending&view=receipt">${t('ดูตัวอย่างขั้นตอนหลังซื้อและอีเมล (ภาษาไทย)','Preview the after-purchase steps and email (Thai)')}</a></p>`;
  const badge = () => `<p class="pd-proposal">${t('เงื่อนไขที่เลือก · พรีวิว ยังไม่เปิดขาย','Selected terms · Preview only, sales are not open')}</p>`;
  const delivery = () => `<ol class="pd-steps">
    <li><strong>${t('ใช้อีเมลเดียวกับรายการสั่งซื้อ','Use the email on your order')}</strong><p>${t('เมื่อระบบพร้อม ทีมงานตรวจสอบยอดชำระและรายการที่ซื้อ ก่อนเปิดสิทธิ์ให้บัญชีของคุณ','Once the service is ready, the team verifies payment and purchased items before enabling access for your account.')}</p></li>
    <li><strong>${t('รับอีเมลพร้อมลิงก์เข้าใช้งาน','Receive an email with your access link')}</strong><p>${t('เสนอให้ส่งลิงก์ภายใน 1 วันทำการหลังยืนยันยอดชำระ เปิดคลังหนังสือดิจิทัลหรือห้องเรียนตามสิทธิ์ที่ซื้อ','Proposed delivery: an access link within one business day after payment is verified, for the digital library or course you purchased.')}</p></li>
    <li><strong>${t('กลับมาอ่านหรือเรียนจากบัญชีเดิม','Return through the same account')}</strong><p>${t('หากไม่พบอีเมล ให้ตรวจโฟลเดอร์สแปม หรือติดต่อ LINE @emcthai พร้อมเลขคำสั่งซื้อเพื่อให้ทีมช่วยตรวจสอบ','Check your spam folder if the email is missing, or contact LINE @emcthai with your order number for help.')}</p></li>
  </ol>`;
  function book(prices){return `<section class="container pd-section" id="book-receive" tabindex="-1" aria-labelledby="book-receive-title">
    ${badge()}<h2 id="book-receive-title">${t('รู้ยอดรวม และรู้ว่าจะได้รับอะไร','Know the total and what arrives')}</h2>
    <p class="pd-intro">${t('หนังสือเล่มส่งถึงที่อยู่ของคุณ ส่วนหนังสือดิจิทัลรับสิทธิ์ผ่านอีเมลและคลังส่วนตัว','The printed book goes to your delivery address. Digital access arrives by email and lives in your personal library.')}</p>
    <div class="pd-columns"><div><h3>${t('หนังสือเล่ม + หนังสือดิจิทัล 1 ชื่อเรื่อง','One printed book + its matching digital edition')}</h3>
      <dl class="pd-receipt"><div><dt>${t('หนังสือ 7 วัน 7 จักระ 1 เล่ม','One copy of 7 Days, 7 Chakras')}</dt><dd>${t(`${prices.book} บาท`,`THB ${prices.book}`)}</dd></div>
      <div><dt>${t('หนังสือดิจิทัลชื่อเดียวกันฉบับเต็ม','The complete digital edition of the same title')}</dt><dd>${t('รวมในชุด','Included')}</dd></div>
      <div><dt>${t('ค่าส่ง: ในประเทศ พื้นที่ปกติ','Shipping: standard areas in Thailand')}</dt><dd>${t('59 บาท','THB 59')}</dd></div>
      <div class="pd-total"><dt>${t('ยอดรวมสำหรับ 1 ชุด','Total for one set')}</dt><dd>${t(`${prices.book+59} บาท`,`THB ${prices.book+59}`)}</dd></div></dl>
      <p class="pd-note">${t('ค่าส่งหนังสือ 59 บาทสำหรับในประเทศพื้นที่ปกติ พื้นที่พิเศษหรือต่างประเทศแจ้งยอดก่อนชำระ','Book shipping is THB 59 for standard areas in Thailand. Special areas and international destinations require a quote before payment.')}</p>
      <p>${t('เสนอให้เตรียมส่งหนังสือภายใน 1–2 วันทำการหลังยืนยันยอดชำระ พร้อมแจ้งเลขติดตาม ระยะเวลาขนส่งขึ้นอยู่กับปลายทาง','Proposed dispatch: within 1–2 business days after payment is verified, with tracking provided. Transit time depends on the destination.')}</p>
    </div><div><h3>${t('เลือกดิจิทัลอย่างเดียวได้เช่นกัน','You can also choose digital only')}</h3>
      <p>${t(`ชุดเริ่มต้นดิจิทัลราคาเสนอ ${prices.digital} บาท ไม่มีค่าจัดส่ง ได้หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม ไม่มีหนังสือเล่ม`,`Digital Starter is proposed at THB ${prices.digital}, with no shipping charge. It includes the complete Thai digital book 7 Days, 7 Chakras and no printed copy.`)}</p>
      <p>${t('เสนอให้รับหนังสือดิจิทัลเป็น PDF ผ่านลิงก์ในอีเมลและคลังส่วนตัว ดาวน์โหลดเก็บอ่านส่วนตัวได้ รูปแบบไฟล์และระบบรับสิทธิ์ต้องยืนยันก่อนเปิดขาย','Proposed format: a PDF accessed through an email link and personal library, downloadable for personal reading. The file format and access system must be confirmed before sales open.')}</p>
      <p class="pd-note">${t('ทั้งสองรูปแบบเป็นหนังสือชื่อเดียวกัน ไม่รวมหนังสือดิจิทัลอีก 7 เล่มหรือคอร์ส ชุดคู่มือ Checklist และบันทึก 7 วันเปิดให้ทุกคนใช้ฟรี','Both formats contain the same book. The other seven digital books and the course are separate. The starter guide, checklist and seven-day journal remain free for everyone.')}</p>
    </div></div>
    <h3 class="pd-delivery-title">${t('รับสิทธิ์ดิจิทัลอย่างไร','How digital access would work')}</h3>${delivery()}
    <p class="pd-boundary">${t('หน้าพรีวิวนี้ยังไม่สร้างคำสั่งซื้อ ส่งอีเมล หรือเปิดไฟล์ที่มีค่าใช้จ่าย','This preview does not create orders, send emails or unlock paid files.')}</p>
  ${previewLink('book')}</section>`;}
  function course(){return `<section class="container pd-section" id="course-receive" tabindex="-1" aria-labelledby="course-receive-title">
    ${badge()}<h2 id="course-receive-title">${t('ซื้อคอร์สแล้ว เรียนและรับสื่ออย่างไร','What you receive and how you learn')}</h2>
    <div class="pd-columns"><div><h3>${t('สิ่งที่อยู่ในข้อเสนอคอร์ส','Included in the proposed course offer')}</h3>
      <ul class="pd-inclusions"><li>${t('เนื้อหาจักระครบ 12 บท ตามสารบัญที่แสดงบนหน้านี้','All 12 chakra lessons, following the curriculum on this page')}</li><li>${t('หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม 1 ชื่อเรื่อง ในชุดเริ่มต้นดิจิทัล','The complete digital book 7 Days, 7 Chakras, included in Digital Starter')}</li><li>${t('ใช้คู่มือเริ่มต้น Checklist และบันทึก 7 วันประกอบการฝึกได้ฟรี','Free starter guide, checklist and seven-day practice journal')}</li></ul>
      <p class="pd-note">${t('ไม่รวมหนังสือเล่ม หนังสือดิจิทัลอีก 7 เล่ม อุปกรณ์ ไลฟ์ หรือการดูแลรายบุคคล เว้นแต่ระบุเป็นสินค้าเพิ่ม','Printed books, the other seven digital books, equipment, live sessions and individual guidance are separate unless explicitly offered as an add-on.')}</p>
      <p>${t('สารบัญ 12 บทอ้างอิงคอร์สเดิม ส่วนรายการวิดีโอ เสียง และเอกสารที่จะส่งมอบในแต่ละบท รวมถึงชั่วโมงเรียนและวันเปิดเรียน ยังต้องตรวจยืนยัน ตัวอย่างที่เปิดดูได้ตอนนี้เป็น PDF 2 หน้า','The 12-lesson outline comes from the existing course. Videos, audio, documents for each lesson, total duration and the opening date still require confirmation. The current sample is a two-page PDF.')}</p>
      <a class="text-link" href="#/lesson-sample">${t('เปิดตัวอย่างเอกสารจริงก่อนตัดสินใจ','Read the actual document sample')}</a>
    </div><div class="pd-access"><h3>${t('ระยะเวลาเข้าเรียน','Course access period')}</h3><p class="pd-duration">${t('12 เดือน','12 months')}</p>
      <p>${t('นับจากวันที่เปิดสิทธิ์เข้าคอร์สในบัญชี ไม่ใช่วันที่ซื้อหนังสือ ย้อนทบทวนบทเรียนที่พร้อมให้บริการได้ภายในระยะเวลานี้','From the date course access is activated in your account, not the book purchase date. Revisit available lessons during this period.')}</p>
      <p>${t('ผู้สมัครเต็มราคาและผู้ใช้เครดิตอัปเกรดได้ระยะเวลาเดียวกัน เสนอให้แจ้งวันหมดอายุในบัญชีและอีเมล ไม่ต่ออายุหรือเรียกเก็บเงินอัตโนมัติ','Full-price and eligible upgrade purchases receive the same access period. The proposed expiry date will appear in your account and email, with no automatic renewal or charge.')}</p>
      <p class="pd-note">${t('หากยืนยันรูปแบบหนังสือดิจิทัลเป็น PDF ไฟล์ที่ดาวน์โหลดไว้ใช้ส่วนตัวจะไม่หมดอายุตามคอร์ส การต่อสิทธิ์เรียนภายหลังต้องมีข้อเสนอแยกให้เลือก','If the digital book is confirmed as a downloadable PDF, your personal downloaded copy will not expire with course access. Any later course renewal requires a separate offer you can choose.')}</p>
    </div></div>
    <h3 class="pd-delivery-title">${t('หลังยืนยันยอดชำระ','After payment is verified')}</h3>${delivery()}
    <p class="pd-boundary">${t('เลือกใช้ระยะเวลาเรียน 12 เดือนแล้ว ส่วนวิธีส่งมอบยังเป็นข้อเสนอ ระบบนี้ยังไม่รับชำระเงินหรือเปิดสิทธิ์เรียนจริง','The 12-month access period is selected. Delivery is still proposed; this preview does not accept payment or activate course access.')}</p>
  ${previewLink('course')}</section>`;}
  function summary(kind,prices){const isCourse=kind==='course'||kind==='upgrade';return `<div class="pd-modal">${badge()}<p>${isCourse?t('เข้าเรียน 12 เดือนนับจากเปิดสิทธิ์ ผู้ใช้เครดิตได้ระยะเวลาเดียวกัน ไม่มีการต่ออายุอัตโนมัติ','Access: 12 months from activation, also for eligible upgrades, with no automatic renewal.'):kind==='digital'?t('ชุดดิจิทัลไม่มีค่าจัดส่ง เสนอให้รับ PDF ผ่านอีเมลและคลังส่วนตัว','No shipping for the digital set. Proposed PDF delivery through email and a personal library.'):t(`ยอดรวม 1 ชุด: หนังสือ ${prices.book} + ค่าส่ง 59 = ${prices.book+59} บาท ในประเทศพื้นที่ปกติ ค่าส่งไม่รวมในเครดิตคอร์ส`,`One-set total: book THB ${prices.book} + shipping THB 59 = THB ${prices.book+59}, for standard areas in Thailand. Shipping does not count toward course credit.`)}</p><p>${t('เสนอให้ส่งอีเมลลิงก์รับสิทธิ์ภายใน 1 วันทำการหลังยืนยันยอดชำระ เงื่อนไขและความพร้อมต้องยืนยันก่อนเปิดขาย','Proposed access email within one business day after verified payment. Terms and availability must be confirmed before sales open.')}</p>${previewLink(kind)}</div>`;}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-details-scroll]');if(!b)return;const id=b.dataset.detailsScroll;if(!['book-receive','course-receive'].includes(id))return;const el=document.getElementById(id);el?.scrollIntoView({block:'start'});el?.focus({preventScroll:true});});
  window.MANTRALO_PURCHASE_DETAILS=Object.freeze({book,course,summary});
})();
