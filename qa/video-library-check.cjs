// Local real-media / funnel checks. Remote requests are blocked; no orders submitted.
const { chromium } = require('C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = 'http://127.0.0.1:8140/';
const report = { checks: [], errors: [], time: new Date().toISOString() };
const pass = (name, data = {}) => { report.checks.push({ name, ...data }); console.log('PASS ' + name); };
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) report.errors.push(r.status() + ' ' + r.url()); });
    for (const width of [360, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
      await page.goto(base + '#/library?section=videos');
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.querySelectorAll('[data-video-library] img')].map(i => { i.loading = 'eager'; return i.decode(); })); });
      await page.waitForFunction(() => document.activeElement?.id === 'video-library-heading');
      assert.equal(await page.locator('[data-video-select]').count(), 4);
      assert.equal(await page.locator('[data-library-grid] [data-library-book]').count(), 8);
      assert.equal(await page.locator('.ml-free a[download]').count(), 3);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1));
      assert.ok(await page.locator('.mv-player').evaluate(v => v.controls && v.playsInline && v.paused && !v.autoplay));
      if ([390, 1440].includes(width)) {
        await page.screenshot({ path: path.join(root, 'preview', `video-library-${width}.png`) });
        await page.locator('[data-video-library]').screenshot({ path: path.join(root, 'preview', `video-library-section-${width}.png`) });
      }
      pass('local library layout ' + width);
    }
    for (const [category, expected] of [['basics', 1], ['practice', 2], ['life', 1], ['all', 4]]) {
      await page.locator(`[data-video-filter="${category}"]`).click();
      assert.equal(await page.locator('[data-video-select]').count(), expected);
    }
    await page.locator('[data-video-search]').fill('ปราณายามะ');
    assert.equal(await page.locator('[data-video-select]').count(), 1);
    await page.locator('[data-video-search]').fill('not-a-video-123');
    assert.ok(await page.locator('[data-video-empty]').isVisible());
    await page.locator('[data-video-empty] [data-video-reset]').click();
    assert.equal(await page.locator('[data-video-select]').count(), 4);
    pass('three categories, search, empty and reset');
    const items = await page.evaluate(() => window.MANTRALO_VIDEO_ITEMS.map(v => ({ id: v.id, duration: v.durationSeconds, src: v.src })));
    for (const item of items) {
      await page.locator(`[data-video-select="${item.id}"]`).click();
      await page.waitForFunction(() => document.querySelector('.mv-player')?.readyState >= 1);
      const info = await page.locator('.mv-player').evaluate(async video => {
        const initialPaused = video.paused;
        video.muted = true;
        await video.play();
        return { duration: video.duration, width: video.videoWidth, height: video.videoHeight, initialPaused };
      });
      assert.ok(info.initialPaused);
      assert.ok(Math.abs(info.duration - item.duration) < 0.2);
      assert.ok(info.width > 0 && info.height > 0);
      await page.waitForFunction(() => document.querySelector('.mv-player')?.currentTime > 0.2);
      await page.locator('.mv-player').evaluate(v => v.pause());
      const range = await context.request.get(base + item.src, { headers: { Range: 'bytes=0-1023' } });
      assert.equal(range.status(), 206);
      assert.equal((await range.body()).length, 1024);
      pass('actual media playback and seeking ' + item.id, info);
    }
    await page.locator('.mv-guide a').click();
    await page.waitForFunction(() => document.querySelector('#main')?.dataset.route === '/free-kit');
    assert.equal(await page.locator('.fk-document-actions a[download]').count(), 3);
    pass('video leads to the three free documents');
    await page.goto(base + '#/library?section=videos&video=meditation-routine');
    assert.equal(await page.locator('[data-video-library]').getAttribute('data-video-selected'), 'meditation-routine');
    const oldVideo = await page.locator('.mv-player').elementHandle();
    await page.locator('.mv-continue a[href="#/book"]').click();
    assert.ok(await oldVideo.evaluate(v => v.paused && !v.getAttribute('src')));
    await page.locator('[data-order="book"]').first().click();
    assert.match(await page.locator('#modal').innerText(), /290/);
    assert.equal(await page.locator('#modal').getAttribute('open'), '');
    pass('video cleanup and book 290 local order summary');
    await page.goto(base + '#/library?section=videos');
    await page.locator('.mv-continue a[href="#/course"]').click();
    await page.locator('[data-course-credit]').first().click();
    const creditText = await page.locator('#modal').innerText();
    assert.match(creditText, /2,610/);
    assert.match(creditText, /ตรวจ|ยืนยัน/);
    pass('course 12 upgrade 2610 remains conditional on verification');
    await page.goto(base + '#/library?section=videos&video=unknown');
    assert.equal(await page.locator('[data-video-library]').getAttribute('data-video-selected'), items[0].id);
    await page.goto(base + '#/library?section=ebooks');
    await page.waitForFunction(() => document.activeElement?.id === 'ml-catalog-title');
    pass('safe video selection and ebook section deep links');
    await page.goto(base + 'funnel-plan.html');
    assert.match(await page.locator('body').innerText(), /2,000,000|2 ล้านบาท/);
    assert.deepEqual(report.errors, []);
    pass('no page errors or failed local assets');
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(root, 'qa/video-library-report.json'), JSON.stringify(report, null, 2));
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
