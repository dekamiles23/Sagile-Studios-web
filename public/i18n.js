(() => {
  const LANGS = { 'pt-BR': '🇧🇷 PT', 'en-US': '🇺🇸 EN' };
  const DEFAULT = 'pt-BR';

  let translations = {};
  let currentLang = localStorage.getItem('sg_lang') || DEFAULT;

  async function loadLang(lang) {
    try {
      const res = await fetch(`languages/${lang}.json`);
      translations = await res.json();
    } catch (e) {
      translations = {};
    }
  }

  function t(key) {
    return translations[key] || key;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    const btn = document.getElementById('langToggleBtn');
    if (btn) btn.textContent = LANGS[currentLang];
  }

  function createDropdown() {
    const wrapper = document.createElement('div');
    wrapper.id = 'langSwitcher';
    wrapper.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 20px;
      z-index: 99999;
      font-family: inherit;
    `;

    const btn = document.createElement('button');
    btn.id = 'langToggleBtn';
    btn.textContent = LANGS[currentLang];
    btn.style.cssText = `
      background: rgba(10,10,25,0.92);
      border: 1px solid rgba(122,92,255,0.5);
      color: white;
      padding: 8px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: bold;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 16px rgba(122,92,255,0.3);
      transition: 0.2s;
      white-space: nowrap;
    `;

    const menu = document.createElement('div');
    menu.id = 'langMenu';
    menu.style.cssText = `
      display: none;
      position: absolute;
      bottom: calc(100% + 8px);
      left: 0;
      background: rgba(10,10,25,0.96);
      border: 1px solid rgba(122,92,255,0.4);
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 20px rgba(122,92,255,0.25);
      min-width: 120px;
    `;

    Object.entries(LANGS).forEach(([code, label]) => {
      const opt = document.createElement('button');
      opt.textContent = label;
      opt.dataset.lang = code;
      opt.style.cssText = `
        display: block;
        width: 100%;
        padding: 10px 16px;
        background: transparent;
        border: none;
        color: white;
        font-size: 13px;
        cursor: pointer;
        text-align: left;
        transition: 0.2s;
      `;
      opt.addEventListener('mouseenter', () => opt.style.background = 'rgba(122,92,255,0.2)');
      opt.addEventListener('mouseleave', () => opt.style.background = 'transparent');
      opt.addEventListener('click', async () => {
        currentLang = code;
        localStorage.setItem('sg_lang', code);
        menu.style.display = 'none';
        await loadLang(currentLang);
        applyTranslations();
      });
      menu.appendChild(opt);
    });

    btn.addEventListener('click', e => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => { menu.style.display = 'none'; });

    wrapper.appendChild(menu);
    wrapper.appendChild(btn);
    document.body.appendChild(wrapper);
  }

  async function init() {
    await loadLang(currentLang);
    createDropdown();
    applyTranslations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.i18n = { t };
})();
