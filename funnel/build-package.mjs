import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { funnelDir, siteDir, loadPackage, escapeHtml, outcomeLabel, bootstrap } from './package-utils.mjs';

const { map, content, render } = await loadPackage();
await Promise.all(['logo.png', 'book-new-edition.png', 'fonts.css'].map(file => access(resolve(siteDir, 'assets', file))));
const outputDir = resolve(funnelDir, 'preview');
await mkdir(outputDir, { recursive: true });
const shellCss = `body{margin:0;background:#fffcfa;font-family:Manrope,'Noto Sans Thai',Tahoma,sans-serif;color:#30144b}.local-header{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px max(20px,calc((100% - 1160px)/2));background:#fff;border-bottom:1px solid #eadff1}.local-header img{display:block;width:155px;height:62px;object-fit:contain}.local-header nav{display:flex;gap:16px;flex-wrap:wrap}.local-header a{color:#6023a2;text-decoration:none;font-size:14px}.local-demo{padding:14px 20px;background:#f1e8fb;color:#5f3980;font-size:13px;line-height:1.8;text-align:center}.local-demo code{font-size:12px;overflow-wrap:anywhere}.local-demo p{margin:0}.local-fallback{padding:30px;text-align:center}@media(max-width:600px){.local-header{padding:12px 18px;gap:12px}.local-header img{width:120px;height:48px}.local-header nav{gap:8px;flex-direction:column;font-size:13px}}`;

for (const route of map.routes) {
  const slug = route.path.slice(1);
  const chakra = content.chakras.find(item => item.id === route.chakra);
  const rootId = `mantralo-result-${route.pageId}`;
  const options = {
    chakra: route.chakra, outcome: route.outcome, preview: false,
    links: { book: '../../index.html#/book', course: '../../index.html#/course', guide: '../../index.html#/library', quiz: map.quizUrl },
    assetBase: '../../assets/', videoUrl: ''
  };
  // Render once during generation so the local review stays readable without JavaScript.
  const markup = render(options);
  if (!markup.includes('class="mr-page"')) throw new Error(`Renderer did not produce a result page: ${slug}`);
  const page = `<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ตัวอย่าง ${escapeHtml(chakra.name)} · ${outcomeLabel(route.outcome)} | MANTRALO</title><link rel="stylesheet" href="../../assets/fonts.css"><link rel="stylesheet" href="../../result-page.css"><style>${shellCss}</style></head>
<body><header class="local-header"><a href="../../index.html#/" aria-label="กลับหน้าเว็บ MANTRALO ในเครื่อง"><img src="../../assets/logo.png" alt="MANTRALO"></a><nav aria-label="นำทางตัวอย่าง"><a href="../review-index.html">ดูตัวอย่างทั้ง 14 หน้า</a><a href="../../index.html#/result?chakra=${route.chakra}&amp;outcome=${route.outcome}">กลับหน้าเว็บในเครื่อง</a></nav></header>
<aside class="local-demo"><p><strong>ตัวอย่างในเครื่อง · ยังไม่เผยแพร่</strong> จักระ ${route.chakra} · ${outcomeLabel(route.outcome)} · ไม่ใช่ผลจากการส่งคำตอบ</p><p>หน้าเดิม <code>${escapeHtml(route.path)}</code> · page ID ${route.pageId} · funnel ID ${route.funnelId}</p></aside>
<main id="${rootId}">${markup}</main>
<script src="../../result-content.js"></script><script src="../../result-page.js"></script><script>${bootstrap(rootId, options)}</script></body></html>\n`;
  await writeFile(resolve(outputDir, `${slug}.html`), page, 'utf8');
}

const cards = content.chakras.map(chakra => `<section class="review-card" style="--accent:${escapeHtml(chakra.color)}"><span class="review-number">${chakra.id}</span><h2>${escapeHtml(chakra.name)}</h2><p>${escapeHtml(chakra.theme)}</p><div>${map.routes.filter(route => route.chakra === chakra.id).map(route => `<a href="preview/${route.path.slice(1)}.html">${outcomeLabel(route.outcome)} <small>page ID ${route.pageId}</small></a>`).join('')}</div></section>`).join('\n');
await writeFile(resolve(funnelDir, 'review-index.html'), `<!doctype html>
<html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>ตรวจตัวอย่างผลจักระ 14 หน้า | MANTRALO</title><link rel="stylesheet" href="../assets/fonts.css"><style>${shellCss}.review-wrap{max-width:1160px;padding:42px 24px 64px;margin:auto}.review-wrap h1{font-size:clamp(28px,4vw,44px);line-height:1.45;margin:0 0 14px}.review-lead{max-width:760px;color:#756080;line-height:1.9}.review-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;margin-top:30px}.review-card{border:1px solid #eadff1;border-top:5px solid var(--accent);border-radius:18px;padding:24px;background:white}.review-number{color:var(--accent);font-size:32px;font-weight:700}.review-card h2{font-size:22px;margin:10px 0}.review-card p{font-size:14px;color:#756080;line-height:1.7;min-height:48px}.review-card a{display:block;padding:13px 14px;border:1px solid #e8dcee;border-radius:10px;margin-top:10px;color:#6023a2;text-decoration:none;font-size:15px}.review-card small{display:block;color:#88718f;font-size:12px}.review-card a:hover{background:#f8f2fd}.review-wrap a:focus-visible{outline:3px solid #9b68d4;outline-offset:3px}@media(max-width:900px){.review-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){.review-grid{grid-template-columns:1fr}.review-wrap{padding:30px 18px}.review-card p{min-height:0}}</style></head><body><header class="local-header"><a href="../index.html#/"><img src="../assets/logo.png" alt="MANTRALO"></a><nav><a href="../index.html#/result">กลับหน้าเว็บในเครื่อง</a></nav></header><main class="review-wrap"><h1>7 จักระ · 14 หน้าผล</h1><p class="review-lead">ชุดตัวอย่างสำหรับตรวจการแสดงผลบนเส้นทาง Funnel เดิม ทุกหน้าใช้เนื้อหาและ renderer ชุดเดียวกัน ยังไม่ได้เผยแพร่ ไม่คำนวณคะแนน และไม่ส่งข้อมูลลูกค้า</p><div class="review-grid">${cards}</div></main></body></html>\n`, 'utf8');
console.log(`Built ${map.routes.length} local previews and funnel/review-index.html. No production export or network requests.`);
