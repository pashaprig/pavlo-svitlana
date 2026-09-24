// Слайдер фото наречених: плавна зміна кадрів кожні SLIDE_INTERVAL мс.
// Фото лежать в assets/images/ з назвами img-1, img-2, ... у будь-якому форматі.
// Браузер не бачить вміст папки, тому для кожного номера пробуємо розширення по черзі
// і зупиняємось на першому номері, якого немає.
(() => {
  const SLIDE_INTERVAL = 5000;
  const PHOTOS_DIR = 'assets/images/';
  const EXTENSIONS = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif', 'JPEG', 'JPG', 'PNG', 'WEBP'];
  const MAX_PHOTOS = 50;

  const slider = document.getElementById('slider');
  const dotsContainer = document.getElementById('slider-dots');

  const slides = [];
  const dots = [];
  let current = 0;
  let timer = null;

  dotsContainer.hidden = true;

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
    slider.insertBefore(img, dotsContainer);
    slides.push(img);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'slider__dot';
    dot.setAttribute('aria-label', `Фото ${index + 1}`);
    dot.addEventListener('click', () => {
      showSlide(index);
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

  function showSlide(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function start() {
    clearInterval(timer);
    timer = setInterval(() => showSlide(current + 1), SLIDE_INTERVAL);
  }

  async function init() {
    for (let number = 1; number <= MAX_PHOTOS; number++) {
      const img = await findPhoto(number);
      if (!img) break;
      addSlide(img);
    }
  }

  init();
})();
