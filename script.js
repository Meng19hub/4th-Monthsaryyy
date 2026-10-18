/* ==========================================================================
   📷  YOUR PHOTOS — just paste the image path for each spot.
   Put the pictures in an "img" folder next to index.html, e.g. "img/us1.jpg".
   Leave "" to show a soft placeholder for that spot.
   ========================================================================== */
const img1 = "gandaa.jpg";  // left frame, top
const img2 = "ganda.jpg";  // left frame, bottom
const img3 = "unif.jpg";  // circle 1 — top left        (caption: asar moko)
const img4 = "busy.jpg";  // circle 2 — top right       (caption: busy ikaw)
const img5 = "compliment.jpg";  // circle 3 — middle          (caption: compliment moko)
const img6 = "lambing.jpg";  // circle 4 — bottom left     (caption: u make lambing)
const img7 = "tagal.jpg";  // circle 5 — bottom right    (caption: u reply so tagal)

// How photos fit their frames:
//   "contain" = zoomed OUT, you see the whole picture (nothing cropped)
//   "cover"   = zoomed IN, fills the frame fully (edges get cropped)
const PHOTO_FIT = "contain";

/* ==========================================================================
   ✏️  EDIT ME — everything personal lives in this one object
   ========================================================================== */
const CONFIG = {
  title:     "Happy Monthsary, dabi!",
  subtitle:  "wanna see my gift?",
  yesLabel:  "YES LOVIE",
  noLabel:   "NO THANKS",
  sadText:   "u sure, baby? i'm sure you'll love it :(",

  menuTitle:  "pick and click !",
  menuFooter: "i hope you'll love them, Dabi",

  /* photo page ---------------------------------------------------------- */
  photoHeading: "ME|WHEN:",          // shown vertically; "|" makes a gap
  // order: top-left, top-right, middle, bottom-left, bottom-right
 captions: [" naka unif ikaw", "busy ikaw", "compliment kita", "u make lambing", "u reply so tagal"],
  // photos: set the img1 … img7 variables at the very top of this file.

  /* letter -------------------------------------------------------------- */
  letterTitle: "happy monthsary, dabi!",
  letter:
    "Another month has passed and i'm beyond grateful that i get to spend it with you. " +
    "Things aren't always perfect, But what matters most is that we always choose each other in the end. " +
    "You've shown me love in ways i never thought i deserved, And that makes me feel so lucky to have you. " +
    "I love how you make me laugh, How you understand me even in silence, And how you remind me that i'm never alone. " +
    "Thank you for staying, For trying, And for loving me through both the good and tough days. " +
    "You're my comfort, My safe place, And my partner in everything. " +
    "I'm so proud of us, Of how far we've come, And i know there's still so much more to look forward to together. " +
    "No matter what, I'll keep choosing you every single day. " +
    "I love you endlessly, And I'll never stop saying it. Cheers to more months and years with you, My love.",
  signature: "- ur babi",

  /* flowers + song ------------------------------------------------------ */
  flowersTitle: ["flowers!", "and a song 4 you"],
  // YOUR MP3: put it in a "music" folder next to index.html and name it
  // song.mp3 — that's it. (Different name? change "src" below. Set the
  // title/artist to whatever should show on the player.)
  // If the file isn't found, a gentle generated lullaby plays instead.
  songs: [
    { title: "Our Song", artist: "for you, Dabi", src: "Ngiti - The Juans (Official Lyric Video).mp3" }
  ]
};

/* ==========================================================================
   Helpers
   ========================================================================== */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ==========================================================================
   Music-box synth (original melody, generated in-browser -> WAV blob)
   ========================================================================== */
function makeMusicBox() {
  const sr = 16000, bpm = 68, beat = 60 / bpm, barBeats = 4;
  const passes = 2;                                   // play the 8-bar phrase twice
  const chords = [
    [48,55,59,64], [45,55,60,64], [41,57,60,64], [43,55,59,62],   // C  Am7  Fmaj7  G
    [40,55,59,62], [45,55,60,64], [41,57,60,64], [43,55,59,62]    // Em7 Am7 Fmaj7  G
  ];
  const melody = [
    [[0,76],[1.5,74],[2,72],[3,74]],
    [[0,76],[1,79],[2.5,76],[3,74]],
    [[0,72],[1.5,76],[2,77],[3,76]],
    [[0,74],[2,71],[3,74]],
    [[0,76],[1.5,79],[2,81],[3,79]],
    [[0,76],[1,72],[2,76],[3,74]],
    [[0,72],[1,77],[2,76],[3,72]],
    [[0,74],[1.5,71],[2,72]]
  ];
  const bars = chords.length * passes;
  const dur = bars * barBeats * beat + 3.5;
  const N = Math.floor(sr * dur);
  const out = new Float32Array(N);
  const TAU = Math.PI * 2;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  function note(t, m, vel, len) {
    const f = hz(m), start = Math.floor(t * sr), L = Math.min(Math.floor(len * sr), N - start);
    if (L <= 0) return;
    const d1 = Math.exp(-2.4 / sr), d2 = Math.exp(-5.5 / sr), d3 = Math.exp(-10 / sr);
    let e1 = 1, e2 = 1, e3 = 1;
    for (let i = 0; i < L; i++) {
      const x = i / sr;
      const atk = x < 0.004 ? x / 0.004 : 1;
      const s = Math.sin(TAU * f * x) * e1
              + 0.34 * Math.sin(TAU * f * 2 * x) * e2
              + 0.16 * Math.sin(TAU * f * 4.1 * x) * e3;
      out[start + i] += s * atk * vel;
      e1 *= d1; e2 *= d2; e3 *= d3;
    }
  }

  for (let b = 0; b < bars; b++) {
    const ci = b % chords.length, ch = chords[ci], t0 = b * barBeats * beat;
    const v = 0.17 * (b >= chords.length ? 1.06 : 1);
    note(t0, ch[0] - 12, v * 1.3, 3.2);                       // bass on 1
    note(t0 + 2 * beat, ch[1] - 12, v * 0.9, 2.4);            // bass on 3
    const pat = [1, 2, 3, 2, 1, 2, 3, 2];
    pat.forEach((p, k) => note(t0 + k * beat / 2, ch[p], v * 0.55, 1.6));
    melody[ci].forEach(([bt, m]) => note(t0 + bt * beat, m, v * 0.85, 2.4));
  }

  // soft echo for a bit of room
  const dA = Math.floor(0.31 * sr), dB = Math.floor(0.53 * sr);
  for (let i = dA; i < N; i++) out[i] += 0.22 * out[i - dA] + (i >= dB ? 0.12 * out[i - dB] : 0);

  // fade tail + normalise
  let peak = 0;
  for (let i = 0; i < N; i++) { const a = Math.abs(out[i]); if (a > peak) peak = a; }
  const g = peak ? 0.85 / peak : 1, fade = Math.floor(sr * 1.2);
  for (let i = 0; i < N; i++) {
    const r = N - i; out[i] *= g * (r < fade ? r / fade : 1);
  }

  // encode 16-bit mono WAV
  const buf = new ArrayBuffer(44 + N * 2), v = new DataView(buf);
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); v.setUint32(4, 36 + N * 2, true); wr(8, 'WAVE'); wr(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  wr(36, 'data'); v.setUint32(40, N * 2, true);
  for (let i = 0; i < N; i++) {
    const s = Math.max(-1, Math.min(1, out[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

/* ==========================================================================
   App
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- text from CONFIG ---------- */
  document.title = CONFIG.title;
  $('#homeTitle').textContent  = CONFIG.title;
  $('#homeSub').textContent    = CONFIG.subtitle;
  $('#yesBtn').textContent     = CONFIG.yesLabel;
  $('#noBtn').textContent      = CONFIG.noLabel;
  $('#sadText').textContent    = CONFIG.sadText;
  $('#menuTitle').textContent  = CONFIG.menuTitle;
  $('#menuFooter').textContent = CONFIG.menuFooter;
  $('#letterTitle').textContent= CONFIG.letterTitle;
  $('#letterBody').textContent = CONFIG.letter;
  $('#letterSig').textContent  = CONFIG.signature;
  $('#fTitle').innerHTML = CONFIG.flowersTitle.map(t => `<span>${esc(t)}</span>`).join('');

  /* vertical heading letters ("|" = gap) */
  $('#mewhen').setAttribute('aria-label', CONFIG.photoHeading.replace('|', ' '));
  $('#mewhen').innerHTML = Array.from(CONFIG.photoHeading)
    .map(ch => ch === '|' ? '<span class="gap"></span>' : `<span aria-hidden="true">${esc(ch)}</span>`).join('');

  /* ---------- screen navigation ---------- */
  const order = ['home', 'sad', 'menu', 'photos', 'letter', 'flowers'];
  const screens = Object.fromEntries(order.map(n => [n, document.getElementById(n)]));
  let current = 'home';

  function go(name) {
    if (!screens[name] || name === current) return;
    const from = current;
    screens[from].classList.remove('active');
    screens[from].inert = true;
    screens[name].classList.add('active');
    screens[name].inert = false;
    current = name;
    screens[name].scrollTop = 0;
    if (from === 'flowers') player.pause();
    if (name === 'flowers') player.start();
    const f = screens[name].querySelector('button');
    if (f) f.focus({ preventScroll: true });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(b.dataset.go);
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (['photos', 'letter', 'flowers'].includes(current)) go('menu');
    else if (['menu', 'sad'].includes(current)) go('home');
  });

  /* ---------- photos ---------- */
  const CIRCLES = [
    { cx: 72,  cy: 66,  r: 44, tx: 150, ty: 24,  arrow: 'M120 20 Q108 22 106 34' },
    { cx: 250, cy: 60,  r: 40, tx: 178, ty: 60,  arrow: 'M188 47 Q196 32 210 33' },
    { cx: 160, cy: 128, r: 42, tx: 168, ty: 208, arrow: 'M126 202 Q116 186 134 174' },
    { cx: 52,  cy: 182, r: 44, tx: 82,  ty: 250, arrow: 'M36 246 Q16 244 24 226' },
    { cx: 268, cy: 190, r: 38, tx: 252, ty: 128, arrow: 'M234 132 Q226 148 234 160' }
  ];
  const photos = Array(7).fill(null);
  [img1, img2, img3, img4, img5, img6, img7].forEach((u, i) => { photos[i] = u || null; });

  function placeholder(i) {
    const h = [350, 210, 20, 280, 170, 40, 320][i % 7];
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h},26%,86%)"/><stop offset="1" stop-color="hsl(${h},22%,70%)"/></linearGradient></defs>` +
      `<rect width="200" height="200" fill="url(#g)"/>` +
      `<circle cx="100" cy="82" r="30" fill="#fff" fill-opacity=".55"/>` +
      `<path d="M40 200c0-42 27-64 60-64s60 22 60 64z" fill="#fff" fill-opacity=".55"/>` +
      `<g transform="translate(150 150)"><circle r="15" fill="#fff" fill-opacity=".9"/>` +
      `<path d="M0-7v14M-7 0h14" stroke="#555" stroke-width="2.6" stroke-linecap="round"/></g></svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* build the circle cluster */
  (function buildCluster() {
    let defs = '<defs>' +
      '<marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">' +
      '<path d="M1.5 1.5 L8.5 5 L1.5 8.5" fill="none" stroke="#2a2a2e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker>' +
      '<filter id="sh" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".26"/></filter>';
    CIRCLES.forEach((c, i) => { defs += `<clipPath id="clip${i}"><circle cx="${c.cx}" cy="${c.cy}" r="${c.r}"/></clipPath>`; });
    defs += '</defs>';
    let body = '';
    CIRCLES.forEach((c, i) => {
      body += `<path d="${c.arrow}" class="arrow" marker-end="url(#ah)"/>`;
      body += `<text x="${c.tx}" y="${c.ty}" text-anchor="middle" class="cap">${esc(CONFIG.captions[i] || '')}</text>`;
      body += `<g class="slot" role="img" aria-label="Photo ${i + 3}" filter="url(#sh)">` +
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r + 7}" class="ring"/>` +
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r + 3}" class="ring2"/>` +
        `<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" fill="#ebe7e1"/>` +
        `<image id="img${i}" x="${c.cx - c.r}" y="${c.cy - c.r}" width="${c.r * 2}" height="${c.r * 2}" preserveAspectRatio="${PHOTO_FIT === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}" clip-path="url(#clip${i})"/>` +
        `</g>`;
    });
    $('#cluster').innerHTML = defs + body;
  })();

  const frames = $$('.frame');
  function applyPhoto(i) {
    const src = photos[i] || placeholder(i);
    if (i < 2) {
      frames[i].style.backgroundImage = `url("${src}")`;
      frames[i].style.backgroundSize = PHOTO_FIT;
      frames[i].style.backgroundRepeat = 'no-repeat';
    }
    else $('#img' + (i - 2)).setAttribute('href', src);
  }
  for (let i = 0; i < 7; i++) applyPhoto(i);

  /* ---------- player ---------- */
  const player = (() => {
    const audio = new Audio();
    audio.preload = 'auto';
    const el = {
      title: $('#pTitle'), artist: $('#pArtist'), seek: $('#pSeek'), cur: $('#pCur'), dur: $('#pDur'),
      play: $('#pPlay'), icon: $('#pPlayIcon'), prev: $('#pPrev'), next: $('#pNext'),
      shuffle: $('#pShuffle'), repeat: $('#pRepeat'),
      mute: $('#pMute'), muteIcon: $('#pMuteIcon'), share: $('#pShare')
    };
    const ICON_PLAY  = '<path d="M6 4l14 8-14 8z"/>';
    const ICON_PAUSE = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
    const ICON_VOL   = '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>';
    const ICON_MUTE  = '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>';

    let tracks = [], idx = 0, shuffle = false, repeat = false, seeking = false;
    let wantPlay = false, fellBack = false;

    const fmt = s => {
      if (!isFinite(s) || s < 0) s = 0;
      s = Math.floor(s);
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    };

    function synthTrack() {
      return { title: 'Our Little Song', artist: 'made for you, baby', src: makeMusicBox(), synth: true };
    }
    function ensureTracks() {
      if (tracks.length) return;
      const custom = (CONFIG.songs || []).filter(s => s && s.src);
      tracks = custom.length
        ? custom.map(s => ({ title: s.title || 'Untitled', artist: s.artist || '', src: s.src }))
        : [synthTrack()];
      load(0, false);
    }

    function load(i, autoplay) {
      idx = ((i % tracks.length) + tracks.length) % tracks.length;
      const t = tracks[idx];
      audio.src = t.src;
      el.title.textContent = t.title;
      el.artist.textContent = t.artist;
      paintProgress(0);
      el.cur.textContent = '0:00';
      el.dur.textContent = '-0:00';
      if (autoplay) play();
    }

    function play() {
      wantPlay = true;
      ensureTracks();
      const p = audio.play();
      if (p && p.catch) p.catch(() => setIcon(false));
    }
    function pause() { wantPlay = false; audio.pause(); }
    function setIcon(playing) {
      el.icon.innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
      el.play.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    }
    function paintProgress(p) {
      el.seek.value = Math.round(p * 1000);
      el.seek.style.setProperty('--p', (p * 100) + '%');
    }
    function nextIndex() {
      if (tracks.length < 2) return idx;
      if (!shuffle) return idx + 1;
      let n; do { n = Math.floor(Math.random() * tracks.length); } while (n === idx);
      return n;
    }

    audio.addEventListener('play',  () => setIcon(true));
    audio.addEventListener('pause', () => setIcon(false));
    audio.addEventListener('loadedmetadata', () => { el.dur.textContent = '-' + fmt(audio.duration); });
    audio.addEventListener('timeupdate', () => {
      const d = audio.duration;
      if (!seeking) paintProgress(d ? audio.currentTime / d : 0);
      el.cur.textContent = fmt(audio.currentTime);
      el.dur.textContent = '-' + fmt(d - audio.currentTime);
    });
    audio.addEventListener('ended', () => {
      if (repeat) { audio.currentTime = 0; play(); }
      else if (tracks.length > 1) load(nextIndex(), true);
      else { audio.currentTime = 0; paintProgress(0); setIcon(false); }
    });
    audio.addEventListener('error', () => {
      if (!audio.getAttribute('src')) return;
      // mp3 missing or unreadable -> fall back to the generated lullaby
      if (!fellBack && tracks[idx] && !tracks[idx].synth) {
        fellBack = true;
        tracks = [synthTrack()];
        load(0, wantPlay);
      }
    });

    el.play.addEventListener('click', () => { audio.paused ? play() : pause(); });
    el.prev.addEventListener('click', () => {
      ensureTracks();
      if (audio.currentTime > 3 || tracks.length < 2) { audio.currentTime = 0; }
      else load(idx - 1, !audio.paused);
    });
    el.next.addEventListener('click', () => {
      ensureTracks();
      if (tracks.length < 2) { audio.currentTime = 0; return; }
      load(nextIndex(), !audio.paused);
    });
    el.shuffle.addEventListener('click', () => {
      shuffle = !shuffle;
      el.shuffle.classList.toggle('on', shuffle);
      el.shuffle.setAttribute('aria-pressed', shuffle);
    });
    el.repeat.addEventListener('click', () => {
      repeat = !repeat;
      el.repeat.classList.toggle('on', repeat);
      el.repeat.setAttribute('aria-pressed', repeat);
    });

    el.seek.addEventListener('pointerdown', () => { seeking = true; });
    el.seek.addEventListener('input', () => {
      const p = el.seek.value / 1000;
      el.seek.style.setProperty('--p', (p * 100) + '%');
      if (isFinite(audio.duration)) {
        audio.currentTime = p * audio.duration;
        el.cur.textContent = fmt(audio.currentTime);
      }
    });
    const endSeek = () => { seeking = false; };
    el.seek.addEventListener('change', endSeek);
    window.addEventListener('pointerup', endSeek);

    el.mute.addEventListener('click', () => {
      audio.muted = !audio.muted;
      el.muteIcon.innerHTML = audio.muted ? ICON_MUTE : ICON_VOL;
      el.mute.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
    });

    el.share.addEventListener('click', async () => {
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) { await navigator.share({ title: document.title, url }); return; }
        await navigator.clipboard.writeText(url);
        toast('link copied 💌');
      } catch (_) { /* user cancelled or clipboard blocked */ }
    });

    return {
      warm() { ensureTracks(); },
      start() { ensureTracks(); if (audio.ended) audio.currentTime = 0; play(); },
      pause
    };
  })();

  /* warm up the generated song shortly after load so the first tap is instant */
  window.addEventListener('load', () => setTimeout(() => { try { player.warm(); } catch (_) {} }, 300));
})();
