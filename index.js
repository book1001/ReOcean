const $ = (id) => document.getElementById(id),
  sea = $("sea"),
  fill = $("fill"),
  mic = $("mic"),
  prompt = $("prompt"),
  action = $("action"),
  state = $("state");

const setState = (text) => (state.textContent = text);

let ctx,
  analyser,
  micStream,
  active = false,
  paused = false,
  began = 0,
  peak = 0,
  noiseFloor = 0.02,
  taps = [],
  lastSound = 0,
  raf;

const setText = (a, b) => {
  prompt.textContent = a;
  action.textContent = b;
};

function audio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, duration, type = "sine", gain = 0.1, slide) {
  const c = audio(),
    o = c.createOscillator(),
    g = c.createGain(),
    n = c.currentTime;
  o.type = type;
  o.frequency.setValueAtTime(freq, n);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, n + duration);
  g.gain.setValueAtTime(0.0001, n);
  g.gain.exponentialRampToValueAtTime(gain, n + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, n + duration);
  o.connect(g).connect(c.destination);
  o.start(n);
  o.stop(n + duration + 0.05);
}

const note = (m) => 440 * Math.pow(2, (m - 69) / 12);

function bell(m, d = 0.7, g = 0.04) {
  tone(note(m), d, "sine", g, note(m) * 1.004);
  setTimeout(() => tone(note(m + 12), d * 0.55, "sine", g * 0.2, note(m + 12) * 0.998), 35);
}

function chord(notes, d = 2.5, g = 0.05) {
  notes.forEach((m, i) => setTimeout(() => tone(note(m), d, "sine", g, note(m) * 0.992), i * 55));
}

function noise(duration, gain = 0.05) {
  const c = audio(),
    b = c.createBuffer(1, c.sampleRate * duration, c.sampleRate),
    d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(),
    g = c.createGain();
  g.gain.value = gain;
  s.buffer = b;
  s.connect(g).connect(c.destination);
  s.start();
}

function bubbles(count = 6, withSound = true, fromBottom = false) {
  const scale = [69, 72, 74, 76, 79, 81];
  for (let i = 0; i < count; i++) {
    let b = document.createElement("span");
    b.className = "bubble";
    let z = 30 + Math.random() * 20;
    b.style.cssText = `width:${z}px;height:${z}px;left:${44 + Math.random() * 13}%;bottom:${10 + Math.random() * 5}%;--dur:${2 + Math.random() * 2}s;--drift:${(Math.random() - 0.5) * 110}px`;
    if (fromBottom) {
      b.style.bottom = "0";
    }
    sea.append(b);
    setTimeout(() => b.remove(), 4300);
    if (withSound) {
      setTimeout(
        () => bell(scale[i % scale.length], 0.48, 0.018),
        i * 105
      );
    }
  }
  if (withSound) {
    noise(0.38, 0.012);
  }
}

let visibleWhales = 0;
let visibleDolphins = 0;

function updateOceanBackground() {
  document.body.classList.toggle(
    "whale-background",
    visibleWhales > 0
  );

  document.body.classList.toggle(
    "dolphin-background",
    visibleDolphins > 0
  );
}

function spawnCreature(id, animationClass) {
  const original = $(id);
  if (!original) return;

  if (id === "shrimp" || id === "seal") {
    const opposite = id === "shrimp" ? "seal" : "shrimp";

    sea.querySelectorAll(`.${opposite}.creature-instance`)
      .forEach((creature) => {
        creature.pause();
        creature.remove();
      });

    if (sea.querySelector(`.${id}.creature-instance`)) {
      return;
    }
  }

  const creature = original.cloneNode(true);

  creature.removeAttribute("id");
  creature.querySelectorAll("[id]").forEach((el) => {
    el.removeAttribute("id");
  });

  creature.classList.remove("active", "click", "hidden");
  creature.classList.add("creature-instance", animationClass);
  creature.setAttribute("aria-hidden", "true");

  if (id === "jellyfish") {
    creature.style.left = `${10 + Math.random() * 70}%`;
    creature.style.top = "100%";
    creature.style.bottom = "auto";

  } else if (id === "seal") {
    creature.style.left = `${35 + Math.random() * 10}%`;
    creature.style.top = "auto";
    creature.style.bottom = "-35px";

  } else if (id === "shrimp") {
    creature.style.left = `${30 + Math.random() * 20}%`;
    creature.style.top = "auto";
    creature.style.bottom = "-35px";

  } else {
    creature.style.top = `${Math.random() * 35}%`;
    creature.style.setProperty(
      "--rise",
      `-${8 + Math.random() * 10}vh`
    );
  }

  const isWhale = id === "whale";
  const isDolphin = id === "dolphins";
  let removed = false;

  if (isWhale) visibleWhales++;
  if (isDolphin) visibleDolphins++;

  updateOceanBackground();

  const removeCreature = () => {
    if (removed) return;
    removed = true;

    creature.pause();
    creature.remove();

    if (isWhale) visibleWhales--;
    if (isDolphin) visibleDolphins--;

    updateOceanBackground();
  };

  creature.addEventListener("animationend", (event) => {
    if (event.target === creature) removeCreature();
  });

  creature.addEventListener("animationcancel", (event) => {
    if (event.target === creature) removeCreature();
  });

  creature.muted = true;
  creature.autoplay = true;
  creature.loop = true;
  creature.playsInline = true;

  sea.append(creature);
  creature.play().catch(() => {});

  const lifetimes = {
    whale: 12000,
    dolphins: 6000,
    shrimp: 6000,
    jellyfish: 14000,
    seal: 9000,
  };

  setTimeout(removeCreature, lifetimes[id] ?? 12000);
}


function shrimp() {
  spawnCreature("shrimp", "active");
  setText("鼓虾回应了你", "短促的气流，像深海乐器的一下点拍");
  bubbles(4);
  noise(0.07, 0.11);
  bell(74, 0.24, 0.052);
  setTimeout(() => bell(81, 0.38, 0.018), 85);
}

function dolphin() {
  spawnCreature("dolphins", "active");
  setText("海豚从身边掠过", "连续短吹，唤来一段上行的海中旋律");
  bubbles(4);
  [74, 76, 79, 81, 84, 81].forEach((m, i) => setTimeout(() => bell(m, 0.48, 0.045), i * 185));
}

function whale() {
  spawnCreature("whale", "active");
  setText("鲸鱼听见了你", "一段漫长的呼吸，化作深海的低音和弦");
  chord([38, 45, 50], 5.2, 0.065);
  setTimeout(() => chord([41, 48, 53], 4.6, 0.04), 850);
  setTimeout(() => bell(62, 2.5, 0.018), 1400);
}

function jellyfish() {
  spawnCreature("jellyfish", "active");
  setText("水母发出微光", "几乎听不见的轻吹，变成漂浮的铃音");
  bubbles(4);
  [76, 79, 81, 84, 81].forEach((m, i) => setTimeout(() => bell(m, 1.05, 0.025), i * 260));
}

function seal() {
  spawnCreature("seal", "active");
  setText("海狮在远处呼应", "有力的吹气，带来一段俏皮的低音节奏");
  bubbles(4);
  [50, 53, 57, 53].forEach((m, i) =>
    setTimeout(() => tone(note(m), 0.52, "triangle", 0.062, note(m) * 0.985), i * 220)
  );
}

function humpback() {
  const e = $("whale");
  e.classList.remove("active");
  void e.offsetWidth;
  e.classList.add("active");
  setText("座头鲸唱起歌", "一口很长的气息，让整片海成为缓慢流动的乐章");
  [
    [38, 45, 50],
    [41, 48, 53],
    [43, 50, 55],
    [38, 45, 50],
  ].forEach((notes, i) => setTimeout(() => chord(notes, 4.5, 0.055), i * 900));
  [62, 65, 69].forEach((m, i) => setTimeout(() => bell(m, 2.4, 0.018), 1100 + i * 650));
}

function finish(duration, strength) {
  const now = Date.now();
  // if (now - lastSound < 380) return;
  if (now - lastSound < 150) return;
  lastSound = now;
  if (duration > 3900) humpback();
  else if (duration > 1450) whale();
  // else if (strength > 0.68 && duration > 430) seal();
   else if (duration > 1000) seal();
  // else if (duration > 430) seal();
  else if (duration < 420) {
    taps.push(now);
    taps = taps.filter((t) => now - t < 1300);
    if (taps.length >= 3) {
      taps = [];
      dolphin();
    } else shrimp();
  } else if (duration >= 700 && duration < 1450 && strength < 0.35) jellyfish();
  else {
    setText("气泡正在上升", "轻柔的水流围绕着你");
    bubbles(9);
  }
}

function updateMicWave(level) {
  const value = Math.max(0, Math.min(1, level));
  const hue = 190 + value * 140;

  mic.style.setProperty("--sound-scale", 1 + value * 0.8);
  mic.style.setProperty("--sound-color", `hsl(${hue}, 90%, 75%)`);
  mic.style.setProperty(
    "--sound-fill",
    `hsla(${hue}, 90%, 75%, ${value * 0.18})`
  );
}

function listen() {
  if (!analyser) return;
  const data = new Uint8Array(analyser.fftSize);
  const loop = () => {
    if (paused) {
      updateMicWave(0);
      // fill.style.width = "0";
      // mic.style.transform = "scale(1)";
      raf = requestAnimationFrame(loop);
      return;
    }
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const x of data) {
      const y = (x - 128) / 128;
      sum += y * y;
    }
    let level = Math.min(1, Math.sqrt(sum / data.length) * 9);
    const now = performance.now();

    updateMicWave(level);
    // fill.style.width = level * 100 + "%";
    // mic.style.transform = `scale(${1 + level * 0.16})`;
    if (!active) noiseFloor = noiseFloor * 0.97 + level * 0.03;
    const startAt = noiseFloor + 0.045;
    const releaseAt = noiseFloor + Math.max(0.012, (peak - noiseFloor) * 0.32);
    if (level > startAt && !active) {
      active = true;
      began = now;
      peak = level;
      setState("正在感受气流");
    }
    if (active) peak = Math.max(peak, level);
    if (active && level < releaseAt && now - began > 90) {
      active = false;
      setState("深海正在回应");
      finish(now - began, peak);
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
}

$("start").addEventListener("click", async () => {
  try {
    audio();
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    ctx.createMediaStreamSource(micStream).connect(analyser);
    $("start").classList.add("hidden");
    $("title").classList.add("hidden");
    $("preview1").classList.add("hidden");
    $("preview2").classList.add("hidden");
    $("micInfo").classList.remove("hidden");
    mic.classList.remove("hidden");
    $("ambient-videos").classList.remove("hidden");
    startAmbientVideos();
    $("pause").classList.remove("hidden");
    noiseFloor = 0.02;
    setText("对着麦克风，吹出海的语言", "听到两声提示音后，就可以开始吹气");
    setState("正在聆听");
    tone(610, 0.22, "sine", 0.05, 790);
    setTimeout(() => tone(820, 0.28, "sine", 0.04, 1040), 260);
    listen();
  } catch (e) {
    setText("需要麦克风权限", "请允许浏览器使用麦克风，然后再试一次。");
    setState("未获得权限");
  }
});

$("pause").addEventListener("click", () => {
  cancelAnimationFrame(raf);

  micStream?.getTracks().forEach((track) => track.stop());
  micStream = null;
  analyser = null;

  active = false;
  paused = false;
  began = 0;
  peak = 0;
  taps = [];
  lastSound = 0;
  noiseFloor = 0.02;

  updateMicWave(0);

  sea.querySelectorAll(".creature-instance").forEach((creature) => {
    creature.pause();
    creature.remove();
  });

  visibleWhales = 0;
  visibleDolphins = 0;
  updateOceanBackground();

  mic.classList.add("hidden");
  $("pause").classList.add("hidden");
  $("start").classList.remove("hidden");
  $("title").classList.remove("hidden");
  $("preview1").classList.remove("hidden");
  $("preview2").classList.remove("hidden");
  $("ambient-videos").classList.add("hidden");
  $("micInfo")?.classList.add("hidden");

});

// $("pause").addEventListener("click", () => {
//   paused = !paused;
//   active = false;
//   if (paused) {
//     ctx.suspend();
//     // $("pause").textContent = "继续深海";
//     // setText("深海已暂停", "此时吹气不会触发声音");
//     // setState("暂停中");
//   } else {
//     ctx.resume();
//     // $("pause").textContent = "暂停深海";
//     // setText("深海再次聆听", "对着麦克风，吹出海的语言");
//     // setState("正在聆听");
//   }
// });

function updateMicInfo() {
  const micInfo = $("micInfo");
  if (!micInfo) return;

  const hasCreature = !!sea.querySelector(".creature-instance");

  micInfo.classList.toggle("is-hidden", hasCreature);
}

const micInfoObserver = new MutationObserver(updateMicInfo);

micInfoObserver.observe(sea, {
  childList: true,
  subtree: true,
});

updateMicInfo();



function startScreenBubbles() {
  const delay = 2000 + Math.random() * 3000;

  setTimeout(() => {
    const isStartScreen =
      !$("start").classList.contains("hidden");

    if (isStartScreen) {
      bubbles(9, false, true);
    }

    startScreenBubbles();
  }, delay);
}

startScreenBubbles();