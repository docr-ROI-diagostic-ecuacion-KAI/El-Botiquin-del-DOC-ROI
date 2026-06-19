(function () {
  document.querySelectorAll('.docroi-resource-card').forEach((card, index) => {
    const top = card.querySelector('.docroi-card-top');
    const title = card.querySelector('h3')?.textContent?.trim() || 'recurso';
    if (!top || top.querySelector('.docroi-card-toggle')) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'docroi-card-toggle';
    toggle.setAttribute('aria-label', `Abrir ${title}`);
    toggle.setAttribute('aria-expanded', 'false');
    top.appendChild(toggle);

    if (index === 0) {
      card.classList.add('is-expanded');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', `Cerrar ${title}`);
    }

    const setExpanded = (expanded) => {
      card.classList.toggle('is-expanded', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', `${expanded ? 'Cerrar' : 'Abrir'} ${title}`);
    };

    const toggleCard = () => setExpanded(!card.classList.contains('is-expanded'));

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleCard();
    });

    card.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      if (!card.classList.contains('is-expanded')) setExpanded(true);
    });
  });
})();
