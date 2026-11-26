(() => {
  'use strict';
  const messages = window.MANTRALO_FOLLOWUP_MESSAGES || [];
  let selectedDay = 1;
  let channel = 'line';
  const audience = document.getElementById('fp-audience');
  const textArea = document.getElementById('fp-message');
  const status = document.getElementById('fp-status');
  const days = document.getElementById('fp-days');
  const labels = { lead: 'ผู้สนใจ', book: 'ผู้ซื้อหนังสือ', course: 'ผู้ซื้อคอร์ส' };
  function current(message = messages.find(m => m.day === selectedDay)) {
    return { ...message, ...(audience.value === 'lead' ? {} : message.variants?.[audience.value]) };
  }
  function fullText(item) {
    const url = new URL('index.html' + item.ctaHref, window.location.href).href;
    return `${channel === 'email' ? `หัวข้อ: ${item.subject}\n\n` : ''}${item[channel]}\n\n${item.ctaLabel}\n${url}`;
  }
  function render() {
    const item = current();
    document.getElementById('fp-day-label').textContent = `วันที่ ${selectedDay} · ${labels[audience.value]} · ${channel === 'line' ? 'LINE' : 'อีเมล'}`;
    document.getElementById('fp-message-title').textContent = item.title;
    document.getElementById('fp-goal').textContent = 'จุดประสงค์: ' + item.goal;
    document.getElementById('fp-subject-block').hidden = channel !== 'email';
    document.getElementById('fp-subject').textContent = item.subject;
    textArea.value = item[channel];
    textArea.style.height = 'auto';
    textArea.style.height = Math.max(260, textArea.scrollHeight + 2) + 'px';
    document.getElementById('fp-cta').textContent = item.ctaLabel;
    document.getElementById('fp-cta').href = 'index.html' + item.ctaHref;
    document.querySelectorAll('[data-channel]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.channel === channel)));
    days.querySelectorAll('[data-day]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.day) === selectedDay)));
    status.textContent = '';
  }
  for (const message of messages) {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.day = message.day;
    button.textContent = 'วันที่ ' + message.day;
    button.setAttribute('aria-controls', 'fp-message');
    days.append(button);
  }
  days.addEventListener('click', e => {
    const button = e.target.closest('[data-day]');
    if (button) { selectedDay = Number(button.dataset.day); render(); }
  });
  document.querySelectorAll('[data-channel]').forEach(b => b.addEventListener('click', () => { channel = b.dataset.channel; render(); }));
  audience.addEventListener('change', render);
  document.getElementById('fp-copy').addEventListener('click', async () => {
    const payload = fullText(current());
    try { await navigator.clipboard.writeText(payload); status.textContent = 'คัดลอกข้อความและลิงก์ตัวอย่างแล้ว ยังไม่มีการส่ง'; }
    catch { textArea.value = payload; textArea.focus(); textArea.select(); status.textContent = 'คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว ใช้คำสั่งคัดลอกได้เลย'; }
  });
  document.getElementById('fp-download').addEventListener('click', () => {
    const contents = `MANTRALO · ข้อความตัวอย่างในเครื่อง\nกลุ่ม: ${labels[audience.value]} · ช่องทาง: ${channel}\nยังไม่มีการส่งจริง ต้องเปลี่ยนลิงก์ localhost และเชื่อมความยินยอม/การยกเลิกก่อนใช้\n\n` + messages.map(m => `วันที่ ${m.day}: ${m.title}\n\n${fullText(current(m))}`).join('\n\n────────────────────\n\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + contents], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `MANTRALO-7days-${audience.value}-${channel}.txt`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'เตรียมไฟล์ข้อความ 7 วันแล้ว ไม่มีการส่งข้อความให้ลูกค้า';
  });
  render();
})();
