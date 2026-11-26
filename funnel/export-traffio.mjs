import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { funnelDir, loadPackage, validateProductionConfig, escapeHtml, scriptSource, bootstrap } from './package-utils.mjs';

const configPath = process.argv[2];
if (!configPath) throw new Error('Usage: node export-traffio.mjs <production-config.json> [output-directory]. Supply confirmed public HTTPS asset/sales URLs first.');
const { map, contentSource, rendererSource, resultCss, fontCss, render } = await loadPackage();
const config = JSON.parse((await readFile(resolve(configPath), 'utf8')).replace(/^\uFEFF/, ''));
// Validate all values before creating any production output. No API or remote requests.
const { assetBase, links, videoUrls } = validateProductionConfig(config, map);
const outputDir = process.argv[3] ? resolve(process.argv[3]) : resolve(funnelDir, 'production-export');
const absoluteFonts = fontCss.replace(/url\(([^)]+)\)/g, (_, path) => `url(${JSON.stringify(new URL(path.trim().replace(/^['"]|['"]$/g, ''), assetBase).href)})`);
const manifest = {
  schemaVersion: 1, generatedAt: new Date().toISOString(), published: false,
  purpose: 'Display-only snippets for the existing 14 pages; not a native builder import or API payload.',
  builderScriptCapability: 'unverified', publicAssetBaseUrl: assetBase, links,
  preserves: ['existing URLs/page IDs/funnel IDs', 'forms and scores', 'server result routing', 'contacts and tags', 'member access and credit verification'],
  sourceSha256: { content: createHash('sha256').update(contentSource).digest('hex'), renderer: createHash('sha256').update(rendererSource).digest('hex'), css: createHash('sha256').update(resultCss).digest('hex') },
  requiredHostedAssets: ['logo.png', 'book-new-edition.png', ...new Set([...fontCss.matchAll(/url\(([^)]+)\)/g)].map(match => match[1].trim().replace(/^['"]|['"]$/g, '').replace(/^\.\//, '')))],
  routes: []
};
const snippets = [];
for (const route of map.routes) {
  const slug = route.path.slice(1);
  const rootId = `mantralo-result-${route.pageId}`;
  const options = { chakra: route.chakra, outcome: route.outcome, preview: false, links, assetBase, videoUrl: videoUrls[slug] || '' };
  const rendered = render(options);
  const snippet = `<!-- MANTRALO display-only | original URL: ${escapeHtml(route.url)} | pageId: ${route.pageId} | funnelId: ${route.funnelId}
Builder HTML/script support is unverified. Preserve native form/score/contact/member blocks. -->
<style>${absoluteFonts}\n${resultCss}</style>
<div id="${rootId}" data-mantralo-page-id="${route.pageId}" data-mantralo-funnel-id="${route.funnelId}">${rendered}</div>
<script>${scriptSource(contentSource)}</script>
<script>${scriptSource(rendererSource)}</script>
<script>${scriptSource(bootstrap(rootId, options))}</script>\n`;
  snippets.push({ file: `${slug}.html`, snippet });
  manifest.routes.push({ url: route.url, path: route.path, pageId: route.pageId, funnelId: route.funnelId, chakra: route.chakra, outcome: route.outcome, file: `${slug}.html`, sha256: createHash('sha256').update(snippet).digest('hex') });
}
await mkdir(outputDir, { recursive: true });
for (const item of snippets) await writeFile(resolve(outputDir, item.file), item.snippet, 'utf8');
await writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`Exported ${snippets.length} display snippets and manifest to ${outputDir}. Not uploaded or installed; builder script support remains unverified.`);
