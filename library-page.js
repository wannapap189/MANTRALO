/* Library presentation. The catalog never exposes full paid PDFs or grants access. */
(() => {
  'use strict';
  const mounted = new WeakMap();
  const categories = { begin: 'เริ่มต้นกับจักระ', life: 'จักระกับชีวิต', crystal: 'คริสตัลและพลังงาน' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const books = () => Array.isArray(window.MANTRALO_LIBRARY_BOOKS) ? window.MANTRALO_LIBRARY_BOOKS.filter(book => book && book.id && book.title) : [];
  const category = book => categories[book.category] || 'เรียนรู้เรื่องจักระ';
  const pages = book => Number.isInteger(book.pages) && book.pages > 0 ? `${book.pages} หน้า` : '';
  const safeCover = value => typeof value === 'string' && /^assets\/[A-Za-z0-9_./%\-]+$/.test(value) && !value.includes('..') ? value : '';
  const spectrum = '<span class="ml-spectrum" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';

  function card(book, pending = false) {
    const cover = safeCover(book.cover);
    const price = window.MANTRALO_EBOOK_OFFERS?.get(`ebook-${book.id}`)?.price;
    const badge = pending ? 'กำลังเตรียม · ยังไม่เปิดขาย' : category(book);
    return `<article class="ml-book-card${pending ? ' ml-book-pending' : ''}" data-library-book="${escape(book.id)}">
      <div class="ml-cover-stage ml-cover-${Object.hasOwn(categories, book.category) ? book.category : 'begin'}">
        <span class="ml-cover-badge">${escape(badge)}</span>
        ${cover ? `<img class="ml-book-cover" src="${escape(cover)}" alt="ปก ${escape(book.title)}" width="600" height="860" loading="lazy">` : `<span class="ml-cover-title">${escape(book.title)}</span>`}
      </div>
      <div class="ml-card-copy"><div class="ml-card-meta"><span>${pending ? 'อ่านต่อในโอกาสถัดไป' : 'MANTRALO LIBRARY'}</span>${pages(book) ? `<span>${pages(book)}</span>` : ''}</div>
        <h3>${escape(book.title)}</h3>${!pending && book.solutionTitle ? `<p class="ml-reader-need"><strong>${escape(book.solutionTitle)}</strong></p>` : ''}<p>${escape(book.solutionCopy || book.description)}</p>
        <div class="ml-card-bottom"><span>${pending ? 'อยู่ระหว่างเตรียมเนื้อหา' : Number.isFinite(price) ? `ราคาเสนอ ${price.toLocaleString('th-TH')} บาท` : 'กำลังเตรียมเปิดอ่าน'}</span><button type="button" class="ml-detail-button" data-ebook-details="${escape(book.id)}" aria-label="ดูรายละเอียด ${escape(book.title)}">ดูรายละเอียด</button></div>
      </div>
    </article>`;
  }

  function render({ downloadCard, draftNote = '' } = {}) {
    const all = books();
    const catalog = all.filter(book => book.stage === 'catalog');
    const pending = all.filter(book => book.stage === 'developing');
    const free = typeof downloadCard === 'function' ? [
      downloadCard('01', 'คู่มือเริ่มฝึก', 'เริ่มทำความรู้จักการฝึกและให้เวลากับตัวเองทีละนิด', 'free-kit/free-guide.pdf', 'ดาวน์โหลดคู่มือ'),
      downloadCard('02', 'Checklist การฝึก', 'กลับมาสังเกตกิจวัตรเล็ก ๆ ในวันที่คุณพร้อม', 'free-kit/checklist.pdf', 'ดาวน์โหลด Checklist'),
      downloadCard('03', 'บันทึก 7 วัน', 'จดสิ่งที่ได้ลองทำ ความรู้สึก และสิ่งที่อยากดูแลต่อ', 'free-kit/journal.pdf', 'ดาวน์โหลดบันทึก')
    ].join('') : '';
    return `<div class="route-page ml-page">
      <section class="ml-hero"><div class="ml-wrap ml-hero-inner"><div class="ml-hero-copy"><p class="ml-eyebrow">A LITTLE LEARNING. A LITTLE MORE YOU.</p><h1>คลังความรู้<br>ให้คุณค่อย ๆ กลับมาสู่ตัวเอง</h1><p>ดูคลิปสั้น รู้จักจักระ และหยิบสิ่งเล็ก ๆ ไปลองทำ<br>เลือกดู อ่าน หรือจดบันทึก ในจังหวะของคุณ</p><div class="ml-hero-tags"><span>คลิปความรู้ดูฟรี</span><span>หนังสือดิจิทัล ${catalog.length} เล่ม</span><span>3 เอกสารเริ่มฝึกฟรี</span></div><nav class="ml-library-sections" aria-label="เลือกเนื้อหาในคลัง"><a href="#/library?section=videos">ดูวิดีโอ</a><a href="#/library?section=ebooks">เลือกหนังสือดิจิทัล</a><a href="#/library?section=free">รับคู่มือฟรี</a></nav></div><div class="ml-hero-art" aria-hidden="true"><span class="ml-orbit ml-orbit-one"></span><span class="ml-orbit ml-orbit-two"></span><div class="ml-reading-mark"><small>MANTRALO</small><strong>WATCH.<br>TRY.<br>GROW.</strong>${spectrum}</div><span class="ml-art-caption">SEVEN COLOURS. MANY WAYS TO BEGIN.</span></div></div></section>
      ${window.MANTRALO_VIDEOS?.render() || ''}
      <div class="ml-wrap eo-library-banner"><div><strong>เลือกหนึ่งเล่ม หรือเก็บครบทั้งคอลเลกชัน</strong><p>ราคาเสนอรายเล่มเริ่ม 99 บาท · ชุดครบ 8 เล่ม ${window.MANTRALO_EBOOK_OFFERS.get('all-eight').price.toLocaleString('th-TH')} บาท</p></div><a class="button button-primary" href="#/ebooks">ดูราคาและแพ็กเกจหนังสือดิจิทัล</a></div>
      <section class="ml-wrap ml-catalog" aria-labelledby="ml-catalog-title"><div class="ml-section-heading"><div><p class="ml-eyebrow">FIND YOUR NEXT CHAPTER</p><h2 id="ml-catalog-title">วันนี้ อยากรู้จักเรื่องไหน?</h2></div><p>เปิดดูเนื้อหาของแต่ละเล่ม<br>แล้วเลือกเส้นทางที่เหมาะกับคุณ</p></div>
        <div class="ml-controls"><div class="ml-search-row"><label class="ml-search" for="ml-book-search"><span>ค้นหาหนังสือดิจิทัลในคลัง</span><div><span class="ml-search-icon" aria-hidden="true">⌕</span><input id="ml-book-search" type="search" autocomplete="off" placeholder="ชื่อหนังสือ หรือเรื่องที่สนใจ" data-library-search></div></label><button type="button" class="ml-reset" data-library-clear>ล้างการค้นหา</button></div><div class="ml-filter-row"><div class="ml-filters" role="group" aria-label="กรองหมวดหนังสือดิจิทัล"><button type="button" data-library-filter="all" aria-pressed="true">ทุกเล่ม</button>${Object.entries(categories).map(([key, title]) => `<button type="button" data-library-filter="${key}" aria-pressed="false">${title}</button>`).join('')}</div><p class="ml-result-count" data-library-count role="status" aria-live="polite" aria-atomic="true">พบ ${catalog.length} จาก ${catalog.length} เล่ม</p></div></div>
        <div class="ml-book-grid" data-library-grid>${catalog.map(book => card(book)).join('')}</div>
        <div class="ml-no-results" data-library-empty hidden><span aria-hidden="true">✦</span><h3>ยังไม่พบเล่มที่ตรงกับคำค้นนี้</h3><p>ลองคำสั้น ๆ เช่น จักระ สี หรือคริสตัล<br>หรือเปิดดูหนังสือทุกเล่มอีกครั้ง</p><button type="button" class="ml-button ml-primary" data-library-clear>ดูทุกเล่ม</button></div>
      </section>
      ${pending.length ? `<section class="ml-pending"><div class="ml-wrap"><div class="ml-section-heading"><div><p class="ml-eyebrow">MORE TO EXPLORE</p><h2>เรื่องใหม่ที่กำลังเตรียม</h2></div><p>อีก ${pending.length} เล่มสำหรับการเรียนรู้ต่อ<br><strong>ยังไม่เปิดขาย</strong></p></div><div class="ml-book-grid ml-pending-grid">${pending.map(book => card(book, true)).join('')}</div></div></section>` : ''}
      <section class="ml-wrap ml-free" aria-labelledby="free-library-heading"><div class="ml-section-heading"><div><p class="ml-eyebrow">A GIFT TO BEGIN</p><h2 id="free-library-heading" tabindex="-1">ยังไม่ต้องซื้อ ก็เริ่มฝึกได้</h2><a class="ml-kit-entry" href="#/free-kit">ดูวิธีใช้ชุดฟรีและแผนเริ่มต้น 7 วัน</a></div><p>เลือกเอกสารเล็ก ๆ ไปใช้ประกอบการฝึก<br>แล้วกลับมาทบทวนเมื่อคุณพร้อม</p></div><div class="ml-free-grid">${free}</div>${draftNote}</section>
      <section class="ml-reading-path"><div class="ml-wrap ml-path-grid"><div><p class="ml-eyebrow">YOUR READING, YOUR RHYTHM</p><h2>เริ่มจากหนึ่งเล่ม<br>แล้วค่อยเรียนรู้ให้ลึกขึ้น</h2><p>หนังสือ 7 วัน 7 จักระ New Edition ราคา 290 บาท<br>แถมหนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ</p><a class="ml-button ml-white" href="#/book">ดูชุดหนังสือ 290 บาท</a></div><div class="ml-course-card">${spectrum}<span>เมื่ออยากเรียนเป็นลำดับ</span><h3>คอร์สจักระ<br><strong>12 บทเรียน</strong></h3><p>ต่อยอดจากพื้นฐาน จักระทั้ง 7<br>ไปสู่การฝึกพลังงาน สมาธิสี และภาษาสี</p><p class="ml-credit-note">ผู้ซื้อหนังสือหรือ ชุดเริ่มต้นดิจิทัล ที่เข้าเงื่อนไข ขอตรวจเครดิตตามยอดซื้อจริงได้สูงสุด 290 บาทหนึ่งครั้ง หนังสือดิจิทัลเล่มอื่นมีรายละเอียดแยกกัน</p><a class="ml-text-link" href="#/course">ดูเนื้อหาและเส้นทางเรียนต่อ</a></div></div></section>
    </div>`;
  }

  function renderDetails(id) {
    const book = books().find(item => String(item.id) === String(id));
    if (!book) return '<div class="dialog-body ml-dialog"><h2 id="dialog-title">ไม่พบหนังสือเล่มนี้</h2><p>กลับไปเลือกหนังสือจากห้องสมุดได้เลยค่ะ</p></div>';
    const pending = book.stage === 'developing' || book.offer === 'developing';
    const offer = window.MANTRALO_EBOOK_OFFERS?.get(`ebook-${book.id}`);
    const cover = safeCover(book.cover);
    const topics = Array.isArray(book.topics) ? book.topics : [];
    const action = pending
      ? '<div class="ml-dialog-status"><strong>กำลังเตรียม · ยังไม่เปิดขาย</strong><p>เล่มนี้อยู่ระหว่างเตรียมเนื้อหาและรายละเอียดการรับหนังสือ</p></div>'
      : book.offer === 'book'
        ? '<div class="ml-dialog-offer"><strong>เริ่มด้วยชุดหนังสือ 290 บาท</strong><p>หนังสือ New Edition 1 เล่ม พร้อม หนังสือดิจิทัล 7 วัน 7 จักระฉบับเต็ม ค่าส่ง 59 บาท ในประเทศพื้นที่ปกติ</p><a class="ml-button ml-primary" href="#/book">ดูชุดหนังสือและรายละเอียดการรับ</a></div>'
        : `<div class="ml-dialog-offer"><strong>หนังสือดิจิทัล PDF · ราคาเสนอ ${offer?.price ?? '—'} บาท</strong><p>กำลังตรวจฉบับส่งมอบ ดูราคาแยกหรือเลือกแพ็กเกจที่มีเล่มนี้ได้</p><button type="button" class="ml-button ml-primary" data-ebook-order="${escape(offer?.id || '')}">ดูสรุปรายการเล่มนี้</button><p><a class="ml-text-link" href="#/ebooks?offer=${escape(offer?.id || '')}">เปรียบเทียบหนังสือดิจิทัลและแพ็กเกจ</a></p><p>ต้นแบบราคาเสนอ · ยังไม่รับชำระเงิน</p></div>`;
    return `<div class="dialog-body ml-dialog"><div class="ml-dialog-top">${cover ? `<div class="ml-dialog-cover"><img src="${escape(cover)}" width="600" height="860" alt="ปก ${escape(book.title)}"></div>` : ''}<div><span class="ml-eyebrow">${escape(category(book))}</span><h2 id="dialog-title">${escape(book.title)}</h2>${pages(book) ? `<p class="ml-dialog-pages">${pages(book)}</p>` : ''}${!pending && book.solutionTitle ? `<p class="ml-reader-need"><strong>${escape(book.solutionTitle)}</strong></p>` : ''}<p>${escape(book.solutionCopy || book.description)}</p></div></div>${topics.length ? `<div class="ml-dialog-topics"><h3>เรื่องที่ชวนเรียนรู้ในเล่ม</h3><ul>${topics.map(topic => `<li>${escape(topic)}</li>`).join('')}</ul></div>` : ''}${action}</div>`;
  }

  function mount(root) {
    mounted.get(root)?.();
    const page = root.querySelector('.ml-page');
    if (!page) return () => {};
    const controller = new AbortController();
    const signal = controller.signal;
    const catalog = books().filter(book => book.stage === 'catalog');
    const input = page.querySelector('[data-library-search]');
    const grid = page.querySelector('[data-library-grid]');
    const count = page.querySelector('[data-library-count]');
    const empty = page.querySelector('[data-library-empty]');
    let selected = 'all';
    const normalize = value => String(value ?? '').normalize('NFC').toLocaleLowerCase('th').trim();
    function update() {
      const query = normalize(input.value);
      const matches = catalog.filter(book => (selected === 'all' || book.category === selected) && normalize([book.title, book.description, book.pain || '', book.benefit || '', book.readerFit || '', book.solutionTitle || '', book.solutionCopy || '', ...(Array.isArray(book.topics) ? book.topics : []), category(book)].join(' ')).includes(query));
      grid.innerHTML = matches.map(book => card(book)).join('');
      grid.hidden = matches.length === 0;
      empty.hidden = matches.length !== 0;
      count.textContent = `พบ ${matches.length} จาก ${catalog.length} เล่ม`;
      page.querySelectorAll('[data-library-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.libraryFilter === selected)));
    }
    page.addEventListener('input', event => { if (event.target === input) update(); }, { signal });
    page.addEventListener('click', event => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !page.contains(button)) return;
      if (button.hasAttribute('data-library-filter')) {
        const next = button.dataset.libraryFilter;
        if (next === 'all' || Object.hasOwn(categories, next)) { selected = next; update(); }
      }
      if (button.hasAttribute('data-library-clear')) { input.value = ''; selected = 'all'; update(); input.focus(); }
    }, { signal });
    const videoCleanup = window.MANTRALO_VIDEOS?.mount(page);
    const cleanup = () => { controller.abort(); videoCleanup?.(); };
    mounted.set(root, cleanup);
    return cleanup;
  }

  window.MANTRALO_LIBRARY = { render, renderDetails, mount };
})();
