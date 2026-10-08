// Small behaviours only; the page reads fine without any of it.
// In order: the language menu, the top bar, the folder beside the six steps, entrances, the MCP figure, art and clips,
// the Copy buttons, light under the pointer, the questions, and the hub in the hero.

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const hasObserver = "IntersectionObserver" in window;
const root = document.documentElement;
root.classList.add("js");

/** A text this script writes itself, in the page's language. The English is given here; tools/build-sr.mjs puts the
    Serbian of every key asked for here in sr/index.html (#say), and nothing else of i18n.js. */
const sayings = (() => {
  try {
    return JSON.parse(document.getElementById("say")?.textContent || "{}");
  } catch {
    return {};
  }
})();
const say = (key, english) => sayings[key] ?? english;

/** Runs fn at most once per frame, however often it is asked for. */
const oncePerFrame = (fn) => {
  let queued = false;
  return () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn();
    });
  };
};

/* ---- language: each language is a page of its own (English at /, Serbian at sr/). The menu's items are links to them;
   choosing one remembers it (the script at the top of the <head> reads it) and goes there, to the same place. ---- */

const PLACE = "lang-place";

/** The parts of the page, the same in both languages. A place is one of them and how far into it the window's top is,
    since the other language's text runs to other heights. */
const parts = () => [...document.querySelectorAll("main > section, body > footer")];

// Coming from the other language: start where the reader was. Once more when the fonts are in, if nothing has moved.
try {
  const place = JSON.parse(sessionStorage.getItem(PLACE));
  sessionStorage.removeItem(PLACE);
  const part = place && Date.now() - place.at < 10000 && parts()[place.i];
  if (part) {
    const go = () => {
      // At once: the stylesheet's smooth scrolling would ease it.
      root.style.scrollBehavior = "auto";
      scrollTo(0, Math.round(part.getBoundingClientRect().top + scrollY + part.offsetHeight * place.f));
      root.style.scrollBehavior = "";
      return scrollY;
    };
    const landed = go();
    document.fonts?.ready.then(() => scrollY === landed && go());
  }
} catch {}

const langBox = document.querySelector(".lang");
if (langBox) {
  const button = langBox.querySelector(".lang-btn");
  const list = langBox.querySelector(".lang-menu");
  const items = [...list.querySelectorAll("[data-lang]")];
  const current = items.find((item) => item.getAttribute("aria-checked") === "true") || items[0];

  const open = (on) => {
    list.hidden = !on;
    button.setAttribute("aria-expanded", String(on));
  };

  // As soon as the reader reaches for the menu, the other page is fetched, so the switch is quick; and from the English
  // page the fonts' latin-ext files too, which hold the Serbian letters with marks. Browsers without prefetch skip it.
  let warmed = false;
  const warm = () => {
    if (warmed) return;
    warmed = true;
    const fonts = document.querySelector('link[rel="preload"][href*="-latin-ext."]')
      ? []
      : [...document.querySelectorAll('link[rel="preload"][as="font"]')].map((font) => font.href.replace("-latin.", "-latin-ext."));
    for (const href of [...items.filter((item) => item !== current).map((item) => item.href), ...fonts]) {
      const link = document.createElement("link");
      if (!link.relList?.supports?.("prefetch")) return;
      link.rel = "prefetch";
      link.href = href;
      if (fonts.includes(href)) {
        link.as = "font";
        link.crossOrigin = "anonymous";
      }
      document.head.append(link);
    }
  };
  langBox.addEventListener("pointerenter", warm);
  langBox.addEventListener("focusin", warm);

  button.addEventListener("click", () => {
    open(list.hidden);
    if (!list.hidden) current.focus();
  });

  for (const item of items) {
    item.addEventListener("click", (event) => {
      // With a modifier the link opens as any link does, in a new tab or window.
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (item === current) {
        open(false);
        button.focus();
        return;
      }
      // The place is taken first: focus moving in the bar can scroll the page.
      try {
        const all = parts();
        let i = 0;
        all.forEach((part, n) => part.getBoundingClientRect().top <= 0 && (i = n));
        const box = all[i].getBoundingClientRect();
        sessionStorage.setItem(PLACE, JSON.stringify({ i, f: box.height ? -box.top / box.height : 0, at: Date.now() }));
      } catch {}
      open(false);
      const lang = item.dataset.lang;
      let kept = false;
      try {
        localStorage.setItem("lang", lang);
        kept = localStorage.getItem("lang") === lang;
      } catch {}
      let href = item.href;
      // A page opened from a file has no folder index.
      if (location.protocol === "file:" && href.endsWith("/")) href += "index.html";
      // A Serbian choice that could not be replaced would send the English page back to the Serbian one; ?lang=en stops that.
      if (lang === "en" && !kept) href += "?lang=en";
      // The switch takes the place of this page in the history, as a change of language on one page would.
      location.replace(href);
    });
  }

  langBox.addEventListener("keydown", (event) => {
    if (list.hidden) return;
    if (event.key === "Escape") {
      open(false);
      button.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      items[(items.indexOf(document.activeElement) + step + items.length) % items.length].focus();
    } else if (event.key === " " && items.includes(document.activeElement)) {
      // An item is a link, which Enter follows; as a menu item, Space chooses it too.
      event.preventDefault();
      document.activeElement.click();
    }
  });

  // It closes when the reader clicks elsewhere or tabs out of it.
  document.addEventListener("pointerdown", (event) => {
    if (!langBox.contains(event.target)) open(false);
  });
  langBox.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !langBox.contains(event.relatedTarget)) open(false);
  });
}

/* ---- top bar: clear over the hero, solid once the page has moved; a thread shows how far the page is read; the link of the section in view is marked ---- */

const bar = document.querySelector(".bar");
if (bar) {
  // The thread on the lower edge of the window fills as the page is read. --read goes on the thread itself: written on
  // <html>, it would make the browser restyle the whole page on every frame of a scroll.
  const thread = document.querySelector(".read-progress") || root;
  let read = "";
  const stick = oncePerFrame(() => {
    // Measure first, then write, so the class does not make the browser lay the page out again before the measure.
    const y = scrollY;
    const span = root.scrollHeight - innerHeight;
    bar.classList.toggle("is-stuck", y > 8);
    const now = span > 0 ? Math.min(1, Math.max(0, y / span)).toFixed(4) : "0";
    if (now !== read) thread.style.setProperty("--read", (read = now));
  });
  addEventListener("scroll", stick, { passive: true });
  addEventListener("resize", stick, { passive: true });
  stick();

  const links = new Map([...bar.querySelectorAll('.bar-links a[href^="#"]')].map((a) => [a.hash.slice(1), a]));
  if (hasObserver && links.size) {
    // A thin line across the middle of the window: the section under it is the current one.
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const a of links.values()) a.removeAttribute("aria-current");
          links.get(entry.target.id)?.setAttribute("aria-current", "true");
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    for (const section of document.querySelectorAll("main > section")) spy.observe(section);
  }
}

/* ---- the loop: the folder shows what exists at the step you are reading ---- */

const rail = document.querySelector(".rail");
const turns = [...document.querySelectorAll(".turn")];
if (rail && turns.length) {
  // What the tag on the slot's card says once each step is over, as in the app.
  const STATUS = [
    ["t-generate", "i-spark", "Needs generating", "v1"],
    ["t-generate", "i-spark", "Needs generating", "v1"],
    ["t-agent", "i-robot", "Agent's turn", "v1"],
    ["t-agent", "i-robot", "Agent's turn", "v1"],
    ["t-review", "i-eye", "Needs your approval", "v2"],
    ["t-approved", "i-check", "Approved", "v2"],
  ];
  const files = [...rail.querySelectorAll(".tree li[data-from]")];
  const pips = [...rail.querySelectorAll(".pips i")];
  const tag = rail.querySelector(".rail-tag");
  const chip = rail.querySelector(".rail-chip");
  let current = 0;

  function show(n) {
    if (n === current) return;
    current = n;
    for (const file of files) {
      const from = Number(file.dataset.from);
      file.classList.toggle("is-future", from > n);
      file.classList.toggle("is-new", from === n);
    }
    pips.forEach((pip, i) => pip.classList.toggle("is-done", i < n));
    for (const turn of turns) turn.classList.toggle("is-current", Number(turn.dataset.turn) === n);
    const [tone, icon, label, version] = STATUS[n - 1];
    tag.className = `tag rail-tag ${tone}`;
    tag.querySelector("use").setAttribute("href", `#${icon}`);
    tag.querySelector("span").textContent = label;
    chip.textContent = version;
  }

  // The current turn is the last one whose top has passed the middle of the window.
  const sync = oncePerFrame(() => {
    const line = innerHeight * 0.5;
    let n = 1;
    for (const turn of turns) {
      if (turn.getBoundingClientRect().top <= line) n = Number(turn.dataset.turn);
    }
    show(n);
  });

  addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync, { passive: true });
  sync();
}

/* ---- entrances: a thing rises into place the first time it is seen, a group one child after another ---- */

if (!reducedMotion && hasObserver) {
  root.classList.add("motion");
  const seen = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        // Something taller than the window never shows 15% of itself; a third of the window is enough then.
        if (entry.intersectionRatio < 0.15 && entry.intersectionRect.height < innerHeight * 0.3) continue;
        entry.target.classList.add("is-in");
        seen.unobserve(entry.target);
      }
    },
    { threshold: [0, 0.15, 0.3], rootMargin: "0px 0px -7% 0px" },
  );
  for (const el of document.querySelectorAll("[data-reveal], [data-reveal-group]")) seen.observe(el);
}

/* ---- smooth scrolling: Lenis (assets/vendor) eases the wheel, so what follows the scroll moves evenly instead of in steps.
   Touch scrolling stays native. Lenis puts .lenis on <html>; styles.css turns the browser's own smooth anchors off there. ---- */

if (!reducedMotion && typeof Lenis === "function") {
  new Lenis({ autoRaf: true, lerp: 0.12, anchors: true });
}

/* ---- the uses: the two halves of a card come in from opposite sides as it scrolls up, meet in the middle of the window, and hold ---- */

const uses = [...document.querySelectorAll(".use")];
if (uses.length && root.classList.contains("motion")) {
  // The halves travel while the card's top rises from the bottom edge of the window to just past its middle.
  const SPAN = 0.45;
  let first = true;
  const place = oncePerFrame(() => {
    // Every card is measured before any is written to, so the page is laid out once per frame, not once per card.
    const tops = uses.map((card) => card.getBoundingClientRect().top);
    uses.forEach((card, i) => {
      const raw = Math.min(1, Math.max(0, (innerHeight - tops[i]) / (innerHeight * SPAN)));
      // Slow at first, fast at the end: they hit rather than land. Written only when it has changed.
      const p = (raw * raw).toFixed(4);
      if (p !== card.p) card.style.setProperty("--p", (card.p = p));
      if (raw < 1) {
        if (card.classList.contains("is-joined") || card.classList.contains("is-hit")) card.classList.remove("is-joined", "is-hit");
      } else if (!card.classList.contains("is-joined")) {
        card.classList.add("is-joined");
        // Already joined when the page opens: no hit for that.
        if (!first) {
          card.classList.add("is-hit");
          setTimeout(() => card.classList.remove("is-hit"), 600);
        }
      }
    });
    first = false;
  });
  addEventListener("scroll", place, { passive: true });
  addEventListener("resize", place, { passive: true });
  place();
}

/* ---- the MCP figure: its light runs only while the figure is on screen ---- */

const lanes = document.querySelector(".lanes");
if (lanes && hasObserver) {
  new IntersectionObserver(([entry]) => lanes.classList.toggle("is-live", entry.isIntersecting)).observe(lanes);
}

/* ---- art: show the picture, its clip if there is one, or the slot it is still waiting in ---- */

// A clip plays only while it is on screen.
const onScreen =
  hasObserver &&
  new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    }
  });

// A clip is fetched only once its picture is near the window, a screen and a half ahead, and not before the page has
// loaded, so it never takes the network from what the first view needs.
const whenNear = new Map();
const near =
  hasObserver &&
  new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        if (!isIntersecting) continue;
        near.unobserve(target);
        whenNear.get(target)();
        whenNear.delete(target);
      }
    },
    { rootMargin: "150% 0px" },
  );
const loaded = new Promise((done) => (document.readyState === "complete" ? done() : addEventListener("load", done, { once: true })));

// Two pictures share a clip: the hero's is shown again beside its frame sheet. The second waits until the first has
// stopped fetching ("suspend": the file is in, or enough of it for now; at most 15 s) and then takes it from the
// browser's cache, so one clip is never downloaded twice at once.
const fetching = new Map();
const fetchClip = (video, src) => {
  const turn = (fetching.get(src) || Promise.resolve()).then(
    () =>
      new Promise((done) => {
        video.addEventListener("suspend", done, { once: true });
        video.addEventListener("error", done, { once: true });
        setTimeout(done, 15000);
        video.src = src;
      }),
  );
  fetching.set(src, turn);
};

for (const art of document.querySelectorAll(".art[data-slot]")) {
  const img = art.querySelector("img");

  const missing = () => {
    art.classList.add("is-missing");
    art.insertAdjacentHTML(
      "beforeend",
      `<span class="tag t-generate"><svg class="icon" width="12" height="12"><use href="#i-spark"/></svg>Needs generating</span>
       <span class="art-slot">${art.dataset.slot}</span>
       <span class="art-hint">${img.alt.replace(/^(Pixel art|Piksel-art): /, "")}</span>`,
    );
  };

  const ready = () => {
    const src = art.dataset.video;
    if (!src || reducedMotion) return;
    const video = document.createElement("video");
    Object.assign(video, { muted: true, loop: true, autoplay: true, playsInline: true, poster: img.currentSrc || img.src });
    // The still stays until the clip can really play; with no clip, it stays for good.
    video.addEventListener(
      "canplay",
      () => {
        // The clip takes over the picture's description.
        video.setAttribute("aria-label", img.alt);
        img.replaceWith(video);
        if (onScreen) onScreen.observe(video);
      },
      { once: true },
    );
    const fetchNow = () => loaded.then(() => fetchClip(video, src));
    if (!near) return fetchNow();
    whenNear.set(art, fetchNow);
    near.observe(art);
  };

  // A picture below the fold keeps loading="lazy": the browser fetches it as it comes near, and then load or error follows.
  if (img.complete) img.naturalWidth ? ready() : missing();
  else {
    img.addEventListener("load", ready, { once: true });
    img.addEventListener("error", missing, { once: true });
  }
}

/* ---- copy button: it says Copied, as the app's does, and the message lights up to show what was taken ---- */

for (const button of document.querySelectorAll("[data-copy]")) {
  const label = button.querySelector(".copy-label") || button;
  const icon = button.querySelector("use");
  const box = button.closest(".ask");
  let timer = 0;

  button.addEventListener("click", async () => {
    const text = document.querySelector(button.dataset.copy).textContent.trim();
    let copied = true;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      copied = false;
    }
    label.textContent = copied ? say("copied", "Copied") : say("copy.byHand", "Select and copy");
    button.classList.toggle("is-copied", copied);
    box?.classList.toggle("is-copied", copied);
    icon?.setAttribute("href", copied ? "#i-check" : "#i-clipboard");
    clearTimeout(timer);
    timer = setTimeout(() => {
      label.textContent = say("copy", "Copy");
      button.classList.remove("is-copied");
      box?.classList.remove("is-copied");
      icon?.setAttribute("href", "#i-clipboard");
    }, 1800);
  });
}

/* ---- light under the pointer ----
   A surface marked data-lit, and every illustration (.art), gets --mx and --my: where the pointer is over it, in px.
   styles.css does the rest; on a touch screen none of this runs. Screenshots and results are left alone. */

if (finePointer) {
  const LIT = "[data-lit], .art";
  let x = 0;
  let y = 0;
  let over = null;

  const apply = oncePerFrame(() => {
    if (!(over instanceof Element)) return;
    for (let el = over.closest(LIT); el; el = el.parentElement && el.parentElement.closest(LIT)) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${Math.round(x - r.left)}px`);
      el.style.setProperty("--my", `${Math.round(y - r.top)}px`);
    }
  });

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      over = event.target;
      apply();
    },
    { passive: true },
  );
}

/* ---- questions: an answer opens and closes smoothly, and only one is open at a time ---- */

const faqs = [...document.querySelectorAll(".faq-list details")];
const closers = new Map();
for (const item of faqs) {
  const summary = item.querySelector("summary");
  const body = item.querySelector(".faq-a");
  if (!summary || !body || reducedMotion || !body.animate) {
    // The browser does the opening; this only closes the others.
    item.addEventListener("toggle", () => {
      if (item.open) for (const other of faqs) if (other !== item) other.open = false;
    });
    continue;
  }
  let anim = null;

  const move = (opening) => {
    // Where the answer is now, which is part-way if it was caught in the middle of a move.
    const from = item.open ? body.getBoundingClientRect().height : 0;
    if (anim) anim.cancel();
    item.classList.toggle("is-closing", !opening);
    if (opening) item.open = true;
    const to = opening ? body.scrollHeight : 0;
    anim = body.animate(
      { height: [`${from}px`, `${to}px`], opacity: opening ? [from ? 1 : 0, 1] : [1, 0] },
      { duration: 360, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
    anim.onfinish = () => {
      anim = null;
      if (opening) return;
      item.open = false;
      item.classList.remove("is-closing");
    };
  };

  closers.set(item, () => {
    if (item.open && !item.classList.contains("is-closing")) move(false);
  });

  summary.addEventListener("click", (event) => {
    event.preventDefault();
    const opening = !item.open || item.classList.contains("is-closing");
    if (opening) for (const [other, close] of closers) if (other !== item) close();
    move(opening);
  });
}

/* ---- the hub: glass cubes float, wires run from each to the folder, and one thread at a time travels them ---- */

const hub = document.querySelector(".hub");
if (hub) {
  // A mark whose file is missing becomes two letters.
  for (const img of hub.querySelectorAll(".cube-core img")) {
    const letters = () => {
      img.parentElement.classList.add("is-letters");
      img.remove();
    };
    if (img.complete) img.naturalWidth || letters();
    else img.addEventListener("error", letters, { once: true });
  }

  const NS = "http://www.w3.org/2000/svg";
  const svg = hub.querySelector(".hub-wires");
  const panel = hub.querySelector(".hero-art");
  const stage = hub.querySelector(".hero-stage");
  const center = hub.querySelector(".hub-center");
  const make = (name, cls) => {
    const el = document.createElementNS(NS, name);
    el.setAttribute("class", cls);
    return el;
  };

  // sign: +1 for a cube on the left, which is turned to face right, and -1 for one on the right.
  const side = (name, sign) =>
    [...hub.querySelectorAll(`.hub-${name} li`)].map((li, i) => ({
      li,
      cube: li.querySelector(".cube"),
      body: li.querySelector(".cube-body"),
      any: li.classList.contains("is-any"),
      sign,
      // Each cube bobs at its own pace and sits at its own angle.
      period: 4200 + ((i * 937) % 2600),
      phase: (i * 2.4) % (Math.PI * 2),
      yaw: (((i * 7) % 5) - 2) * 2.5,
      dy: 0,
      rx: null,
      ry: null,
      lit: false,
      rest: null,
      pts: null,
      shadow: null,
    }));
  const agents = side("agents", 1);
  const gens = side("gens", -1);
  const nodes = [...agents, ...gens];

  // The svg is the ground: the cubes' hard shadows lie on it, the wires over them, the thread on top.
  const ground = make("g", "cube-shadows");
  svg.append(ground);
  for (const node of nodes) {
    if (!node.any) {
      node.shadow = make("rect", "cube-shadow");
      ground.append(node.shadow);
    }
    node.wire = make("polyline", `wire${node.any ? " is-any" : ""}`);
    svg.append(node.wire);
  }

  let floating = false;

  /** Where each wire runs while its cube is at rest: from the middle of the cube to the folder, with right angles only. */
  function layout() {
    const box = hub.getBoundingClientRect();
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      const l = r.left - box.left;
      const t = r.top - box.top;
      return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2, w: r.width };
    };
    const p = rect(panel);
    const c = rect(center);
    // The middle is a box of its own only in the wide layout, where the cubes float beside it.
    const wasFloating = floating;
    floating = c.w > 0;
    if (wasFloating && !floating) {
      for (const node of nodes) {
        node.dy = 0;
        node.li.style.transform = node.bob = "";
      }
    }
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const group = (list, before) => {
      const shown = list.filter((node) => node.cube.offsetParent);
      const rects = new Map(shown.map((node) => [node, rect(node.cube)]));
      // In rows, every wire of a group turns at one height: half-way between the cubes nearest the folder and the folder.
      const to = floating ? (before ? p.l : p.r) : before ? p.t : p.b;
      const near = [...rects.values()].map((t) => (before ? t.b : t.t));
      const edge = before ? Math.max(...near) : Math.min(...near);
      const bus = floating ? (before ? c.l - 14 : c.r + 14) : (edge + to) / 2 + (before ? 5 : -5);
      for (const node of list) {
        const t = rects.get(node);
        if (!t) {
          node.rest = node.pts = null;
          node.wire.setAttribute("points", (node.drawn = ""));
          continue;
        }
        // Measured while bobbing: take the bob out.
        t.cy -= node.dy;
        const pts = floating ? [[t.cx, t.cy], [bus, t.cy], [bus, p.cy], [to, p.cy]] : [[t.cx, t.cy], [t.cx, bus], [p.cx, bus], [p.cx, to]];
        node.rest = pts.map(([x, y]) => [Math.round(x), Math.round(y)]);
        if (node.shadow) {
          // The shadow of a cube seen from a little above: its outline, moved down and to the right.
          const s = node.cube.offsetWidth;
          const w = s * (floating ? 1.12 : 1.08);
          const h = s * 1.1;
          node.sx = node.rest[0][0] - w / 2 + s * 0.12;
          node.sy = node.rest[0][1] - h / 2 + s * 0.19;
          node.shadow.setAttribute("x", node.sx.toFixed(1));
          node.shadow.setAttribute("width", w.toFixed(1));
          node.shadow.setAttribute("height", h.toFixed(1));
          node.shadow.setAttribute("rx", 6);
        }
        place(node);
      }
    };
    group(agents, true);
    group(gens, false);
  }

  /** Draws a wire and a shadow for where their cube is now. Only the end at the cube moves with the bob. */
  function place(node) {
    const [a, b, ...rest] = node.rest;
    const dy = floating ? Math.round(node.dy) : 0;
    node.pts = [[a[0], a[1] + dy], [b[0], b[1] + dy], ...rest];
    // Written only when it has changed: in most frames the bob has not moved a whole pixel.
    const points = node.pts.map((q) => q.join(",")).join(" ");
    if (points !== node.drawn) node.wire.setAttribute("points", (node.drawn = points));
    if (node.shadow) {
      const y = (node.sy + dy).toFixed(1);
      if (y !== node.shadowY) node.shadow.setAttribute("y", (node.shadowY = y));
    }
  }

  layout();
  if ("ResizeObserver" in window) new ResizeObserver(layout).observe(hub);
  else addEventListener("resize", layout, { passive: true });
  if (document.fonts) document.fonts.ready.then(layout);
  addEventListener("load", layout);

  if (!reducedMotion) {
    const SPEED = 760; // px per second, before easing
    const BOB = 6; // px each way
    // The same numbers as in styles.css, where the cubes stand when this script does not run.
    const PERSPECTIVE = 640;
    const REST = { wide: [-16, 24], row: [-20, 14] }; // degrees: rotateX, rotateY (times the cube's sign)
    // The thread is one line drawn three times: a long faint tail, a shorter one, and a bright head.
    const LAYERS = [
      ["thread-tail", 300],
      ["thread-mid", 130],
      ["thread-head", 22],
    ];
    const TAIL = LAYERS[0][1];

    const route = make("polyline", "thread-route");
    const thread = make("g", "thread");
    const layers = LAYERS.map(([name, length]) => {
      const line = make("polyline", name);
      thread.append(line);
      return { line, length };
    });
    svg.append(route, thread);

    // The glow at the head of the thread. It lies under the cubes, so it is seen through their glass.
    const spark = document.createElement("i");
    spark.className = "hub-spark";
    svg.after(spark);

    // What the thread carries, riding its head: a sheet with the prompt on the way out, the picture on the way back.
    const load = document.createElement("i");
    load.className = "hub-load";
    load.innerHTML =
      '<svg class="icon load-sheet" width="14" height="14" aria-hidden="true"><use href="#i-sheet"/></svg>' +
      '<svg class="icon load-picture" width="14" height="14" aria-hidden="true"><use href="#i-image"/></svg>';
    spark.after(load);

    const pointer = { on: false, x: 0, y: 0 };
    const dots = { on: false, x: null, y: null };
    if (finePointer) {
      addEventListener(
        "pointermove",
        (event) => {
          if (event.pointerType === "touch") return;
          pointer.on = true;
          pointer.x = event.clientX;
          pointer.y = event.clientY;
        },
        { passive: true },
      );
      root.addEventListener("mouseleave", () => (pointer.on = false));
    }

    let running = false;
    let routeDrawn = "";
    let ticking = false;
    let looping = false;
    let count = 0;
    /** The pair the thread runs between now, and the trip it is on. */
    let pair = null;
    let trip = null;

    const clamp = (v) => Math.min(Math.max(v, -1), 1);
    const lengthOf = (pts) => pts.slice(1).reduce((sum, q, i) => sum + Math.abs(q[0] - pts[i][0]) + Math.abs(q[1] - pts[i][1]), 0);
    const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

    /** The point a given distance along a line of right angles. */
    function pointAt(pts, d) {
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const len = Math.abs(bx - ax) + Math.abs(by - ay);
        if (d <= len && len > 0) return [ax + ((bx - ax) * d) / len, ay + ((by - ay) * d) / len];
        d -= len;
      }
      return pts[pts.length - 1];
    }

    /** From the agent's cube to the folder, through it, and on to the generator's cube. */
    const pathOf = ({ agent, gen }) => [...agent.pts, ...[...gen.pts].reverse()];

    /** Turns a cube a step closer to where it should face: its rest angle, the pointer, and the folder while its turn lasts. */
    function face(node, box) {
      const [restX, restY] = floating ? REST.wide : REST.row;
      let rx = restX;
      let ry = node.sign * restY + (floating ? node.yaw : 0);
      if (pointer.on) {
        const dx = pointer.x - box.left - node.rest[0][0];
        const dy = pointer.y - box.top - node.rest[0][1] - node.dy;
        // Cubes near the pointer answer most.
        const near = 1 / (1 + (Math.hypot(dx, dy) / 420) ** 2);
        ry += clamp(dx / 240) * 18 * near;
        rx += clamp(-dy / 240) * 14 * near;
      }
      if (node.lit && floating) ry += node.sign * 9;
      if (node.rx === null) {
        // Start from where styles.css put it.
        node.rx = restX;
        node.ry = node.sign * restY;
      }
      node.rx += (rx - node.rx) * 0.09;
      node.ry += (ry - node.ry) * 0.09;
      // Once a cube has come to rest, the same turn is not written again.
      const turn = `perspective(${PERSPECTIVE}px) rotateX(${node.rx.toFixed(2)}deg) rotateY(${node.ry.toFixed(2)}deg)`;
      if (turn !== node.turn) node.body.style.transform = node.turn = turn;
    }

    function frame(now) {
      if (running) {
        const box = hub.getBoundingClientRect();
        for (const node of nodes) {
          if (!node.rest) continue;
          if (floating) {
            node.dy = Math.sin((now / node.period) * Math.PI * 2 + node.phase) * BOB;
            const bob = `translate3d(0,${node.dy.toFixed(2)}px,0)`;
            if (bob !== node.bob) node.li.style.transform = node.bob = bob;
            place(node);
          }
          face(node, box);
        }
        // The dots of the ground light up around the pointer while it is over the hub.
        const lit = pointer.on && pointer.y > box.top - 60 && pointer.y < box.bottom + 60;
        if (lit) {
          const px = Math.round(pointer.x - box.left);
          const py = Math.round(pointer.y - box.top);
          if (px !== dots.x || py !== dots.y) {
            dots.x = px;
            dots.y = py;
            hub.style.setProperty("--px", `${px}px`);
            hub.style.setProperty("--py", `${py}px`);
          }
        }
        if (lit !== dots.on) {
          dots.on = lit;
          hub.classList.toggle("is-pointed", lit);
        }
      }
      if (pair && pair.agent.pts && pair.gen.pts) {
        const out = pathOf(pair);
        const pts = trip && trip.back ? out.reverse() : out;
        const total = lengthOf(pts);
        const points = pts.map((q) => q.join(",")).join(" ");
        if (points !== routeDrawn) route.setAttribute("points", (routeDrawn = points));
        if (trip) {
          const k = Math.min((now - trip.start) / trip.time(total), 1);
          // The head runs a tail's length past the end, so the whole thread arrives.
          const head = ease(k) * (total + TAIL);
          for (const layer of layers) {
            const { line, length } = layer;
            if (points !== layer.drawn) line.setAttribute("points", (layer.drawn = points));
            const dash = `${length} ${total + 400}`;
            if (dash !== layer.dash) line.setAttribute("stroke-dasharray", (layer.dash = dash));
            const offset = String(length - Math.min(head, total + length));
            if (offset !== layer.offset) line.setAttribute("stroke-dashoffset", (layer.offset = offset));
          }
          // On the way out the thread is the agent's until it has passed the folder, then yours.
          const folder = lengthOf(trip.back ? pair.gen.pts : pair.agent.pts);
          const tone = trip.back ? "image" : head < folder + 40 ? "agent" : "you";
          if (tone !== trip.tone) {
            trip.tone = tone;
            thread.setAttribute("class", `thread is-on tone-${tone}`);
            spark.className = `hub-spark is-on tone-${tone}`;
            load.className = `hub-load is-on tone-${tone}${trip.back ? " is-picture" : ""}`;
          }
          if (head < total) {
            const [x, y] = pointAt(pts, head);
            const at = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
            if (at !== spark.at) spark.style.transform = load.style.transform = spark.at = at;
          }
          // The folder answers as the thread goes through it, and the cube at the far end as the thread enters its glass.
          if (!trip.passed && head >= folder) {
            trip.passed = true;
            flash(stage, `is-passing tone-${tone}`, 1100);
          }
          if (!trip.arrived && head >= total - 6) {
            trip.arrived = true;
            spark.classList.remove("is-on");
            load.classList.remove("is-on");
            pulse(trip.back ? pair.agent : pair.gen);
          }
          if (k === 1) {
            const done = trip.done;
            trip = null;
            thread.setAttribute("class", "thread");
            done();
          }
        }
      }
      if (running || trip) requestAnimationFrame(frame);
      else ticking = false;
    }

    function wake() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    /** Puts class names on an element for a moment, to play an animation once. */
    function flash(el, names, ms) {
      if (!el) return;
      const list = names.split(" ");
      el.classList.remove("tone-agent", "tone-you", "tone-image");
      el.classList.add(...list);
      clearTimeout(el.flashTimer);
      el.flashTimer = setTimeout(() => el.classList.remove(list[0]), ms);
    }

    /** The glass answers a thread that leaves or enters: the cube swells, its glow flares and a sheen crosses its face. */
    function pulse(node) {
      flash(node.li, "is-pulse", 1000);
      if (node.cube.animate) {
        node.cube.animate([{ transform: "scale(1)" }, { transform: "scale(1.09)", offset: 0.3 }, { transform: "scale(1)" }], {
          duration: 700,
          easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        });
      }
    }

    function light(node, on) {
      node.lit = on;
      node.li.classList.toggle("is-lit", on);
    }

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const travel = (back) =>
      new Promise((done) => {
        trip = { back, tone: "", passed: false, arrived: false, start: performance.now(), time: (total) => ((total + TAIL) / SPEED) * 1000, done };
        wake();
      });

    // One round at a time: the prompt goes from an agent, through the folder, to a generator.
    // Then the picture comes back the same way.
    async function round(agent, gen) {
      pair = { agent, gen };
      light(agent, true);
      light(gen, true);
      route.classList.add("is-on");
      await wait(500);
      pulse(agent);
      await wait(120);
      await travel(false);
      await wait(900);
      pulse(gen);
      await wait(120);
      await travel(true);
      await wait(700);
      light(agent, false);
      light(gen, false);
      route.classList.remove("is-on");
      await wait(900);
      pair = null;
    }

    const real = (list) => list.filter((n) => !n.any);

    /** Draws from the list in a shuffled order: everyone gets a turn before anyone repeats, and never twice running. */
    const drawFrom = (list) => {
      let bag = [];
      let last = null;
      return () => {
        if (!bag.length) {
          bag = [...list];
          for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
          }
          // The bag is drawn from its end; keep the one just shown away from it.
          if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop());
        }
        last = bag.pop();
        return last;
      };
    };
    const nextAgent = drawFrom(real(agents));
    const nextGen = drawFrom(real(gens));

    async function loop() {
      if (looping) return;
      looping = true;
      // The first round waits for the hero's entrance to finish.
      if (!count) await wait(1900);
      while (running) {
        // Agent and generator are drawn at random, each from its own shuffled bag.
        await round(nextAgent(), nextGen());
        count++;
      }
      looping = false;
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) {
        wake();
        loop();
      }
    }

    if (hasObserver) {
      new IntersectionObserver(([entry]) => setRunning(entry.isIntersecting && !document.hidden), { threshold: 0.05 }).observe(hub);
    } else setRunning(true);
    document.addEventListener("visibilitychange", () => setRunning(!document.hidden && hub.getBoundingClientRect().bottom > 0));
  }
}
