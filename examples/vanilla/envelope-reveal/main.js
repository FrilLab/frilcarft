import { createEnvelopeReveal } from './envelope-reveal.js';

const host = document.querySelector('#envelope-demo');
const envelope = createEnvelopeReveal(host, {
  title: "You're invited",
  eyebrow: 'AN OPEN INVITATION',
  message: 'A little something, just for you.',
  envelopeColor: '#d9bda7',
  accentColor: '#966d78',
});

const colorButtons = document.querySelectorAll('[data-preset]');
for (const button of colorButtons) {
  button.addEventListener('click', () => {
    const [envelopeColor, accentColor] = button.dataset.preset.split('|');
    envelope.setOptions({ envelopeColor, accentColor });
    colorButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  });
}

document.querySelector('#title-input').addEventListener('input', (event) => {
  envelope.setOptions({ title: event.target.value });
});
document.querySelector('#message-input').addEventListener('input', (event) => {
  envelope.setOptions({ message: event.target.value });
});
document.querySelector('#toggle-button').addEventListener('click', () => envelope.toggle());

window.addEventListener('pagehide', () => envelope.dispose(), { once: true });
