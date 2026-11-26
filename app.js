/* MANTRALO local preview. No orders, payments, or course entitlements are created. */
(() => {
  'use strict';

  function init() {
    const main = document.getElementById('main');
    if (!main) return;
    const homeHTML = main.innerHTML;
    const homeTitle = document.title;
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const toast = document.getElementById('toast');
    const nav = document.getElementById('main-nav');
    const menuToggle = document.getElementById('menu-toggle');
    const header = document.getElementById('site-header');
    // This campaign has one approved offer across result, book, and course pages.
    // A connection URL or browser config cannot change prices or grant credit.
    const prices = Object.freeze({ book: 290, digital: 290, course: 2900, credit: 290 });
    const baht = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(value);
    let activeRoute = '';
    let activeRouteKey = '';
    let resultCleanup = null;
    let libraryCleanup = null;
    let leadCleanup = null;
    let freeKitCleanup = null;
    let selectedFormat = 'paper';
    let modalTrigger = null;
    let toastTimeout = null;
    let practiceInterval = null;
    let practice = { status: 'idle', remaining: 180, deadline: 0, phase: 0 };

    const chakras = [
      { name: 'รากฐาน · กลับมาตั้งหลัก', description: 'รับรู้เท้าที่วางบนพื้น มองไปรอบตัว แล้วเลือกหนึ่งเรื่องเล็ก ๆ ที่ทำให้วันนี้เป็นระเบียบขึ้น ใช้สีแดงเป็นสัญลักษณ์เตือนใจถึงความมั่นคง', mantra: 'ฉันค่อย ๆ สร้างความมั่นคงในแบบของฉันได้' },
      { name: 'ความรู้สึก · ให้พื้นที่กับตัวเอง', description: 'หยุดสักครู่แล้วลองบอกความรู้สึกของตัวเองหนึ่งคำ โดยยังไม่ต้องรีบเปลี่ยนหรืออธิบาย ใช้สีส้มเป็นจุดเริ่มต้นของการรับฟังตัวเอง', mantra: 'ฉันรับรู้ความรู้สึก โดยไม่ต้องตัดสินตัวเอง' },
      { name: 'ความตั้งใจ · เริ่มจากสิ่งที่ทำได้', description: 'เลือกงานเล็กเพียงหนึ่งอย่างที่ทำต่อได้วันนี้ และกำหนดจุดเริ่มต้นให้ชัด ใช้สีเหลืองเตือนใจถึงความตั้งใจและสิทธิในการเลือกของตัวเอง', mantra: 'ฉันเลือกก้าวเล็ก ๆ ที่เหมาะกับวันนี้ได้' },
      { name: 'ความเมตตา · อ่อนโยนกับตัวเอง', description: 'ถามตัวเองว่า ถ้าคนที่เราห่วงใยกำลังเจอเรื่องเดียวกัน เราจะพูดกับเขาอย่างไร แล้วลองใช้ถ้อยคำเหล่านั้นกับตัวเอง สีเขียวเป็นสัญลักษณ์ของความเมตตา', mantra: 'ฉันดูแลตัวเองด้วยความอ่อนโยนได้' },
      { name: 'การสื่อสาร · พูดอย่างใส่ใจ', description: 'ลองเขียนหนึ่งประโยคที่สื่อความต้องการของเราอย่างตรงไปตรงมาและเคารพอีกฝ่าย ใช้สีฟ้าเป็นสัญลักษณ์ของการฟังและการสื่อสารที่ชัดเจน', mantra: 'ฉันพูดสิ่งสำคัญ และฟังด้วยความใส่ใจ' },
      { name: 'การทบทวน · มองให้ชัดขึ้น', description: 'พักจากข้อมูลใหม่สักครู่ แล้วทบทวนว่าอะไรคือข้อเท็จจริง อะไรคือความรู้สึก และอะไรยังไม่รู้ ใช้สีครามเตือนใจให้เว้นพื้นที่ก่อนตัดสินใจ', mantra: 'ฉันให้เวลาตัวเองได้เห็นสิ่งต่าง ๆ ชัดขึ้น' },
      { name: 'ความหมาย · เชื่อมกับสิ่งสำคัญ', description: 'นึกถึงสิ่งหนึ่งที่มีความหมายกับเรา แล้วเลือกการกระทำเล็ก ๆ ที่สอดคล้องกับสิ่งนั้น ใช้สีม่วงเป็นสัญลักษณ์ของการทบทวนคุณค่าและความหมายในชีวิต', mantra: 'วันนี้ฉันให้เวลากับสิ่งที่มีความหมาย' }
    ];
    const interests = {
      focus: 'เริ่มจากหยุดรับข้อมูลสัก 3 นาที รับรู้ลมหายใจตามธรรมชาติ แล้วเลือกเพียงหนึ่งสิ่งที่จะทำต่อ ไม่จำเป็นต้องทำให้ความคิดทั้งหมดหายไป',
      work: 'ก่อนเริ่มงานหรือหลังจบประชุม ลองกลับมารับรู้ท่านั่งและลมหายใจ แล้วเขียนงานถัดไปหนึ่งอย่างที่ทำได้จริงในวันนี้',
      love: 'ให้เวลาตัวเองสังเกตความรู้สึก ก่อนเลือกถ้อยคำที่จะพูด การฝึกครั้งนี้เริ่มที่การฟังตัวเองและเคารพความรู้สึกของอีกฝ่าย',
      energy: 'ลองเช็กกับตัวเองว่าตอนนี้ต้องการพัก เคลื่อนไหว หรือจัดลำดับสิ่งที่ทำ ใช้สีเป็นเครื่องเตือนใจให้สังเกตตัวเองในแต่ละวัน'
    };
    const phases = [
      { title: 'ตั้งหลักกับร่างกาย', overview: 'นั่งให้สบาย รับรู้เท้าหรือส่วนของร่างกายที่สัมผัสพื้น', instruction: 'นั่งในท่าที่สบาย รับรู้เท้าหรือส่วนของร่างกายที่สัมผัสพื้น จะลืมตาหรือพักสายตาก็ได้ ปล่อยให้ลมหายใจเป็นธรรมชาติ' },
      { title: 'รับรู้ลมหายใจ', overview: 'สังเกตลมหายใจตามธรรมชาติ ไม่ต้องนับ กลั้น หรือบังคับ', instruction: 'สังเกตลมหายใจเข้าและออกตามจังหวะของตัวเอง ไม่ต้องหายใจลึก ไม่ต้องนับหรือกลั้นหายใจ เมื่อรู้ตัวว่าใจลอย ค่อย ๆ กลับมารับรู้ใหม่' },
      { title: 'กลับไปสู่วันของเรา', overview: 'รับรู้สิ่งรอบตัว แล้วเลือกหนึ่งอย่างเล็ก ๆ ที่อยากทำต่อ', instruction: 'รับรู้เสียงรอบตัวและน้ำหนักของร่างกาย ลองเลือกสิ่งเล็ก ๆ ที่อยากทำต่อเมื่อจบการฝึก แล้วค่อย ๆ ขยับตามสบาย' }
    ];

    function notify(message) {
      if (!toast) return;
      window.clearTimeout(toastTimeout);
      toast.textContent = message;
      toast.hidden = false;
      toast.classList.add('is-visible');
      toastTimeout = window.setTimeout(() => { toast.classList.remove('is-visible'); toast.hidden = true; }, 4500);
    }

    function setMenu(open) {
      menuToggle?.setAttribute('aria-expanded', String(open));
      nav?.classList.toggle('is-open', open);
      header?.classList.toggle('menu-open', open);
    }

    function openModal(markup, trigger) {
      if (!modal || !modalContent) return;
      modalTrigger = trigger || document.activeElement;
      modalContent.innerHTML = markup;
      modal.setAttribute('aria-labelledby', 'dialog-title');
      if (!modal.open) modal.showModal();
      // Keep the title and offer visible; focusing a lower CTA can scroll long dialogs.
      modalContent.scrollTop = 0;
      modal.scrollTop = 0;
      modal.querySelector('[data-close]')?.focus({ preventScroll: true });
    }

    function contactModal(trigger) {
      openModal(`<div class="dialog-body"><span class="eyebrow">MANTRALO</span><h2 id="dialog-title">พูดคุยกับ MANTRALO</h2><p class="muted">สอบถามหนังสือ รูปแบบคอร์ส และกำหนดการผ่าน LINE ของทีมงาน (ช่องทางเดิม EMC) โดยค้นหา ID นี้ในแอป</p><div class="contact-id" aria-label="LINE ID">@emcthai</div><button type="button" class="button button-primary" data-copy-line>คัดลอก LINE ID</button><p class="dialog-footnote">ค้นหา @emcthai ใน LINE เพื่อเริ่มพูดคุยกับทีมงาน</p></div>`, trigger);
    }

    function funnelNextStep(kind) {
      const action = window.MANTRALO_FUNNEL?.resolveAction(kind);
      if (!action || action.state !== 'configured') return '';
      const labels = {
        book: 'ดำเนินการสั่งหนังสือในระบบเดิม',
        digital: 'ดำเนินการสั่งฉบับดิจิทัลในระบบเดิม',
        course: 'ดูยอดและสมัครคอร์สในระบบเดิม',
        upgrade: 'ไปตรวจสิทธิ์เครดิตในระบบเดิม'
      };
      const escapedUrl = String(action.url).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
      return `<div class="funnel-next-step"><a class="button button-primary" href="${escapedUrl}">${labels[kind]}</a><p class="dialog-footnote">${kind === 'upgrade' ? 'ตรวจรายการซื้อและเครดิตก่อน ระบบจึงแจ้งยอดจ่ายจริง การเปิดหน้านี้ยังไม่ให้สิทธิ์ส่วนลดหรือเข้าเรียน' : 'ตรวจรายการและยอดรวมในหน้าถัดไป การเปิดหน้านี้ยังไม่ได้สั่งซื้อหรือชำระเงิน'}</p></div>`;
    }

    function orderModal(kind, trigger) {
      const isCourse = kind === 'course';
      const isDigital = kind === 'digital';
      const title = isCourse ? 'คอร์สจักระ 12 บทเรียน' : isDigital ? 'ชุดเริ่มต้นดิจิทัล ฉบับดิจิทัล' : 'ชุดหนังสือ 7 วัน 7 จักระ';
      const price = isCourse ? prices.course : isDigital ? prices.digital : prices.book;
      const details = isCourse
        ? '<li>คอร์สจำนวน 12 บทเรียน</li><li>เสนอให้รวม ชุดเริ่มต้นดิจิทัล: หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็มและเอกสารช่วยฝึก ไม่รวมหนังสือดิจิทัลอีก 7 เล่มหรือหนังสือเล่มโดยอัตโนมัติ</li><li>เข้าเรียน 12 เดือนนับจากเปิดสิทธิ์ ส่วนวันเปิดเรียนและรายการวิดีโอยังรอยืนยัน</li>'
        : isDigital
          ? '<li>หนังสือดิจิทัล 7 วัน 7 จักระ ฉบับเต็ม เป็นสินค้าหลักของแพ็กเกจ</li><li>พร้อมคู่มือเริ่มฝึก เช็กลิสต์ และสมุดบันทึกสำหรับใช้ประกอบการฝึก</li><li>รายละเอียดไฟล์จำหน่ายและวิธีส่งมอบอยู่ระหว่างยืนยัน</li><li>PDF ชุดเริ่มต้น MANTRALO เปิดให้ทุกคนใช้ฟรี แยกจากหนังสือดิจิทัลฉบับเต็ม</li>'
          : '<li>หนังสือ 7 วัน 7 จักระ New Edition 1 เล่ม พิมพ์ 4 สีทั้งเล่ม</li><li>แถมหนังสือดิจิทัล 7 วัน 7 จักระ ฉบับเต็ม ไม่ต้องซื้อเพิ่ม</li><li>ทีมงานแจ้งวิธีรับสิทธิ์หนังสือดิจิทัลหลังยืนยันรายการ</li><li>ค่าส่ง 59 บาท รวม 349 บาท ในประเทศพื้นที่ปกติ แจ้งกำหนดส่งก่อนชำระ</li>';
      const credit = isCourse ? `<div class="notice"><strong>เครดิตหนังสือสูงสุด 290 บาท</strong><p>ใช้ได้เมื่อทีมงานตรวจสอบการซื้อที่เข้าเงื่อนไขแล้วเท่านั้น หากได้รับเครดิตเต็มจำนวน ราคาคอร์สตามข้อเสนอจะเหลือ ${baht(Math.max(0, prices.course - prices.credit))} บาท ยอดชำระจริงจะยืนยันหลังตรวจสอบสิทธิ์</p></div>` : `<div class="notice"><strong>อยากเรียนต่อภายหลัง?</strong><p>ตามแผนข้อเสนอ นำยอดซื้อที่ตรวจสอบแล้วเป็นเครดิตคอร์ส 12 บทเรียนได้สูงสุด ${baht(prices.credit)} บาทหนึ่งครั้ง เมื่อได้เครดิตเต็ม จ่ายเพิ่ม ${baht(Math.max(0, prices.course - prices.credit))} บาท ไม่รวมค่าจัดส่งและสินค้าเพิ่ม</p><a class="text-button" href="#/course">ดูคอร์ส 12 บทเรียน</a></div>`;
      openModal(`<div class="dialog-body"><span class="eyebrow">สรุปรายการเพื่อสอบถาม</span><h2 id="dialog-title">${title}</h2><div class="order-price"><strong>${baht(price)} <small>บาท</small></strong><span class="pill">${isCourse || isDigital ? 'ราคาเสนอ รอยืนยัน' : 'ราคาหนังสือเล่ม'}</span></div><ul class="check-list">${details}</ul>${credit}${window.MANTRALO_PURCHASE_DETAILS.summary(kind, prices)}${funnelNextStep(isCourse ? 'course' : isDigital ? 'digital' : 'book')}<p class="preview-disclaimer">หน้านี้แสดงรายการสำหรับสอบถามเท่านั้น ยังไม่ได้สร้างคำสั่งซื้อ รับชำระเงิน หรือเปิดสิทธิ์เข้าเรียน</p><div class="contact-id">LINE @emcthai</div><button type="button" class="button button-primary" data-copy-line>คัดลอก LINE ID เพื่อสอบถาม</button></div>`, trigger);
    }

    function courseCreditModal(trigger) {
      const courseCredit = Math.min(prices.credit, prices.course);
      const remainder = Math.max(0, prices.course - courseCredit);
      openModal(`<div class="dialog-body cp-credit-modal"><span class="eyebrow">สำหรับผู้ซื้อหนังสือหรือ ชุดเริ่มต้นดิจิทัล</span><h2 id="dialog-title">ขอตรวจเครดิตเพื่อเรียนต่อ</h2><p class="muted">แจ้งทีมงานว่าต้องการอัปเกรดเป็นคอร์สจักระ 12 บทเรียน พร้อมข้อมูลการซื้อเดิม เพื่อรับสรุปเครดิตและยอดส่วนต่างก่อนชำระ</p><div class="cp-credit-modal-math"><span>${baht(prices.course)} − เครดิตเต็ม ${baht(courseCredit)}</span><strong>${baht(remainder)} บาท</strong></div><p class="cp-credit-modal-status">ตัวอย่างเมื่อได้รับเครดิตเต็ม · ยังไม่ได้ยืนยันสิทธิ์</p><h3>ข้อมูลที่เตรียมไว้ให้ทีมงาน</h3><ul class="check-list"><li>เลขคำสั่งซื้อหรือหลักฐานการซื้อหนังสือหรือ ชุดเริ่มต้นดิจิทัล</li><li>ข้อมูลที่ใช้สั่งซื้อเดิม เพื่อให้ทีมงานค้นหารายการ</li><li>ยอดสินค้าที่ชำระ ไม่รวมค่าจัดส่งและสินค้าเพิ่ม</li></ul><div class="notice"><strong>ก่อนยืนยันอัปเกรด</strong><p>เครดิตตามยอดซื้อที่ตรวจสอบได้ สูงสุด ${baht(courseCredit)} บาทหนึ่งครั้ง หากเครดิตไม่เต็ม ยอดจ่ายเพิ่มจะสูงกว่า ${baht(remainder)} บาท ทีมงานจะแจ้งยอดจริงก่อนชำระ</p><p>ข้อเสนอชุดหนังสือดิจิทัลครบ 8 เล่มจัดสรรส่วน ชุดเริ่มต้นดิจิทัล 290 บาทไว้สำหรับขอตรวจเครดิตด้วย ต้องตรวจคำสั่งซื้อและยอดที่ชำระจริงก่อนเสมอ ยอดหนังสือดิจิทัลอื่น ชุดเติม 7 เล่ม และเครดิตที่เคยใช้แล้วไม่สะสมเพิ่ม</p></div>${window.MANTRALO_PURCHASE_DETAILS.summary('upgrade', prices)}${funnelNextStep('upgrade')}<div class="contact-id">LINE @emcthai</div><button type="button" class="button button-primary" data-copy-line>คัดลอก LINE ID เพื่อตรวจเครดิต</button><p class="preview-disclaimer">หน้านี้เป็นต้นแบบ ยังไม่มีการส่งข้อมูล ตรวจสิทธิ์ รับชำระเงิน หรือเปิดคอร์สอัตโนมัติ</p></div>`, trigger);
    }

    function syncCourseExpansion() {
      const lessons = [...main.querySelectorAll('[data-course-lesson]')];
      const button = main.querySelector('[data-course-expand]');
      if (!button || !lessons.length) return;
      const allOpen = lessons.every(lesson => lesson.open);
      button.setAttribute('aria-expanded', String(allOpen));
      button.textContent = allOpen ? 'ย่อรายละเอียดทุกบท' : 'เปิดรายละเอียดทุกบท';
    }

    async function copyLine(button) {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText('@emcthai'); copied = true; } catch { /* Try the selection-based fallback. */ }
      }
      if (!copied) {
        const field = document.createElement('textarea');
        field.value = '@emcthai';
        field.setAttribute('readonly', '');
        field.setAttribute('aria-label', 'LINE ID สำหรับคัดลอก');
        field.className = 'clipboard-helper';
        (modal?.open ? modal : document.body).append(field);
        field.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        field.remove();
        button?.focus();
      }
      if (copied) {
        notify('คัดลอก @emcthai แล้ว เปิด LINE และค้นหา ID นี้ได้เลย');
        if (button) button.textContent = 'คัดลอกแล้ว: @emcthai';
      } else {
        notify('คัดลอกอัตโนมัติไม่ได้ โปรดคัดลอกหรือพิมพ์ @emcthai ใน LINE');
      }
    }

    const downloadCard = (number, title, text, file, label) => `<article class="resource-card"><span class="resource-number">${number}</span><div class="resource-card-copy"><span class="resource-type">PDF · ชุดเริ่มต้น MANTRALO</span><h3>${title}</h3><p>${text}</p></div><a class="button button-secondary button-small" href="assets/${file}" download>${label}</a></article>`;
    const draftNote = '<p class="draft-note">ชุดเริ่มต้น MANTRALO เรียบเรียงจากเนื้อหาเดิม พร้อมใช้ทดลองฝึกในเครื่อง ยังไม่เผยแพร่</p>';

    function startPage() {
      return `<section class="page-shell route-page start-page"><div class="container">
        <div class="page-intro"><span class="eyebrow">เริ่มจากเวลาสั้น ๆ ของคุณ</span><h1>พื้นที่เล็ก ๆ<br><span class="text-violet">สำหรับ 3 นาทีนี้</span></h1><p>ไม่มีคะแนนและไม่ต้องทำให้สมบูรณ์แบบ เพียงกลับมารับรู้ตัวเองทีละช่วง ผ่านคำแนะนำบนหน้าจอ</p></div>
        <section class="practice-overview" aria-labelledby="practice-overview-heading"><h2 id="practice-overview-heading">ก่อนเริ่ม ลองอ่านทั้ง 3 ช่วงไว้สักนิด</h2><p>ช่วงละ 1 นาที อ่านตามหน้าจอได้ในจังหวะของคุณ กิจกรรมนี้ไม่มีเสียงแจ้งเปลี่ยนช่วง หากพักสายตา กลับมาดูคำแนะนำได้เมื่อพร้อม</p><ol>${phases.map((phase, index) => `<li><span class="practice-overview-number">0${index + 1}</span><div><h3>${phase.title}</h3><p>${phase.overview}</p></div></li>`).join('')}</ol></section>
        <div class="practice-layout"><section class="practice-card" aria-labelledby="practice-heading"><div class="practice-card-heading"><span class="pill">ฝึกตามข้อความ · ไม่มีเสียงบันทึก</span><span class="practice-length">3 ช่วง ช่วงละ 1 นาที</span></div><div class="timer-ring" id="timer-ring" style="--progress:0"><div class="timer-center"><span class="timer-caption">เวลาที่เหลือ</span><div id="practice-timer" class="timer-digits" role="timer" aria-live="off" aria-label="เวลาที่เหลือ 3 นาที">03:00</div><span id="timer-phase-label">พร้อมเมื่อคุณพร้อม</span></div></div><h2 id="practice-heading">ตั้งหลักกับร่างกาย</h2><p id="practice-instruction" class="practice-instruction">${phases[0].instruction}</p><div class="practice-controls"><button class="button button-primary" type="button" data-timer="start">เริ่มฝึก 3 นาที</button><button class="button button-secondary" type="button" data-timer="pause" disabled>พักชั่วคราว</button><button class="text-button" type="button" data-timer="reset">เริ่มเวลาใหม่</button></div><p id="practice-status" class="practice-status" role="status" aria-live="polite" aria-atomic="true">เลือกเวลาที่สะดวก แล้วเริ่มได้เลย</p></section><aside class="practice-sidebar"><span class="eyebrow">ค่อย ๆ ไปทีละช่วง</span><ol class="phase-list">${phases.map((phase, index) => `<li data-phase="${index}"${index === 0 ? ' class="is-active" aria-current="step"' : ''}><span class="phase-number">0${index + 1}</span><div><span>นาทีที่ ${index + 1}</span><h3>${phase.title}</h3></div></li>`).join('')}</ol><div class="practice-reminder"><h3>ใช้จังหวะของตัวเอง</h3><p>หายใจตามธรรมชาติ ไม่ต้องกลั้นหรือบังคับลมหายใจ คุณพักหรือหยุดการฝึกได้ทุกเมื่อ</p><p>เมื่อสลับแท็บหรือแอป เวลาจะพักไว้ กลับมาแล้วกดฝึกต่อได้ หากไปหน้าอื่นในเว็บหรือรีโหลด จะเริ่มเวลาใหม่</p></div></aside></div>
        <section class="practice-after" aria-labelledby="after-heading"><div><span class="eyebrow">หลังฝึก · ใช้เวลาอีกนิด</span><h2 id="after-heading">สังเกต โดยไม่ต้องให้คะแนน</h2><p class="muted">ติ๊กสิ่งที่คุณได้ลองทำ หรือใช้สมุดบันทึกจดความรู้สึกสั้น ๆ</p><fieldset class="practice-checklist" aria-describedby="practice-check-note"><legend class="visually-hidden">สิ่งที่ได้ลองทำในการฝึกวันนี้</legend><label><input type="checkbox" data-practice-check><span>ฉันให้เวลาตัวเองหยุดพัก</span></label><label><input type="checkbox" data-practice-check><span>ฉันสังเกตลมหายใจตามธรรมชาติ</span></label><label><input type="checkbox" data-practice-check><span>ฉันเลือกสิ่งเล็ก ๆ ที่จะทำต่อ</span></label></fieldset><p id="checklist-count" class="checklist-count" role="status">เลือกแล้ว 0 จาก 3 ข้อ</p><p id="practice-check-note" class="practice-check-note">เครื่องหมายที่เลือกอยู่เฉพาะหน้านี้ เมื่อเปลี่ยนหน้าหรือรีโหลดจะหายไป หากอยากเก็บไว้ ใช้สมุดบันทึกที่ดาวน์โหลดได้</p></div><div class="practice-downloads">${downloadCard('01', 'คู่มือเริ่มฝึก', 'เก็บคำแนะนำไว้กลับมาอ่านในวันที่อยากเริ่มใหม่', 'free-kit/free-guide.pdf', 'ดาวน์โหลดคู่มือเริ่มต้น')}${downloadCard('02', 'เช็กลิสต์การฝึก', 'พื้นที่เช็กอินกับการฝึกในจังหวะที่คุณเลือก', 'free-kit/checklist.pdf', 'ดาวน์โหลดเช็กลิสต์')}${downloadCard('03', 'สมุดบันทึก', 'จดสิ่งที่สังเกตและสิ่งที่อยากทำต่อในแต่ละวัน', 'free-kit/journal.pdf', 'ดาวน์โหลดสมุดบันทึก')}${draftNote}</div></section>
        <section class="page-next practice-next" aria-labelledby="practice-next-heading"><div><span class="eyebrow">เลือกต่อในจังหวะของคุณ</span><h2 id="practice-next-heading">มีคู่มือไว้กลับมาฝึกในวันถัดไป</h2><p>เก็บชุดเริ่มต้นฟรีไว้ใช้ก่อนก็ได้ เมื่ออยากรู้จักจักระมากขึ้น ค่อยเลือกอ่านหนังสือหรือดูรายละเอียดคอร์ส</p></div><div class="practice-next-links"><a class="button button-primary" href="#/free-kit">รับชุดเริ่มต้นฟรี</a><a class="button button-secondary" href="#/book">ดูหนังสือ ${baht(prices.book)} บาท</a><a class="button button-secondary" href="#/course">ดูคอร์ส 12 บทเรียน</a></div></section>
      </div></section>`;
    }

    function bookPage() {
      return window.MANTRALO_BOOK.render(prices, baht);
    }

    function coursePage() {
      return window.MANTRALO_COURSE.render(prices, baht);
    }

    function resultPage() {
      const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
      return window.MANTRALO_RESULT.render({
        chakra: params.has('chakra') ? params.get('chakra') : 2,
        outcome: params.has('outcome') ? params.get('outcome') : 'unbalance',
        preview: true,
        links: { book: '#/book', course: '#/course', guide: '#/free-kit', quiz: 'https://chakra.emcthai.com/7-chakras-testing' }
      });
    }

    function libraryPage() {
      return window.MANTRALO_LIBRARY.render({ downloadCard, draftNote });
    }

    function stopPractice() {
      window.clearInterval(practiceInterval);
      practiceInterval = null;
      practice = { status: 'idle', remaining: 180, deadline: 0, phase: 0 };
    }

    function updatePractice(announce) {
      if (activeRoute !== '/start') return;
      const remaining = Math.max(0, practice.remaining);
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const phase = Math.min(2, Math.floor((180 - remaining) / 60));
      const complete = practice.status === 'complete';
      const timer = document.getElementById('practice-timer');
      if (!timer) return;
      timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      timer.setAttribute('aria-label', `เวลาที่เหลือ ${minutes} นาที ${seconds} วินาที`);
      document.getElementById('timer-ring').style.setProperty('--progress', String((180 - remaining) / 180));
      document.getElementById('timer-phase-label').textContent = complete ? 'ครบ 3 นาทีแล้ว' : practice.status === 'idle' ? 'พร้อมเมื่อคุณพร้อม' : `ช่วงที่ ${phase + 1} จาก 3`;
      document.getElementById('practice-heading').textContent = complete ? 'ขอบคุณที่ให้เวลากับตัวเอง' : phases[phase].title;
      document.getElementById('practice-instruction').textContent = complete ? 'ค่อย ๆ ขยับร่างกายตามสบาย ลองสังเกตความรู้สึกโดยไม่ต้องคาดหวังผลลัพธ์ แล้วเลือกสิ่งเล็ก ๆ ที่จะทำต่อ' : phases[phase].instruction;
      main.querySelectorAll('[data-phase]').forEach(item => {
        const index = Number(item.dataset.phase);
        item.classList.toggle('is-active', !complete && index === phase);
        item.classList.toggle('is-complete', complete || index < phase);
        if (!complete && index === phase) item.setAttribute('aria-current', 'step');
        else item.removeAttribute('aria-current');
      });
      const start = main.querySelector('[data-timer="start"]');
      const pause = main.querySelector('[data-timer="pause"]');
      start.disabled = practice.status === 'running';
      start.textContent = complete ? 'เริ่มรอบใหม่' : practice.status === 'paused' ? 'ฝึกต่อ' : 'เริ่มฝึก 3 นาที';
      pause.disabled = practice.status !== 'running';
      if (announce || phase !== practice.phase) {
        const phaseAnnouncement = `เริ่มช่วงที่ ${phase + 1}: ${phases[phase].title} ${phases[phase].instruction}`;
        document.getElementById('practice-status').textContent = announce || phaseAnnouncement;
      }
      practice.phase = phase;
    }

    function tickPractice() {
      practice.remaining = Math.max(0, Math.ceil((practice.deadline - performance.now()) / 1000));
      if (practice.remaining === 0) {
        window.clearInterval(practiceInterval);
        practiceInterval = null;
        practice.status = 'complete';
        updatePractice('ฝึกครบ 3 นาทีแล้ว ค่อย ๆ กลับมารับรู้สิ่งรอบตัวตามสบาย');
      } else updatePractice();
    }

    function timerAction(action, pauseMessage) {
      if (activeRoute !== '/start') return;
      if (action === 'reset') {
        stopPractice();
        updatePractice('เริ่มเวลาใหม่แล้ว พร้อมเมื่อคุณพร้อม');
      } else if (action === 'pause' && practice.status === 'running') {
        practice.remaining = Math.max(0, Math.ceil((practice.deadline - performance.now()) / 1000));
        window.clearInterval(practiceInterval);
        practiceInterval = null;
        practice.status = practice.remaining === 0 ? 'complete' : 'paused';
        updatePractice(practice.remaining === 0 ? 'ฝึกครบ 3 นาทีแล้ว' : pauseMessage || 'พักเวลาไว้แล้ว เลือกฝึกต่อได้เมื่อพร้อม');
      } else if (action === 'start' && practice.status !== 'running') {
        if (practice.status === 'complete') stopPractice();
        practice.status = 'running';
        practice.deadline = performance.now() + practice.remaining * 1000;
        updatePractice(`กำลังฝึกช่วงที่ ${practice.phase + 1}: ${phases[practice.phase].title}`);
        practiceInterval = window.setInterval(tickPractice, 250);
      }
    }

    function updateBookFormat(format) {
      if (activeRoute !== '/book' || !['paper', 'digital'].includes(format)) return;
      selectedFormat = format;
      const digital = format === 'digital';
      main.querySelectorAll('[data-format]').forEach(button => {
        const selected = button.dataset.format === format;
        button.setAttribute('aria-pressed', String(selected));
        button.classList.toggle('is-active', selected);
      });
      document.getElementById('book-price-value').innerHTML = `${baht(digital ? prices.digital : prices.book)} <small>บาท</small>`;
      document.getElementById('book-price-label').textContent = digital ? 'ราคาเสนอ รอยืนยัน' : 'รวมหนังสือดิจิทัลฉบับเต็ม';
      document.getElementById('book-format-copy').textContent = digital ? 'ชุดเริ่มต้นดิจิทัล มี หนังสือดิจิทัล 7 วัน 7 จักระ ฉบับเต็ม พร้อมเครื่องมือช่วยฝึก ไม่มีเล่มพิมพ์ รายละเอียดการจำหน่ายและส่งมอบรอยืนยัน' : 'หนังสือ 7 วัน 7 จักระ New Edition 1 เล่ม พิมพ์ 4 สี พร้อม หนังสือดิจิทัล ฉบับเต็ม';
      document.getElementById('book-format-note').textContent = digital ? 'รูปแบบดิจิทัลไม่มีค่าจัดส่ง คู่มือและ Checklist เริ่มต้นเปิดให้ทุกคนดาวน์โหลดฟรี' : 'ค่าส่ง 59 บาท รวม 349 บาท ในประเทศพื้นที่ปกติ แจ้งกำหนดส่งก่อนชำระ';
      document.getElementById('book-order-label').textContent = digital ? 'ดูสรุป ชุดเริ่มต้นดิจิทัล' : `เลือกชุดหนังสือ ${baht(prices.book)} บาท`;
      document.getElementById('bp-mobile-price').innerHTML = `${baht(digital ? prices.digital : prices.book)} <small>บาท</small>`;
      document.getElementById('bp-mobile-format').textContent = digital ? 'ดิจิทัลอย่างเดียว · ราคาเสนอ' : 'เล่มจริง + หนังสือดิจิทัล · ค่าส่ง 59 บาท';
      document.getElementById('bp-mobile-button').textContent = digital ? 'ดูชุดดิจิทัล' : 'เลือกชุดหนังสือ';
    }

    function normalizeRoute() {
      const value = window.location.hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/';
      return value.startsWith('/') ? value : '/';
    }

    function renderRoute(initial = false) {
      const nextRoute = normalizeRoute();
      const nextRouteKey = ['/result', '/library', '/ebooks', '/next-step'].includes(nextRoute) ? window.location.hash : nextRoute;
      if (!initial && nextRouteKey === activeRouteKey) return;
      resultCleanup?.();
      resultCleanup = null;
      libraryCleanup?.();
      libraryCleanup = null;
      leadCleanup?.();
      leadCleanup = null;
      freeKitCleanup?.();
      freeKitCleanup = null;
      stopPractice();
      setMenu(false);
      if (modal?.open) modal.close();
      activeRoute = nextRoute;
      activeRouteKey = nextRouteKey;
      selectedFormat = 'paper';
      const routes = {
        '/start': { render: startPage, title: 'เริ่มฝึก 3 นาที' },
        '/free-kit': { render: () => window.MANTRALO_FREE_KIT.render(), title: 'ชุดเริ่มต้นฟรี คู่มือ Checklist และบันทึก 7 วัน' },
        '/lesson-sample': { render: () => window.MANTRALO_FREE_KIT.renderSample(), title: 'ตัวอย่างเอกสารจากคอร์สจักระจริง' },
        '/book': { render: bookPage, title: 'หนังสือและ ชุดเริ่มต้นดิจิทัล' },
        '/course': { render: coursePage, title: 'คอร์สจักระ 12 บทเรียน' },
        '/result': { render: resultPage, title: 'ผลสำรวจจักระ' },
        '/library': { render: libraryPage, title: 'คลังความรู้ วิดีโอ หนังสือดิจิทัล และคู่มือ' },
        '/ebooks': { render: () => window.MANTRALO_EBOOK_SALES.render({ selectedOffer:new URLSearchParams(window.location.hash.split('?')[1] || '').get('offer') }), title: 'หนังสือดิจิทัล 8 เล่มและแพ็กเกจ' },
        '/discover': { render: () => window.MANTRALO_LEAD.render(), title: 'แบบสำรวจ คลิป และกิจกรรมฟรี' },
        '/member': { render: () => window.MANTRALO_MEMBER_SHOP.renderMember(), title: 'พื้นที่สมาชิก · ตัวอย่าง' },
        '/shop': { render: () => window.MANTRALO_MEMBER_SHOP.renderShop(), title: 'สิ่งของสำหรับมุมฝึกของคุณ' },
        '/next-step': { render: () => window.MANTRALO_MEMBER_SHOP.renderNext({ from:new URLSearchParams(window.location.hash.split('?')[1] || '').get('from') }), title: 'ก้าวถัดไป · ตัวอย่างเส้นทางหลังซื้อ' }
      };
      if (nextRoute === '/') {
        if (!initial) main.innerHTML = homeHTML;
        main.style.setProperty('--active-chakra', '#e74d5c');
        document.title = homeTitle;
      } else if (routes[nextRoute]) {
        main.innerHTML = routes[nextRoute].render();
        document.title = `${routes[nextRoute].title} | MANTRALO`;
      } else {
        main.innerHTML = '<section class="page-shell route-page"><div class="container page-intro"><span class="eyebrow">MANTRALO</span><h1>ไม่พบหน้าที่คุณเปิด</h1><p>กลับไปเริ่มต้น หรือเลือกเนื้อหาจากเมนูด้านบนได้เลย</p><a href="#/" class="button button-primary">กลับหน้าหลัก</a></div></section>';
        document.title = 'ไม่พบหน้า | MANTRALO';
      }
      main.dataset.route = nextRoute;
      if (nextRoute === '/result') resultCleanup = window.MANTRALO_RESULT.mount(main);
      if (nextRoute === '/library') libraryCleanup = window.MANTRALO_LIBRARY.mount(main);
      if (nextRoute === '/discover') leadCleanup = window.MANTRALO_LEAD.mount(main);
      if (nextRoute === '/free-kit') freeKitCleanup = window.MANTRALO_FREE_KIT.mount(main);
      document.querySelectorAll('a[href^="#/"]').forEach(link => {
        const route = link.getAttribute('href').slice(1).split('?')[0].replace(/\/+$/, '') || '/';
        const current = route === nextRoute || (nav?.contains(link) && route === '/library' && nextRoute === '/ebooks');
        if (current) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
        if (nav?.contains(link)) link.classList.toggle('is-active', current);
      });
      if (!initial) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
      if (nextRoute === '/library') {
        const sectionIds = { free: 'free-library-heading', videos: 'video-library-heading', ebooks: 'ml-catalog-title' };
        const requestedSection = new URLSearchParams(window.location.hash.split('?')[1] || '').get('section');
        const sectionId = sectionIds[requestedSection];
        if (sectionId) {
        requestAnimationFrame(() => {
          const section = document.getElementById(sectionId);
          section?.setAttribute('tabindex', '-1');
          section?.scrollIntoView({ block: 'start', behavior: 'instant' });
          section?.focus({ preventScroll: true });
        });
        }
      }
      if (nextRoute === '/ebooks') {
        const id = new URLSearchParams(window.location.hash.split('?')[1] || '').get('offer');
        if (window.MANTRALO_EBOOK_OFFERS.get(id)) requestAnimationFrame(() => {
          const card = [...main.querySelectorAll('[data-offer-card]')].find(item => item.dataset.offerCard === id);
          card?.setAttribute('tabindex','-1');
          card?.scrollIntoView({ block:'start', behavior:'instant' });
          card?.focus({ preventScroll:true });
        });
      }
    }

    document.addEventListener('click', event => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('button, a');
      if (!button) return;
      if (button.matches('a[href="#main"]')) { event.preventDefault(); main.focus({ preventScroll: false }); return; }
      if (button === menuToggle) { setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'); return; }
      if (button.matches('[data-close]')) { modal?.close(); return; }
      if (button.matches('[data-copy-line]')) { event.preventDefault(); copyLine(button); return; }
      if (button.matches('[data-ebook-order]')) {
        event.preventDefault();
        openModal(window.MANTRALO_EBOOK_OFFERS.renderSummary(button.dataset.ebookOrder), button);
        return;
      }
      if (button.matches('[data-ebook-details]')) {
        event.preventDefault();
        const markup = window.MANTRALO_LIBRARY.renderDetails(button.dataset.ebookDetails);
        if (markup) openModal(markup, button);
        return;
      }
      if (button.matches('[data-course-credit]')) { event.preventDefault(); courseCreditModal(button); return; }
      if (button.matches('[data-course-scroll]')) {
        const section = document.getElementById(button.dataset.courseScroll);
        if (section && main.contains(section)) {
          section.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
          section.focus({ preventScroll: true });
        }
        return;
      }
      if (button.matches('[data-course-expand]')) {
        const lessons = [...main.querySelectorAll('[data-course-lesson]')];
        const open = !lessons.every(lesson => lesson.open);
        lessons.forEach(lesson => { lesson.open = open; });
        syncCourseExpansion();
        return;
      }
      if (button.matches('[data-contact]')) { event.preventDefault(); contactModal(button); return; }
      if (button.matches('[data-order]')) {
        event.preventDefault();
        const kind = button.dataset.order === 'selected-book' ? selectedFormat === 'digital' ? 'digital' : 'book' : button.dataset.order;
        if (['book', 'digital', 'course'].includes(kind)) orderModal(kind, button);
        return;
      }
      if (button.matches('[data-format]')) { updateBookFormat(button.dataset.format); return; }
      if (button.matches('[data-timer]')) { timerAction(button.dataset.timer); return; }
      if (button.matches('[data-chakra]')) {
        const index = Number(button.dataset.chakra);
        if (!Number.isInteger(index) || !chakras[index]) return;
        const chakra = chakras[index];
        const color = ['#e74d5c', '#f58a35', '#e9b92d', '#3caa7a', '#36b3d8', '#6560bf', '#a169d1'][index];
        main.style.setProperty('--active-chakra', color);
        main.querySelector('.chakra-detail')?.style.setProperty('--active-chakra', color);
        for (const [id, value] of [['chakra-name', chakra.name], ['chakra-description', chakra.description], ['chakra-mantra', chakra.mantra]]) {
          const target = document.getElementById(id);
          if (target) target.textContent = value;
        }
        main.querySelectorAll('[data-chakra]').forEach(item => {
          const selected = Number(item.dataset.chakra) === index;
          item.setAttribute('aria-pressed', String(selected));
          item.classList.toggle('is-active', selected);
          item.classList.toggle('active', selected);
        });
        return;
      }
      if (button.matches('[data-interest]')) {
        const value = interests[button.dataset.interest];
        const copy = document.getElementById('interest-copy');
        if (!value || !copy) return;
        copy.textContent = value;
        main.querySelectorAll('[data-interest]').forEach(item => {
          const selected = item === button;
          item.setAttribute('aria-pressed', String(selected));
          item.classList.toggle('is-active', selected);
          item.classList.toggle('active', selected);
        });
      }
      if (button.matches('a[href^="#/"]')) setMenu(false);
    });

    main.addEventListener('toggle', event => {
      if (event.target instanceof Element && event.target.matches('[data-course-lesson]')) syncCourseExpansion();
    }, true);

    document.addEventListener('change', event => {
      if (!(event.target instanceof Element) || !event.target.matches('[data-practice-check]')) return;
      const count = main.querySelectorAll('[data-practice-check]:checked').length;
      const status = document.getElementById('checklist-count');
      if (status) status.textContent = `เลือกแล้ว ${count} จาก 3 ข้อ`;
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuToggle.focus();
      }
    });

    modal?.addEventListener('close', () => {
      if (modalTrigger instanceof HTMLElement && modalTrigger.isConnected) modalTrigger.focus({ preventScroll: true });
      modalTrigger = null;
    });
    modal?.addEventListener('click', event => {
      if (event.target !== modal) return;
      const box = modal.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) modal.close();
    });
    window.addEventListener('hashchange', () => renderRoute());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && activeRoute === '/start' && practice.status === 'running') {
        timerAction('pause', 'พักเวลาไว้ให้แล้ว เมื่อกลับมาพร้อม เลือกฝึกต่อได้ด้วยตัวเอง');
      }
    });
    window.addEventListener('pagehide', () => { window.clearInterval(practiceInterval); practiceInterval = null; });
    window.addEventListener('pageshow', event => { if (event.persisted && activeRoute === '/start') { stopPractice(); updatePractice('พร้อมเริ่มฝึกใหม่เมื่อคุณพร้อม'); } });
    renderRoute(true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
