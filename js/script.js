// Список гостей: partner — id другої половинки або null
const GUESTS = [
  { id: 1, lastName: 'Пригарницький', firstName: 'Павло', partner: 2 },
  { id: 2, lastName: 'Ященко', firstName: 'Світлана', partner: 1 },
  { id: 3, lastName: 'Башкін', firstName: 'Ігор', partner: null },
];
const MIN_MATCH = 4;
const STORAGE_KEY = 'guestIds';
// Спершу локальна копія, якщо її немає — CDN
const HTML2PDF_URLS = [
  'js/vendor/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
];

const inviteButton = document.getElementById('invite-button');
const guestInput = document.getElementById('guest-input');
const guestSuggestions = document.getElementById('guest-suggestions');
const coupleCheckbox = document.getElementById('guest-couple');
const modals = document.querySelectorAll('.modal');
const mapBoxes = document.querySelectorAll('.details__map-box');
const wishForm = document.getElementById('wish-form');
const wishStatus = document.getElementById('wish-status');
const downloadButton = document.getElementById('download-button');
let openedModal = null;
let selectedGuest = null;

const normalize = (text) => text.trim().toLowerCase().replace(/[’ʼ`]/g, "'");
const fullName = (guest) => `${guest.lastName} ${guest.firstName}`;
const findGuest = (id) => GUESTS.find((guest) => guest.id === id) || null;

// Гість + його пара, якщо відмічено «нас двоє»
function guestGroup(guest) {
  const partner = coupleCheckbox.checked ? findGuest(guest.partner) : null;
  return partner ? [guest, partner] : [guest];
}

const groupName = (guest) => guestGroup(guest).map(fullName).join(' та ');
const selectedGuests = () => guestGroup(selectedGuest);

function saveGuests() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedGuests().map((guest) => guest.id)));
  } catch {}
}

function loadGuestIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderSelectedGuests() {
  guestInput.value = groupName(selectedGuest);
  const firstNames = selectedGuests().map((guest) => guest.firstName).join(' та ');
  document.querySelectorAll('[data-guest-names]').forEach((el) => {
    el.textContent = firstNames;
  });

  // data-guest-word="для пари|для одного": вами/тобою, маєте/маєш…
  const isSingle = selectedGuests().length === 1;
  document.querySelectorAll('[data-guest-word]').forEach((el) => {
    const [plural, single] = el.dataset.guestWord.split('|');
    el.textContent = isSingle ? single : plural;
  });
  document.querySelectorAll('[data-guest-placeholder]').forEach((el) => {
    const [plural, single] = el.dataset.guestPlaceholder.split('|');
    el.placeholder = isSingle ? single : plural;
  });
  saveGuests();
}

function selectGuest(guest) {
  selectedGuest = guest;
  guestSuggestions.hidden = true;
  inviteButton.disabled = false;
  renderSelectedGuests();
}

function renderSuggestions() {
  const query = normalize(guestInput.value);
  const matches = query.length >= MIN_MATCH
    ? GUESTS.filter((guest) => normalize(guest.lastName).includes(query))
    : [];

  guestSuggestions.replaceChildren(...matches.map((guest) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = 'guest__suggestion';
    button.type = 'button';
    button.textContent = groupName(guest);
    button.addEventListener('click', () => selectGuest(guest));
    item.append(button);
    return item;
  }));
  guestSuggestions.hidden = matches.length === 0;
}

guestInput.addEventListener('input', () => {
  selectedGuest = null;
  inviteButton.disabled = true;
  renderSuggestions();
});

coupleCheckbox.addEventListener('change', () => {
  if (selectedGuest) renderSelectedGuests();
  else renderSuggestions();
});

const [savedId, savedPartnerId] = loadGuestIds();
const savedGuest = findGuest(savedId);
if (savedGuest) {
  coupleCheckbox.checked = savedPartnerId !== undefined;
  selectGuest(savedGuest);
}

// Підказка «гортайте донизу» ховається, щойно користувач почав гортати
const scrollHint = document.getElementById('scroll-hint');
const updateScrollHint = () => scrollHint.classList.toggle('is-hidden', window.scrollY > 40);
window.addEventListener('scroll', updateScrollHint, { passive: true });
updateScrollHint();
scrollHint.addEventListener('click', () => {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
});

// Бібліотеку для PDF вантажимо лише при першому натисканні
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => {
      script.remove();
      reject();
    };
    document.head.append(script);
  });
}

async function loadHtml2pdf() {
  for (const url of HTML2PDF_URLS) {
    if (window.html2pdf) return;
    try {
      await loadScript(url);
    } catch {}
  }
  if (!window.html2pdf) throw new Error('html2pdf не завантажився');
}

function createElement(tag, className, text) {
  const el = document.createElement(tag);
  el.className = className;
  if (text) el.textContent = text;
  return el;
}

// Сторінка PDF будується з тексту в js/invitation-text.js
function buildInvitationPage() {
  const names = selectedGuests().map((guest) => guest.firstName).join(' та ');
  const fill = (text) => text.replaceAll('{names}', names);
  const page = createElement('div', 'pdf-page');

  page.append(
    createElement('p', 'pdf-page__subtitle', INVITATION_PDF.subtitle),
    createElement('h1', 'pdf-page__title', INVITATION_PDF.title),
    createElement('p', 'pdf-page__greeting', fill(INVITATION_PDF.greeting)),
  );

  INVITATION_PDF.blocks.forEach((block) => {
    const section = createElement('section', 'pdf-page__block');
    if (block.title) section.append(createElement('h2', 'pdf-page__block-title', fill(block.title)));
    block.text.forEach((paragraph) => section.append(createElement('p', 'pdf-page__text', fill(paragraph))));
    page.append(section);
  });

  page.append(createElement('p', 'pdf-page__signature', fill(INVITATION_PDF.signature)));
  return page;
}

downloadButton.addEventListener('click', async () => {
  const label = downloadButton.textContent;
  downloadButton.disabled = true;
  downloadButton.textContent = 'Готуємо запрошення…';

  const savePdf = (page) => html2pdf()
    .set({
      filename: INVITATION_PDF.fileName,
      margin: 0,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: '#fbf6ec' },
      jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
    })
    .from(page)
    .save();

  try {
    await Promise.all([loadHtml2pdf(), document.fonts.ready]);
    try {
      await savePdf(buildInvitationPage());
    } catch (error) {
      // Сторінка відкрита як файл (file://) — браузер не дає вставити шпалери, робимо без них
      console.warn('PDF зі шпалерами не вдався, пробуємо без фону', error);
      const page = buildInvitationPage();
      page.classList.add('pdf-page--plain');
      await savePdf(page);
    }
  } catch (error) {
    console.error(error);
    alert('Не вдалося створити запрошення. Спробуйте ще раз.');
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = label;
  }
});

wishForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const submitButton = wishForm.querySelector('[type="submit"]');
  submitButton.disabled = true;

  // Перед побажанням — повні імена гостей, щоб у відповідях було видно, від кого
  const formData = new FormData(wishForm);
  const wishField = wishForm.querySelector('textarea');
  const guestNames = selectedGuest ? selectedGuests().map(fullName).join(' та ') : 'Невідомий гість';
  formData.set(wishField.name, `${guestNames}: ${wishField.value}`);

  // Google Форма не віддає відповідь на інший домен, тому no-cors
  fetch(wishForm.action, { method: 'POST', mode: 'no-cors', body: formData })
    .then(() => {
      wishForm.reset();
      wishStatus.textContent = 'Дякуємо! Ми отримали ваше повідомлення 🤍';
    })
    .catch(() => {
      wishStatus.textContent = 'Не вдалося надіслати. Спробуйте ще раз.';
    })
    .finally(() => {
      wishStatus.hidden = false;
      submitButton.disabled = false;
    });
});

mapBoxes.forEach((mapBox) => {
  mapBox.querySelector('iframe').addEventListener('load', () => mapBox.classList.add('is-loaded'));
});

function openModal(modal) {
  if (openedModal) openedModal.hidden = true;
  openedModal = modal;
  modal.hidden = false;
  modal.querySelector('.modal__content').scrollTop = 0;
  document.body.classList.add('no-scroll');
  modal.querySelector('.modal__close').focus();
}

function closeModal() {
  openedModal.hidden = true;
  openedModal = null;
  document.body.classList.remove('no-scroll');
  inviteButton.focus();
}

inviteButton.addEventListener('click', () => openModal(document.getElementById('about-modal')));

modals.forEach((modal) => {
  modal.addEventListener('click', (event) => {
    if (event.target.hasAttribute('data-close')) closeModal();
    if (event.target.dataset.next) openModal(document.getElementById(event.target.dataset.next));
  });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && openedModal) closeModal();
});
