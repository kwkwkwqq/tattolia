const CONFIG = {
  instagram: "",                                    // ← ссылка на Instagram (если пусто — кнопки Instagram скроются)
  telegramChannel: "https://t.me/tattolia",         // ← Telegram-канал
  telegramAccount: "https://t.me/oqkskskq",         // ← Telegram, куда писать для записи
};

// Работы портфолио. Положите фото в папку images/ и укажите имя файла в src.
// Если файла нет, покажется красивая розовая заглушка.
const WORKS = [
  { src: "images/work1.jpg", title: "Готика", cat: "Готика", h: 320 },
  { src: "images/work2.jpg", title: "Outline", cat: "Outline", h: 260 },
  { src: "images/work3.jpg", title: "Whipshading", cat: "Whipshading", h: 380 },
  { src: "images/work4.jpg", title: "Greywash", cat: "Greywash", h: 240 },
  { src: "images/work5.jpg", title: "Whipshading", cat: "Whipshading", h: 340 },
  { src: "images/work6.jpg", title: "Fine Line", cat: "Fine Line", h: 290 },
  { src: "images/work7.jpg", title: "Euro trash", cat: "Euro trash", h: 370 },
    { src: "images/work8.jpg", title: "Greywash", cat: "Greywash", h: 370 },
];
/* ============================================================ */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Ссылки на соцсети
const links = { ".js-instagram": CONFIG.instagram, ".js-tg-channel": CONFIG.telegramChannel, ".js-tg-account": CONFIG.telegramAccount };
for (const [sel, url] of Object.entries(links)) {
  $$(sel).forEach((a) => {
    if (!url) { a.style.display = "none"; return; }
    a.href = url; a.target = "_blank"; a.rel = "noopener";
  });
}

$("#year").textContent = new Date().getFullYear();

// Шапка и меню
const header = $("#header"), nav = $("#nav"), burger = $("#burger");
addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 30), { passive: true });
burger.addEventListener("click", () => { burger.classList.toggle("open"); nav.classList.toggle("open"); });
$$("a", nav).forEach((a) => a.addEventListener("click", () => { burger.classList.remove("open"); nav.classList.remove("open"); }));

// Градиенты для заглушек
const GRADS = [
  "linear-gradient(135deg,#f7c9d9,#c9738f)",
  "linear-gradient(135deg,#e59ab5,#7a2e4a)",
  "linear-gradient(135deg,#fbe3ec,#e59ab5)",
  "linear-gradient(135deg,#c9738f,#3a1a29)",
];

// Галерея
const gallery = $("#gallery"), filtersEl = $("#filters");
const cats = ["Все", ...new Set(WORKS.map((w) => w.cat))];
let current = "Все";
let visible = [];


function makeMedia(w, i, forLightbox = false) {
  const wrap = document.createElement("div");

  const ph = document.createElement("div");
  ph.className = "ph";
  ph.style.background = GRADS[i % GRADS.length];
  ph.style.height = forLightbox ? "" : w.h + "px";
  ph.textContent = w.title;

  const img = new Image();
  img.alt = w.title;

  img.onload = () => {
    ph.replaceWith(img);
  };

  img.onerror = () => {
    console.error("Не удалось загрузить изображение:", w.src);
  };

  wrap.append(ph);
  img.src = w.src;

  return wrap.firstChild;
}


function renderGallery() {
  gallery.innerHTML = "";
  visible = WORKS.map((w, i) => ({ ...w, i })).filter((w) => current === "Все" || w.cat === current);
  visible.forEach((w, idx) => {
    const card = document.createElement("figure");
    card.className = "work";
    card.style.animationDelay = idx * 60 + "ms";
    card.append(makeMedia(w, w.i));
    card.insertAdjacentHTML("beforeend", `<figcaption class="cap"><b>${w.title}</b><small>${w.cat}</small></figcaption>`);
    card.addEventListener("click", () => openLightbox(idx));
    gallery.append(card);
  });
}

cats.forEach((c) => {
  const b = document.createElement("button");
  b.className = "filter" + (c === current ? " active" : "");
  b.textContent = c;
  b.addEventListener("click", () => {
    current = c;
    $$(".filter").forEach((f) => f.classList.toggle("active", f === b));
    renderGallery();
  });
  filtersEl.append(b);
});
renderGallery();

// Лайтбокс
const lb = $("#lightbox"), lbBody = $("#lbBody");
let lbIndex = 0;
function showLb() {
  const w = visible[lbIndex];
  lbBody.innerHTML = "";
  const media = makeMedia(w, w.i, true);
  lbBody.append(media);
  lbBody.insertAdjacentHTML("beforeend", `<p>${w.title} · ${w.cat}</p>`);
}
function openLightbox(i) { lbIndex = i; showLb(); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
function closeLb() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
const step = (d) => { lbIndex = (lbIndex + d + visible.length) % visible.length; showLb(); };
$("#lbClose").addEventListener("click", closeLb);
$("#lbPrev").addEventListener("click", () => step(-1));
$("#lbNext").addEventListener("click", () => step(1));
lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") step(-1);
  if (e.key === "ArrowRight") step(1);
});

// Появление при скролле
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach((el) => io.observe(el));

// Счётчики
const counters = $$("[data-count]");
const cio = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (end >= 100 && el.nextElementSibling.textContent.startsWith("работ") ? "+" : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: 0.6 });
counters.forEach((c) => cio.observe(c));


/* ============================================================
   ТАТУ-УЗОРЫ НА ФОНЕ (вырисовываются при загрузке страницы)
   Слева — колючая лоза с шипами и завитками, справа — колючая
   проволока с крестами-подвесками, плюс искры (euro trash),
   на широких экранах — барочные завитки. Линии прерывистые,
   как на винтажном флеше.
   ============================================================ */
(function tattooBackground() {
  const layer = document.getElementById("tattooBg");
  if (!layer) return;

  const NS = "http://www.w3.org/2000/svg";
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MS_PER_PX = 4;      // скорость «рисования»: больше число — медленнее
  const START_DELAY = 500;  // пауза перед началом, мс
  const TAU = Math.PI * 2;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const f = (p) => p[0].toFixed(1) + " " + p[1].toFixed(1);

  // Детерминированный рандом: узор всегда одинаковый
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function svgEl(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  // SVG-«окно», координаты внутри равны координатам экрана
  function makeSvg(x, y, w, h) {
    const s = svgEl("svg", { viewBox: x + " " + y + " " + w + " " + h, width: w, height: h });
    s.style.cssText = "left:" + x + "px;top:" + y + "px;overflow:visible";
    layer.appendChild(s);
    return s;
  }

  // Плавная кривая через точки
  function smooth(pts) {
    if (pts.length < 3) return "M" + pts.map(f).join("L");
    let d = "M" + f(pts[0]);
    for (let i = 1; i < pts.length - 1; i++) {
      const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2];
      d += "Q" + f(pts[i]) + " " + f(m);
    }
    return d + "L" + f(pts[pts.length - 1]);
  }

  // Рисуем линию и (если нужно) анимируем «вырисовывание»
  function draw(svg, d, cls, delay, animate) {
    const p = svgEl("path", { d: d, class: "ink " + (cls || "") }, svg);
    if (animate) {
      const len = p.getTotalLength();
      if (len > 1) {
        p.style.strokeDasharray = len + " " + (len + 4);
        p.style.strokeDashoffset = len + 2;
        p.style.animation = "tattoo-draw " + Math.max(260, len * MS_PER_PX) + "ms " + Math.round(delay) + "ms cubic-bezier(.45,.1,.3,1) forwards";
      }
    }
    return p;
  }

  function fadeIn(el, delay, animate) {
    if (!animate) return;
    el.style.opacity = 0;
    el.style.animation = "tattoo-fade 600ms " + Math.round(delay) + "ms ease forwards";
  }

  function dot(svg, x, y, rad, delay, animate) {
    const c = svgEl("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: rad.toFixed(1), class: "fill" }, svg);
    fadeIn(c, delay, animate);
  }

  // Режем линию на куски с разрывами — винтажная прерывистая линия
  function breakLine(pts, r, minLen, maxLen, gap) {
    const chunks = [];
    let i = 0, total = 0;
    while (i < pts.length - 1) {
      const target = minLen + r() * (maxLen - minLen);
      const start = total;
      const cur = [pts[i]];
      let acc = 0;
      while (i < pts.length - 1 && acc < target) {
        const s = dist(pts[i], pts[i + 1]);
        acc += s; total += s; i++; cur.push(pts[i]);
      }
      if (cur.length > 1) chunks.push({ pts: cur, start: start });
      let skip = gap * (0.6 + r() * 0.9);
      while (i < pts.length - 1 && skip > 0) {
        const s = dist(pts[i], pts[i + 1]);
        skip -= s; total += s; i++;
      }
    }
    return chunks;
  }

  /* ---------- Мотивы ---------- */

  // Колючая лоза: стебель, шипы, завитки, точки
  function vine(svg, o, r, animate) {
    const x = o.x, amp = o.amp, y0 = o.y0, y1 = o.y1, delay = o.delay, sf = o.sf;
    const lam = 230 + r() * 40, ph = r() * TAU;
    const pts = [];
    for (let y = y0; y <= y1; y += 10) {
      pts.push([
        x + amp * Math.sin((y / lam) * TAU + ph) + amp * 0.2 * Math.sin((y / 83) * TAU + ph * 2),
        y,
      ]);
    }
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1], pts[i]));
    const total = cum[cum.length - 1];

    // основной стебель + тонкая параллельная линия
    breakLine(pts, r, 150, 300, 9).forEach((c) => draw(svg, smooth(c.pts), "bold", delay + c.start * MS_PER_PX, animate));
    const pts2 = pts.map((p) => [p[0] + 4.5 * sf, p[1]]);
    breakLine(pts2, r, 90, 220, 12).forEach((c) => draw(svg, smooth(c.pts), "thin", delay + 150 + c.start * MS_PER_PX, animate));

    // шипы и завитки вдоль стебля
    let next = 40 + r() * 30, side = 1, n = 0;
    for (let i = 2; i < pts.length - 2; i++) {
      if (cum[i] < next) continue;
      next = cum[i] + (62 + r() * 40) * sf;
      const P = pts[i], A = pts[i - 2], B = pts[i + 2];
      let tx = B[0] - A[0], ty = B[1] - A[1];
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl; ty /= tl;
      const nx = -ty * side, ny = tx * side;
      const d0 = delay + cum[i] * MS_PER_PX;
      n++;

      if (n % 3 === 0) {
        // завиток (спираль)
        const R = (11 + r() * 13) * sf, turns = 1.5 + r() * 0.7;
        const c = [P[0] + nx * R, P[1] + ny * R];
        const a0 = Math.atan2(P[1] - c[1], P[0] - c[0]);
        const U = turns * TAU, sp = [];
        for (let u = 0; u <= U; u += 0.3) {
          const rr = R * (1 - 0.86 * (u / U));
          sp.push([c[0] + rr * Math.cos(a0 + side * u), c[1] + rr * Math.sin(a0 + side * u)]);
        }
        draw(svg, smooth(sp), "ink", d0, animate);
        const e = sp[sp.length - 1];
        dot(svg, e[0], e[1], 1.5, d0 + R * turns * 60, animate);
      } else {
        // шип-крючок
        const L = (14 + r() * 14) * sf;
        const T = [P[0] + nx * L + tx * L * 0.7, P[1] + ny * L + ty * L * 0.7];
        const c1 = [P[0] + nx * L * 0.95, P[1] + ny * L * 0.95];
        const P2 = [P[0] + tx * L * 0.9, P[1] + ty * L * 0.9];
        const c2 = [P2[0] + nx * L * 0.35, P2[1] + ny * L * 0.35];
        draw(svg, "M" + f(P) + "Q" + f(c1) + " " + f(T) + "Q" + f(c2) + " " + f(P2), "rose", d0, animate);
      }
      side = -side;
    }

    // «набивка» точками рядом с лозой
    const count = Math.round(total / 24);
    for (let k = 0; k < count; k++) {
      const i = Math.floor(r() * pts.length);
      const P = pts[i];
      const off = (10 + r() * 38) * (r() < 0.5 ? -1 : 1) * sf;
      dot(svg, P[0] + off, P[1] + (r() - 0.5) * 20, 0.7 + r() * 1.1, delay + cum[i] * MS_PER_PX + 200, animate);
    }
  }

  // Колючая проволока (две скрученные нити + колючки-крестики)
  function barbed(svg, o, r, animate) {
    const x = o.x, amp = o.amp, lam = o.lam, y0 = o.y0, y1 = o.y1, delay = o.delay, sf = o.sf;
    const A = [], B = [];
    for (let y = y0; y <= y1; y += 8) {
      const s = Math.sin(((y - y0) / lam) * TAU);
      A.push([x + amp * s, y]);
      B.push([x - amp * s, y]);
    }
    [A, B].forEach((arr) =>
      breakLine(arr, r, 170, 360, 8).forEach((c) => draw(svg, smooth(c.pts), "ink", delay + c.start * MS_PER_PX, animate))
    );
    const b = 9 * sf;
    for (let y = y0 + lam / 2; y < y1; y += lam) {
      const d =
        "M" + (x - b).toFixed(1) + " " + (y - b * 0.9).toFixed(1) + "L" + (x + b).toFixed(1) + " " + (y + b * 0.9).toFixed(1) +
        "M" + (x - b).toFixed(1) + " " + (y + b * 0.9).toFixed(1) + "L" + (x + b).toFixed(1) + " " + (y - b * 0.9).toFixed(1);
      draw(svg, d, "rose", delay + (y - y0) * MS_PER_PX, animate);
    }
  }

  // Готический крест с заострёнными концами
  function crossPath(cx, cy, s) {
    const w = s * 0.13, a = s * 0.62, top = s, bot = s * 1.75, ay = -s * 0.38;
    const p = [
      [0, -top], [w, -top + w * 2.4], [w, ay - w], [a - w * 2.2, ay - w], [a, ay], [a - w * 2.2, ay + w], [w, ay + w], [w, bot - w * 3], [0, bot],
      [-w, bot - w * 3], [-w, ay + w], [-(a - w * 2.2), ay + w], [-a, ay], [-(a - w * 2.2), ay - w], [-w, ay - w], [-w, -top + w * 2.4],
    ];
    return "M" + p.map((q) => (cx + q[0]).toFixed(1) + " " + (cy + q[1]).toFixed(1)).join("L") + "Z";
  }

  function cross(svg, cx, cy, s, delay, animate) {
    draw(svg, crossPath(cx, cy, s), "bold", delay, animate);
    draw(svg, "M" + cx + " " + (cy - s * 0.55) + "L" + cx + " " + (cy + s * 1.35), "thin", delay + 300, animate);
    dot(svg, cx, cy - s * 0.38, 1.6, delay + 500, animate);
  }

  // Вогнутая «искра» (классика euro trash)
  function starPath(cx, cy, rad, squash) {
    const c = rad * 0.16, sx = rad * squash;
    return (
      "M" + cx.toFixed(1) + " " + (cy - rad).toFixed(1) +
      "Q" + (cx + c).toFixed(1) + " " + (cy - c).toFixed(1) + " " + (cx + sx).toFixed(1) + " " + cy.toFixed(1) +
      "Q" + (cx + c).toFixed(1) + " " + (cy + c).toFixed(1) + " " + cx.toFixed(1) + " " + (cy + rad).toFixed(1) +
      "Q" + (cx - c).toFixed(1) + " " + (cy + c).toFixed(1) + " " + (cx - sx).toFixed(1) + " " + cy.toFixed(1) +
      "Q" + (cx - c).toFixed(1) + " " + (cy - c).toFixed(1) + " " + cx.toFixed(1) + " " + (cy - rad).toFixed(1) + "Z"
    );
  }

  function stars(svg, x0, x1, count, VH, r, sf, delay0, animate) {
    for (let i = 0; i < count; i++) {
      const y = ((i + 0.3 + r() * 0.4) / count) * VH;
      const x = x0 + r() * Math.max(4, x1 - x0);
      const rad = (5 + r() * 7) * sf;
      const dl = delay0 + y * MS_PER_PX * 0.9;
      draw(svg, starPath(x, y, rad, 0.62), "thin", dl, animate);
      if (r() < 0.6) dot(svg, x + rad * 1.6, y - rad * 0.8, 1.2, dl + 300, animate);
    }
  }

  // Барочный S-завиток: две спирали, сросшиеся в «S»
  function sScroll(svg, o, r, animate) {
    const cx = o.cx, cy = o.cy, R = o.R, turns = o.turns, rot = o.rot, mirror = o.mirror, delay = o.delay;
    const U = turns * TAU, r0 = R * 0.07, R2 = R * 0.78, U2 = turns * 0.8 * TAU;
    const pts = [];
    for (let u = 0; u <= U; u += 0.22) {
      const rr = r0 + (R - r0) * (u / U);
      pts.push([rr * Math.cos(u), rr * Math.sin(u)]);
    }
    const C2 = [(R + R2) * Math.cos(U), (R + R2) * Math.sin(U)];
    for (let u = 0.22; u <= U2; u += 0.22) {
      const rr = R2 - (R2 - r0) * (u / U2);
      const a = U + Math.PI - u;
      pts.push([C2[0] + rr * Math.cos(a), C2[1] + rr * Math.sin(a)]);
    }
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const T = pts.map((q) => {
      const x = q[0] * mirror, y = q[1];
      return [cx + x * cr - y * sr, cy + x * sr + y * cr];
    });
    breakLine(T, r, 80, 170, 6).forEach((c) => draw(svg, smooth(c.pts), "bold", delay + c.start * MS_PER_PX, animate));
    dot(svg, T[0][0], T[0][1], 2.2, delay, animate);
    const e = T[T.length - 1];
    dot(svg, e[0], e[1], 2.2, delay + U * R * MS_PER_PX * 1.6, animate);
  }

  /* ---------- Сборка композиции ---------- */
  let lastW = innerWidth;

  function build(animate) {
    layer.innerHTML = "";
    const W = innerWidth, VH = innerHeight, H = VH + 160;
    const r = rng(11);
    const mobile = W < 700;
    const sf = mobile ? 0.72 : 1;
    const amp = clamp(W * 0.03, 10, 42);
    const colW = Math.round(amp * 2 + 80);
    const A = animate && !REDUCE;
    const base = START_DELAY;

    // слева — колючая лоза
    const left = makeSvg(-10, 0, colW, H);
    vine(left, { x: amp + 14, amp: amp, y0: -10, y1: H, delay: base, sf: sf }, r, A);
    stars(left, amp * 2 + 22, colW - 18, mobile ? 3 : 5, VH, r, sf, base + 300, A);

    // справа — колючая проволока и кресты-подвески
    const wx = W - (amp * 0.4 + 22);
    const right = makeSvg(W - colW + 10, 0, colW, H);
    barbed(right, { x: wx, amp: clamp(W * 0.007, 4, 9), lam: 64 * sf, y0: -10, y1: H, delay: base + 300, sf: sf }, r, A);
    stars(right, W - colW + 16, wx - 44, mobile ? 3 : 5, VH, r, sf, base + 600, A);

    const crossYs = mobile ? [VH * 0.45] : [VH * 0.36, VH * 0.68];
    crossYs.forEach((cy, idx) => {
      const s = 15 * sf, cx = wx - 26 * sf - 6;
      const dl = base + 900 + cy * MS_PER_PX * 0.5 + idx * 400;
      const chain = svgEl("path", {
        d: "M" + wx.toFixed(1) + " " + (cy - s - 16).toFixed(1) + "Q" + ((wx + cx) / 2).toFixed(1) + " " + (cy - s - 2).toFixed(1) + " " + cx.toFixed(1) + " " + (cy - s).toFixed(1),
        class: "dots",
      }, right);
      fadeIn(chain, dl, A);
      cross(right, cx, cy, s, dl + 200, A);
    });

    // на широких экранах — барочные завитки в углах
    if (W >= 1100) {
      const tr = makeSvg(W - 330, 60, 300, 200);
      sScroll(tr, { cx: W - 150, cy: 150, R: 30, turns: 2.4, rot: -0.3, mirror: 1, delay: base + 1200 }, r, A);
      const br = makeSvg(W - 330, VH - 190, 300, 190);
      sScroll(br, { cx: W - 170, cy: VH - 90, R: 30, turns: 2.4, rot: Math.PI + 0.2, mirror: -1, delay: base + 1800 }, r, A);
    }
  }

  build(true);

  // При смене ширины (поворот телефона) перерисовываем без анимации.
  // Изменение высоты (адресная строка на мобильных) игнорируем.
  let timer;
  addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (Math.abs(innerWidth - lastW) > 30) { lastW = innerWidth; build(false); }
    }, 250);
  });
})();
