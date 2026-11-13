'use strict';

/* ==========================================================================
   I.E. N.° 0051 "José Faustino Sánchez Carrión" — script.js
   Módulos: menú móvil · sombra del header · aparición suave
            valores seleccionables · filtro de actividades
            formulario → WhatsApp · año del pie
   ========================================================================== */

/* Número institucional de WhatsApp (formato internacional: 51 + número) */
const WHATSAPP_NUMBER = '51963692714';

document.documentElement.classList.add('js');

const $  = (selector, ctx = document) => ctx.querySelector(selector);
const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

/* 1) Menú de navegación móvil (hamburguesa) -------------------------------- */
function initNavigation() {
  const header = $('#header');
  const toggle = $('#nav-toggle');
  if (!header || !toggle) return;

  const setOpen = (open) => {
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };

  toggle.addEventListener('click', () =>
    setOpen(!header.classList.contains('nav-open')));

  /* El menú se cierra al elegir cualquier enlace */
  $$('#nav a').forEach((link) =>
    link.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('nav-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  /* Al volver a escritorio, se garantiza el menú cerrado */
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) setOpen(false);
  });
}

/* 2) Sombra del header al hacer scroll ------------------------------------- */
function initHeaderShadow() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () =>
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* 3) Aparición suave de secciones (respeta movimiento reducido) ------------- */
function initReveal() {
  const items = $$('[data-reveal]');
  if (!items.length) return;

  if (typeof IntersectionObserver === 'undefined') {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach((item) => observer.observe(item));
}

/* 4) Valores institucionales seleccionables -------------------------------- */
function initValues() {
  const chips = $$('.value-chip[data-value]');
  const status = $('#valor-status');
  if (!chips.length) return;

  const setStatus = (selectedName) => {
    if (!status) return;
    status.textContent = selectedName
      ? `Has seleccionado «${selectedName}», uno de los valores que prioriza la institución según el PEI 2025.`
      : 'Ningún valor seleccionado. Toca o presiona un valor para destacarlo.';
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const isSelected = chip.getAttribute('aria-pressed') === 'true';

      chips.forEach((other) => other.setAttribute('aria-pressed', 'false'));

      if (isSelected) {
        setStatus(null);
      } else {
        chip.setAttribute('aria-pressed', 'true');
        setStatus(chip.dataset.value);
      }
    });
  });

  setStatus(null);
}

/* 5) Filtro de actividades (concursos / talleres) --------------------------- */
function initFilters() {
  const pills = $$('.filter-pill[data-filter]');
  const cards = $$('.act-card[data-categoria]');
  const status = $('#filtro-status');
  if (!pills.length || !cards.length) return;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;

      pills.forEach((other) =>
        other.setAttribute('aria-pressed', String(other === pill)));

      let visible = 0;
      cards.forEach((card) => {
        const show = filter === 'todos' || card.dataset.categoria === filter;
        card.classList.toggle('is-hidden', !show);
        card.toggleAttribute('hidden', !show);
        if (show) visible += 1;
      });

      if (status) {
        const nombre = filter === 'todos'
          ? 'todas las actividades'
          : (filter === 'concursos' ? 'los concursos' : 'los talleres');
        status.textContent =
          `Mostrando ${visible} de ${cards.length} actividades: ${nombre}.`;
      }
    });
  });
}

/* 6) Formulario de contacto → WhatsApp ------------------------------------- */
function initContactForm() {
  const form = $('#form-contacto');
  if (!form) return;

  const fieldNombre  = $('#f-nombre');
  const fieldMensaje = $('#f-mensaje');
  const errNombre    = $('#error-nombre');
  const errMensaje   = $('#error-mensaje');
  const success      = $('#form-success');

  const setError = (field, errEl, hasError) => {
    field.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    errEl.classList.toggle('show', hasError);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nombre  = fieldNombre.value.trim();
    const mensaje = fieldMensaje.value.trim();
    const telefono = $('#f-telefono').value.trim();
    const asunto   = $('#f-asunto').value;

    let valid = true;
    if (!nombre)  { setError(fieldNombre, errNombre, true); valid = false; }
    else          { setError(fieldNombre, errNombre, false); }
    if (!mensaje) { setError(fieldMensaje, errMensaje, true); valid = false; }
    else          { setError(fieldMensaje, errMensaje, false); }

    if (!valid) {
      (nombre ? fieldMensaje : fieldNombre).focus();
      return;
    }

    const lineas = [
      'Hola, les escribo desde la página web de la I.E. N.° 0051 "José Faustino Sánchez Carrión".',
      '',
      `Nombre: ${nombre}`,
      telefono ? `Teléfono: ${telefono}` : null,
      `Asunto: ${asunto}`,
      '',
      'Mensaje:',
      mensaje,
    ].filter((linea) => linea !== null);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lineas.join('\n'))}`;
    window.open(url, '_blank', 'noopener');

    if (success) {
      success.classList.add('show');
      success.scrollIntoView({ block: 'nearest' });
    }
  });
}

/* 7) Año dinámico del pie de página ---------------------------------------- */
function initYear() {
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}

/* Inicialización ----------------------------------------------------------- */
initNavigation();
initHeaderShadow();
initReveal();
initValues();
initFilters();
initContactForm();
initYear();
