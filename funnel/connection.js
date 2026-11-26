/* Public navigation only. No requests, scoring, contacts, payments, or entitlements. */
(() => {
  'use strict';
  const actions = Object.freeze({
    book: { label: 'เปิดขั้นตอนสั่งซื้อหนังสือ', actionType: 'order_navigation' },
    digital: { label: 'เปิดขั้นตอนสั่งซื้อฉบับดิจิทัล', actionType: 'order_navigation' },
    course: { label: 'เปิดขั้นตอนสมัครคอร์ส', actionType: 'order_navigation' },
    upgrade: { label: 'ไปหน้าขอตรวจเครดิต', actionType: 'verification_request_navigation' }
  });
  const systemLinks = Object.freeze({ orderStatus: 'เปิดสถานะคำสั่งซื้อในระบบเดิม', memberLibrary: 'เปิดคลังสื่อที่มีสิทธิ์', courseDashboard: 'เปิดห้องเรียนในระบบเดิม' });
  const queryKeys = new Set(['lang', 'locale', 'productId', 'variantId', 'sku']);
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const onlyKeys = (value, allowed) => record(value) && Object.keys(value).every(key => allowed.includes(key));
  const empty = () => ({ schemaVersion: 1, mode: 'inquiry', actions: {}, systemLinks: {} });
  const result = (state, reason, info = {}, url = '') => Object.freeze({ state, reason, url, ...info });

  function configuration() {
    const config = window.MANTRALO_FUNNEL_CONFIG === undefined ? empty() : window.MANTRALO_FUNNEL_CONFIG;
    if (!onlyKeys(config, ['schemaVersion', 'mode', 'actions', 'systemLinks']) || config.schemaVersion !== 1 || !['inquiry', 'connected'].includes(config.mode)) return null;
    if (!onlyKeys(config.actions, Object.keys(actions)) || !onlyKeys(config.systemLinks, Object.keys(systemLinks))) return null;
    if ([...Object.values(config.actions), ...Object.values(config.systemLinks)].some(value => typeof value !== 'string')) return null;
    return config;
  }

  function checkedUrl(value, kind) {
    if (!value) return { state: 'unconfigured', reason: 'missing_url' };
    if (/[<>"'\s]/.test(value)) return { state: 'invalid', reason: 'invalid_url' };
    let url;
    try { url = new URL(value); } catch { return { state: 'invalid', reason: 'invalid_url' }; }
    const host = url.hostname.toLowerCase().replace(/\.$/, '');
    if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || host.startsWith('[') || /^\d+(?:\.\d+){3}$/.test(host) || /(^|\.)(?:localhost|local|internal|test|invalid|example|example\.com|example\.org|example\.net)$/.test(host)) return { state: 'invalid', reason: 'public_https_required' };
    const seen = new Set();
    for (const [key, value] of url.searchParams) {
      if (!queryKeys.has(key) || seen.has(key) || !/^[A-Za-z0-9_-]{1,100}$/.test(value)) return { state: 'invalid', reason: 'unsupported_query' };
      seen.add(key);
    }
    // A route fragment is allowed; credentials, eligibility and payment parameters are not.
    if (url.hash && !/^#\/[A-Za-z0-9/_-]*$/.test(url.hash)) return { state: 'invalid', reason: 'unsupported_fragment' };
    let path;
    try { path = decodeURIComponent(url.pathname).toLowerCase().replace(/\/+$/, ''); }
    catch { return { state: 'invalid', reason: 'invalid_url' }; }
    if (/%[0-9a-f]{2}/i.test(path) || /[\\\u0000-\u001f\u007f]/.test(path)) return { state: 'invalid', reason: 'ambiguous_encoded_path' };
    const legacyPurchase = /(?:^|\.)emcthai\.com$/.test(host) && /\/(?:course-purchase|course-purchase-basic-awaken-chakra-7-days|course-purchase-advance-chakra)$/.test(path);
    if (legacyPurchase) return { state: 'invalid', reason: 'legacy_offer_endpoint' };
    if (kind === 'upgrade' && /(?:^|\/)(?:checkout|cart|pay|payment|course-purchase[^/]*)(?:\/|$)/i.test(`${path}/${url.hash.slice(1)}`)) return { state: 'invalid', reason: 'upgrade_requires_review_page' };
    return { state: 'configured', reason: null, url: url.href };
  }

  function resolve(kind, table, section) {
    if (!Object.hasOwn(table, kind)) return result('invalid', 'unsupported_action');
    const info = section === 'actions' ? table[kind] : { label: table[kind], actionType: 'existing_system_navigation' };
    const config = configuration();
    if (!config) return result('invalid', 'unsupported_configuration', info);
    const checked = checkedUrl(config[section][kind] || '', kind);
    if (checked.state === 'invalid') return result('invalid', checked.reason, info);
    if (config.mode !== 'connected') return result('unconfigured', 'inquiry_mode', info);
    return result(checked.state, checked.reason, info, checked.url || '');
  }

  window.MANTRALO_FUNNEL = Object.freeze({
    resolveAction: kind => resolve(kind, actions, 'actions'),
    resolveSystemLink: kind => resolve(kind, systemLinks, 'systemLinks')
  });
})();
