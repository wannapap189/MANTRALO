/* Curated owner-supplied EMC clips for local preview. This module does not grant course access. */
(() => {
  'use strict';

  const mounted = new WeakMap();
  const categories = { basics: 'รู้จักจักระ', practice: 'ลองฝึกทีละนิด', life: 'เชื่อมกับชีวิตประจำวัน' };
  const guides = { guide: 'เลือกคู่มือเริ่มฝึกฟรี', checklist: 'เลือก Checklist การฝึกฟรี', journal: 'เลือกบันทึก 7 วันฟรี' };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const text = value => typeof value === 'string' ? value.trim() : '';
  const spectrum = '<span class="mv-spectrum" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>';

  function asset(value, extensions) {
    if (typeof value !== 'string' || !/^assets\/[A-Za-z0-9_./-]+$/.test(value) || value.includes('..') || value.includes('//')) return '';
    return extensions.test(value) ? value : '';
  }

  function items() {
    const seen = new Set();
    const source = Array.isArray(window.MANTRALO_VIDEO_ITEMS) ? window.MANTRALO_VIDEO_ITEMS : [];
    return source.flatMap(item => {
      if (!item || typeof item.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(item.id) || seen.has(item.id)) return [];
      const src = asset(item.src, /\.(mp4|m4v|mov|webm|ogg)$/i);
      const title = text(item.title);
      if (!src || !title) return [];
      seen.add(item.id);
      const captionData = typeof item.caption === 'string' ? { src: item.caption } : item.caption;
      const captionSrc = asset(captionData?.src, /\.vtt$/i);
      const caption = captionSrc ? {
        src: captionSrc,
        language: /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(captionData?.srclang || '') ? captionData.srclang : 'th',
        label: text(captionData?.label) || 'คำบรรยายภาษาไทย'
      } : null;
      return [{
        id: item.id, title, src, caption,
        category: Object.hasOwn(categories, item.category) ? item.category : 'basics',
        description: text(item.description),
        poster: asset(item.poster, /\.(jpe?g|png|webp|avif)$/i),
        durationSeconds: Number.isFinite(item.durationSeconds) && item.durationSeconds > 0 ? item.durationSeconds : 0,
        practice: (Array.isArray(item.practice) ? item.practice : [item.practice]).map(text).filter(Boolean),
        guide: Object.hasOwn(guides, item.guide) ? item.guide : 'guide',
        transcript: text(item.transcript)
      }];
    });
  }

  function queryId() {
    const hash = window.location?.hash || '';
    const start = hash.indexOf('?');
    return start < 0 ? '' : new URLSearchParams(hash.slice(start + 1)).get('video') || '';
  }

  function selectedItem(all, requested) {
    const id = typeof requested === 'string' ? requested : queryId();
    return all.find(item => item.id === id) || all[0];
  }

  function duration(seconds) {
    if (!seconds) return '';
    const total = Math.ceil(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  function card(item, selected) {
    return `<button type="button" class="mv-card" data-video-select="${escape(item.id)}" aria-pressed="${item.id === selected}" aria-controls="mv-video-viewer">
      <span class="mv-card-image">${item.poster ? `<img src="${escape(item.poster)}" alt="" loading="lazy" width="90" height="120">` : '<span class="mv-card-mark" aria-hidden="true">▶</span>'}</span>
      <span class="mv-card-copy"><span class="mv-card-category">${categories[item.category]}${duration(item.durationSeconds) ? ` · ${duration(item.durationSeconds)}` : ''}</span><strong>${escape(item.title)}</strong><span class="mv-card-action">${item.id === selected ? 'คลิปที่เลือกอยู่' : 'เลือกดูคลิปนี้'}</span></span>
    </button>`;
  }

  function viewer(item) {
    return `<div class="mv-watch-header"><p class="mv-eyebrow">${categories[item.category]}${duration(item.durationSeconds) ? ` · ${duration(item.durationSeconds)} นาที` : ''}</p><h3 id="mv-current-title" class="mv-player-title" tabindex="-1">${escape(item.title)}</h3></div>
      <div class="mv-watch-grid"><div class="mv-media-column"><div class="mv-media-stage"><video class="mv-player" controls playsinline preload="metadata" src="${escape(item.src)}"${item.poster ? ` poster="${escape(item.poster)}"` : ''} aria-labelledby="mv-current-title">${item.caption ? `<track kind="captions" src="${escape(item.caption.src)}" srclang="${escape(item.caption.language)}" label="${escape(item.caption.label)}">` : ''}<p>เบราว์เซอร์นี้ไม่รองรับวิดีโอ กรุณาเปิดหน้านี้ด้วยเบราว์เซอร์ที่รองรับการเล่นวิดีโอ</p></video></div><p class="mv-source">คลิปจากคลังความรู้ EMC</p><p class="mv-media-error" data-video-error role="status" hidden>ขณะนี้เปิดคลิปไม่ได้ ลองเลือกคลิปอื่น หรือกลับมาเปิดหน้านี้อีกครั้ง</p></div>
      <div class="mv-watch-copy">${item.description ? `<p class="mv-description">${escape(item.description)}</p>` : ''}
        ${item.practice.length ? `<div class="mv-practice"><span class="mv-note-label">หลังดูคลิป ลองทำสิ่งเล็ก ๆ</span><ul>${item.practice.map(step => `<li>${escape(step)}</li>`).join('')}</ul><p>เลือกทำเท่าที่สะดวก และหยุดพักได้ตามจังหวะของคุณ</p></div>` : ''}
        <div class="mv-guide"><div><strong>เก็บสิ่งที่ได้เรียนรู้ไว้กับตัวเอง</strong><p>มีคู่มือ Checklist และบันทึก 7 วัน ให้เลือกดาวน์โหลดฟรี</p></div><a class="mv-button mv-button-primary" href="#/free-kit">${guides[item.guide]}</a></div>
        ${item.transcript ? `<details class="mv-transcript"><summary>อ่านบทถอดเสียงของคลิปนี้</summary><div>${escape(item.transcript)}</div></details>` : ''}
      </div></div>`;
  }

  function render({ videoId } = {}) {
    const all = items();
    const selected = selectedItem(all, videoId);
    return `<section class="mv-section" data-video-library data-video-selected="${escape(selected?.id || '')}" aria-labelledby="video-library-heading"><div class="mv-wrap">
      <div class="mv-section-heading"><div><p class="mv-eyebrow">A LITTLE TIME TO LEARN</p><h2 id="video-library-heading" tabindex="-1">คลิปสั้น ๆ<br>เติมมุมมองให้วันธรรมดา</h2></div><div class="mv-intro">${spectrum}<p>เริ่มจากเรื่องที่สนใจ ดูในจังหวะของคุณ<br>แล้วเลือกสิ่งเล็ก ๆ ไปลองใช้ในวันนี้</p></div></div>
      ${selected ? `<div class="mv-viewer" id="mv-video-viewer" data-video-viewer>${viewer(selected)}</div>
      <div class="mv-browse"><div class="mv-browse-heading"><h3>อยากเรียนรู้เรื่องไหนต่อ?</h3><p class="mv-result-count" data-video-count role="status" aria-live="polite" aria-atomic="true">${all.length} คลิปให้เลือกดู</p></div>
        <div class="mv-controls"><label class="mv-search"><span>ค้นหาคลิป</span><input type="search" data-video-search placeholder="ชื่อคลิป หรือเรื่องที่สนใจ" autocomplete="off" aria-controls="mv-video-list"></label><button class="mv-reset" type="button" data-video-reset>ล้างการค้นหาและหมวด</button></div>
        <div class="mv-filters" role="group" aria-label="กรองหมวดวิดีโอ"><button type="button" data-video-filter="all" aria-pressed="true" aria-controls="mv-video-list">ดูทั้งหมด</button>${Object.entries(categories).map(([id, label]) => `<button type="button" data-video-filter="${id}" aria-pressed="false" aria-controls="mv-video-list">${label}</button>`).join('')}</div>
        <div class="mv-card-grid" id="mv-video-list" data-video-list>${all.map(item => card(item, selected.id)).join('')}</div><div class="mv-empty" data-video-empty hidden><strong>ยังไม่พบคลิปที่ตรงกับคำค้น</strong><p>ลองคำสั้น ๆ หรือกลับไปดูทุกหมวดอีกครั้ง</p><button type="button" class="mv-button mv-button-secondary" data-video-reset>ดูคลิปทั้งหมด</button></div>
      </div>` : `<div class="mv-empty"><strong>กำลังเตรียมคลิปความรู้ให้เลือกดู</strong><p>ระหว่างนี้ เลือกอ่านคู่มือและลองจดบันทึกได้ฟรี</p><a class="mv-button mv-button-primary" href="#/free-kit">เลือกคู่มือฟรี</a></div>`}
      <div class="mv-continue"><div class="mv-continue-heading"><p class="mv-eyebrow">WHEN YOU WANT TO GO A LITTLE FURTHER</p><h3>ค่อย ๆ เรียนรู้ต่อ<br>ในแบบที่เหมาะกับคุณ</h3></div><div class="mv-offer"><h4>อ่านและลองทำไปทีละวัน</h4><p>หนังสือเล่ม 7 วัน 7 จักระ New Edition <strong>290 บาท</strong> พร้อมหนังสือดิจิทัลฉบับเต็มของเล่มนี้ฟรี ค่าส่ง 59 บาท</p><a class="mv-text-link" href="#/book">ดูหนังสือ 7 วัน 7 จักระ</a></div><div class="mv-offer"><h4>เรียนต่ออย่างเป็นลำดับ</h4><p>คอร์สเต็ม <strong>12 บท · 2,900 บาท</strong></p><p class="mv-credit-note">ผู้ซื้อหนังสือที่ผ่านการตรวจสิทธิ์ ใช้เครดิตยอดซื้อได้สูงสุด 290 บาท ครั้งเดียว หากได้เครดิตเต็ม จ่ายเพิ่ม 2,610 บาท</p><a class="mv-text-link" href="#/course">ดูรายละเอียดคอร์สและเงื่อนไข</a></div></div>
    </div></section>`;
  }

  function release(section) {
    for (const video of section.querySelectorAll('video')) {
      try { video.pause(); } catch (_) { /* Detached media may already be released. */ }
      video.removeAttribute('src');
      for (const source of video.querySelectorAll('source,track')) source.removeAttribute('src');
      try { video.load(); } catch (_) { /* No playback is started during cleanup. */ }
    }
  }

  function mount(root, { videoId } = {}) {
    if (!root || typeof root.querySelector !== 'function') return () => {};
    mounted.get(root)?.();
    const section = root.matches?.('[data-video-library]') ? root : root.querySelector('[data-video-library]');
    if (!section) return () => {};
    const all = items();
    let selected = selectedItem(all, videoId);
    const panel = section.querySelector('[data-video-viewer]');
    if (!selected || !panel) return () => {};
    const controller = new AbortController();
    const list = section.querySelector('[data-video-list]');
    const search = section.querySelector('[data-video-search]');
    const count = section.querySelector('[data-video-count]');
    const empty = section.querySelector('[data-video-empty]');
    let category = 'all';
    let disposed = false;

    function updateSelection() {
      for (const button of list.querySelectorAll('[data-video-select]')) {
        const active = button.dataset.videoSelect === selected.id;
        button.setAttribute('aria-pressed', String(active));
        button.querySelector('.mv-card-action').textContent = active ? 'คลิปที่เลือกอยู่' : 'เลือกดูคลิปนี้';
      }
    }

    function select(item, focus = false) {
      release(panel);
      selected = item;
      section.dataset.videoSelected = item.id;
      panel.innerHTML = viewer(item);
      updateSelection();
      if (focus) {
        panel.querySelector('#mv-current-title')?.focus({ preventScroll: true });
        panel.scrollIntoView({ block: 'start', behavior: 'auto' });
      }
    }

    function filter() {
      const query = search.value.trim().toLocaleLowerCase('th-TH');
      const visible = all.filter(item => (category === 'all' || item.category === category) && `${item.title} ${item.description} ${categories[item.category]} ${item.practice.join(' ')}`.toLocaleLowerCase('th-TH').includes(query));
      list.innerHTML = visible.map(item => card(item, selected.id)).join('');
      empty.hidden = visible.length > 0;
      list.hidden = visible.length === 0;
      count.textContent = `พบ ${visible.length} จาก ${all.length} คลิป`;
      for (const button of section.querySelectorAll('[data-video-filter]')) button.setAttribute('aria-pressed', String(button.dataset.videoFilter === category));
    }

    if (section.dataset.videoSelected !== selected.id || !panel.querySelector('video')?.getAttribute('src')) select(selected);

    section.addEventListener('click', event => {
      const button = event.target?.closest?.('button');
      if (!button || !section.contains(button)) return;
      if (button.hasAttribute('data-video-reset')) {
        category = 'all';
        search.value = '';
        filter();
        search.focus();
      } else if (button.hasAttribute('data-video-filter')) {
        const next = button.dataset.videoFilter;
        if (next !== 'all' && !Object.hasOwn(categories, next)) return;
        category = next;
        filter();
      } else if (button.hasAttribute('data-video-select')) {
        const next = all.find(item => item.id === button.dataset.videoSelect);
        if (next && next.id !== selected.id) select(next, true);
        else if (next) {
          panel.querySelector('#mv-current-title')?.focus({ preventScroll: true });
          panel.scrollIntoView({ block: 'start', behavior: 'auto' });
        }
      }
    }, { signal: controller.signal });
    section.addEventListener('input', event => { if (event.target === search) filter(); }, { signal: controller.signal });
    section.addEventListener('error', event => {
      if (event.target?.tagName === 'VIDEO' && !disposed) {
        const notice = panel.querySelector('[data-video-error]');
        if (notice) notice.hidden = false;
      }
    }, { capture: true, signal: controller.signal });

    const cleanup = () => {
      if (disposed) return;
      disposed = true;
      controller.abort();
      release(section);
      if (mounted.get(root) === cleanup) mounted.delete(root);
    };
    mounted.set(root, cleanup);
    return cleanup;
  }

  window.MANTRALO_VIDEOS = Object.freeze({ render, mount });
})();
