/* ===== Karar Pusulası · Etkileşim ===== */
(() => {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  /* ---- Kartları görünürken yumuşakça getir ---- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.15 }
  );
  $$(".card").forEach((c) => io.observe(c));

  /* ============ 1. Yazı-Tura ============ */
  const coin = $("#coinEl");
  const coinHint = $("#coinHint");
  const hints = [
    "Hissine kulak ver: sonuç hayal kırıklığı yarattıysa, cevabını çoktan biliyorsun.",
    "İçinden “bir daha atsam mı?” geçtiyse, gerçek tercihin ortada.",
    "Çoğu zaman doğru cevap, attığın anda hissettiğin ilk duygudur.",
    "Sonuç ne olursa olsun, küçük bir adım büyük bir tıkanıklıktan iyidir.",
  ];
  let coinBusy = false;
  $("#coinFlip").addEventListener("click", () => {
    if (coinBusy) return;
    coinBusy = true;
    const yes = Math.random() < 0.5;
    coin.classList.remove("result-yes", "result-no", "flipping");
    void coin.offsetWidth; // reflow → animasyonu yeniden tetikle
    coin.classList.add("flipping");
    coinHint.textContent = "…";
    setTimeout(() => {
      coin.classList.remove("flipping");
      coin.classList.add(yes ? "result-yes" : "result-no");
      coinHint.textContent = rand(hints);
      coinBusy = false;
    }, 1500);
  });

  /* ============ 2. Karar Çarkı ============ */
  const canvas = $("#wheelCanvas");
  const ctx = canvas.getContext("2d");
  const palette = ["#8b7bff", "#5fd0c5", "#ffb37a", "#ff8095", "#7aa7ff", "#c08bff", "#6ddf9c"];
  let options = ["Evet, yap", "Bekle", "Belki yarın", "Kesinlikle"];
  let wheelAngle = 0;
  let wheelBusy = false;
  const chipsBox = $("#wheelChips");
  const wheelResult = $("#wheelResult");

  function drawWheel() {
    const n = options.length;
    const r = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (n === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI * 2); ctx.fill();
      return;
    }
    const slice = (Math.PI * 2) / n;
    for (let i = 0; i < n; i++) {
      const start = i * slice + wheelAngle;
      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r, start, start + slice);
      ctx.closePath();
      ctx.fillStyle = palette[i % palette.length];
      ctx.fill();
      // metin
      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(10,12,30,0.85)";
      ctx.font = "600 14px Inter, sans-serif";
      const label = options[i].length > 14 ? options[i].slice(0, 13) + "…" : options[i];
      ctx.fillText(label, r - 16, 5);
      ctx.restore();
    }
    // merkez halkası
    ctx.beginPath(); ctx.arc(r, r, 42, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(14,16,36,0.9)"; ctx.fill();
  }

  function renderChips() {
    chipsBox.innerHTML = "";
    options.forEach((opt, i) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      const dot = `<span style="width:9px;height:9px;border-radius:50%;background:${palette[i % palette.length]}"></span>`;
      chip.innerHTML = `${dot}<span>${opt}</span>`;
      const x = document.createElement("button");
      x.type = "button"; x.textContent = "×"; x.setAttribute("aria-label", `${opt} sil`);
      x.addEventListener("click", () => {
        options.splice(i, 1);
        renderChips(); drawWheel();
      });
      chip.appendChild(x);
      chipsBox.appendChild(chip);
    });
  }

  $("#wheelForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("#wheelInput");
    const val = input.value.trim();
    if (!val || options.length >= 8) { input.value = ""; return; }
    options.push(val);
    input.value = "";
    renderChips(); drawWheel();
  });

  $("#wheelSpin").addEventListener("click", () => {
    if (wheelBusy || options.length < 2) return;
    wheelBusy = true;
    wheelResult.textContent = "";
    const turns = 5 + Math.random() * 4;
    const finalRot = wheelAngle + turns * Math.PI * 2 + Math.random() * Math.PI * 2;
    canvas.style.transform = `rotate(${finalRot}rad)`;
    const slice = (Math.PI * 2) / options.length;
    // İbre tepe noktasında (12 yön = -PI/2). Hangi dilim oraya denk geliyor?
    const norm = ((finalRot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const pointerAngle = (-Math.PI / 2 - norm + Math.PI * 4) % (Math.PI * 2);
    const idx = Math.floor(pointerAngle / slice) % options.length;
    setTimeout(() => {
      wheelResult.innerHTML = `Pusula diyor ki: <strong>${options[idx]}</strong>`;
      wheelBusy = false;
    }, 4600);
  });

  renderChips();
  drawWheel();

  /* ============ 3. Karar Tartısı ============ */
  const pros = [];
  const cons = [];
  const proList = $("#proList");
  const conList = $("#conList");
  const scaleFill = $("#scaleFill");
  const verdict = $("#scaleVerdict");

  function renderScale() {
    [["pro", pros, proList], ["con", cons, conList]].forEach(([side, arr, ul]) => {
      ul.innerHTML = "";
      arr.forEach((item, i) => {
        const li = document.createElement("li");
        const txt = document.createElement("span");
        txt.textContent = item.text;
        const w = document.createElement("span");
        w.className = "wlabel"; w.textContent = "önem " + item.weight;
        const del = document.createElement("button");
        del.className = "del"; del.type = "button"; del.textContent = "×";
        del.setAttribute("aria-label", "Sil");
        del.addEventListener("click", () => { arr.splice(i, 1); renderScale(); });
        li.append(txt, w, del);
        ul.appendChild(li);
      });
    });

    const proScore = pros.reduce((s, x) => s + x.weight, 0);
    const conScore = cons.reduce((s, x) => s + x.weight, 0);
    const total = proScore + conScore;
    if (total === 0) {
      scaleFill.style.width = "50%";
      verdict.textContent = "Henüz tartacak bir şey yok. Birkaç madde ekle.";
      return;
    }
    const pct = (proScore / total) * 100;
    scaleFill.style.width = pct.toFixed(0) + "%";
    const diff = proScore - conScore;
    let msg;
    if (diff > 2) msg = `Terazi “evet”e ağıyor (👍 ${proScore} – 👎 ${conScore}). İçin de rahatsa, ilerle.`;
    else if (diff < -2) msg = `Terazi “hayır”a ağıyor (👍 ${proScore} – 👎 ${conScore}). Belki şimdi değil.`;
    else msg = `Neredeyse başa baş (👍 ${proScore} – 👎 ${conScore}). Çok yakınsa, küçük bir deneme yap ya da ertele.`;
    verdict.textContent = msg;
  }

  $$(".scale-add").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input", form);
      const select = $("select", form);
      const text = input.value.trim();
      if (!text) return;
      const item = { text, weight: parseInt(select.value, 10) };
      (form.dataset.side === "pro" ? pros : cons).push(item);
      input.value = "";
      renderScale();
    });
  });

  /* ============ 4. Mini Kararlar ============ */
  const ideas = {
    yemek: [
      "Bugün sevdiğin o basit makarnayı yap — abartma.", "Sıcak bir çorba ısmarla, üşenme.",
      "Buzdolabındaki ilk üç şeyle bir omlet.", "Kendine güzel bir kahvaltı tabağı hazırla.",
      "Fırına sebze at, gerisi kendiliğinden olur.", "Bir tost ve yanında meyve — yeter.",
      "Yeni bir tarif dene; başarısız olursa da hikâye olur.", "Sipariş ver ve suçluluk duyma, bugün böyle.",
    ],
    aktivite: [
      "20 dakikalık kısa bir yürüyüş — telefonsuz.", "Sevdiğin bir albümü baştan sona dinle.",
      "Odanın tek bir köşesini topla, hepsini değil.", "Yarım kalmış o diziyi tek bölüm izle.",
      "5 dakika serbest yaz: aklından geçen ne varsa.", "Birine kısa bir mesaj at: “aklıma geldin”.",
      "Pencereyi aç, 10 dakika sadece dışarı bak.", "Eski bir fotoğraf albümünü karıştır.",
    ],
    kucuk: [
      "Bir bardak su iç — gerçekten, şimdi.", "Omuzlarını indir, çeneni gevşet.",
      "Bugün yapmadığın bir şey için kendini suçlama.", "Telefonu 30 dakika uçak moduna al.",
      "Yapılacaklar listenden en küçük maddeyi sil ya da yap.", "Aynaya bak ve bir güzel şey söyle.",
      "Yarına bir şeyi ertelemek de bir karardır — sorun değil.", "Derin bir nefes: bu an yeterince iyi.",
    ],
  };
  let miniTopic = "yemek";
  const miniOutput = $("#miniOutput");
  $("#miniTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".mini-tab");
    if (!tab) return;
    miniTopic = tab.dataset.topic;
    $$(".mini-tab").forEach((t) => t.classList.toggle("is-active", t === tab));
    rollMini();
  });
  function rollMini() {
    miniOutput.style.opacity = "0";
    setTimeout(() => {
      miniOutput.textContent = rand(ideas[miniTopic]);
      miniOutput.style.opacity = "1";
    }, 200);
  }
  $("#miniRoll").addEventListener("click", rollMini);

  /* ============ 5. Nefes ============ */
  const circle = $("#breatheCircle");
  const breatheText = $("#breatheText");
  const btn = $("#breatheBtn");
  let breathing = false;
  let breatheTimers = [];
  function clearBreathe() { breatheTimers.forEach(clearTimeout); breatheTimers = []; }
  function cycle() {
    // 4s al · 4s tut · 6s ver  = 14s (CSS animasyonu ile senkron)
    breatheText.textContent = "Nefes al…";
    breatheTimers.push(setTimeout(() => (breatheText.textContent = "Tut…"), 4000));
    breatheTimers.push(setTimeout(() => (breatheText.textContent = "Yavaşça ver…"), 8000));
  }
  btn.addEventListener("click", () => {
    breathing = !breathing;
    if (breathing) {
      circle.classList.add("run");
      btn.textContent = "Durdur";
      cycle();
      breatheTimers.push(setInterval(cycle, 14000));
    } else {
      clearBreathe();
      circle.classList.remove("run");
      breatheText.textContent = "Başla";
      btn.textContent = "Nefes egzersizini başlat";
    }
  });

  /* ============ Footer · dönen alıntı ============ */
  const quotes = [
    "“En iyi karar genellikle bir sonrakini almana izin verendir.”",
    "“Mükemmel kararı bekleme; iyi bir karar al, gerisini düzelt.”",
    "“Karasızlık da bir karardır — ama nadiren senin lehine.”",
    "“Küçük adım, donup kalmaktan her zaman iyidir.”",
    "“Yanlış kapıyı açmaktan korkma; koridor uzun.”",
  ];
  const fq = $("#footerQuote");
  let qi = 0;
  setInterval(() => { qi = (qi + 1) % quotes.length; fq.style.opacity = "0";
    setTimeout(() => { fq.textContent = quotes[qi]; fq.style.opacity = "1"; }, 400);
  }, 7000);
  fq.style.transition = "opacity 0.4s ease";
})();
