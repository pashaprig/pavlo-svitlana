// Перемикач стилів сайту. Стиль зберігається в data-style на <html>,
// усі кольори й шрифти кожного стилю описані в css/style.css.
(() => {
  const STORAGE_KEY = 'wedding-style';

  const THEMES = [
    { id: 'classic', name: 'Класика', swatch: '#b5838d' },
    { id: 'minimal', name: 'Мінімал', swatch: '#1a1a1a' },
    {
      id: 'milk',
      name: 'Молочний',
      swatch: 'conic-gradient(#f5efe3 0 25%, #c5a15a 0 50%, #171513 0 75%, #4a3025 0)',
    },
    // Стилі за референсами з Pinterest
    { id: 'adore', name: 'Адор', swatch: 'conic-gradient(#fff 0 50%, #b8975a 0 75%, #111 0)' },
    { id: 'interior', name: "Інтер'єр", swatch: 'conic-gradient(#2b2b2b 0 60%, #d1a85a 0)' },
    { id: 'brown', name: 'Шоколад', swatch: 'conic-gradient(#3a2d29 0 50%, #a8e3d6 0 75%, #2f6f73 0)' },
    { id: 'gold', name: 'Золото', swatch: 'conic-gradient(#0e0e0e 0 50%, #c8a45a 0)' },
    { id: 'sweet', name: 'Мармур', swatch: 'conic-gradient(#fff 0 40%, #d6b270 0 70%, #111 0)' },
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
