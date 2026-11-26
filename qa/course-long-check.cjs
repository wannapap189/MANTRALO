/* Isolated local QA for the long course page. Never submits data or opens remote services. */
const { chromium } = require(process.env.MANTRALO_PLAYWRIGHT || 'C:/Program Files/WindowsApps/OpenAI.CodexPrimaryRuntime.v26-1118-904-0_26.1118.904.0_x64__3k8sg7r9htsxt/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const base = process.env.MANTRALO_PREVIEW_URL || 'http://127.0.0.1:8140/';
const origin = new URL(base).origin;
assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname), 'Only a local preview may be tested');
const freeNames = ['free-kit/free-guide.pdf', 'free-kit/checklist.pdf', 'free-kit/journal.pdf'];
const freePaths = new Set(freeNames.map(name => new URL('assets/' + name, base).pathname));
const report = { time: new Date().toISOString(), base, checks: [], failures: [], errors: [], blockedRequests: [], screenshots: [], requestCount: 0 };
const check = async (name, test) => {
  try { const details = await test(); report.checks.push({ name, ...details }); console.log('PASS ' + name); }
  catch (error) { report.failures.push({ name, error: error.stack }); console.error('FAIL ' + name + ': ' + error.message); }
};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', deviceScaleFactor: 1, serviceWorkers: 'block' });
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      report.requestCount++;
      const reason = !['GET', 'HEAD'].includes(request.method()) ? 'network mutation'
        : url.origin !== origin ? 'external request'
          : /\.pdf$/i.test(url.pathname) && !freePaths.has(url.pathname) ? 'paid or unknown PDF' : null;
      if (reason) { report.blockedRequests.push({ reason, method: request.method(), url: request.url() }); return route.abort(); }
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => report.errors.push({ type: 'javascript', message: error.message }));
    page.on('console', message => { if (message.type() === 'error') report.errors.push({ type: 'console', message: message.text() }); });
    page.on('response', response => { if (response.status() >= 400) report.errors.push({ type: 'http', status: response.status(), url: response.url() }); });
    const loaded = async () => {
      const broken = await page.evaluate(async () => {
        await document.fonts.ready;
        return (await Promise.all([...document.images].map(async image => {
          image.loading = 'eager';
          try { await image.decode(); return null; } catch { return image.getAttribute('src'); }
        }))).filter(Boolean);
      });
      assert.deepEqual(broken, [], 'Image decoding failed');
    };
    const visit = async (route = '/course') => {
      await page.goto(base + '#' + route);
      await page.waitForFunction(expected => document.querySelector('#main')?.dataset.route === expected, route.split('?')[0]);
      await loaded();
    };
    const freshCourse = async () => {
      await visit('/');
      await visit('/course');
      assert.equal(await page.locator('.cl-page').count(), 1, 'The new long course page must be installed');
    };
    const capture = async (name, fullPage = false) => {
      await loaded();
      const filename = path.join(root, 'preview', name + '.png');
      await page.screenshot({ path: filename, fullPage });
      report.screenshots.push(filename);
    };
    const layout = async () => {
      const result = await page.evaluate(() => ({
        width: innerWidth, client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.getAttribute('src')),
        duplicateIds: [...document.querySelectorAll('[id]')].map(element => element.id).filter((id, index, ids) => ids.indexOf(id) !== index)
      }));
      assert.ok(result.scroll <= result.client + 1, 'Horizontal overflow: ' + JSON.stringify(result));
      assert.deepEqual(result.brokenImages, []);
      assert.deepEqual(result.duplicateIds, []);
      return result;
    };
    const targetVisible = async id => {
      await page.waitForFunction(targetId => {
        const target = document.getElementById(targetId);
        if (!target || document.activeElement !== target) return false;
        const box = target.getBoundingClientRect();
        const header = document.getElementById('site-header')?.getBoundingClientRect();
        const sticky = document.querySelector('.cp-mobile-bar');
        const bottom = sticky && getComputedStyle(sticky).display !== 'none' ? sticky.getBoundingClientRect().top : innerHeight;
        return box.top >= Math.max(0, header?.bottom || 0) - 2 && box.top < bottom;
      }, id);
    };
    const closeModal = async () => {
      if (await page.locator('#modal').evaluate(element => element.open)) await page.locator('#modal [data-close]').click();
    };
    const summaryGuard = async () => {
      assert.ok(await page.locator('#modal').evaluate(element => element.open));
      assert.equal(await page.locator('#modal-content').evaluate(element => element.scrollTop), 0);
      assert.equal(await page.locator('#modal form, #modal input[type="checkbox"]').count(), 0, 'No submission or self-approved credit');
      const dialog = await page.locator('#modal').boundingBox();
      assert.ok(dialog.x >= -1 && dialog.x + dialog.width <= page.viewportSize().width + 1, 'Dialog exceeds viewport width');
      const text = await page.locator('#modal').innerText();
      assert.match(text, /ยังไม่มี|ยังไม่ได้|ยังไม่/);
      assert.match(text, /ชำระเงิน/);
      assert.match(text, /เปิดสิทธิ์|เปิดคอร์ส/);
      return text;
    };

    await freshCourse();
    await check('long course sections, exactly 12 lessons and one full-price order action', async () => {
      for (const id of ['cp-story', 'cp-path', 'cp-instructor', 'cp-curriculum', 'cp-pricing', 'cp-lessons']) assert.equal(await page.locator('#' + id).count(), 1, id);
      assert.equal(await page.locator('[data-course-lesson]').count(), 12);
      assert.equal(await page.locator('[data-order="course"]').count(), 1);
      assert.ok(await page.locator('[data-course-credit]').count() >= 1, 'At least one real credit action is required; other CTAs may scroll to pricing');
      assert.equal(await page.locator('[data-course-expand]').getAttribute('aria-controls'), 'cp-lessons');
      const names = await page.locator('[data-course-lesson] summary').allTextContents();
      assert.match(names[0], /พลังงานจักระ/);
      for (let chakra = 1; chakra <= 7; chakra++) assert.match(names[chakra], new RegExp('จักระที่\\s*' + chakra));
      assert.match(names[8], /เข้าถึง.*รับพลังงาน/);
      assert.match(names[9], /ควบคุมพลังงาน/);
      assert.match(names[10], /สมาธิ/);
      assert.match(names[11], /ภาษาสี/);
      assert.ok(await page.locator('#cp-instructor img[src="assets/instructor-wannapa.png"]').count() > 0, 'Verified instructor portrait required');
      assert.ok(await page.locator('#main img[src="assets/book-new-edition.png"]').count() > 0, 'Approved original book cover required');
      assert.match(await page.locator('#cp-instructor').innerText(), /วรรณนภา.*ประจักษ์ทิพย์/s);
      return { lessons: names.map(name => name.trim().replace(/\s+/g, ' ')) };
    });

    for (const width of [360, 390, 768, 1440]) {
      await check('long-page layout and decoded images at ' + width, async () => {
        await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
        await freshCourse();
        const result = await layout();
        await page.evaluate(() => scrollTo(0, 0));
        if ([390, 1440].includes(width)) await capture('course-long-' + width + '-full', true);
        if (width === 1440) await capture('course-long-1440-hero');
        if (width === 390) {
          for (const [id, name] of [['cp-pricing', 'pricing'], ['cp-instructor', 'teacher']]) {
            await page.locator('#' + id).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
            await capture('course-long-390-' + name);
          }
        }
        return result;
      });
    }

    for (const width of [360, 1440]) {
      await check('every visible section button scrolls and focuses its target at ' + width, async () => {
        await page.setViewportSize({ width, height: width === 360 ? 844 : 1000 });
        await freshCourse();
        const controls = page.locator('[data-course-scroll]');
        const targets = [];
        for (let index = 0; index < await controls.count(); index++) {
          const button = controls.nth(index);
          if (!await button.isVisible()) continue;
          const id = await button.getAttribute('data-course-scroll');
          assert.ok(id && await page.locator('#' + id).count() === 1, 'Invalid scroll destination');
          await button.click();
          await targetVisible(id);
          targets.push(id);
        }
        assert.ok(targets.includes('cp-curriculum'));
        assert.ok(targets.includes('cp-pricing'));
        return { targets };
      });
    }

    await check('all 12 lesson accordions respond to Enter and Space', async () => {
      await freshCourse();
      const lessons = page.locator('[data-course-lesson]');
      for (let index = 0; index < 12; index++) {
        const lesson = lessons.nth(index);
        const initiallyOpen = await lesson.evaluate(element => element.open);
        await lesson.locator('summary').focus();
        await lesson.locator('summary').press('Enter');
        assert.equal(await lesson.evaluate(element => element.open), !initiallyOpen);
        await lesson.locator('summary').press('Space');
        assert.equal(await lesson.evaluate(element => element.open), initiallyOpen);
      }
    });
    await check('expand-all, individual changes and collapse-all maintain accurate state', async () => {
      await freshCourse();
      const all = page.locator('[data-course-expand]');
      if (await page.locator('[data-course-lesson][open]').count() === 12) await all.click();
      await all.focus();
      await all.press('Enter');
      assert.equal(await page.locator('[data-course-lesson][open]').count(), 12);
      assert.equal(await all.getAttribute('aria-expanded'), 'true');
      await page.locator('[data-course-lesson] summary').first().press('Space');
      await page.waitForFunction(() => document.querySelector('[data-course-expand]').getAttribute('aria-expanded') === 'false');
      assert.equal(await page.locator('[data-course-lesson][open]').count(), 11);
      await all.click();
      assert.equal(await page.locator('[data-course-lesson][open]').count(), 12);
      await all.press('Space');
      assert.equal(await page.locator('[data-course-lesson][open]').count(), 0);
      assert.equal(await all.getAttribute('aria-expanded'), 'false');
    });
    await check('FAQ answers are keyboard-operable and contain access and purchase conditions', async () => {
      await freshCourse();
      const answers = page.locator('.cl-page details:not([data-course-lesson])');
      assert.ok(await answers.count() >= 4, 'FAQ is missing');
      for (let index = 0; index < await answers.count(); index++) {
        const answer = answers.nth(index);
        const initiallyOpen = await answer.evaluate(element => element.open);
        await answer.locator('summary').focus();
        await answer.locator('summary').press('Enter');
        assert.equal(await answer.evaluate(element => element.open), !initiallyOpen);
        await answer.locator('summary').press('Space');
        assert.equal(await answer.evaluate(element => element.open), initiallyOpen);
      }
      const text = (await answers.allTextContents()).join(' ');
      assert.match(text, /ระยะเวลา|เรียนได้นาน/);
      assert.match(text, /ตรวจสอบ/);
      assert.match(text, /ค่าส่ง|ค่าจัดส่ง/);
      assert.match(text, /Starter|อีบุ๊ก/);
    });

    for (const width of [390, 1440]) {
      await check('full course 2900 and each conditional credit action at ' + width, async () => {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
        await freshCourse();
        const order = page.locator('[data-order="course"]');
        await order.click();
        const full = await summaryGuard();
        assert.match(await page.locator('#modal .order-price').innerText(), /2,900/);
        assert.match(full, /12 บทเรียน/);
        assert.match(full, /E-book 7 วัน 7 จักระฉบับเต็ม/);
        assert.match(full, /ไม่รวมอีบุ๊กอีก 7 เล่มหรือหนังสือเล่ม/);
        assert.match(full, /ระยะเวลาเข้าถึง.*รอยืนยัน/s);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#modal').evaluate(element => element.open), false);
        assert.ok(await order.evaluate(element => element === document.activeElement));
        const credits = page.locator('[data-course-credit]');
        for (let index = 0; index < await credits.count(); index++) {
          const trigger = credits.nth(index);
          if (!await trigger.isVisible()) continue;
          await trigger.click();
          const text = await summaryGuard();
          assert.match(text, /2,610/);
          assert.match(text, /2,900/);
          assert.match(text, /290/);
          assert.match(text, /ยังไม่ได้ยืนยันสิทธิ์/);
          assert.match(text, /ตรวจสอบ/);
          assert.match(text, /หนึ่งครั้ง/);
          assert.match(text, /ไม่รวมค่าจัดส่งและสินค้าเพิ่ม/);
          assert.match(text, /เครดิตไม่เต็ม.*สูงกว่า/s);
          await page.locator('#modal-content').evaluate(element => element.scrollTop = element.scrollHeight);
          const close = await page.locator('#modal [data-close]').boundingBox();
          assert.ok(close.y >= 0 && close.y + close.height <= page.viewportSize().height, 'Dialog close must stay visible');
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#modal').evaluate(element => element.open), false);
          assert.ok(await trigger.evaluate(element => element === document.activeElement));
        }
      });
    }

    await check('book, ebook extension, free practice and free-document links work', async () => {
      for (const [href, route] of [['#/book', '/book'], ['#/ebooks?offer=complete-seven', '/ebooks'], ['#/start', '/start'], ['#/library?section=free', '/library']]) {
        await freshCourse();
        const destination = page.locator('.cl-page a[href="' + href + '"]').first();
        assert.ok(await destination.count(), 'Missing customer route ' + href);
        await destination.click();
        await page.waitForFunction(expected => document.querySelector('#main')?.dataset.route === expected, route);
        assert.equal(new URL(page.url()).hash, href);
        if (route === '/book') assert.ok(await page.locator('[data-format="paper"]').count());
        if (route === '/ebooks') assert.ok(await page.locator('[data-offer-card="complete-seven"]').count());
        if (route === '/start') assert.ok(await page.locator('[data-timer="start"]').count());
        if (route === '/library') {
          await page.waitForFunction(() => document.activeElement?.id === 'free-library-heading');
          for (const name of freeNames) {
            assert.equal(await page.locator('a[download][href="assets/' + name + '"]').count(), 1);
            const response = await context.request.get(new URL('assets/' + name, base).href, { maxRedirects: 0 });
            assert.equal(response.status(), 200);
            assert.equal((await response.body()).subarray(0, 4).toString(), '%PDF');
          }
        }
      }
      await freshCourse();
      const bridge = page.locator('.eo-bridge');
      assert.equal(await bridge.count(), 1);
      assert.match(await bridge.innerText(), /800/);
      assert.match(await bridge.innerText(), /ไม่ซื้อเล่มเดิมซ้ำ/);
      assert.match(await bridge.innerText(), /ไม่เพิ่มเครดิตคอร์ส/);
    });

    for (const width of [360, 390]) {
      await check('mobile menu, pricing bar and footer remain usable at ' + width, async () => {
        await page.setViewportSize({ width, height: 844 });
        await freshCourse();
        await page.evaluate(() => scrollTo(0, 0));
        await page.locator('#menu-toggle').click();
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
        assert.ok(await page.locator('#main-nav').isVisible());
        await page.locator('#main-nav a[href="#/book"]').click();
        await page.waitForFunction(() => document.querySelector('#main')?.dataset.route === '/book');
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
        await visit('/course');
        const sticky = page.locator('.cp-mobile-bar');
        assert.ok(await sticky.isVisible());
        await sticky.locator('[data-course-scroll="cp-pricing"]').click();
        await targetVisible('cp-pricing');
        await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
        const footerBox = await page.locator('.footer-bottom').boundingBox();
        const stickyBox = await sticky.boundingBox();
        assert.ok(footerBox.y + footerBox.height <= stickyBox.y + 1, 'Fixed course CTA covers the footer');
        assert.ok(stickyBox.x >= -1 && stickyBox.x + stickyBox.width <= width + 1);
        assert.ok(stickyBox.y >= 0 && stickyBox.y + stickyBox.height <= 845);
        await layout();
      });
    }

    await check('no placeholder links, fake media player, countdown or testimonial widgets', async () => {
      await freshCourse();
      const links = await page.locator('.cl-page a').evaluateAll(nodes => nodes.map(node => ({ href: node.getAttribute('href'), label: node.textContent.trim() })));
      const knownRoutes = new Set(['/', '/start', '/book', '/course', '/library', '/ebooks', '/free-kit', '/lesson-sample']);
      for (const link of links) {
        assert.ok(link.href && link.href !== '#', 'Dead link: ' + link.label);
        assert.ok(!/^(javascript|vbscript):/i.test(link.href), 'Executable link: ' + link.label);
        if (link.href.startsWith('#/')) assert.ok(knownRoutes.has(link.href.slice(1).split('?')[0]), 'Unknown internal route: ' + link.href);
        else if (link.href.startsWith('#')) assert.equal(await page.locator('[id="' + link.href.slice(1) + '"]').count(), 1);
        const url = new URL(link.href, base);
        if (/\.pdf$/i.test(url.pathname)) assert.ok(url.origin === origin && freePaths.has(url.pathname), 'Full paid PDF exposed');
      }
      const fakeSelectors = 'video, audio, iframe, [data-play-video], [data-video-play], button[aria-label*="เล่นวิดีโอ"], [data-countdown], .countdown, .testimonial, [data-testimonial]';
      assert.equal(await page.locator('.cl-page').locator(fakeSelectors).count(), 0);
      assert.equal(await page.locator('.cl-page form').count(), 0);
      const text = await page.locator('.cl-page').innerText();
      assert.doesNotMatch(text, /เหลือเวลา\s*\d|ผู้เรียนกว่า\s*[\d,]+|รีวิว\s*5\s*ดาว/);
      return { checkedLinks: links.length, remoteLinksNotOpened: links.filter(link => /^https?:/.test(link.href)).length };
    });
    await check('no browser errors, failed assets, remote requests or network mutation', async () => {
      assert.deepEqual(report.errors, []);
      assert.deepEqual(report.blockedRequests, []);
      return { requestCount: report.requestCount, externalRequests: 0, commerceSubmissions: 0, paidPdfRequests: 0 };
    });
  } catch (error) {
    report.failures.push({ name: 'test setup or new course availability', error: error.stack });
    console.error(error);
  } finally {
    if (browser) await browser.close();
    report.status = report.failures.length ? 'failed' : 'passed';
    if (report.failures.length) process.exitCode = 1;
    fs.writeFileSync(path.join(__dirname, 'course-long-report.json'), JSON.stringify(report, null, 2));
    console.log(report.status.toUpperCase() + ': ' + report.checks.length + ' checks; ' + report.failures.length + ' failures');
  }
})();
