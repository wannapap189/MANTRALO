/* Local starter-kit experience. No contacts, messages, payments or rights are created. */
(() => {
  'use strict';
  const mounted = new WeakMap();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rainbow = '<span class="fk-spectrum" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';
  const documents = [
    { id: 'free-guide', title: 'คู่มือเริ่มต้น', subtitle: 'เริ่มรู้จักจักระ ในจังหวะของคุณ', use: 'เปิดอ่านแนวทางสั้น ๆ เลือกกิจกรรมแรกที่อยากลอง แล้วเก็บคู่มือไว้กลับมาอ่านต่อได้', pages: 5, color: 'purple' },
    { id: 'checklist', title: 'Checklist การฝึก', subtitle: 'เช็กอินก่อนและหลังฝึก', use: 'มีรายการให้เช็กก่อนและหลังฝึก ช่วยเตรียมตัวและมองเห็นสิ่งที่ได้ลองในแต่ละครั้ง', pages: 1, color: 'peach' },
    { id: 'journal', title: 'บันทึก 7 วัน', subtitle: '7 วัน ให้เวลากับตัวเอง', use: 'เก็บความรู้สึกและสิ่งที่ได้ลองไว้วันละนิด ใช้คำถามในบันทึกเป็นจุดเริ่มเมื่ออยากกลับมาให้เวลากับตัวเอง', pages: 4, color: 'mint' }
  ];
  const days = [
    { title: 'กลับมาตั้งหลัก', color: '#ce3f59', text: 'รับรู้เท้าหรือส่วนที่สัมผัสพื้น แล้วเลือกสิ่งเล็ก ๆ ที่ช่วยจัดวันของคุณให้เป็นระเบียบขึ้น', question: 'วันนี้ฉันอยากเริ่มดูแลเรื่องใดก่อน?' },
    { title: 'ให้พื้นที่กับความรู้สึก', color: '#c87827', text: 'ลองบอกความรู้สึกของตัวเองหนึ่งคำ โดยยังไม่ต้องรีบเปลี่ยนหรือตัดสิน', question: 'ตอนนี้ฉันรู้สึกอย่างไร และอยากให้พื้นที่กับอะไร?' },
    { title: 'เลือกก้าวที่ทำได้', color: '#9b7715', text: 'เลือกงานเล็กหนึ่งอย่าง และเขียนว่าจะเริ่มเมื่อไร ใช้เท่าที่เหมาะกับกำลังของวันนี้', question: 'ก้าวเล็กที่สุดที่ฉันเริ่มได้คืออะไร?' },
    { title: 'พูดกับตัวเองอย่างอ่อนโยน', color: '#36825f', text: 'นึกถึงคำที่อยากบอกคนที่คุณห่วงใย แล้วลองใช้คำนั้นกับตัวเอง', question: 'วันนี้ฉันอยากบอกอะไรกับตัวเอง?' },
    { title: 'ฟังและสื่อสารให้ชัด', color: '#267f9d', text: 'เขียนความต้องการของคุณหนึ่งประโยค ด้วยถ้อยคำที่ตรงไปตรงมาและเคารพอีกฝ่าย', question: 'มีสิ่งใดที่ฉันอยากพูดหรืออยากฟังให้ชัดขึ้น?' },
    { title: 'เว้นพื้นที่ให้การทบทวน', color: '#5e57a4', text: 'แยกสิ่งที่เกิดขึ้นจริง ออกจากสิ่งที่คุณกำลังคิดหรือรู้สึก แล้วเลือกคำถามที่อยากรู้เพิ่ม', question: 'อะไรที่ฉันรู้แล้ว และอะไรที่ยังอยากเข้าใจ?' },
    { title: 'เลือกสิ่งที่มีความหมาย', color: '#9553b1', text: 'มองกลับไปตลอดสัปดาห์ แล้วเลือกสิ่งเล็ก ๆ ที่คุณอยากให้มีพื้นที่ในสัปดาห์ถัดไป', question: 'อะไรที่ฉันอยากทำต่อ ในจังหวะของตัวเอง?' }
  ];

  function documentCards() {
    return documents.map(d => `<article class="fk-document fk-${d.color}"><a href="assets/free-kit/${d.id}.pdf" target="_blank" rel="noopener" class="fk-document-preview" aria-label="เปิดดู ${d.title}"><img src="assets/free-kit/${d.id}.png" width="595" height="842" loading="lazy" alt="ตัวอย่างหน้าแรก ${d.subtitle}"></a><div class="fk-document-copy"><span class="fk-tag">PDF · ${d.pages} หน้า</span><h3>${d.title}</h3><p>${d.use}</p><div class="fk-document-actions"><a class="fk-button fk-primary" href="assets/free-kit/${d.id}.pdf" download="MANTRALO-${d.id}.pdf">ดาวน์โหลด${d.title}</a><a class="fk-link" href="assets/free-kit/${d.id}.pdf" target="_blank" rel="noopener">เปิดอ่านก่อน</a></div></div></article>`).join('');
  }

  function offers() {
    return `<section class="fk-next" aria-labelledby="fk-next-heading"><div class="fk-wrap"><div class="fk-section-heading"><p class="fk-eyebrow">เลือกไปต่อ เมื่อพร้อม</p><h2 id="fk-next-heading">อยากอ่านทบทวน หรือเรียนเป็นลำดับ?</h2><p>เลือกเส้นทางที่เหมาะกับคุณ ชุดฟรียังกลับมาใช้ได้เสมอ</p></div><div class="fk-offer-grid"><article class="fk-offer"><span class="fk-tag">อ่านในจังหวะของคุณ</span><h3>หนังสือ 7 วัน 7 จักระ</h3><p>จากช่วงพักสั้น ๆ สู่การอ่านทีละเรื่อง รู้จักจักระและแนวทางฝึกที่ค่อย ๆ เลือกลองได้ในวันของคุณ พร้อม หนังสือดิจิทัล ฉบับเต็มของเล่มเดียวกัน</p><strong class="fk-price">290 <small>บาท</small></strong><p class="fk-small">หนังสือ New Edition 1 เล่ม + หนังสือดิจิทัล 7 วัน 7 จักระ · ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ</p><a class="fk-button fk-primary" href="#/book">ดูหนังสือและสิ่งที่ได้รับ</a></article><article class="fk-offer fk-offer-course"><span class="fk-tag">เรียนจากพื้นฐานทีละบท</span><h3>คอร์สจักระ 12 บทเรียน</h3><p>ค่อย ๆ ต่อความเข้าใจผ่าน 12 บท เริ่มจากพื้นฐานและจักระทั้ง 7 ไปสู่การฝึก สมาธิสี และภาษาสี มีสารบัญและตัวอย่างเอกสารให้ดูก่อนเรียน</p><strong class="fk-price">2,900 <small>บาท</small></strong><p class="fk-small">ราคาคอร์สตามแผน</p><p class="fk-small">ผู้ซื้อหนังสือหรือ ชุดเริ่มต้นดิจิทัล ที่ผ่านการตรวจสิทธิ์ ใช้เครดิตได้สูงสุด 290 บาทหนึ่งครั้ง เมื่อได้เครดิตเต็ม จ่ายเพิ่ม 2,610 บาท</p><a class="fk-button fk-primary" href="#/course">ดูเนื้อหา 12 บทและเงื่อนไขเครดิต</a></article></div></div></section>`;
  }

  function dayPanel(index) {
    const day = days[index];
    return `<span class="fk-day-name" style="--day-color:${day.color}">วันที่ ${index + 1} · ${day.title}</span><h3>${day.question}</h3><p>${day.text}</p><p class="fk-small">ใช้สีเป็นสัญลักษณ์ชวนทบทวนตัวเอง เลือกทำเท่าที่สะดวก และกลับมาเริ่มใหม่ได้ทุกวัน</p><a class="fk-link" href="assets/free-kit/journal.pdf" download="MANTRALO-journal.pdf">เก็บคำตอบไว้ในบันทึก 7 วัน</a>`;
  }

  function render() {
    return `<div class="route-page fk-page" data-free-kit><section class="fk-hero"><div class="fk-wrap fk-hero-grid"><div><p class="fk-eyebrow">MANTRALO · YOUR EVERYDAY PAUSE</p><h1>คู่มือเล็ก ๆ<br><em>สำหรับช่วงพัก</em></h1><p class="fk-lead">ก่อนเริ่มเรื่องถัดไป ลองมีช่วงพักสั้น ๆ ให้ตัวเอง เริ่มรู้จักจักระผ่านการสังเกตความรู้สึก รับรู้ลมหายใจตามธรรมชาติ และเลือกสิ่งเล็ก ๆ ที่อยากให้เวลาต่อ</p><p>คู่มือพาเริ่มทีละนิด Checklist ช่วยเตรียมช่วงเวลาฝึก และบันทึก 7 วันมีพื้นที่ให้จดสิ่งที่สังเกต ไม่ต้องมีพื้นฐาน เลือกใช้ทีละชิ้นในเวลาที่สะดวก</p><div class="fk-actions"><button type="button" class="fk-button fk-primary" data-kit-scroll="fk-downloads">เปิดชุดฝึกฟรีทั้ง 3 ชิ้น</button><a class="fk-link" href="#/lesson-sample">ลองอ่านตัวอย่างจากคอร์สจริง</a></div><p class="fk-small">เปิดอ่านและดาวน์โหลดได้ฟรี โดยไม่ต้องสมัครรับข้อความ</p></div><div class="fk-hero-paper"><span class="fk-paper-label">ชุดเริ่มต้นของคุณ</span><img src="assets/free-kit/free-guide.png" alt="คู่มือเริ่มรู้จักจักระ ในจังหวะของคุณ" width="595" height="842">${rainbow}<span>อ่านนิดหนึ่ง · ลองทำ · จดสิ่งที่พบ</span></div></div></section>
      <section class="fk-wrap fk-section" id="fk-downloads" tabindex="-1" aria-labelledby="fk-downloads-title"><div class="fk-section-heading"><p class="fk-eyebrow">เริ่มใช้ได้วันนี้</p><h2 id="fk-downloads-title">ได้อะไร และใช้แต่ละชิ้นอย่างไร</h2><p>อ่านบนมือถือหรือพิมพ์ไว้จดก็ได้ เริ่มจากชิ้นที่เหมาะกับคุณ</p></div><div class="fk-document-grid">${documentCards()}</div><p class="fk-small fk-kit-note">ชุดแจกฟรีนี้เรียบเรียงจากเนื้อหาเดิมของ EMC และแบบฝึก MANTRALO เป็นเอกสารสำหรับเริ่มต้น แยกจาก หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็มในชุดหนังสือ</p></section>
      <section class="fk-pause"><div class="fk-wrap fk-pause-grid"><div><p class="fk-eyebrow">อ่านแล้ว ลองให้เวลากับตัวเอง</p><h2>เริ่มจาก 3 นาทีที่คุณเลือกได้</h2><p>นั่งในท่าที่สบาย รับรู้ลมหายใจตามธรรมชาติ แล้วเลือกสิ่งเล็ก ๆ ที่จะทำต่อ กิจกรรมบนเว็บมีข้อความนำและตัวจับเวลาให้ลองตาม</p><a class="fk-button fk-primary" href="#/start">เริ่มกิจกรรม 3 นาที</a></div><ol><li><strong>เปิดคู่มือ</strong><span>อ่านแนวทางก่อนเริ่ม ไม่ต้องจำทั้งหมด</span></li><li><strong>ลองทำเท่าที่สะดวก</strong><span>พักหรือหยุดได้โดยไม่ต้องทำให้สมบูรณ์แบบ</span></li><li><strong>จดสิ่งที่สังเกต</strong><span>ใช้ Checklist หรือบันทึกสั้น ๆ ตามที่ชอบ</span></li></ol></div></section>
      <section class="fk-wrap fk-section" aria-labelledby="fk-days-title"><div class="fk-section-heading"><p class="fk-eyebrow">หนึ่งวัน หนึ่งคำถามเล็ก ๆ</p><h2 id="fk-days-title">มีจุดเริ่มต้นให้ครบ 7 วัน</h2><p>เลือกวันเพื่อดูสิ่งที่ชวนลอง ไม่ต้องเร่งหรือเก็บคะแนน</p></div><div class="fk-day-picker" role="group" aria-label="เลือกกิจกรรมรายวัน">${days.map((d, i) => `<button type="button" data-kit-day="${i}" aria-pressed="${i === 0}" aria-controls="fk-day-panel" style="--day-color:${d.color}"><i aria-hidden="true"></i>วันที่ ${i + 1}</button>`).join('')}</div><div class="fk-day-panel" id="fk-day-panel" aria-live="polite">${dayPanel(0)}</div></section>
      <section class="fk-wrap fk-signup-section" aria-labelledby="fk-signup-title"><div><p class="fk-eyebrow">มีคำชวนฝึกให้กลับมาอ่าน</p><h2 id="fk-signup-title">อยากรับคำแนะนำ<br>ต่อเนื่อง 7 วันไหม?</h2><p>แต่ละวันมีสิ่งเล็ก ๆ ให้ลอง พร้อมทางอ่านเพิ่มเติมเมื่อคุณสนใจ คุณเลือกได้ว่าจะรับข้อความต่อหรือใช้ชุดฟรีด้วยตัวเอง</p><p class="fk-preview-note">แบบฟอร์มทดลองในเครื่อง: ยังไม่บันทึกรายชื่อหรือส่งอีเมล ข้อมูลที่กรอกจะถูกล้างเมื่อออกจากหน้า</p></div><form class="fk-form" data-kit-form><label>ชื่อที่อยากให้เราเรียก <span>(ไม่บังคับ)</span><input name="firstName" autocomplete="off" maxlength="60" placeholder="ชื่อของคุณ"></label><label>อีเมลสำหรับรับคู่มือ<input name="email" type="email" autocomplete="off" required maxlength="254" placeholder="you@example.com" aria-describedby="fk-form-hint"></label><label class="fk-consent"><input name="followup" type="checkbox"><span>ฉันต้องการรับคำแนะนำและข้อมูลหนังสือหรือคอร์สจาก MANTRALO ต่อเนื่อง 7 วัน โดยสามารถยกเลิกได้</span></label><p id="fk-form-hint" class="fk-small">ช่องรับข้อความเป็นทางเลือก ไม่ติ๊กก็เปิดชุดฟรีได้</p><button class="fk-button fk-primary" type="submit">ทดลองรับชุดเริ่มต้นฟรี</button><div class="fk-form-result" data-kit-result role="status" tabindex="-1" hidden></div></form></section>
      <section class="fk-wrap fk-sample-bridge"><div>${rainbow}<h2>อยากเห็นเนื้อหาจากคอร์สก่อนเลือกเรียน?</h2><p>ลองอ่านตัวอย่างเอกสารภาษาสีจากบทที่ 12 แล้วดูว่าเนื้อหาและแนวทางการเรียนตรงกับความสนใจของคุณไหม</p></div><a class="fk-button fk-secondary" href="#/lesson-sample">เปิดตัวอย่างบทเรียนจริง</a></section>
      ${offers()}<section class="fk-wrap fk-faq fk-section"><h2>ก่อนเริ่ม มีอะไรที่ควรรู้?</h2><details><summary>ยังไม่รู้จักจักระ เริ่มได้ไหม?</summary><p>เริ่มจากอ่านคู่มือและลองกิจกรรมสั้น ๆ ได้เลย เราใช้แนวคิดจักระและสีเป็นกรอบชวนสำรวจตัวเอง ไม่มีคะแนนหรือผลตัดสินตัวคุณ</p></details><details><summary>ต้องซื้อหนังสือหรือคอร์สเพื่อใช้ชุดฟรีไหม?</summary><p>ชุดเริ่มต้นทั้ง 3 ชิ้นดาวน์โหลดได้ฟรี หนังสือและคอร์สเป็นทางเลือกสำหรับคนที่อยากอ่านหรือเรียนต่อ</p></details><details><summary>ต้องมีอุปกรณ์หรือทำท่าพิเศษไหม?</summary><p>กิจกรรมในชุดนี้เริ่มจากท่านั่งที่สบาย กระดาษหรือบันทึกในมือถือ และการรับรู้ลมหายใจตามธรรมชาติ คุณไม่จำเป็นต้องซื้ออุปกรณ์เพิ่ม</p></details><p class="fk-small">ต้นแบบฉบับตรวจเนื้อหาในเครื่อง · แนวทางสำรวจตัวเองตามความเชื่อเรื่องจักระ ไม่ใช้วินิจฉัยหรือรักษาสุขภาพ</p></section></div>`;
  }

  function renderSample() {
    const sample = window.MANTRALO_COURSE_SAMPLE;
    if (!sample) return '<section class="fk-wrap fk-section"><h1>กำลังเตรียมตัวอย่างบทเรียน</h1><a href="#/free-kit">เปิดชุดเริ่มต้นฟรี</a></section>';
    return `<div class="route-page fk-page fk-sample-page"><section class="fk-hero"><div class="fk-wrap"><p class="fk-eyebrow">ลองอ่านก่อนเลือกเรียน</p><h1>เห็นเนื้อหาจริง<br><em>แล้วค่อยเลือกเส้นทางของคุณ</em></h1><p class="fk-lead">ตัวอย่างเอกสารจากบทที่ ${esc(sample.lessonNumber)} · ${esc(sample.lessonTitle)} จากคอร์ส EMC เดิม ที่นำมาใช้ในเส้นทาง MANTRALO 12 บทเรียน</p><div class="fk-sample-context"><strong>${esc(sample.title)}</strong><p>คัดมา ${sample.pages.length} หน้าจากเอกสารเดิม เพื่อให้เห็นรูปแบบเนื้อหาเรื่องภาษาสีและการตีความตามแนวคิดจักระ</p><p class="fk-small">แสดงหน้าต้นฉบับ ${sample.originalPages.map(esc).join(' และ ')} · คงข้อความและรูปแบบต้นฉบับไว้</p></div><div class="fk-actions"><a class="fk-button fk-primary" href="${esc(sample.pdf)}" download="MANTRALO-course-sample.pdf">ดาวน์โหลดตัวอย่าง ${sample.pages.length} หน้า</a><a class="fk-link" href="#/course">ดูสารบัญคอร์สทั้ง 12 บท</a></div></div></section>
      <section class="fk-wrap fk-section"><div class="fk-section-heading"><p class="fk-eyebrow">ก่อนเปิดอ่าน</p><h2>ลองดูว่าเรื่องนี้ชวนคุณสนใจอะไร</h2><p>อ่านชื่อสีและความหมายที่เอกสารเชื่อมโยงไว้ แล้วเลือกหนึ่งคำที่อยากนำมาทบทวนกับตัวเอง เนื้อหานี้เป็นการตีความเชิงความเชื่อ ไม่ได้ใช้ตัดสินบุคลิกหรือสุขภาพของผู้อ่าน</p></div><div class="fk-sample-pages">${sample.pages.map((p, i) => `<article><h3>${esc(p.label || `หน้าตัวอย่าง ${i + 1}`)}</h3><a href="${esc(p.src)}" target="_blank" rel="noopener" aria-label="เปิดภาพขนาดเต็ม ${esc(p.label || '')}"><img src="${esc(p.src)}" loading="lazy" width="595" height="842" alt="${esc(p.label || sample.title)} จากเอกสารประกอบคอร์ส EMC"></a>${p.text ? `<details><summary>อ่านข้อความในหน้านี้</summary><div class="fk-source-text">${esc(p.text)}</div></details>` : ''}</article>`).join('')}</div><div class="fk-sample-context"><strong>หลังอ่าน ลองจดเพียงหนึ่งประโยค</strong><p>“จากสิ่งที่ได้อ่าน วันนี้ฉันอยากให้เวลากับเรื่องใด?” คำถามนี้เป็นกิจกรรมเพิ่มเติมของ MANTRALO สำหรับใช้คู่กับตัวอย่างเอกสาร</p><a class="fk-link" href="#/free-kit">รับบันทึก 7 วันและชุดเริ่มต้นฟรี</a></div></section>
      ${offers()}<section class="fk-wrap fk-section"><h2>เริ่มจากเรื่องเล็ก ๆ ก็ได้</h2><p>หากยังอยากสำรวจก่อน เลือกดูคลิปความรู้หรือใช้ชุดฟรี แล้วกลับมาดูรายละเอียดคอร์สเมื่อพร้อม</p><div class="fk-actions"><a class="fk-button fk-secondary" href="#/library?section=videos">เลือกคลิปความรู้ฟรี</a><a class="fk-link" href="#/free-kit">กลับไปชุดเริ่มต้นฟรี</a></div></section></div>`;
  }

  function mount(root) {
    mounted.get(root)?.();
    const section = root.querySelector('[data-free-kit]');
    if (!section) return () => {};
    const controller = new AbortController();
    const form = section.querySelector('[data-kit-form]');
    const focusTo = id => { const el = section.querySelector('#' + id); el?.scrollIntoView({ block: 'start', behavior: 'auto' }); el?.focus({ preventScroll: true }); };
    section.addEventListener('click', e => {
      const button = e.target.closest('button');
      if (!button || !section.contains(button)) return;
      if (button.dataset.kitScroll) focusTo(button.dataset.kitScroll);
      if (button.hasAttribute('data-kit-day')) {
        const day = Number(button.dataset.kitDay);
        if (!Number.isInteger(day) || day < 0 || day >= days.length) return;
        section.querySelectorAll('[data-kit-day]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
        section.querySelector('#fk-day-panel').innerHTML = dayPanel(day);
      }
    }, { signal: controller.signal });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const followup = form.elements.followup.checked;
      const name = form.elements.firstName.value.trim();
      const result = section.querySelector('[data-kit-result]');
      result.innerHTML = `<strong>${name ? `คุณ${esc(name)} ` : ''}เปิดชุดเริ่มต้นได้เลยค่ะ</strong><p>${followup ? 'ในระบบจริง คุณจะได้รับคำแนะนำต่อเนื่อง 7 วันตามที่เลือก' : 'คุณเลือกใช้ชุดฟรีด้วยตัวเอง โดยไม่สมัครรับข้อความต่อเนื่อง'}</p><p>นี่คือการทดลองในเครื่อง ยังไม่ได้บันทึกข้อมูลหรือส่งอีเมล</p><button type="button" class="fk-button fk-secondary" data-kit-scroll="fk-downloads">เปิดไฟล์ฟรีทั้ง 3 ชิ้น</button>`;
      result.hidden = false;
      form.reset();
      result.focus();
    }, { signal: controller.signal });
    const cleanup = () => { controller.abort(); form.reset(); mounted.delete(root); };
    mounted.set(root, cleanup);
    return cleanup;
  }
  window.MANTRALO_FREE_KIT = Object.freeze({ render, renderSample, mount });
})();
