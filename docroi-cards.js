(function () {
  const grids = Array.from(document.querySelectorAll('.docroi-resource-grid'));

  const getColumns = (grid) => {
    const width = grid.clientWidth;
    if (width >= 920) return 3;
    if (width >= 640) return 2;
    return 1;
  };

  const layoutGrid = (grid) => {
    const cards = Array.from(grid.querySelectorAll('.docroi-resource-card'));
    const columns = getColumns(grid);
    const gap = 18;

    if (columns === 1) {
      grid.classList.remove('is-masonry');
      grid.style.height = '';
      cards.forEach((card) => {
        card.style.position = '';
        card.style.width = '';
        card.style.left = '';
        card.style.top = '';
      });
      return;
    }

    grid.classList.add('is-masonry');
    const columnWidth = (grid.clientWidth - gap * (columns - 1)) / columns;
    const heights = Array(columns).fill(0);

    cards.forEach((card) => {
      const column = heights.indexOf(Math.min(...heights));
      card.style.width = `${columnWidth}px`;
      card.style.left = `${column * (columnWidth + gap)}px`;
      card.style.top = `${heights[column]}px`;
      heights[column] += card.offsetHeight + gap;
    });

    grid.style.height = `${Math.max(...heights) - gap}px`;
  };

  const layoutAll = () => {
    window.requestAnimationFrame(() => {
      grids.forEach(layoutGrid);
    });
  };

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
      if (expanded) {
        const grid = card.closest('.docroi-resource-grid');
        grid?.querySelectorAll('.docroi-resource-card.is-expanded').forEach((expandedCard) => {
          if (expandedCard === card) return;
          expandedCard.classList.remove('is-expanded');
          const expandedToggle = expandedCard.querySelector('.docroi-card-toggle');
          const expandedTitle = expandedCard.querySelector('h3')?.textContent?.trim() || 'recurso';
          expandedToggle?.setAttribute('aria-expanded', 'false');
          expandedToggle?.setAttribute('aria-label', `Abrir ${expandedTitle}`);
        });
      }
      card.classList.toggle('is-expanded', expanded);
      toggle.setAttribute('aria-expanded', String(expanded));
      toggle.setAttribute('aria-label', `${expanded ? 'Cerrar' : 'Abrir'} ${title}`);
      layoutAll();
      window.setTimeout(layoutAll, 240);
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

  window.addEventListener('resize', layoutAll);
  window.addEventListener('load', layoutAll);
  if (document.fonts) document.fonts.ready.then(layoutAll);
  layoutAll();
})();
