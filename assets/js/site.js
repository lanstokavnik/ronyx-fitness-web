// Ronyx Fitness website motion. Plain JavaScript, no libraries.
// Everything here is decoration: without JS (or with reduced motion) the
// page shows its final state. The script only adds a class to <html> and
// animates from there.
{
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('js');

    // 1. Reveal on scroll: fade and rise, staggered within each group.
    const groups = [
      '.hero .copy > *',
      '.works > *',
      '#features > h2, #features > .lede',
      '.three > .card',
      '.feature .text > *',
      '.feature .visual > *',
      '.more > li',
      '.privacy-band .inner > *',
      '.facts > li',
      '.cta > *',
      'footer .cols > div'
    ];
    const items = [];
    groups.forEach(sel => {
      const parents = new Map();
      document.querySelectorAll(sel).forEach(el => {
        const i = parents.get(el.parentElement) || 0;
        parents.set(el.parentElement, i + 1);
        el.classList.add('rv');
        el.style.setProperty('--d', (i * 90) + 'ms');
        items.push(el);
      });
    });

    // 2. Count-ups: a number at the start of an element counts from 0.
    const countUp = el => {
      const m = el.textContent.match(/^([^\d]*)([\d,]+)(.*)$/s);
      if (!m) return;
      const target = parseInt(m[2].replace(/,/g, ''), 10);
      const dur = 1100, t0 = performance.now();
      const fmt = n => target >= 1000 ? n.toLocaleString('en-US') : String(n);
      const step = t => {
        const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + fmt(Math.round(target * e)) + m[3];
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = m[1] + '0' + m[3];
      requestAnimationFrame(step);
    };
    const counters = '.chip b, .nums b, .board .sc, .parts b';

    // 3. The coach chat plays once: question, typing dots, answer, chart.
    const playChat = chat => {
      const [me, ai] = chat.querySelectorAll('.bubble');
      const ask = chat.querySelector('.ask');
      ai.classList.add('typing');
      setTimeout(() => me.classList.add('on'), 200);
      setTimeout(() => ai.classList.add('on'), 900);
      setTimeout(() => { ai.classList.remove('typing'); ai.classList.add('done'); }, 2300);
      setTimeout(() => ask && ask.classList.add('on'), 2700);
    };

    // 4. Small loops that show a control being used.
    const loopStepper = box => {
      const b = box.querySelector('.stepper b'), s = box.querySelector('.s');
      let n = 3;
      setInterval(() => {
        n = n === 3 ? 1 : n + 1;
        b.textContent = n + 'x';
        s.textContent = 'Croissant, ' + n + 'x: ' + (230 * n) + ' kcal';
        b.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
      }, 1800);
    };
    const loopChips = box => {
      const chips = [...box.querySelectorAll('.chips span')];
      let i = chips.findIndex(c => c.classList.contains('on'));
      setInterval(() => {
        chips[i].classList.remove('on');
        i = (i + 1) % chips.length;
        chips[i].classList.add('on');
      }, 2000);
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        io.unobserve(el);
        el.classList.add('in');
        el.querySelectorAll(counters).forEach(countUp);
        if (el.matches(counters)) countUp(el);
        if (el.classList.contains('chat')) playChat(el);
        if (el.classList.contains('f2')) setTimeout(() => loopStepper(el), 1200);
        if (el.classList.contains('split')) setTimeout(() => loopChips(el), 1200);
        if (el.classList.contains('giant')) el.style.setProperty('--blur', '3px');
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

    items.forEach(el => io.observe(el));
    document.querySelectorAll('.chat, .f2, .split, .giant, .hero .chip').forEach(el => io.observe(el));

    // 5. Hero: the phone rises in on load; on scroll the phone, the chips and
    //    the motif move at different speeds.
    const hero = document.querySelector('.hero');
    const phone = hero && hero.querySelector('.stage .phone');
    const chips = hero ? [...hero.querySelectorAll('.chip')] : [];
    requestAnimationFrame(() => hero && hero.classList.add('ready'));
    let ticking = false;
    const parallax = () => {
      ticking = false;
      const y = Math.min(window.scrollY, 900);
      if (phone) phone.style.translate = `0 ${y * -0.10}px`;
      chips.forEach((c, i) => c.style.translate = `0 ${y * (i ? -0.22 : -0.16)}px`);
      if (hero) hero.style.backgroundPositionY = `calc(40% + ${y * 0.12}px)`;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
  }
}
