// ===========================
// Helpers
// ===========================
function $(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===========================
// Theme Toggle
// ===========================
(function initTheme() {
  const saved = localStorage.getItem("theme");
  const initialTheme = saved ? saved : "dark";
  document.documentElement.setAttribute("data-theme", initialTheme);

  const icon = $("themeIcon");
  icon.textContent = initialTheme === "dark" ? "Dark" : "Light";
})();

$("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);

  $("themeIcon").textContent = next === "dark" ? "Dark" : "Light";
  showToast(`Switched to ${next} mode`);
});

// ===========================
// Greeting message by time
// ===========================
(function setGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hello!";
  if (hour >= 5 && hour < 12) greeting = "Good morning ";
  else if (hour >= 12 && hour < 17) greeting = "Good afternoon ";
  else if (hour >= 17 && hour < 23) greeting = "Good evening ";
  else greeting = "Hello, its Midnight! ";

  $("greetingPill").textContent = greeting;
})();

// ===========================
// Mobile nav toggle
// ===========================
const navToggle = $("navToggle");
const navMenu = $("navMenu");

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close menu after clicking a link (mobile UX)
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    if (navMenu.classList.contains("open")) {
      navMenu.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

// ===========================
// Form validation
// ===========================
function setError(id, msg) {
  const el = $(id);
  el.textContent = msg;
}

function isValidEmail(email) {
  // Simple email validation for front-end use
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

$("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = $("name").value.trim();
  const email = $("email").value.trim();
  const message = $("message").value.trim();

  let ok = true;

  setError("nameError", "");
  setError("emailError", "");
  setError("messageError", "");

  if (name.length < 2) {
    setError("nameError", "Please enter your name (at least 2 characters).");
    ok = false;
  }
  if (!isValidEmail(email)) {
    setError("emailError", "Please enter a valid email address.");
    ok = false;
  }
  if (message.length < 10) {
    setError("messageError", "Message should be at least 10 characters.");
    ok = false;
  }

  if (!ok) {
    showToast("Please fix the form errors.");
    return;
  }

  // No backend: simulate success
  e.target.reset();
  showToast("Message ready. In a real site, this would be sent!");
});

// ===========================
// Footer year
// ===========================
$("year").textContent = String(new Date().getFullYear());

// ===========================
// Assignment 2
// ===========================
// Project search / filter
(function initProjectSearch() {
  const search = $("projectSearch");
  const clearBtn = $("clearSearch");
  const empty = $("projectsEmpty");
  const cards = Array.from(document.querySelectorAll(".project.card"));

  if (!search || !clearBtn || !empty || cards.length === 0) return;

  function normalize(s) {
    return (s || "").toLowerCase().trim();
  }

  function applyFilter() {
    const q = normalize(search.value);
    let shown = 0;

    cards.forEach((card) => {
      const text = normalize(card.textContent);
      const tags = normalize(card.getAttribute("data-tags"));
      const match = q === "" || text.includes(q) || tags.includes(q);

      card.style.display = match ? "" : "none";
      if (match) shown += 1;
    });

    empty.hidden = shown !== 0;
  }

  search.addEventListener("input", applyFilter);
  clearBtn.addEventListener("click", () => {
    search.value = "";
    search.focus();
    applyFilter();
    showToast("Search cleared");
  });

  applyFilter();
})();

// ===========================
// Shows loading + friendly errors.
// ===========================

// ===========================
// Developer Quote (Public API) + local fallback
// - Uses GitHub Zen when available
// - Caches last successful quote to reduce API calls
// - Falls back to local quotes if rate-limited/offline
// ===========================
(async function initDevQuote(){
  const statusEl = $("quoteStatus");
  const quoteEl = $("quoteText");
  const authorEl = $("quoteAuthor");
  const refreshBtn = $("refreshQuote");

  if (!statusEl || !quoteEl || !authorEl || !refreshBtn) return;

  const FALLBACK_QUOTES = [["Code is like humor. When you have to explain it, it’s bad.", "Cory House"], ["First, solve the problem. Then, write the code.", "John Johnson"], ["Simplicity is the soul of efficiency.", "Austin Freeman"], ["Make it work, make it right, make it fast.", "Kent Beck"], ["Programs must be written for people to read, and only incidentally for machines to execute.", "Harold Abelson"]];

  function setQuote(text, author){
    quoteEl.textContent = `“${text}”`;
    authorEl.textContent = author ? `— ${author}` : "";
    quoteEl.hidden = false;
    authorEl.hidden = !author;
  }

  function setStatus(text){
    statusEl.textContent = text || "";
  }

  function saveCache(text, author){
    try {
      localStorage.setItem("lastQuoteText", text);
      localStorage.setItem("lastQuoteAuthor", author || "");
      localStorage.setItem("lastQuoteTime", String(Date.now()));
    } catch (_e) {}
  }

  function loadCache(){
    try {
      const t = localStorage.getItem("lastQuoteText");
      if (!t) return null;
      return {
        text: t,
        author: localStorage.getItem("lastQuoteAuthor") || "",
        time: Number(localStorage.getItem("lastQuoteTime") || "0")
      };
    } catch (_e) {
      return null;
    }
  }

  function randomFallback(){
    const [text, author] = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
    return { text, author };
  }

  async function fetchGitHubZen(){
    const res = await fetch("https://api.github.com/zen", { cache: "no-store" });
    if (!res.ok) {
      // 403 is common when rate-limited
      throw new Error(`Request failed (${res.status})`);
    }
    const text = (await res.text()).trim();
    if (!text) throw new Error("Empty response");
    return { text, author: "GitHub Zen" };
  }

  async function loadQuote(forceNetwork = false){
    // Loading state
    statusEl.classList.add("loading");
    setStatus("Loading…");
    quoteEl.hidden = true;
    authorEl.hidden = true;

    const cached = loadCache();

    // If we have a cached quote and not forcing network, show it immediately
    if (cached && !forceNetwork) {
      setQuote(cached.text, cached.author);
      setStatus("");
      statusEl.classList.remove("loading");
      return;
    }

    try {
      const q = await fetchGitHubZen();
      setQuote(q.text, q.author);
      setStatus("");
      saveCache(q.text, q.author);
    } catch (err) {
      // Fallback to cached quote if available, otherwise local quotes
      if (cached) {
        setQuote(cached.text, cached.author);
        setStatus("Showing last saved quote (API unavailable).");
      } else {
        const fb = randomFallback();
        setQuote(fb.text, fb.author);
        setStatus("Showing an offline quote.");
      }
      showToast("Quote API unavailable");
      console.error(err);
    } finally {
      statusEl.classList.remove("loading");
    }
  }

  refreshBtn.addEventListener("click", () => loadQuote(true));
  await loadQuote(false);
})();
