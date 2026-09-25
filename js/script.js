const inviteButton = document.getElementById('invite-button');
const modal = document.getElementById('details-modal');

function openModal() {
  modal.hidden = false;
  document.body.classList.add('no-scroll');
  modal.querySelector('.modal__close').focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.classList.remove('no-scroll');
  inviteButton.focus();
}

inviteButton.addEventListener('click', openModal);

modal.addEventListener('click', (event) => {
  if (event.target.hasAttribute('data-close')) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closeModal();
});
