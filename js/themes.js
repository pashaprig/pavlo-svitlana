// Перемикач стилів сайту. Стиль зберігається в data-style на <html>,
// усі кольори й шрифти кожного стилю описані в css/style.css.
(() => {
  const STORAGE_KEY = 'wedding-style';

  const THEMES = [
    { id: 'classic', name: 'Класика', swatch: '#b5838d' },
    { id: 'minimal', name: 'Мінімал', swatch: '#1a1a1a' },
    { id: 'merlot', name: 'Мерло', swatch: '#6e2639' },
    { id: 'olive', name: 'Олива', swatch: '#6b7446' },
    { id: 'deco', name: 'Нео Деко', swatch: '#c9a45c' },
  ];

  function readSaved() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function save(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // приватний режим — просто не запам'ятовуємо
    }
  }

  function applyTheme(id) {
    document.documentElement.dataset.style = id;
  }

  // Ставимо збережений стиль одразу, ще до показу сторінки, щоб не було «блимання»
  const saved = readSaved();
  let currentId = THEMES.some((theme) => theme.id === saved) ? saved : THEMES[0].id;
  applyTheme(currentId);

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('themes');

    const buttons = THEMES.map((theme) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'themes__button';
      button.style.setProperty('--swatch', theme.swatch);
      button.textContent = theme.name;
      button.setAttribute('aria-pressed', String(theme.id === currentId));

      button.addEventListener('click', () => {
        currentId = theme.id;
        applyTheme(currentId);
        save(currentId);
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(THEMES[i].id === currentId)));
      });

      container.append(button);
      return button;
    });
  });
})();
