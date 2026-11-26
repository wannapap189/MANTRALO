/* Local, editorial translations. No network translation, checkout or account writes. */
(() => {
  'use strict';
  const supported = new Set(['/', '/book', '/course']);
  const attributes = ['alt', 'title', 'aria-label', 'placeholder'];
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const linkSources = new WeakMap();
  const storageKey = 'mantralo-language';
  let preference = 'th';
  let observer;
  let scheduled = false;
  let applying = false;
  let notice;
  let controls;
  let liveStatus;

  const route = () => (location.hash.slice(1).split('?')[0].replace(/\/+$/, '') || '/');
  const requestedLanguage = () => new URLSearchParams(location.hash.split('?')[1] || '').get('lang');
  const validLanguage = value => value === 'th' || value === 'en';
  const remember = value => { try { localStorage.setItem(storageKey, value); } catch { /* The switch still works when storage is unavailable. */ } };
  const dictionaries = () => Object.assign({}, window.MANTRALO_EN_HOME, window.MANTRALO_EN_BOOK, window.MANTRALO_EN_COURSE, window.MANTRALO_EN_COMMON, window.MANTRALO_EN_PURCHASE);
  const metadata = {
    '/': {
      th: ['MANTRALO — พักสักนิด กลับมาฟังตัวเอง', 'พักสักนิด กลับมาฟังตัวเองกับ MANTRALO เรียนรู้จักระและสมาธิในชีวิตประจำวัน ลองพัก 3 นาที รับชุดเริ่มต้นฟรี อ่านหนังสือ 290 บาท หรือเรียนต่อในคอร์ส 12 บท'],
      en: ['MANTRALO — A little pause. A moment for yourself.', 'Explore chakras and everyday meditation with MANTRALO. Start with a short pause, discover the free Thai starter kit, or explore our Thai book and 12-lesson course.']
    },
    '/book': {
      th: ['หนังสือและ ชุดเริ่มต้นดิจิทัล | MANTRALO', 'หนังสือ 7 วัน 7 จักระ 290 บาท พร้อมหนังสือดิจิทัลชื่อเดียวกัน ค่าส่ง 59 บาท รวม 349 บาท ในประเทศพื้นที่ปกติ เรียนรู้จักระในจังหวะของคุณ'],
      en: ['7 Days 7 Chakras — Thai Book & eBook | MANTRALO', 'Explore the Thai-language 7 Days 7 Chakras book for THB 290, with the matching eBook included. Shipping is separate. See the contents and conditional course credit.']
    },
    '/course': {
      th: ['คอร์สจักระ 12 บทเรียน | MANTRALO', 'เรียนรู้จักระอย่างเป็นลำดับในคอร์ส 12 บท ราคาเสนอ 2,900 บาท พร้อมเงื่อนไขเครดิตหนังสือที่ตรวจสอบแล้ว'],
      en: ['12-Lesson Chakra Course in Thai | MANTRALO', 'Explore all 12 lessons in MANTRALO CORE, taught in Thai. Proposed price: THB 2,900. Eligible verified purchases may receive up to THB 290 in one-time credit.']
    }
  };

  function original(current, record) {
    return record && (current === record.source || current === record.result) ? record.source : current;
  }

  function translated(source, dictionary, language) {
    if (language !== 'en') return source;
    const key = source.trim();
    if (!key || !Object.prototype.hasOwnProperty.call(dictionary, key)) return source;
    const position = source.indexOf(key);
    return source.slice(0, position) + dictionary[key] + source.slice(position + key.length);
  }

  function translateTree(language, dictionary) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.parentElement || node.parentElement.closest('script, style, noscript, [data-locale-ui]')) continue;
      const source = original(node.nodeValue, textSources.get(node));
      let result = translated(source, dictionary, language);
      // Several Thai layouts hide a line break on small screens. Keep English
      // words separated when that break is visually collapsed.
      if (language === 'en' && node.nextSibling?.nodeName === 'BR' && result && !/\s$/.test(result)) result += ' ';
      textSources.set(node, { source, result });
      if (node.nodeValue !== result) node.nodeValue = result;
    }
    document.body.querySelectorAll('[alt], [title], [aria-label], [placeholder]').forEach(element => {
      if (element.closest('[data-locale-ui]')) return;
      let records = attributeSources.get(element);
      if (!records) { records = new Map(); attributeSources.set(element, records); }
      attributes.forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const source = original(current, records.get(attribute));
        const result = translated(source, dictionary, language);
        records.set(attribute, { source, result });
        if (current !== result) element.setAttribute(attribute, result);
      });
    });
  }

  function updateLinks() {
    document.querySelectorAll('a[href^="#/"]').forEach(link => {
      if (link.closest('[data-locale-ui]')) return;
      const source = original(link.getAttribute('href'), linkSources.get(link));
      const [pathname, query = ''] = source.slice(1).split('?');
      const params = new URLSearchParams(query);
      if (preference === 'en') params.set('lang', 'en');
      else params.delete('lang');
      const result = '#' + pathname + (params.size ? '?' + params.toString() : '');
      linkSources.set(link, { source, result });
      if (link.getAttribute('href') !== result) link.setAttribute('href', result);
    });
  }

  function apply() {
    if (applying || !document.body || !controls) return;
    applying = true;
    observer?.disconnect();
    try {
      const currentRoute = route();
      const isSupported = supported.has(currentRoute);
      const language = isSupported ? preference : 'th';
      document.documentElement.lang = language;
      document.documentElement.dataset.locale = language;
      translateTree(language, dictionaries());
      controls.setAttribute('aria-label', language === 'en' ? 'Website language' : 'ภาษาหน้าเว็บ');
      controls.querySelectorAll('[data-language]').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.language === language));
        button.disabled = button.dataset.language === 'en' && !isSupported;
        button.title = button.disabled ? 'English is available on Home, Book and Course pages.' : '';
      });
      notice.hidden = preference !== 'en';
      if (preference === 'en') {
        const message = isSupported
          ? 'English website preview · Books, PDFs and course materials are currently in Thai. Prices are in THB.'
          : 'This page is currently in Thai. Your English preference is kept for Home, Book and Course pages.';
        if (notice.firstElementChild.textContent !== message) notice.firstElementChild.textContent = message;
        notice.querySelector('a').hidden = isSupported;
      }
      if (metadata[currentRoute]) {
        const [title, description] = metadata[currentRoute][language];
        if (document.title !== title) document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      }
      updateLinks();
      // A Thai-only library dialog can be reached from an English home page.
      // Label that content honestly without changing the underlying product or access.
      const modal = document.querySelector('#modal');
      const content = document.querySelector('#modal-content');
      let modalNote = document.querySelector('.locale-modal-note');
      if (modal?.open && content && language === 'en') {
        const remainingThai = content.textContent.replace(/วรรณนภา ประจักษ์ทิพย์/g, '');
        if (/[\u0E00-\u0E7F]/.test(remainingThai)) {
          if (!modalNote) {
            modalNote = document.createElement('p');
            modalNote.className = 'locale-modal-note';
            modalNote.dataset.localeUi = '';
            modalNote.lang = 'en';
            modalNote.textContent = 'Some details below are currently available in Thai. All eBooks are Thai-language editions.';
            content.prepend(modalNote);
          }
        } else modalNote?.remove();
      } else modalNote?.remove();
    } finally {
      applying = false;
      observer?.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...attributes, 'open'] });
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; apply(); });
  }

  function choose(language) {
    if (!validLanguage(language) || (language === 'en' && !supported.has(route()))) return;
    preference = language;
    remember(language);
    const [pathname, query = ''] = location.hash.slice(1).split('?');
    const params = new URLSearchParams(query);
    params.set('lang', language);
    history.replaceState(history.state, '', location.pathname + location.search + '#' + (pathname || '/') + '?' + params.toString());
    apply();
    liveStatus.lang = language;
    liveStatus.textContent = language === 'en' ? 'Website language changed to English.' : 'เปลี่ยนภาษาหน้าเว็บเป็นภาษาไทยแล้ว';
  }

  function init() {
    try { const saved = localStorage.getItem(storageKey); if (validLanguage(saved)) preference = saved; } catch { /* Default to Thai. */ }
    const requested = requestedLanguage();
    if (validLanguage(requested)) { preference = requested; remember(requested); }
    controls = document.querySelector('[data-language-switch]');
    notice = document.querySelector('#locale-notice');
    liveStatus = document.querySelector('#locale-status');
    if (!controls || !notice || !liveStatus) return;
    controls.addEventListener('click', event => {
      const button = event.target.closest('[data-language]');
      if (button && !button.disabled) choose(button.dataset.language);
    });
    window.addEventListener('hashchange', () => {
      const requested = requestedLanguage();
      if (validLanguage(requested)) { preference = requested; remember(requested); }
      apply();
    });
    observer = new MutationObserver(schedule);
    apply();
    window.MANTRALO_I18N = Object.freeze({ apply, getLanguage: () => document.documentElement.lang, getPreference: () => preference });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
