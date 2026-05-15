<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       🔍 BUSCA
    ========================= */
    const searchInput = document.getElementById("search");
    const cards = document.querySelectorAll(".card");

    function filtrar() {
        if (!searchInput) return;

        const valor = searchInput.value.toLowerCase();

        cards.forEach(card => {
            const nome = (card.dataset.nome || "").toLowerCase();
            card.style.display = nome.includes(valor) ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filtrar);

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                filtrar();
            }
        });
    }


    /* =========================
       🎬 TRANSIÇÃO DE PÁGINA
    ========================= */
    const transition = document.querySelector(".transition");

    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (e) {

            const href = this.getAttribute("href");

            if (!href || href.startsWith("http") || href.startsWith("#")) return;
            if (!transition) return;

            e.preventDefault();

            transition.classList.add("active");

            setTimeout(() => {
                window.location.href = href;
            }, 400);
        });
    });

    window.addEventListener("pageshow", () => {
        if (transition) transition.classList.remove("active");
    });


    /* =========================
       🍔 MENU MOBILE
    ========================= */
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#menu");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }


    /* =========================
       🔥 HEADER SCROLL EFFECT
    ========================= */
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {
        if (header) {
            header.classList.toggle("scroll", window.scrollY > 50);
        }
    });


    /* =========================
       ✨ HIGHLIGHT MENU
    ========================= */
    const menu = document.querySelector(".menu");
    const highlight = document.querySelector(".highlight");
    const items = document.querySelectorAll(".menu a");

    if (menu && highlight && items.length > 0) {

        function moveHighlight(el) {
            const rect = el.getBoundingClientRect();
            const parentRect = menu.getBoundingClientRect();

            highlight.style.width = rect.width + "px";
            highlight.style.height = rect.height + "px";
            highlight.style.left = (rect.left - parentRect.left) + "px";
            highlight.style.top = (rect.top - parentRect.top) + "px";
        }

        items.forEach(item => {
            item.addEventListener("mouseenter", () => moveHighlight(item));
        });

        const ativo = document.querySelector(".menu a.ativo");
        if (ativo) moveHighlight(ativo);
    }


    /* =========================
       ❄️ NEVE
    ========================= */
    const snowContainer = document.querySelector(".snow-container");

    if (snowContainer) {
        for (let i = 0; i < 40; i++) {
            const flake = document.createElement("div");
            flake.classList.add("snowflake");
            flake.innerHTML = "•";

            flake.style.left = Math.random() * 100 + "vw";
            flake.style.animationDuration = (5 + Math.random() * 5) + "s";
            flake.style.fontSize = (5 + Math.random() * 10) + "px";

            snowContainer.appendChild(flake);
        }
    }

});


/* =========================
   🔔 NOTIFICAÇÕES (SAFE)
========================= */
const btnNotif = document.getElementById("btnNotif");
const notifBox = document.getElementById("notifBox");

if (btnNotif && notifBox) {
    btnNotif.addEventListener("click", () => {
        notifBox.classList.toggle("active");
    });
}


/* =========================
   👤 LOGIN (SAFE)
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const btnUser = document.getElementById("btnUser");
    const loginOverlay = document.getElementById("loginOverlay");
    const closeLogin = document.getElementById("closeLogin");

    if (btnUser && loginOverlay && closeLogin) {

        btnUser.addEventListener("click", (e) => {
            e.preventDefault();
            loginOverlay.classList.add("active");
        });

        closeLogin.addEventListener("click", () => {
            loginOverlay.classList.remove("active");
        });

    }
});


/* =========================
   🔊 CLICK SOUND
========================= */
document.addEventListener("DOMContentLoaded", () => {

    function playClick() {
        const audio = new Audio("assets/button1.mp3");
        audio.volume = 0.2;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    document.addEventListener("click", (e) => {
        if (e.target.closest("a, button, .icon-btn")) {
            playClick();
        }
    });

});


document.addEventListener("DOMContentLoaded", () => {
    const updateBtn = document.getElementById("update-btn");

    if (!updateBtn) return;

    if (window.electronAPI?.isElectron) {
        updateBtn.style.display = "flex";
    } else {
        updateBtn.style.display = "none";
    }
});


/* =========================
   🆕 UPDATER (FIX PRINCIPAL)
========================= */
if (window.updater && typeof window.updater.onAvailable === "function") {

    window.updater.onAvailable((data) => {

        const modal = document.getElementById("updateModal");

        if (document.getElementById("updateVersion")) {
            document.getElementById("updateVersion").innerText =
                "Versão: " + (data?.version || "");
        }

        if (document.getElementById("updateNotes")) {
            document.getElementById("updateNotes").innerText =
                data?.notes || "Sem changelog disponível";
        }

        if (modal) {
            modal.classList.remove("hidden");
        }

        /* 🔥 BOTÃO UPDATE (ESSA É A PARTE QUE SUMIA) */
        const updateBtn = document.getElementById("update-btn");

        if (updateBtn) {
            updateBtn.style.display = "flex";
            updateBtn.classList.add("has-update");

            if (window.lucide) {
                lucide.createIcons();
            }
        }
    });
}

=======
document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       🔍 BUSCA
    ========================= */
    const searchInput = document.getElementById("search");
    const cards = document.querySelectorAll(".card");

    function filtrar() {
        if (!searchInput) return;

        const valor = searchInput.value.toLowerCase();

        cards.forEach(card => {
            const nome = (card.dataset.nome || "").toLowerCase();
            card.style.display = nome.includes(valor) ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filtrar);

        searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                filtrar();
            }
        });
    }


    /* =========================
       🎬 TRANSIÇÃO DE PÁGINA
    ========================= */
    const transition = document.querySelector(".transition");

    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function (e) {

            const href = this.getAttribute("href");

            if (!href || href.startsWith("http") || href.startsWith("#")) return;
            if (!transition) return;

            e.preventDefault();

            transition.classList.add("active");

            setTimeout(() => {
                window.location.href = href;
            }, 400);
        });
    });

    window.addEventListener("pageshow", () => {
        if (transition) transition.classList.remove("active");
    });


    /* =========================
       🍔 MENU MOBILE
    ========================= */
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("#menu");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }


    /* =========================
       🔥 HEADER SCROLL EFFECT
    ========================= */
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {
        if (header) {
            header.classList.toggle("scroll", window.scrollY > 50);
        }
    });


    /* =========================
       ✨ HIGHLIGHT MENU
    ========================= */
    const menu = document.querySelector(".menu");
    const highlight = document.querySelector(".highlight");
    const items = document.querySelectorAll(".menu a");

    if (menu && highlight && items.length > 0) {

        function moveHighlight(el) {
            const rect = el.getBoundingClientRect();
            const parentRect = menu.getBoundingClientRect();

            highlight.style.width = rect.width + "px";
            highlight.style.height = rect.height + "px";
            highlight.style.left = (rect.left - parentRect.left) + "px";
            highlight.style.top = (rect.top - parentRect.top) + "px";
        }

        items.forEach(item => {
            item.addEventListener("mouseenter", () => moveHighlight(item));
        });

        const ativo = document.querySelector(".menu a.ativo");
        if (ativo) moveHighlight(ativo);
    }


    /* =========================
       ❄️ NEVE
    ========================= */
    const snowContainer = document.querySelector(".snow-container");

    if (snowContainer) {
        for (let i = 0; i < 40; i++) {
            const flake = document.createElement("div");
            flake.classList.add("snowflake");
            flake.innerHTML = "•";

            flake.style.left = Math.random() * 100 + "vw";
            flake.style.animationDuration = (5 + Math.random() * 5) + "s";
            flake.style.fontSize = (5 + Math.random() * 10) + "px";

            snowContainer.appendChild(flake);
        }
    }

});


/* =========================
   🔔 NOTIFICAÇÕES (SAFE)
========================= */
const btnNotif = document.getElementById("btnNotif");
const notifBox = document.getElementById("notifBox");

if (btnNotif && notifBox) {
    btnNotif.addEventListener("click", () => {
        notifBox.classList.toggle("active");
    });
}


/* =========================
   👤 LOGIN (SAFE)
========================= */
document.addEventListener("DOMContentLoaded", () => {

    const btnUser = document.getElementById("btnUser");
    const loginOverlay = document.getElementById("loginOverlay");
    const closeLogin = document.getElementById("closeLogin");

    if (btnUser && loginOverlay && closeLogin) {

        btnUser.addEventListener("click", (e) => {
            e.preventDefault();
            loginOverlay.classList.add("active");
        });

        closeLogin.addEventListener("click", () => {
            loginOverlay.classList.remove("active");
        });

    }
});


/* =========================
   🔊 CLICK SOUND
========================= */
document.addEventListener("DOMContentLoaded", () => {

    function playClick() {
        const audio = new Audio("assets/button1.mp3");
        audio.volume = 0.2;
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    document.addEventListener("click", (e) => {
        if (e.target.closest("a, button, .icon-btn")) {
            playClick();
        }
    });

});


document.addEventListener("DOMContentLoaded", () => {
    const updateBtn = document.getElementById("update-btn");

    if (!updateBtn) return;

    if (window.electronAPI?.isElectron) {
        updateBtn.style.display = "flex";
    } else {
        updateBtn.style.display = "none";
    }
});


/* =========================
   🆕 UPDATER (FIX PRINCIPAL)
========================= */
if (window.updater && typeof window.updater.onAvailable === "function") {

    window.updater.onAvailable((data) => {

        const modal = document.getElementById("updateModal");

        if (document.getElementById("updateVersion")) {
            document.getElementById("updateVersion").innerText =
                "Versão: " + (data?.version || "");
        }

        if (document.getElementById("updateNotes")) {
            document.getElementById("updateNotes").innerText =
                data?.notes || "Sem changelog disponível";
        }

        if (modal) {
            modal.classList.remove("hidden");
        }

        /* 🔥 BOTÃO UPDATE (ESSA É A PARTE QUE SUMIA) */
        const updateBtn = document.getElementById("update-btn");

        if (updateBtn) {
            updateBtn.style.display = "flex";
            updateBtn.classList.add("has-update");

            if (window.lucide) {
                lucide.createIcons();
            }
        }
    });
}

>>>>>>> 758f1dc (debug deploy)
