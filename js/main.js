document.addEventListener("DOMContentLoaded", () => {
  initHeaderMenu();
  initStudiesSlider();
  initTestimonialsSlider();
});

function initHeaderMenu() {
  const toggle = document.querySelector(".header__menu-toggle");
  const nav = document.getElementById("headerNav");
  if (!toggle || !nav) return;

  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
    nav.classList.remove("is-open");
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    nav.classList.toggle("is-open", isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) closeMenu();
  });
}

function initStudiesSlider() {
  const slider = document.getElementById("studiesSlider");
  const prevBtn = document.getElementById("studiesPrev");
  const nextBtn = document.getElementById("studiesNext");
  if (!slider || !prevBtn || !nextBtn) return;

  const wrap = slider.parentElement;
  const originals = Array.from(slider.querySelectorAll(".studies__slide"));
  const count = originals.length;
  if (!count) return;

  const DURATION = 450;

  const makeClone = (el) => {
    const c = el.cloneNode(true);
    c.classList.remove("is-active");
    c.setAttribute("aria-hidden", "true");
    return c;
  };

  originals.forEach((el) => slider.insertBefore(makeClone(el), originals[0]));
  originals.forEach((el) => slider.appendChild(makeClone(el)));

  const slides = Array.from(slider.querySelectorAll(".studies__slide"));
  let index = count + Math.floor(count / 2);
  let locked = false;

  // Căn slide[index] vào giữa wrap
  function position(animate) {
    if (!animate) slider.style.transition = "none";

    const slide = slides[index];
    const x = wrap.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);
    slider.style.transform = `translate3d(${x}px, 0, 0)`;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));

    if (!animate) {
      void slider.offsetWidth; 
      slider.style.transition = "";
    }
  }

  position(false);

  function go(dir) {
    if (locked) return;
    locked = true;
    index += dir;
    position(true);

    setTimeout(() => {
      // Chạm vùng clone thì nhảy âm thầm về slide thật tương ứng
      if (index >= count * 2) {
        index -= count;
        position(false);
      } else if (index < count) {
        index += count;
        position(false);
      }
      locked = false;
    }, DURATION + 30);
  }

  const next = () => go(1);
  const prev = () => go(-1);

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  slides.forEach((slide, i) => {
    slide.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      if (i === index + 1) next();
      else if (i === index - 1) prev();
    });
  });

  // Swipe
  let sx = 0, sy = 0;
  slider.addEventListener(
    "touchstart",
    (e) => {
      sx = e.changedTouches[0].clientX;
      sy = e.changedTouches[0].clientY;
    },
    { passive: true }
  );
  slider.addEventListener(
    "touchend",
    (e) => {
      const dx = sx - e.changedTouches[0].clientX;
      const dy = sy - e.changedTouches[0].clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? next() : prev();
      }
    },
    { passive: true }
  );

  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
    threshold: 0.2,
  }).observe(slider);

  window.addEventListener("keydown", (e) => {
    if (!visible) return;
    if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") prev();
  });

  window.addEventListener("resize", () => position(false));
}

function initTestimonialsSlider() {
  const slider = document.getElementById("testimonialSlider");
  const prevBtn = document.getElementById("testimonialPrev");
  const nextBtn = document.getElementById("testimonialNext");
  if (!slider || !prevBtn || !nextBtn) return;

  const wrap = slider.parentElement;
  const originals = Array.from(slider.querySelectorAll(".testimonial__card"));
  const dots = Array.from(document.querySelectorAll(".testimonial__dot"));
  const count = originals.length;
  if (!count) return;

  const DURATION = 450;
  const makeClone = (card) => {
    const clone = card.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  };

  slider.insertBefore(makeClone(originals[count - 1]), originals[0]);
  slider.appendChild(makeClone(originals[0]));

  const slides = Array.from(slider.querySelectorAll(".testimonial__card"));
  let index = 1;
  let locked = false;

  function position(animate) {
    if (!animate) slider.style.transition = "none";

    slider.style.transform = `translate3d(-${index * wrap.clientWidth}px, 0, 0)`;
    slides.forEach((slide, i) => {
      slide.setAttribute("aria-hidden", String(i !== index));
    });
    dots.forEach((dot, i) => {
      const active = i === index - 1;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", String(active));
    });

    if (!animate) {
      void slider.offsetWidth;
      slider.style.transition = "";
    }
  }

  position(false);

  function goTo(nextIndex) {
    if (locked) return;
    locked = true;
    index = nextIndex;
    position(true);

    setTimeout(() => {
      if (index === 0) {
        index = count;
        position(false);
      } else if (index === count + 1) {
        index = 1;
        position(false);
      }
      locked = false;
    }, DURATION + 30);
  }

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => goTo(i + 1));
  });

  let sx = 0;
  let sy = 0;
  slider.addEventListener(
    "touchstart",
    (event) => {
      sx = event.changedTouches[0].clientX;
      sy = event.changedTouches[0].clientY;
    },
    { passive: true }
  );
  slider.addEventListener(
    "touchend",
    (event) => {
      const dx = sx - event.changedTouches[0].clientX;
      const dy = sy - event.changedTouches[0].clientY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? next() : prev();
      }
    },
    { passive: true }
  );

  let visible = false;
  new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
    threshold: 0.2,
  }).observe(slider);

  window.addEventListener("keydown", (event) => {
    if (!visible) return;
    if (event.key === "ArrowRight") next();
    else if (event.key === "ArrowLeft") prev();
  });

  window.addEventListener("resize", () => position(false));
}