const inviteButton = document.getElementById('invite-button');
const modals = document.querySelectorAll('.modal');
const mapBox = document.getElementById('map-box');
let openedModal = null;

mapBox.querySelector('iframe').addEventListener('load', () => mapBox.classList.add('is-loaded'));

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
