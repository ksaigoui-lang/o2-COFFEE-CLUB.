// ===== ENTRANCE MODAL =====
const entrance = document.getElementById('entrance');
const enterButton = entrance.querySelector('.entry-enter');
const replay = document.querySelector('.entry-replay');
const homeLink = document.querySelector('header .brand');
let exitTimer;

function openEntrance() {
  entrance.classList.remove('leaving');
  entrance.showModal();
}

function finishEntrance() {
  clearTimeout(exitTimer);
  if (entrance.open) entrance.close();
  entrance.classList.remove('leaving');
  window.scrollTo({ top: 0, behavior: 'instant' });
  homeLink.focus({ preventScroll: true });
}

function enterSite() {
  if (entrance.classList.contains('leaving')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishEntrance();
    return;
  }
  entrance.classList.add('leaving');
  exitTimer = setTimeout(finishEntrance, 680);
}

if (typeof entrance.showModal === 'function') {
  replay.hidden = false;
  replay.addEventListener('click', openEntrance);
  entrance.addEventListener('cancel', event => {
    event.preventDefault();
    enterSite();
  });
  enterButton.addEventListener('click', enterSite);
  if (!location.hash) openEntrance();
}

// ===== LAZY BACKGROUND FILMS =====
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('video[data-src]').forEach(film => {
  const filmToggle = film.parentElement.querySelector('.film-toggle');
  const isHero = film.classList.contains('hero-film');
  let photoShown = !isHero;
  let photoTimer;
  let inView = false;
  let pausedByVisitor = false;

  function syncFilm() {
    if (entrance.open || !inView || document.hidden || reducedMotion.matches || pausedByVisitor) {
      clearTimeout(photoTimer);
      photoTimer = undefined;
      if (isHero && entrance.open) {
        photoShown = false;
        film.classList.remove('has-frame');
      }
      film.pause();
      if (reducedMotion.matches) film.classList.remove('has-frame');
      filmToggle.hidden = reducedMotion.matches || !film.classList.contains('has-frame');
      return;
    }
    if (!film.src) film.src = film.dataset.src;
    if (!photoShown) {
      if (photoTimer === undefined) {
        photoTimer = setTimeout(() => {
          photoTimer = undefined;
          photoShown = true;
          syncFilm();
        }, 2000);
      }
      return;
    }
    film.play().catch(() => {});
  }

  film.addEventListener('playing', () => {
    film.classList.add('has-frame');
    filmToggle.hidden = false;
    filmToggle.classList.remove('is-paused');
    filmToggle.setAttribute('aria-label', '映像を一時停止');
  });

  filmToggle.addEventListener('click', () => {
    pausedByVisitor = !pausedByVisitor;
    filmToggle.classList.toggle('is-paused', pausedByVisitor);
    filmToggle.setAttribute('aria-label', pausedByVisitor ? '映像を再生' : '映像を一時停止');
    syncFilm();
  });

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    syncFilm();
  }).observe(film);

  new MutationObserver(syncFilm).observe(entrance, {
    attributes: true,
    attributeFilter: ['open'],
  });
  document.addEventListener('visibilitychange', syncFilm);
  reducedMotion.addEventListener('change', syncFilm);
});
