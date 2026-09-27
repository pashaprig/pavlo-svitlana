const inviteButton = document.getElementById('invite-button');
const modals = document.querySelectorAll('.modal');
const mapBoxes = document.querySelectorAll('.details__map-box');
const wishForm = document.getElementById('wish-form');
const wishStatus = document.getElementById('wish-status');
let openedModal = null;

wishForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const submitButton = wishForm.querySelector('[type="submit"]');
  submitButton.disabled = true;

  // Google Форма не віддає відповідь на інший домен, тому no-cors
  fetch(wishForm.action, { method: 'POST', mode: 'no-cors', body: new FormData(wishForm) })
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
