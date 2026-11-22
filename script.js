"use strict";

const form = document.getElementById("dl-form");
const urlInput = document.getElementById("input-url");
const pasteButton = document.getElementById("paste-button");
const submitButton = document.getElementById("submit-button");
const errorBox = document.getElementById("error-box");
const resultSection = document.getElementById("result");
const coverImg = document.getElementById("result-cover");
const titleEl = document.getElementById("result-title");
const authorEl = document.getElementById("result-author");
const actionsEl = document.getElementById("result-actions");
const photosSection = document.getElementById("photos");
const photosGrid = document.getElementById("photos-grid");
const photosCount = document.getElementById("photos-count");

const ERROR_TEXT = "Link-nya gak valid / API lagi gangguan, coba lagi ya.";

function isTikTokUrl(raw) {
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase();
  return host === "tiktok.com" || host.endsWith(".tiktok.com");
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

function hideError() {
  errorBox.hidden = true;
  errorBox.textContent = "";
}

function setLoading(loading) {
  submitButton.disabled = loading;
  pasteButton.disabled = loading;
  submitButton.textContent = loading ? "Lagi ngambil videonya…" : "Download →";
}

function makeDownloadButton(href, label, sublabel, className, filename) {
  const a = document.createElement("a");
  a.className = "dl-btn " + className;
  a.href = href;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("download", filename);
  a.textContent = label;
  if (sublabel) {
    const small = document.createElement("small");
    small.textContent = sublabel;
    a.appendChild(small);
  }
  return a;
}

function formatDuration(seconds) {
  const total = Math.round(Number(seconds) || 0);
  if (!total) return "";
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? m + ":" + String(s).padStart(2, "0") : s + " detik";
}

function renderResult(data) {
  const id = data.id || "tiktok";
  const isSlideshow = Array.isArray(data.images) && data.images.length > 0;

  coverImg.src = data.cover || "";
  coverImg.alt = data.title ? "Thumbnail: " + data.title : "Thumbnail video TikTok";
  titleEl.textContent = data.title || "(tanpa judul)";

  const nickname = data.author && data.author.nickname ? data.author.nickname : "";
  const uniqueId = data.author && data.author.unique_id ? "@" + data.author.unique_id : "";
  const duration = formatDuration(data.duration);
  const metaBits = [nickname, uniqueId, duration].filter(Boolean);
  authorEl.textContent = metaBits.length ? metaBits.join(" · ") : "Kreator TikTok";

  actionsEl.textContent = "";
  if (data.hdplay) {
    actionsEl.appendChild(makeDownloadButton(data.hdplay, "Video HD", "kualitas terbaik", "dl-hd", "tiktok-" + id + "-hd.mp4"));
  }
  if (data.play) {
    actionsEl.appendChild(makeDownloadButton(data.play, "Video Tanpa Watermark", "bersih, tanpa logo", "dl-clean", "tiktok-" + id + ".mp4"));
  }
  if (data.wmplay) {
    actionsEl.appendChild(makeDownloadButton(data.wmplay, "Video Pakai Watermark", "versi original", "dl-wm", "tiktok-" + id + "-wm.mp4"));
  }
  if (data.music) {
    actionsEl.appendChild(makeDownloadButton(data.music, "Audio MP3", "suara / lagunya aja", "dl-audio", "tiktok-" + id + ".mp3"));
  }

  photosGrid.textContent = "";
  if (isSlideshow) {
    photosCount.textContent = data.images.length + " foto";
    data.images.forEach((src, index) => {
      const item = document.createElement("div");
      item.className = "photo-item";
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Foto slideshow " + (index + 1) + " dari " + data.images.length;
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      item.appendChild(img);
      item.appendChild(
        makeDownloadButton(src, "Unduh Foto " + (index + 1), "", "", "tiktok-" + id + "-foto-" + (index + 1) + ".jpg")
      );
      photosGrid.appendChild(item);
    });
    photosSection.hidden = false;
  } else {
    photosSection.hidden = true;
  }

  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

pasteButton.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.trim()) {
      urlInput.value = text.trim();
      hideError();
      urlInput.focus();
    } else {
      showError("Clipboard-nya kosong. Salin dulu link TikTok-nya, baru tekan Tempel lagi.");
    }
  } catch {
    showError("Browser belum ngasih izin baca clipboard. Paste manual aja: tahan kolom link-nya lalu pilih Tempel.");
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  const raw = urlInput.value.trim();
  if (!raw || !isTikTokUrl(raw)) {
    showError("Itu bukan link TikTok yang bener. Contohnya: https://www.tiktok.com/@user/video/1234567890 — salin dari tombol Bagikan di aplikasi TikTok.");
    urlInput.focus();
    return;
  }

  setLoading(true);
  try {
    const apiUrl = "https://www.tikwm.com/api/?url=" + encodeURIComponent(raw) + "&hd=1";
    const response = await fetch(apiUrl, { method: "GET" });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json = await response.json();
    if (!json || json.code !== 0 || !json.data) throw new Error("API error");

    const data = json.data;
    const hasMedia = data.play || data.hdplay || (Array.isArray(data.images) && data.images.length > 0);
    if (!hasMedia) throw new Error("No media in response");

    renderResult(data);
  } catch {
    resultSection.hidden = true;
    showError(ERROR_TEXT);
  } finally {
    setLoading(false);
  }
});
