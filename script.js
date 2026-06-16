const meter = document.querySelector(".scroll-meter span");
const navLinks = [...document.querySelectorAll(".nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  meter.style.width = `${Math.min(progress * 100, 100)}%`;

  const active = sections
    .map((section) => ({
      id: section.id,
      distance: Math.abs(section.getBoundingClientRect().top - 120),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  if (active) {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${active.id}`);
    });
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const filters = [...document.querySelectorAll(".filter")];
const timelineItems = [...document.querySelectorAll(".timeline-item")];

filters.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    timelineItems.forEach((item) => {
      const categories = item.dataset.category.split(" ");
      item.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
    });
    const timelineSection = document.querySelector("#timeline");
    const sectionTop = timelineSection.getBoundingClientRect().top;
    if (sectionTop < -140 || sectionTop > 160) {
      timelineSection.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  });
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxTitle = lightbox?.querySelector(".lightbox-actions strong");
const lightboxDownload = lightbox?.querySelector(".lightbox-actions a");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const wallpaperCards = [...document.querySelectorAll(".wallpaper-card")];
let currentWallpaperIndex = -1;

function closeLightbox() {
  lightbox?.classList.remove("is-open");
  lightbox?.setAttribute("aria-hidden", "true");
}

function showWallpaper(index) {
  if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDownload || !wallpaperCards.length) return;
  currentWallpaperIndex = (index + wallpaperCards.length) % wallpaperCards.length;
  const card = wallpaperCards[currentWallpaperIndex];
  const src = card.dataset.wallpaper;
  const title = card.dataset.title || "航天视觉";
  lightboxImage.src = src;
  lightboxImage.alt = title;
  lightboxTitle.textContent = `${currentWallpaperIndex + 1} / ${wallpaperCards.length} · ${title}`;
  lightboxDownload.href = src;
  lightboxDownload.setAttribute("download", src.split("/").pop() || "space-wallpaper.png");
  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
}

if (lightbox && lightboxImage && lightboxTitle && lightboxDownload) {
  wallpaperCards.forEach((card, index) => {
    card.addEventListener("click", () => {
      showWallpaper(index);
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") showWallpaper(currentWallpaperIndex + 1);
    if (event.key === "ArrowLeft") showWallpaper(currentWallpaperIndex - 1);
  });
}

const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
let stars = [];
let width = 0;
let height = 0;
let animationFrame = 0;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = document.documentElement.clientWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.round(Math.min(Math.max(width * height / 9000, 70), 150));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.3 + 0.2,
    speed: Math.random() * 0.18 + 0.04,
    alpha: Math.random() * 0.65 + 0.22,
  }));
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#02040a";
  ctx.fillRect(0, 0, width, height);

  for (const star of stars) {
    star.y += star.speed;
    star.x += star.speed * 0.15;
    if (star.y > height + 8) {
      star.y = -8;
      star.x = Math.random() * width;
    }
    ctx.beginPath();
    ctx.fillStyle = `rgba(205, 239, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const gradient = ctx.createRadialGradient(width * 0.76, height * 0.18, 0, width * 0.76, height * 0.18, width * 0.58);
  gradient.addColorStop(0, "rgba(92, 233, 255, 0.13)");
  gradient.addColorStop(0.42, "rgba(168, 132, 255, 0.06)");
  gradient.addColorStop(1, "rgba(2, 4, 10, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  animationFrame = requestAnimationFrame(drawStars);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  resizeCanvas();
  drawStars();
  window.addEventListener("resize", resizeCanvas);
} else {
  resizeCanvas();
  ctx.fillStyle = "#02040a";
  ctx.fillRect(0, 0, width, height);
}

window.addEventListener("beforeunload", () => cancelAnimationFrame(animationFrame));
