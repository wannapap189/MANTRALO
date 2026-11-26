import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isIP } from 'node:net';
import vm from 'node:vm';

export const funnelDir = dirname(fileURLToPath(import.meta.url));
export const siteDir = resolve(funnelDir, '..');
export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
export const scriptJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
export const scriptSource = value => value.replace(/<\/script/gi, '<\\/script');
export const outcomeLabel = outcome => outcome === 'balance' ? 'แนวโน้มสมดุล' : 'ชวนกลับมาดูแล';

export async function loadPackage() {
  const [mapText, contentSource, rendererSource, resultCss, fontCss] = await Promise.all([
    readFile(resolve(funnelDir, 'route-map.json'), 'utf8'),
    readFile(resolve(siteDir, 'result-content.js'), 'utf8'),
    readFile(resolve(siteDir, 'result-page.js'), 'utf8'),
    readFile(resolve(siteDir, 'result-page.css'), 'utf8'),
    readFile(resolve(siteDir, 'assets/fonts.css'), 'utf8')
  ]);
  const map = JSON.parse(mapText.replace(/^\uFEFF/, ''));
  if (map.routes?.length !== 14 || new Set(map.routes.map(route => route.url)).size !== 14 || new Set(map.routes.map(route => route.pageId)).size !== 14) throw new Error('Expected 14 unique original result routes and page IDs.');
  const context = { window: {}, URL };
  vm.runInNewContext(contentSource, context, { timeout: 1000 });
  vm.runInNewContext(rendererSource, context, { timeout: 1000 });
  const content = context.window.MANTRALO_RESULT_CONTENT;
  if (content?.chakras?.length !== 7 || typeof context.window.MANTRALO_RESULT?.render !== 'function') throw new Error('Content/renderer is not ready.');
  for (const route of map.routes) {
    if (!Number.isInteger(route.chakra) || route.chakra < 1 || route.chakra > 7 || !['balance', 'unbalance'].includes(route.outcome)) throw new Error('Invalid chakra/outcome.');
    if (route.url !== `${map.origin}${route.path}` || route.path !== `/result-chakra${route.chakra}-${route.outcome}`) throw new Error('Original route mismatch.');
    if (!content.chakras.find(chakra => chakra.id === route.chakra)?.outcomes?.[route.outcome]) throw new Error(`Missing content: ${route.path}`);
  }
  return { map, content, contentSource, rendererSource, resultCss, fontCss, render: context.window.MANTRALO_RESULT.render };
}

export function publicHttps(value, label, { assetDirectory = false, salesPage = false } = {}) {
  if (typeof value !== 'string' || !value.trim() || /[<>"'\r\n]/.test(value)) throw new Error(`${label}: supply an absolute public HTTPS URL.`);
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label}: invalid absolute URL.`); }
  const host = url.hostname.toLowerCase().replace(/\.$/, '');
  if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || isIP(host) || host.startsWith('[') || /(^|\.)(localhost|local|internal|test|invalid|example|example\.com|example\.org|example\.net)$/.test(host)) throw new Error(`${label}: public HTTPS host required; local addresses and placeholders are not accepted.`);
  let canonicalPath, canonicalFragment;
  try {
    canonicalPath = decodeURIComponent(url.pathname);
    canonicalFragment = decodeURIComponent(url.hash.slice(1));
  } catch { throw new Error(`${label}: malformed encoded path or fragment.`); }
  if ([canonicalPath, canonicalFragment].some(value => /%[0-9a-f]{2}/i.test(value) || /[\\\u0000-\u001f\u007f]/.test(value))) throw new Error(`${label}: ambiguous encoded path or fragment.`);
  if (salesPage && /(?:^|\/)(?:checkout|course-purchase(?:-[^/]*)?|cart)(?:\/|$|\?)/i.test(`${canonicalPath}/${canonicalFragment}`)) throw new Error(`${label}: use the confirmed sales page, not a legacy checkout/cart URL.`);
  if (assetDirectory) {
    if (url.search || url.hash) throw new Error(`${label}: the asset directory must not contain a query or fragment.`);
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  }
  return url.href;
}

export function validateProductionConfig(config, map) {
  const assetBase = publicHttps(config.publicAssetBaseUrl, 'publicAssetBaseUrl', { assetDirectory: true });
  const links = Object.fromEntries(['book', 'course', 'guide'].map(key => [key, publicHttps(config.links?.[key], `links.${key}`, { salesPage: true })]));
  if (config.links?.quiz && config.links.quiz !== map.quizUrl) throw new Error('links.quiz must preserve the original quiz URL.');
  links.quiz = map.quizUrl;
  const videoUrls = config.videoUrls ?? {};
  if (!videoUrls || Array.isArray(videoUrls) || typeof videoUrls !== 'object') throw new Error('videoUrls must be an object keyed by original result slug.');
  const allowed = new Set(map.routes.map(route => route.path.slice(1)));
  for (const [key, value] of Object.entries(videoUrls)) {
    if (!allowed.has(key)) throw new Error(`Unknown video route: ${key}`);
    if (value) videoUrls[key] = publicHttps(value, `videoUrls.${key}`);
  }
  return { assetBase, links, videoUrls };
}

export function bootstrap(rootId, options) {
  return `(() => {\n  'use strict';\n  const root = document.getElementById(${scriptJson(rootId)});\n  const api = window.MANTRALO_RESULT;\n  if (!root || !api || !window.MANTRALO_RESULT_CONTENT) return;\n  if (typeof root.mantraloCleanup === 'function') root.mantraloCleanup();\n  root.innerHTML = api.render(${scriptJson(options)});\n  root.mantraloCleanup = api.mount(root);\n})();`;
}
