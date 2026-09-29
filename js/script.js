const GUESTS = [
  { id: 1, lastName: 'Сайчук', firstName: 'Лєна', gender: 'f', partner: null },
  { id: 2, lastName: 'Барська', firstName: 'Настя', gender: 'f', partner: 3 },
  { id: 3, lastName: 'Шульга', firstName: 'Руслан', gender: 'm', partner: 2 },
  { id: 4, lastName: 'Васильєва', firstName: 'Оля', gender: 'f', partner: 5 },
  { id: 5, lastName: 'Васильєв', firstName: 'Антон', gender: 'm', partner: 4 },
  { id: 6, lastName: 'Фіканюк', firstName: 'Софія', gender: 'f', partner: 7 },
  { id: 7, lastName: 'Фіканюк', firstName: 'Андрій', gender: 'm', partner: 6 },
  { id: 8, lastName: 'Беверакі', firstName: 'Оля', gender: 'f', partner: 9 },
  { id: 9, lastName: 'Беверакі', firstName: 'Діма', gender: 'm', partner: 8 },
  { id: 10, lastName: 'Петришин', firstName: 'Аня', gender: 'f', partner: 11 },
  { id: 11, lastName: 'Петришин', firstName: 'Діма', gender: 'm', partner: 10 },
  { id: 12, lastName: 'Стреляний', firstName: 'Вітя', gender: 'm', partner: 13 },
  { id: 13, lastName: 'Соловйова', firstName: 'Юля', gender: 'f', partner: 12 },
  { id: 14, lastName: 'Башкін', firstName: 'Ігор', gender: 'm', partner: null },
  { id: 15, lastName: 'Підопригора', firstName: 'Сергій', gender: 'm', partner: null },
  { id: 16, lastName: 'Ткаченко', firstName: 'Настя', gender: 'f', partner: 17 },
  { id: 17, lastName: 'Ткаченко', firstName: 'Денис', gender: 'm', partner: 16 },
  { id: 18, lastName: 'Черненко', firstName: 'Стас', gender: 'm', partner: 19 },
  { id: 19, lastName: 'Стаса', firstName: 'Таня', gender: 'f', partner: 18 },
  { id: 20, lastName: 'Горбачевська', firstName: 'Лєра', gender: 'f', partner: null },
];
const MIN_MATCH = 4;
const STORAGE_KEY = 'guestIds';
const FONT_STORAGE_KEY = 'font';
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
const downloadButton = document.getElementById('download-button');
const fontButtons = document.querySelectorAll('.fonts__button');
let openedModal = null;
let selectedGuest = null;

const normalize = (text) => text.trim().toLowerCase().replace(/[’ʼ`]/g, "'");
const fullName = (guest) => `${guest.lastName} ${guest.firstName}`;
const findGuest = (id) => GUESTS.find((guest) => guest.id === id) || null;

function guestGroup(guest) {
  const partner = coupleCheckbox.checked ? findGuest(guest.partner) : null;
  return partner ? [guest, partner] : [guest];
}

const groupName = (guest) => guestGroup(guest).map(fullName).join(' та ');
const selectedGuests = () => guestGroup(selectedGuest);
const firstNames = () => selectedGuests().map((guest) => guest.firstName).join(' та ');

// options: "пара|він|вона", форма для неї необов'язкова
function pickForm(options) {
  const guests = selectedGuests();
  const variant = guests.length > 1 ? 0 : guests[0].gender === 'f' ? 2 : 1;
  const [pair, male, female = male] = options.split('|');
  return [pair, male, female][variant];
}

const fillText = (text) => text
  .replaceAll('{names}', firstNames())
  .replace(/\{([^{}]*\|[^{}]*)\}/g, (_, options) => pickForm(options));

function saveGuests() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedGuests().map((guest) => guest.id)));
  } catch {}
}

function loadGuestIds() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function renderSelectedGuests() {
  guestInput.value = groupName(selectedGuest);
  document.querySelectorAll('[data-guest-names]').forEach((el) => {
    el.textContent = firstNames();
  });

  document.querySelectorAll('[data-guest-word]').forEach((el) => {
    el.textContent = pickForm(el.dataset.guestWord);
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

function selectFont(button) {
  const root = document.documentElement.style;
  root.setProperty('--font', button.dataset.font);
  root.setProperty('--font-scale', button.dataset.scale);
  fontButtons.forEach((el) => el.setAttribute('aria-pressed', el === button));
  try {
    localStorage.setItem(FONT_STORAGE_KEY, button.dataset.font);
  } catch {}
}

fontButtons.forEach((button) => button.addEventListener('click', () => selectFont(button)));

let savedFont = null;
try {
  savedFont = localStorage.getItem(FONT_STORAGE_KEY);
} catch {}
selectFont([...fontButtons].find((button) => button.dataset.font === savedFont) || fontButtons[0]);

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

function buildInvitationPage() {
  const page = createElement('div', 'pdf-page');
  page.append(createElement('h1', 'pdf-page__title', fillText(INVITATION_PDF.title)));

  INVITATION_PDF.blocks.forEach((block) => {
    const section = createElement('section', 'pdf-page__block');
    if (block.title) section.append(createElement('h2', 'pdf-page__block-title', fillText(block.title)));
    block.text.forEach((paragraph) => section.append(createElement('p', 'pdf-page__text', fillText(paragraph))));
    page.append(section);
  });

  page.append(createElement('p', 'pdf-page__signature', fillText(INVITATION_PDF.signature)));
  return page;
}

const DOWNLOAD_LABEL = downloadButton.textContent;
// iOS не зберігає blob-файли через посилання, тому там віддаємо PDF у системне меню «Поділитися»
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let pendingPdf = null;

const pdfWorker = (page) => html2pdf()
  .set({
    filename: INVITATION_PDF.fileName,
    margin: 0,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, backgroundColor: '#f5f0e4' },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' },
  })
  .from(page);

async function createPdf(output) {
  try {
    return await output(pdfWorker(buildInvitationPage()));
  } catch (error) {
    console.warn('PDF з фоном не вдався, пробуємо без нього', error);
    const page = buildInvitationPage();
    page.classList.add('pdf-page--plain');
    return output(pdfWorker(page));
  }
}

// false — браузер не дав відкрити меню без нового натискання
async function sharePdf(file) {
  try {
    await navigator.share({ files: [file] });
  } catch (error) {
    if (error.name === 'NotAllowedError') return false;
  }
  return true;
}

function resetPendingPdf() {
  pendingPdf = null;
  downloadButton.textContent = DOWNLOAD_LABEL;
}

guestInput.addEventListener('input', resetPendingPdf);
coupleCheckbox.addEventListener('change', resetPendingPdf);

downloadButton.addEventListener('click', async () => {
  if (pendingPdf) {
    if (await sharePdf(pendingPdf)) resetPendingPdf();
    return;
  }

  downloadButton.disabled = true;
  downloadButton.textContent = 'Готуємо запрошення…';
  let label = DOWNLOAD_LABEL;

  try {
    await Promise.all([loadHtml2pdf(), document.fonts.load('20px "Great Vibes"', 'Павло')]);
    if (isIOS && navigator.canShare) {
      const blob = await createPdf((worker) => worker.outputPdf('blob'));
      const file = new File([blob], INVITATION_PDF.fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        if (!(await sharePdf(file))) {
          pendingPdf = file;
          label = 'Зберегти PDF';
        }
        return;
      }
    }
    await createPdf((worker) => worker.save());
  } catch (error) {
    console.error(error);
    alert('Не вдалося створити запрошення. Спробуйте ще раз.');
  } finally {
    downloadButton.disabled = false;
    downloadButton.textContent = label;
  }
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
