const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');

toggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.textContent = isOpen ? 'Close' : 'Menu';
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (toggle) toggle.textContent = 'Menu';
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const chatLauncher = document.querySelector('.chat-launcher');
const chatPanel = document.querySelector('#inquiry-chat');
const chatClose = document.querySelector('.chat-close');
const inquiryForm = document.querySelector('#inquiry-form');
const chatStatus = document.querySelector('.chat-status');

const setChatOpen = (open) => {
  chatPanel?.classList.toggle('open', open);
  chatPanel?.setAttribute('aria-hidden', String(!open));
  chatLauncher?.setAttribute('aria-expanded', String(open));
  if (open) chatPanel?.querySelector('input')?.focus();
};

chatLauncher?.addEventListener('click', () => {
  setChatOpen(!chatPanel.classList.contains('open'));
});

chatClose?.addEventListener('click', () => setChatOpen(false));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && chatPanel?.classList.contains('open')) {
    setChatOpen(false);
    chatLauncher?.focus();
  }
});

inquiryForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = inquiryForm.querySelector('.chat-submit');
  submitButton.disabled = true;
  submitButton.textContent = 'Sending…';
  chatStatus.textContent = '';
  chatStatus.className = 'chat-status';

  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(inquiryForm)))
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'We could not send your inquiry.');
    inquiryForm.reset();
    chatStatus.textContent = 'Thank you. Your inquiry has been sent to the Digal team.';
    chatStatus.classList.add('success');
  } catch (error) {
    chatStatus.textContent = error.message || 'Something went wrong. Please try again.';
    chatStatus.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Send inquiry <span aria-hidden="true">→</span>';
  }
});

const projectModal = document.querySelector('#project-modal');
const projectModalImage = document.querySelector('.project-modal-image');
const projectModalTitle = document.querySelector('#project-modal-title');
const projectModalMeta = document.querySelector('#project-modal-meta');
const projectModalDescription = document.querySelector('#project-modal-description');
const projectPageLink = document.querySelector('#project-page-link');
let lastProjectTrigger = null;

const closeProjectModal = () => {
  projectModal?.classList.remove('open');
  projectModal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  lastProjectTrigger?.focus();
};

const openProjectModal = (card) => {
  lastProjectTrigger = card;
  const sourceImage = card.querySelector('img');
  projectModalImage.src = sourceImage?.currentSrc || sourceImage?.src || '';
  projectModalImage.alt = sourceImage?.alt || '';
  projectModalTitle.textContent = card.dataset.projectName || '';
  projectModalMeta.textContent = card.dataset.projectMeta || '';
  projectModalDescription.textContent = card.dataset.projectDescription || '';
  if (projectPageLink) projectPageLink.href = card.getAttribute('href') || '#';
  projectModal.classList.add('open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  projectModal.querySelector('.project-modal-close')?.focus();
};

document.querySelectorAll('.portfolio-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    event.preventDefault();
    openProjectModal(card);
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProjectModal(card);
    }
  });
});

projectModal?.querySelectorAll('[data-project-close]').forEach((control) => {
  control.addEventListener('click', closeProjectModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && projectModal?.classList.contains('open')) closeProjectModal();
});
