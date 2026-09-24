// Слайдер фото наречених: плавна зміна кадрів кожні SLIDE_INTERVAL мс.
// Фото лежать в assets/images/ з назвами img-1, img-2, ... у будь-якому форматі.
// Браузер не бачить вміст папки, тому для кожного номера пробуємо розширення по черзі
// і зупиняємось на першому номері, якого немає.
(() => {
  const SLIDE_INTERVAL = 5000;
  const PHOTOS_DIR = 'assets/images/';
  const EXTENSIONS = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'JPEG', 'JPG', 'PNG', 'WEBP'];
  const MAX_PHOTOS = 50;
  const SWIPE_THRESHOLD = 40; // скільки пікселів треба протягнути для перемикання

  // Режими зміни фото: плавне зникання або прокрутка вбік
  const MODES = [
    { id: 'fade', name: 'Зникання' },
    { id: 'slide', name: 'Прокрутка' },
  ];
  const MODE_STORAGE_KEY = 'wedding-slider-mode';

  const slider = document.getElementById('slider');
  const dotsContainer = document.getElementById('slider-dots');
  const modesContainer = document.getElementById('slider-modes');

  const slides = [];
  const dots = [];
  let current = 0;
  let timer = null;

  dotsContainer.hidden = true;

  let mode = MODES[0].id;
  try {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    if (MODES.some((m) => m.id === saved)) mode = saved;
  } catch {
    // приватний режим — лишаємо режим за замовчуванням
  }

  function applyMode(id) {
    mode = id;
    document.documentElement.dataset.slider = id;
    // Скидаємо позиції від прокрутки миттєво, щоб фото не «проїжджали» екраном при зміні режиму
    slides.forEach((slide) => {
      slide.style.transition = 'none';
      slide.style.transform = '';
    });
    slider.offsetWidth; // примусовий reflow
    slides.forEach((slide) => {
      slide.style.transition = '';
    });
  }

  const modeButtons = MODES.map((m) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'themes__button themes__button--plain';
    button.textContent = m.name;
    button.addEventListener('click', () => {
      applyMode(m.id);
      modeButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(MODES[i].id === mode)));
      try {
        localStorage.setItem(MODE_STORAGE_KEY, m.id);
      } catch {
        // не запам'ятовуємо
      }
    });
    modesContainer.append(button);
    return button;
  });

  applyMode(mode);
  modeButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(MODES[i].id === mode)));

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function findPhoto(number) {
    for (const ext of EXTENSIONS) {
      try {
        return await loadImage(`${PHOTOS_DIR}img-${number}.${ext}`);
      } catch {
        // такого файлу немає — пробуємо наступне розширення
      }
    }
    return null;
  }

  function addSlide(img) {
    const index = slides.length;

    img.className = 'slider__photo';
    img.alt = 'Павло і Світлана';
    img.draggable = false;
    slider.insertBefore(img, dotsContainer);
    slides.push(img);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider__dot';
    dot.setAttribute('aria-label', `Фото ${index + 1}`);
    dot.addEventListener('click', () => {
      if (index === current) return;
      showSlide(index, index > current ? 1 : -1);
      start();
    });
    dotsContainer.append(dot);
    dots.push(dot);

    if (index === 0) {
      img.classList.add('is-active');
      dot.classList.add('is-active');
    }
    if (index === 1) {
      dotsContainer.hidden = false;
      start();
    }
  }

  // direction: 1 — наступне фото (заїжджає справа), -1 — попереднє (заїжджає зліва)
  function showSlide(index, direction = 1) {
    const next = (index + slides.length) % slides.length;
    if (next === current) return;

    const outgoing = slides[current];
    const incoming = slides[next];

    if (mode === 'slide') {
      // Ставимо нове фото за край з потрібного боку без анімації, потім запускаємо рух
      incoming.style.transition = 'none';
      incoming.style.transform = `translateX(${direction * 100}%)`;
      incoming.offsetWidth; // примусовий reflow, щоб браузер зафіксував стартову позицію
      incoming.style.transition = '';
      incoming.style.transform = '';
      outgoing.style.transform = `translateX(${-direction * 100}%)`;
    }

    outgoing.classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = next;
    incoming.classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1, 1), SLIDE_INTERVAL);
  }

  // Свайп пальцем (або перетягування мишкою): ліворуч — наступне фото, праворуч — попереднє
  let swipeStart = null;

  slider.addEventListener('pointerdown', (event) => {
    if (slides.length < 2 || !event.isPrimary) return;
    swipeStart = { x: event.clientX, y: event.clientY };
  });

  window.addEventListener('pointerup', (event) => {
    if (!swipeStart) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    const direction = dx < 0 ? 1 : -1;
    showSlide(current + direction, direction);
    start();
  });

  window.addEventListener('pointercancel', () => {
    swipeStart = null;
  });

  async function init() {
    for (let number = 1; number <= MAX_PHOTOS; number++) {
      const img = await findPhoto(number);
      if (!img) break;
      addSlide(img);
    }
  }

  init();
})();
