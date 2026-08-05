(() => {
  'use strict';
  const allowedUtm = ['utm_source','utm_medium','utm_campaign','utm_content'];
  const params = new URLSearchParams(window.location.search);
  const stored = JSON.parse(sessionStorage.getItem('apropos_campaign') || '{}');
  allowedUtm.forEach((key) => { if (params.get(key)) stored[key] = params.get(key); });
  sessionStorage.setItem('apropos_campaign', JSON.stringify(stored));

  window.dataLayer = window.dataLayer || [];
  window.aproposAnalytics = window.aproposAnalytics || {
    track(event, detail = {}) {
      const payload = { event, page_path: location.pathname, ...stored, ...detail };
      window.dataLayer.push(payload);
      window.dispatchEvent(new CustomEvent('apropos:analytics', { detail: payload }));
      return payload;
    }
  };

  const seen = localStorage.getItem('apropos_marketplace_seen');
  window.aproposAnalytics.track(seen ? 'returning_visitor' : 'first_time_visitor');
  localStorage.setItem('apropos_marketplace_seen', new Date().toISOString());

  const medium = stored.utm_medium || params.get('utm_medium');
  if (medium === 'qr') window.aproposAnalytics.track('qr_traffic');
  if (medium === 'nfc') window.aproposAnalytics.track('nfc_traffic');
  if (document.body.classList.contains('event-page')) window.aproposAnalytics.track('event_page_visit');

  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', () => {
      const href = element.getAttribute('href') || '';
      const outbound = /^https?:\/\//.test(href) && !href.startsWith(location.origin);
      window.aproposAnalytics.track(element.dataset.track, {
        link_url: href,
        link_text: element.textContent.trim().replace(/\s+/g, ' '),
        outbound
      });
      if (outbound) window.aproposAnalytics.track('outbound_platform_click', { link_url: href });
    });
  });

  document.querySelectorAll('form[data-track-form]').forEach((form) => {
    allowedUtm.forEach((key) => {
      const field = form.querySelector(`[data-utm-field="${key}"]`);
      if (field) field.value = stored[key] || '';
    });
    form.addEventListener('submit', () => window.aproposAnalytics.track('form_completion', { form_name: form.dataset.trackForm }));
  });

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-primary-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }
  document.querySelectorAll('[data-current-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
})();
