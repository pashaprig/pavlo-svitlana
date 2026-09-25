// Перемикач фону: два фото поруч або одне відео. Режим зберігається в data-bg на <html>,
// вигляд обох режимів описаний в css/style.css.
(() => {
  const STORAGE_KEY = 'wedding-background';

  const MODES = [
    { id: 'photos', name: 'Фото' },
    { id: 'video', name: 'Відео' },
  ];

  let currentId = MODES[0].id;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (MODES.some((mode) => mode.id === saved)) currentId = saved;
  } catch {
    // приватний режим — лишаємо фото
  }

  // Ставимо режим одразу, ще до показу сторінки, щоб не було «блимання»
  document.documentElement.dataset.bg = currentId;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bg-modes');
    const video = document.getElementById('bg-video');

    // Відео крутиться лише коли його видно, щоб не вантажити його дарма
    function syncVideo() {
      if (currentId === 'video') video.play().catch(() => {});
      else video.pause();
    }

    const buttons = MODES.map((mode) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'themes__button themes__button--plain';
      button.textContent = mode.name;
      button.setAttribute('aria-pressed', String(mode.id === currentId));

      button.addEventListener('click', () => {
        currentId = mode.id;
        document.documentElement.dataset.bg = currentId;
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(MODES[i].id === currentId)));
        syncVideo();
        try {
          localStorage.setItem(STORAGE_KEY, currentId);
        } catch {
          // не запам'ятовуємо
        }
      });

      container.append(button);
      return button;
    });

    syncVideo();
  });
})();
