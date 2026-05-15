// =============================================
// updater-ui.js — carregado em todas as páginas
// =============================================

(function () {
  const isElectron = typeof window.electronAPI !== "undefined" && window.electronAPI.isElectron === true;

  // ----- oculta ícone de download no .exe -----
  function hideDownloadBtn() {
    document.querySelectorAll("a[href='download.html']").forEach(el => {
      el.style.display = "none";
    });
  }

  // ----- injeta modal de update se não existir -----
  function injectModal() {
    if (document.getElementById("updateModal")) return;

    const modal = document.createElement("div");
    modal.id = "updateModal";
    modal.className = "update-modal hidden";
    modal.innerHTML = `
      <div class="update-box">
        <div class="update-icon">⬇️</div>
        <h2>Atualização disponível</h2>
        <p id="updateVersion"></p>
        <div id="updateNotes" class="update-notes"></div>
        <div id="updateProgress" class="update-progress hidden">
          <div class="progress-bar"><div id="progressFill" class="progress-fill"></div></div>
          <span id="progressText">0%</span>
        </div>
        <div id="updateActions">
          <button class="update-btn-primary" onclick="window.__startUpdate()">Baixar e instalar</button>
          <button class="update-btn-secondary" onclick="document.getElementById('updateModal').classList.add('hidden')">Agora não</button>
        </div>
        <div id="updateReady" class="hidden">
          <p class="update-ready-msg">✅ Pronto! Reinicie para aplicar.</p>
          <button class="update-btn-primary" onclick="window.updater.restart()">Reiniciar agora</button>
        </div>
      </div>`;

    document.body.appendChild(modal);
  }

  // ----- injeta estilos do modal -----
  function injectStyles() {
    if (document.getElementById("updater-ui-styles")) return;

    const style = document.createElement("style");
    style.id = "updater-ui-styles";
    style.textContent = `
      .update-modal { position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;z-index:99999; }
      .update-modal.hidden { display:none; }
      .update-box { background:rgba(10,10,25,0.97);border:1px solid rgba(122,92,255,0.4);border-radius:16px;padding:32px;max-width:400px;width:90%;text-align:center;box-shadow:0 0 40px rgba(122,92,255,0.3);animation:fadeIn 0.3s ease; }
      .update-icon { font-size:36px;margin-bottom:10px; }
      .update-box h2 { margin:0 0 8px;font-size:20px;color:white; }
      .update-box #updateVersion { opacity:0.6;font-size:13px;margin-bottom:12px;color:white; }
      .update-notes { font-size:13px;opacity:0.7;background:rgba(255,255,255,0.04);border-radius:8px;padding:10px;margin-bottom:20px;max-height:80px;overflow-y:auto;text-align:left;color:white; }
      .update-progress { margin-bottom:16px; }
      .progress-bar { height:6px;background:rgba(255,255,255,0.1);border-radius:10px;overflow:hidden;margin-bottom:6px; }
      .progress-fill { height:100%;width:0%;background:linear-gradient(90deg,#7a5cff,#5f3bff);border-radius:10px;transition:width 0.3s ease; }
      #progressText { font-size:12px;opacity:0.6;color:white; }
      #updateActions { display:flex;flex-direction:column;gap:10px; }
      .update-btn-primary { padding:11px;border:none;border-radius:10px;background:linear-gradient(135deg,#7a5cff,#5f3bff);color:white;font-weight:bold;cursor:pointer;transition:0.3s; }
      .update-btn-primary:hover { box-shadow:0 0 15px rgba(122,92,255,0.5);transform:translateY(-1px); }
      .update-btn-secondary { padding:9px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:transparent;color:rgba(255,255,255,0.5);cursor:pointer;transition:0.3s; }
      .update-btn-secondary:hover { color:white;border-color:rgba(255,255,255,0.3); }
      .update-ready-msg { color:#00e676;margin-bottom:12px;font-size:14px; }
      .notification-wrapper .badge.update-badge { background:#7a5cff; }
    `;
    document.head.appendChild(style);
  }

  // ----- atualiza o badge e notif-box com aviso de update -----
  function showUpdateNotif(version) {
    // badge roxo no sino
    const badge = document.querySelector(".notification-wrapper .badge");
    if (badge) {
      badge.textContent = "!";
      badge.classList.add("update-badge");
    }

    // injeta item no topo da notif-box
    const box = document.getElementById("notifBox");
    if (box) {
      const item = document.createElement("p");
      item.id = "notif-update-item";
      item.style.cssText = "color:#a78bfa;cursor:pointer;font-weight:bold;";
      item.textContent = "🔔 Versão " + version + " disponível — clique para atualizar";
      item.onclick = () => {
        document.getElementById("updateModal").classList.remove("hidden");
        box.classList.remove("active");
      };
      // remove item anterior se existir
      const old = document.getElementById("notif-update-item");
      if (old) old.remove();
      box.insertBefore(item, box.firstChild);
    }
  }

  // ----- função global para iniciar update -----
  window.__startUpdate = function () {
    const actions = document.getElementById("updateActions");
    const bar     = document.getElementById("updateProgress");
    if (actions) actions.classList.add("hidden");
    if (bar)     bar.classList.remove("hidden");
    if (window.updater) window.updater.downloadUpdate();
  };

  // ----- botão update-btn no header -----
  function bindUpdateBtn() {
    const btn = document.getElementById("update-btn");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const modal = document.getElementById("updateModal");
      if (modal) modal.classList.remove("hidden");
    });
  }

  // ----- aplica avatar do perfil no img#userAvatar de todas as páginas -----
  function applyUserAvatar() {
    const profile = JSON.parse(localStorage.getItem('sgProfile') || '{}');
    const DEFAULT = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyIi8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
    const src = profile.avatar || DEFAULT;
    document.querySelectorAll('img#userAvatar').forEach(img => {
      img.src = src;
      // borda roxa quando tem foto personalizada
      const btn = img.closest('.icon-btn');
      if (btn) {
        btn.style.border = profile.avatar
          ? '2px solid #7a5cff'
          : '';
      }
    });
  }
  window.applyUserAvatar = applyUserAvatar;

  // ----- inicializa tudo -----
  function init() {
    injectStyles();
    injectModal();
    applyUserAvatar();
    bindUpdateBtn();

    if (isElectron) {
      hideDownloadBtn();

      if (window.updater) {
        window.updater.onAvailable((data) => {
          const version = data.version || "";
          const notes   = data.notes   || "Sem changelog disponível.";

          const vEl = document.getElementById("updateVersion");
          const nEl = document.getElementById("updateNotes");
          if (vEl) vEl.textContent = "Versão " + version + " disponível";
          if (nEl) nEl.textContent = notes;

          // mostra o botão update-btn no header
          const btn = document.getElementById("update-btn");
          if (btn) {
            btn.style.display = "flex";
            const badge = document.getElementById("update-badge");
            if (badge) badge.style.display = "block";
          }

          showUpdateNotif(version);
        });

        window.updater.onProgress((percent) => {
          const fill = document.getElementById("progressFill");
          const txt  = document.getElementById("progressText");
          const bar  = document.getElementById("updateProgress");
          if (bar)  bar.classList.remove("hidden");
          if (fill) fill.style.width = Math.round(percent) + "%";
          if (txt)  txt.textContent  = Math.round(percent) + "%";
        });

        window.updater.onDownloaded(() => {
          const actions = document.getElementById("updateActions");
          const ready   = document.getElementById("updateReady");
          const bar     = document.getElementById("updateProgress");
          if (actions) actions.classList.add("hidden");
          if (bar)     bar.classList.add("hidden");
          if (ready)   ready.classList.remove("hidden");

          const item = document.getElementById("notif-update-item");
          if (item) item.textContent = "✅ Update baixado — reinicie para instalar";
        });

        window.updater.onError((msg) => {
          const bar     = document.getElementById("updateProgress");
          const actions = document.getElementById("updateActions");
          if (bar)     bar.classList.add("hidden");
          if (actions) actions.classList.remove("hidden");

          const vEl = document.getElementById("updateVersion");
          if (vEl) vEl.textContent = "❌ Erro ao baixar: " + (msg || "tente novamente");

          const item = document.getElementById("notif-update-item");
          if (item) {
            item.textContent = "❌ Falha no download da atualização";
            item.style.color = "#ff6b6b";
          }
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // sincroniza avatar se o perfil mudar em outra aba
  window.addEventListener("storage", (e) => {
    if (e.key === "sgProfile") applyUserAvatar();
  });
})();
