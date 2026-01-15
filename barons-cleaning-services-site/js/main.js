(function(){
  const yearEl = document.getElementById("year");
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("navLinks");
  if(navToggle && navLinks){
    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", (e) => {
      if(!navLinks.classList.contains("open")) return;
      const within = navLinks.contains(e.target) || navToggle.contains(e.target);
      if(!within){
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const sets = [
    { label: "Parking Lot Cleanup", before: "assets/before-after/01_before.jpg", after: "assets/before-after/01_after.jpg" },
    { label: "Dumped Item Removal", before: "assets/before-after/02_before.jpg", after: "assets/before-after/02_after.jpg" },
    { label: "Graffiti Removal", before: "assets/before-after/03_before.jpg", after: "assets/before-after/03_after.jpg" },
    { label: "Walkways and Common Areas", before: "assets/before-after/04_before.jpg", after: "assets/before-after/04_after.jpg" },
    { label: "Pothole and Concrete Patching", before: "assets/before-after/05_before.jpg", after: "assets/before-after/05_after.jpg" },
    { label: "Lighting and Touch-Ups", before: "assets/before-after/06_before.jpg", after: "assets/before-after/06_after.jpg" }
  ];

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function createBASlider({label, before, after}, opts){
    const container = document.createElement("div");
    container.className = "ba-slider";
    container.setAttribute("aria-label", label);

    const imgBefore = document.createElement("img");
    imgBefore.src = before;
    imgBefore.alt = label + " before";

    const imgAfter = document.createElement("img");
    imgAfter.src = after;
    imgAfter.alt = label + " after";
    imgAfter.className = "ba-after";

    const handle = document.createElement("div");
    handle.className = "ba-handle";

    const knob = document.createElement("div");
    knob.className = "ba-knob";
    knob.innerHTML = '<span class="l"></span><span class="r"></span>';

    const range = document.createElement("input");
    range.type = "range";
    range.min = "0";
    range.max = "100";
    range.value = "50";
    range.className = "ba-input";
    range.setAttribute("aria-label", "Before and after slider");

    function apply(val){
      const v = clamp(Number(val), 0, 100);
      imgAfter.style.clipPath = `inset(0 0 0 ${v}%)`;
      handle.style.left = v + "%";
      knob.style.left = v + "%";
    }
    apply(50);

    range.addEventListener("input", (e) => apply(e.target.value));

    function pointerToValue(clientX){
      const rect = container.getBoundingClientRect();
      const x = clamp(clientX - rect.left, 0, rect.width);
      return (x / rect.width) * 100;
    }

    function onPointer(e){
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const v = pointerToValue(clientX);
      range.value = String(v);
      apply(v);
    }

    let dragging = false;
    container.addEventListener("mousedown", (e) => { dragging = true; onPointer(e); });
    window.addEventListener("mousemove", (e) => { if(dragging) onPointer(e); });
    window.addEventListener("mouseup", () => { dragging = false; });

    container.addEventListener("touchstart", (e) => { dragging = true; onPointer(e); }, {passive:false});
    window.addEventListener("touchmove", (e) => { if(dragging) onPointer(e); }, {passive:false});
    window.addEventListener("touchend", () => { dragging = false; });

    container.appendChild(imgBefore);
    container.appendChild(imgAfter);
    container.appendChild(handle);
    container.appendChild(knob);
    container.appendChild(range);

    if(opts && typeof opts.initial === "number"){
      range.value = String(opts.initial);
      apply(opts.initial);
    }

    return container;
  }

  function initCarousel(){
    const root = document.querySelector("[data-ba-carousel]");
    if(!root) return;

    const stage = root.querySelector("[data-ba-stage]");
    const prev = root.querySelector("[data-ba-prev]");
    const next = root.querySelector("[data-ba-next]");
    const labelEl = document.querySelector("[data-ba-label]");
    const dotsEl = document.querySelector("[data-ba-dots]");

    let idx = 0;

    function renderDots(){
      if(!dotsEl) return;
      dotsEl.innerHTML = "";
      sets.forEach((_, i) => {
        const d = document.createElement("button");
        d.type = "button";
        d.className = "dot" + (i === idx ? " active" : "");
        d.setAttribute("aria-label", "Go to slide " + (i+1));
        d.addEventListener("click", () => { idx = i; render(); });
        dotsEl.appendChild(d);
      });
    }

    function render(){
      if(!stage) return;
      stage.innerHTML = "";
      stage.appendChild(createBASlider(sets[idx]));
      if(labelEl) labelEl.textContent = sets[idx].label;
      renderDots();
    }

    function go(delta){
      idx = (idx + delta + sets.length) % sets.length;
      render();
    }

    if(prev) prev.addEventListener("click", () => go(-1));
    if(next) next.addEventListener("click", () => go(1));

    let startX = null;
    root.addEventListener("touchstart", (e) => {
      if(!e.touches || e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
    }, {passive:true});

    root.addEventListener("touchend", (e) => {
      if(startX === null) return;
      const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
      const dx = endX - startX;
      startX = null;
      if(Math.abs(dx) < 60) return;
      if(dx < 0) go(1);
      else go(-1);
    }, {passive:true});

    render();
  }

  function initGallery(){
    const gallery = document.querySelector("[data-gallery]");
    if(!gallery) return;

    gallery.innerHTML = "";
    sets.forEach((s, i) => {
      const item = document.createElement("div");
      item.className = "gitem";
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", "Open before and after for " + s.label);

      const img = document.createElement("img");
      img.src = s.after;
      img.alt = s.label;

      const cap = document.createElement("div");
      cap.className = "gcap";
      cap.textContent = s.label;

      item.appendChild(img);
      item.appendChild(cap);

      function open(){ openModal(i); }
      item.addEventListener("click", open);
      item.addEventListener("keydown", (e) => {
        if(e.key === "Enter" || e.key === " ") open();
      });

      gallery.appendChild(item);
    });
  }

  let modal = document.querySelector("[data-modal]");
  let modalCloseEls = document.querySelectorAll("[data-modal-close]");
  let modalTitle = document.querySelector("[data-modal-title]");
  let modalBody = document.querySelector("[data-modal-body]");
  let modalBound = false;

  function closeModal(){
    if(!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function ensureModal(){
    if(modal && modalBody && modalTitle) return;

    modal = document.querySelector("[data-modal]");
    if(!modal){
      modal = document.createElement("div");
      modal.className = "modal";
      modal.setAttribute("data-modal", "");
      modal.hidden = true;
      modal.innerHTML = [
        '<div class="modal-backdrop" data-modal-close></div>',
        '<div class="modal-panel" role="dialog" aria-modal="true" aria-label="Before and after viewer">',
        '  <button class="modal-close" type="button" aria-label="Close" data-modal-close>&times;</button>',
        '  <div class="modal-title" data-modal-title>Before and After</div>',
        '  <div class="modal-body" data-modal-body></div>',
        '</div>'
      ].join("");
      document.body.appendChild(modal);
      modalBound = false;
    }

    modalCloseEls = modal.querySelectorAll("[data-modal-close]");
    modalTitle = modal.querySelector("[data-modal-title]");
    modalBody = modal.querySelector("[data-modal-body]");

    if(!modalBound){
      modalCloseEls.forEach(el => el.addEventListener("click", closeModal));
      modalBound = true;
    }
  }

  function openModal(i){
    ensureModal();
    if(!modal || !modalBody) return;
    modalBody.innerHTML = "";
    modalBody.appendChild(createBASlider(sets[i], {initial: 50}));
    if(modalTitle) modalTitle.textContent = sets[i].label;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  document.addEventListener("keydown", (e) => {
    if(!modal || modal.hidden) return;
    if(e.key === "Escape") closeModal();
  });

  const contactForm = document.querySelector("[data-contact-form]");
  if(contactForm){
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(contactForm);
      const name = fd.get("name") || "";
      const company = fd.get("company") || "";
      const phone = fd.get("phone") || "";
      const email = fd.get("email") || "";
      const location = fd.get("location") || "";
      const service = fd.get("service") || "";
      const message = fd.get("message") || "";

      const subject = encodeURIComponent("Quote Request | Barons Cleaning Services");
      const body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Company: " + company + "\n" +
        "Phone: " + phone + "\n" +
        "Email: " + email + "\n" +
        "Property Location: " + location + "\n" +
        "Service Needed: " + service + "\n\n" +
        "Message:\n" + message
      );

      window.location.href = "mailto:bcservicesca@gmail.com?subject=" + subject + "&body=" + body;
    });
  }

  initCarousel();
  initGallery();
})();
