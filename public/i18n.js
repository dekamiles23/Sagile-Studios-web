// i18n.js - Sistema de tradução global
(function() {
  const SUPPORTED = ['pt-br', 'en-US'];
  const DEFAULT   = 'pt-br';

  function getLang() {
    return localStorage.getItem('sagile_lang') || DEFAULT;
  }

  function setLang(lang) {
    localStorage.setItem('sagile_lang', lang);
  }

  async function loadTranslations(lang) {
    try {
      const res = await fetch(`/languages/${lang}.json`);
      return await res.json();
    } catch(e) {
      return null;
    }
  }

  function applyTranslations(t) {
    // aplica em todos os elementos com data-i18n="chave.subchave"
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = key.split('.').reduce((o, k) => o && o[k], t);
      if (val !== undefined) el.textContent = val;
    });

    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const val = key.split('.').reduce((o, k) => o && o[k], t);
      if (val !== undefined) el.placeholder = val;
    });

    // title da página
    const pageKey = document.body.getAttribute('data-page');
    if (pageKey && t[pageKey] && t[pageKey].title) {
      document.title = t[pageKey].title;
    }

    // atualiza lang do html
    document.documentElement.lang = getLang() === 'en-US' ? 'en' : 'pt-br';
  }

  async function init() {
    const lang = getLang();
    const t = await loadTranslations(lang);
    if (t) applyTranslations(t);

    // atualiza o seletor se existir
    const sel = document.getElementById('langSelector');
    if (sel) sel.value = lang;
  }

  // expõe globalmente
  window.i18n = {
    init,
    getLang,
    setLang,
    loadTranslations,
    applyTranslations,
    SUPPORTED
  };

  // roda automaticamente quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
