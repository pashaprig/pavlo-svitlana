const form = document.getElementById('invite-form');
const input = document.getElementById('guest-name');
const message = document.getElementById('invite-message');
const modal = document.getElementById('video-modal');
const modalTitle = document.getElementById('modal-title');
const modalVideo = document.getElementById('modal-video');
const suggestionsList = document.getElementById('suggestions');

// Скільки літер поспіль має збігтися, щоб показати підказку
const MIN_MATCH_LENGTH = 4;
const MAX_SUGGESTIONS = 5;

// Регістр, зайві пробіли та різні апострофи не мають значення
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[’ʼ`‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// Точний збіг прізвища
function findGuest(query) {
  const q = normalize(query);
  if (!q) return null;
  return GUESTS.find((guest) => normalize(guest.lastName) === q) || null;
}

// Довжина найдовшого спільного фрагмента двох рядків (літери поспіль)
function longestCommonRun(a, b) {
  let best = 0;
  let prev = new Array(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i++) {
    const row = new Array(b.length + 1).fill(0);
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        row[j] = prev[j - 1] + 1;
        if (row[j] > best) best = row[j];
      }
    }
    prev = row;
  }
  return best;
}

// Гості, в прізвищі яких є 4+ літери поспіль з введеного
function findSuggestions(query) {
  const q = normalize(query);
  if (q.length < MIN_MATCH_LENGTH) return [];

  return GUESTS
    .map((guest) => {
      const last = normalize(guest.lastName);
      return { guest, score: longestCommonRun(q, last), isExact: q === last };
    })
    .filter(({ score, isExact }) => score >= MIN_MATCH_LENGTH && !isExact)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ guest }) => guest);
}

function hideSuggestions() {
  suggestionsList.hidden = true;
  suggestionsList.replaceChildren();
}

function renderSuggestions() {
  const guests = findSuggestions(input.value);
  if (!guests.length) {
    hideSuggestions();
    return;
  }

  suggestionsList.replaceChildren(...guests.map((guest) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'suggestions__item';
    button.textContent = guest.lastName;
    button.addEventListener('click', () => {
      input.value = guest.lastName;
      hideSuggestions();
      message.textContent = '';
      input.focus();
    });
    item.append(button);
    return item;
  }));
  suggestionsList.hidden = false;
}

function openModal(guest) {
  modalTitle.textContent = `${guest.lastName}, це запрошення для вас!`;

  // Якщо іменного відео ще немає — підставляємо загальне
  modalVideo.onerror = () => {
    modalVideo.onerror = null;
    modalVideo.src = DEFAULT_VIDEO;
    modalVideo.play().catch(() => {});
  };
  modalVideo.src = guest.video;

  modal.hidden = false;
  document.body.classList.add('no-scroll');
  modalVideo.play().catch(() => {});
}

function closeModal() {
  modal.hidden = true;
  modalVideo.onerror = null;
  modalVideo.pause();
  modalVideo.removeAttribute('src');
  modalVideo.load();
  document.body.classList.remove('no-scroll');
  input.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const guest = findGuest(input.value);

  if (guest) {
    message.textContent = '';
    hideSuggestions();
    openModal(guest);
  } else if (!suggestionsList.hidden) {
    message.textContent = 'Оберіть, будь ласка, варіант з підказки.';
  } else {
    message.textContent = 'На жаль, запрошення не знайдено. Перевірте написання.';
  }
});

// Прибираємо повідомлення і оновлюємо підказки, щойно гість змінює введене
input.addEventListener('input', () => {
  message.textContent = '';
  renderSuggestions();
});

// Клік поза полем ховає підказки
document.addEventListener('click', (event) => {
  if (!event.target.closest('.invite__field')) hideSuggestions();
});

modal.addEventListener('click', (event) => {
  if (event.target.hasAttribute('data-close')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!modal.hidden) closeModal();
  else hideSuggestions();
});
