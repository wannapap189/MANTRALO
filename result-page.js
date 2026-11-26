/* Presentation only. Existing Funnel owns quiz scoring, contact data and access rights. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = (value, fallback = '') => {
    if (typeof value !== 'string' || !value.trim()) return fallback;
    try { const url = new URL(value, 'https://preview.invalid/'); return ['http:', 'https:'].includes(url.protocol) ? value : fallback; } catch { return fallback; }
  };
  const mounted = new WeakMap();
  function render(options = {}) {
    const chakras = window.MANTRALO_RESULT_CONTENT?.chakras || [];
    const chakra = chakras.find(item => item.id === Number(options.chakra));
    if (!chakra || !['balance','unbalance'].includes(options.outcome)) {
      return '<section class="mr-page mr-empty"><h1>ยังไม่มีผลสำรวจให้แสดง</h1><p>กลับไปทำแบบสำรวจในระบบเดิม เพื่อรับผลที่ตรงกับคำตอบของคุณ</p><a class="mr-button mr-primary" href="https://chakra.emcthai.com/7-chakras-testing">เปิดแบบสำรวจจักระ</a></section>';
    }
    const outcome = chakra.outcomes[options.outcome];
    const links = { book: '#/book', course: '#/course', guide: '#/library', quiz: 'https://chakra.emcthai.com/7-chakras-testing', ...options.links };
    const href = key => escape(safeUrl(links[key], key === 'quiz' ? 'https://chakra.emcthai.com/7-chakras-testing' : '#/'));
    const assetBase = safeUrl(options.assetBase || 'assets/', 'assets/').replace(/\/?$/, '/');
    const preview = options.preview === true;
    const videoUrl = safeUrl(options.videoUrl);
    const color = /^#[0-9a-f]{6}$/i.test(chakra.color) ? chakra.color : '#7c3aed';
    const soft = /^#[0-9a-f]{6}$/i.test(chakra.soft) ? chakra.soft : '#f3e8ff';
    const e = escape;
    return `<article class="mr-page" data-result-chakra="${chakra.id}" data-result-outcome="${e(options.outcome)}" style="--mr-accent:${color};--mr-soft:${soft}">
      ${preview ? `<aside class="mr-preview" aria-label="เลือกตัวอย่างสำหรับตรวจงาน"><div class="mr-wrap mr-preview-inner"><span><b>ตัวอย่างหน้าผล</b> สำหรับตรวจแบบ · ไม่ได้คำนวณผลทดสอบ</span><div><label>จักระ <select data-result-preview-chakra aria-label="เลือกจักระตัวอย่าง">${chakras.map(c => `<option value="${c.id}" ${c.id === chakra.id ? 'selected' : ''}>${c.id} · ${e(c.name)}</option>`).join('')}</select></label><label>ผล <select data-result-preview-outcome aria-label="เลือกผลตัวอย่าง"><option value="unbalance" ${options.outcome === 'unbalance' ? 'selected' : ''}>ชวนกลับมาดูแล</option><option value="balance" ${options.outcome === 'balance' ? 'selected' : ''}>แนวโน้มสมดุล</option></select></label></div></div></aside>` : ''}
      <section class="mr-hero"><div class="mr-wrap mr-hero-grid"><div class="mr-hero-copy"><p class="mr-eyebrow">YOUR COLOUR. YOUR NEXT LITTLE STEP.</p><div class="mr-result-label"><span class="mr-dot" aria-hidden="true"></span>จักระที่ ${chakra.id} · ${e(chakra.name)}</div><h1>${e(outcome.heading)}</h1><p class="mr-hero-description">${e(outcome.body)}</p><div class="mr-outcome">${e(outcome.label)}</div><p class="mr-context">ผลนี้เป็นภาพสะท้อนจากแบบสำรวจตามแนวคิดจักระ ไม่ใช่การวินิจฉัยสุขภาพ และไม่ได้ตัดสินว่าคุณเป็นคนแบบใด</p><button type="button" class="mr-button mr-primary" data-result-scroll="mr-practice">ลองให้เวลากับตัวเองสักนิด</button></div><div class="mr-colour-art" aria-hidden="true"><div class="mr-orbit mr-orbit-outer"></div><div class="mr-orbit mr-orbit-inner"></div><div class="mr-colour-core"><span>${e(chakra.english)}</span><strong>${chakra.id}</strong><small>${e(chakra.theme)}</small></div><div class="mr-colour-ribbons">${chakras.map(c => `<i style="--ribbon:${/^#[0-9a-f]{6}$/i.test(c.color) ? c.color : '#7c3aed'}" class="${c.id === chakra.id ? 'is-current' : ''}"></i>`).join('')}</div><span class="mr-art-note">SEVEN COLOURS. ONE YOU.</span></div></div></section>
      <section class="mr-wrap mr-reflection" aria-labelledby="mr-reflection-title"><div><p class="mr-eyebrow">A MOMENT TO NOTICE</p><h2 id="mr-reflection-title">ไม่ต้องรีบเปลี่ยนทุกอย่าง<br>เริ่มจากการสังเกต</h2></div><ul>${chakra.reflection.map(item => `<li><span aria-hidden="true">✦</span>${e(item)}</li>`).join('')}</ul></section>
      <section class="mr-guidance"><div class="mr-wrap"><div class="mr-section-heading"><div><p class="mr-eyebrow">LET’S TAKE A LITTLE PAUSE</p><h2>เข้าใจผล แล้วลองฝึกไปด้วยกัน</h2></div><p>เลือกอ่านคำแนะนำ<br>หรือเริ่มจากสิ่งเล็ก ๆ ที่ทำได้ตอนนี้</p></div><div class="mr-guidance-grid"><div class="mr-video-column">${videoUrl ? `<div class="mr-video-player"><video controls preload="metadata" playsinline src="${e(videoUrl)}" aria-label="${e(chakra.video.title)}"></video><p data-result-video-error hidden role="status">วิดีโอยังเปิดไม่ได้ อ่านคำแนะนำฉบับข้อความด้านล่างได้ค่ะ</p></div>` : `<div class="mr-video-poster"><div class="mr-video-halo" aria-hidden="true"></div><span class="mr-eyebrow">A NOTE FROM MANTRALO</span><div class="mr-video-poster-copy"><span>${e(chakra.name)} · ${e(chakra.theme)}</span><h3>${e(chakra.video.title)}</h3><p>วิดีโอใหม่กำลังจัดทำ<br>อ่านคำแนะนำฉบับข้อความได้ก่อน</p></div><button type="button" class="mr-button mr-white" data-result-transcript>อ่านคำแนะนำตอนนี้</button><div class="mr-poster-spectrum" aria-hidden="true"></div></div>`}<details class="mr-transcript" data-result-transcript-panel><summary>${preview ? 'อ่านสคริปต์วิดีโอใหม่' : 'คำแนะนำฉบับข้อความ'}</summary><div><p class="mr-transcript-intro">${e(chakra.video.intro)}</p>${chakra.video.transcript.map(p => `<p>${e(p)}</p>`).join('')}</div></details></div><section class="mr-practice" id="mr-practice" tabindex="-1" aria-labelledby="mr-practice-title"><span class="mr-practice-tag">YOUR DAILY PAUSE</span><h3 id="mr-practice-title">${e(chakra.practice.title)}</h3><p>ใช้เวลาประมาณ 1 นาที ทำเท่าที่รู้สึกสบาย</p><ol>${chakra.practice.steps.map((step,i) => `<li><span>${i+1}</span><p>${e(step)}</p></li>`).join('')}</ol><div class="mr-journal-prompt"><span>ชวนจดสั้น ๆ</span><p>“${e(chakra.practice.prompt)}”</p></div><button type="button" class="mr-button mr-secondary" data-result-practised aria-pressed="false">ฉันลองฝึกแล้ว</button><p class="mr-practice-status" data-result-practice-status role="status">ไม่ต้องทำให้สมบูรณ์แบบ แค่ให้เวลาตัวเอง</p></section></div><div class="mr-free-row"><div><strong>เก็บพื้นที่เล็ก ๆ นี้ไว้ฝึกต่อ</strong><p>มีคู่มือเริ่มต้น Checklist และบันทึก 7 วันให้เปิดอ่านได้ฟรี</p></div><a class="mr-text-link" href="${href('guide')}" data-result-action="open_guide">เปิดคลังคู่มือฟรี</a></div></div></section>
      <section class="mr-wrap mr-book" id="mr-book" aria-labelledby="mr-book-title"><div class="mr-book-art"><div class="mr-book-glow" aria-hidden="true"></div><img src="${e(assetBase)}book-new-edition.png" width="617" height="900" alt="ปกหนังสือ 7 วัน 7 จักระ New Edition" loading="lazy"><span>เริ่มจากหนึ่งเล่ม<br>ค่อย ๆ รู้จักตัวเองครบทั้ง 7 จักระ</span></div><div class="mr-book-copy"><p class="mr-eyebrow">YOUR FIRST CHAPTER</p><h2 id="mr-book-title">อยากเข้าใจให้มากกว่า<br>ผลสำรวจครั้งเดียว?</h2><p>หนังสือ <strong>7 วัน 7 จักระ</strong> ชวนคุณกลับมาอ่าน ทำความเข้าใจ และทบทวนในจังหวะของตัวเอง</p><ul class="mr-check-list"><li>หนังสือ New Edition 1 เล่ม พิมพ์ 4 สี</li><li>แถมหนังสือดิจิทัล ฉบับเต็ม อ่านทบทวนได้</li><li>ขอตรวจเครดิตเพื่อเรียนคอร์สต่อได้สูงสุด 290 บาท</li></ul><div class="mr-book-price"><strong>290 <small>บาท</small></strong><span>เล่มจริง + หนังสือดิจิทัล<br>ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ</span></div><a class="mr-button mr-primary" href="${href('book')}" data-result-action="view_book">ดูชุดหนังสือ 290 บาท</a><p class="mr-purchase-note">ดูรายละเอียดการจัดส่งและวิธีรับ หนังสือดิจิทัล ก่อนสั่งซื้อ</p></div></section>
      <section class="mr-upgrade"><div class="mr-wrap mr-upgrade-grid"><div><p class="mr-eyebrow">KEEP YOUR LEARNING GOING</p><h2>หนังสือเป็นจุดเริ่มต้น<br>คอร์สช่วยให้เรียนต่อเป็นลำดับ</h2><p>คอร์สจักระ <strong>12 บทเรียน</strong> ตั้งแต่พื้นฐาน จักระทั้ง 7 การฝึกพลังงาน สมาธิจักระสี และภาษาสี พร้อม ชุดเริ่มต้นดิจิทัลตามข้อเสนอ</p><a class="mr-text-link mr-light-link" href="${href('course')}" data-result-action="view_course">ดูว่า 12 บทเรียนอะไรบ้าง</a></div><div class="mr-upgrade-card"><span>มีหนังสือแล้ว ใช้เครดิตเรียนต่อ</span><div class="mr-upgrade-math"><span>ราคาคอร์ส</span><strong>2,900 บาท</strong><span>หักเครดิตที่ตรวจสอบแล้ว สูงสุด</span><strong>290 บาท</strong></div><div class="mr-upgrade-total"><span>จ่ายเพิ่มเมื่อได้เครดิตเต็ม</span><strong>2,610 <small>บาท</small></strong></div><a class="mr-button mr-white" href="${href('course')}" data-result-action="view_upgrade">ดูรายละเอียดอัปเกรดคอร์ส</a><p>เครดิตใช้ได้หนึ่งครั้งหลังตรวจสอบยอดซื้อ ไม่รวมค่าจัดส่งและสินค้าเพิ่ม การเปิดหน้านี้ยังไม่ใช่การยืนยันเครดิต</p></div></div></section>
      <section class="mr-wrap mr-closing"><div class="mr-colour-dots" aria-hidden="true">${chakras.map(c=>`<i style="background:${/^#[0-9a-f]{6}$/i.test(c.color) ? c.color : '#7c3aed'}"></i>`).join('')}</div><h2>ค่อย ๆ รู้จักตัวเอง<br>ในจังหวะที่เป็นคุณ</h2><p>จะเริ่มจากการฝึก การอ่าน หรือการเรียนต่อก็ได้</p><div><a class="mr-button mr-primary" href="${href('book')}" data-result-action="view_book">เริ่มด้วยหนังสือ 290 บาท</a><a class="mr-text-link" href="${href('quiz')}" data-result-action="return_quiz">สำรวจจักระอื่นต่อ</a></div><small>คอร์สและเครดิตเป็นข้อเสนอ MANTRALO ที่ต้องยืนยันเงื่อนไขก่อนเปิดขาย</small></section>
      <div class="mr-mobile-bar"><div><strong>เริ่มอ่าน 290 บาท</strong><span>หนังสือ + หนังสือดิจิทัล · ค่าส่ง 59 บาท</span></div><a class="mr-button mr-primary" href="${href('book')}" data-result-action="view_book">ดูชุดหนังสือ</a></div>
    </article>`;
  }
  function mount(root) {
    mounted.get(root)?.();
    const page = root.querySelector('.mr-page');
    if (!page) return () => {};
    const controller = new AbortController();
    const signal = controller.signal;
    const scrollTo = element => { if (!element) return; element.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'}); element.focus({preventScroll:true}); };
    page.addEventListener('click', event => {
      const control = event.target instanceof Element ? event.target.closest('button,a') : null;
      if (!control) return;
      if (control.hasAttribute('data-result-scroll')) scrollTo(page.querySelector('#'+control.dataset.resultScroll));
      if (control.hasAttribute('data-result-transcript')) { const panel=page.querySelector('[data-result-transcript-panel]'); panel.open=true; scrollTo(panel.querySelector('summary')); }
      if (control.hasAttribute('data-result-practised')) {
        const done = control.getAttribute('aria-pressed') !== 'true';
        control.setAttribute('aria-pressed',String(done));
        control.textContent=done?'ลองอีกครั้งเมื่อพร้อม':'ฉันลองฝึกแล้ว';
        page.querySelector('[data-result-practice-status]').textContent=done?'ขอบคุณที่ให้เวลาตัวเอง ลองจดสิ่งที่สังเกตได้สักหนึ่งอย่าง':'ไม่ต้องทำให้สมบูรณ์แบบ แค่ให้เวลาตัวเอง';
      }
      if (control.hasAttribute('data-result-action')) page.dispatchEvent(new CustomEvent('mantralo:result-action',{bubbles:true,detail:{action:control.dataset.resultAction,chakra:Number(page.dataset.resultChakra),outcome:page.dataset.resultOutcome}}));
    },{signal});
    page.addEventListener('change',event=>{
      if (!(event.target instanceof Element) || !event.target.matches('[data-result-preview-chakra],[data-result-preview-outcome]')) return;
      const chakra=page.querySelector('[data-result-preview-chakra]').value;
      const outcome=page.querySelector('[data-result-preview-outcome]').value;
      window.location.hash='/result?chakra='+encodeURIComponent(chakra)+'&outcome='+encodeURIComponent(outcome);
    },{signal});
    const video=page.querySelector('video');
    video?.addEventListener('error',()=>{page.querySelector('[data-result-video-error]').hidden=false;},{signal});
    const cleanup=()=>controller.abort(); mounted.set(root,cleanup);return cleanup;
  }
  window.MANTRALO_RESULT = {render,mount};
})();
