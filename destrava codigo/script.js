(() => {
  const config = window.DESTRAVA_CONFIG || {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = document.querySelector('[data-toast]');
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 4200);
  };

  // Header, reading progress and mobile purchase reminder.
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const mobileBuybar = document.querySelector('[data-mobile-buybar]');
  const hero = document.querySelector('.hero');
  let scrollTick = false;
  const updateScrollState = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(percent, 100)}%`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 12);
    if (mobileBuybar && window.innerWidth <= 720) {
      const threshold = hero ? hero.offsetHeight * .72 : 480;
      mobileBuybar.classList.toggle('is-visible', window.scrollY > threshold);
    }
    scrollTick = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollTick) {
      window.requestAnimationFrame(updateScrollState);
      scrollTick = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateScrollState, { passive: true });
  updateScrollState();

  // Mobile navigation.
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const closeMenu = () => {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav?.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  // Reveal elements when they enter the viewport.
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .13, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Small pointer tilt for the book on larger screens.
  const tiltStage = document.querySelector('[data-tilt]');
  if (tiltStage && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    tiltStage.addEventListener('pointermove', (event) => {
      if (window.innerWidth <= 720) return;
      const rect = tiltStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      tiltStage.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    });
    tiltStage.addEventListener('pointerleave', () => { tiltStage.style.transform = ''; });
  }

  // Code example tabs.
  const codeExamples = {
    python: '<span class="code-comment"># Começa com 2 pontos.</span>\npontos = <span class="code-number">2</span>\n\n<span class="code-comment"># Acrescenta 5 ao valor atual.</span>\npontos = pontos + <span class="code-number">5</span>\n\n<span class="code-comment"># Mostra o novo total.</span>\n<span class="code-fn">print</span>(pontos)',
    pseudo: '<span class="code-comment">INÍCIO</span>\n    pontos &lt;- <span class="code-number">2</span>\n\n    <span class="code-comment">// Atualiza o valor guardado.</span>\n    pontos &lt;- pontos + <span class="code-number">5</span>\n\n    <span class="code-fn">MOSTRE</span> pontos\n<span class="code-comment">FIM</span>'
  };
  const demoCode = document.querySelector('#demo-code code');
  const output = document.querySelector('#demo-output');
  let currentCode = 'python';
  document.querySelectorAll('[data-code-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      currentCode = tab.dataset.codeTab;
      document.querySelectorAll('[data-code-tab]').forEach((button) => {
        const active = button === tab;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
      });
      if (demoCode) demoCode.innerHTML = codeExamples[currentCode];
      if (output) output.textContent = currentCode === 'python' ? 'Execute o exemplo para ver o resultado.' : 'O pseudocódigo representa os mesmos passos.';
    });
  });
  document.querySelector('[data-run-demo]')?.addEventListener('click', (event) => {
    const button = event.currentTarget;
    if (button.disabled) return;
    button.disabled = true;
    if (output) output.textContent = 'Executando os passos…';
    window.setTimeout(() => {
      if (output) output.textContent = currentCode === 'python' ? 'Resultado: 7' : 'Saída: 7';
      button.disabled = false;
    }, reducedMotion ? 0 : 480);
  });

  // Switchable four-week plan.
  const weeks = [
    {
      kicker: 'SEMANA 01 · DIAS 1–7', title: 'Entender o problema e os dados',
      description: 'Organize passos, reconheça entradas e pratique variáveis, tipos de dados e operadores em situações do dia a dia.',
      example: 'Desafio: planeje como calcular o preço de três produtos e escreva os passos em ordem.', caption: 'COMECE PELO QUE JÁ SABE'
    },
    {
      kicker: 'SEMANA 02 · DIAS 8–14', title: 'Fazer escolhas e repetir ações',
      description: 'Use comparações, condições e laços para representar caminhos diferentes e tarefas que se repetem.',
      example: 'Desafio: escreva uma condição para uma nota e teste os limites de cada faixa.', caption: 'PRATIQUE CAMINHOS E REPETIÇÃO'
    },
    {
      kicker: 'SEMANA 03 · DIAS 15–21', title: 'Organizar listas e funções',
      description: 'Agrupe dados, percorra coleções e transforme tarefas que se repetem em funções com entradas e retornos.',
      example: 'Desafio: crie uma função que recebe três preços e devolve a soma.', caption: 'CONECTE OS CONCEITOS'
    },
    {
      kicker: 'SEMANA 04 · DIAS 22–30', title: 'Planejar e construir um projeto',
      description: 'Desenhe um quiz de três perguntas, implemente as etapas, teste os caminhos e explique seu programa.',
      example: 'Projeto: construa um quiz que confira respostas, some pontos e mostre o resultado.', caption: 'CONCLUA E EXPLIQUE SEU PROJETO'
    }
  ];
  const weekPanel = document.querySelector('.week-panel');
  const updateWeek = (index) => {
    const week = weeks[index];
    if (!week) return;
    weekPanel?.classList.add('is-switching');
    window.setTimeout(() => {
      document.querySelector('#week-kicker').textContent = week.kicker;
      document.querySelector('#week-title').textContent = week.title;
      document.querySelector('#week-description').textContent = week.description;
      document.querySelector('#week-example').textContent = week.example;
      document.querySelector('#week-caption').textContent = week.caption;
      document.querySelector('#week-progress-fill').style.width = `${(index + 1) * 25}%`;
      const firstDay = [1, 8, 15, 22][index];
      const dayCount = index === 3 ? 9 : 7;
      const dayList = document.querySelector('#week-days');
      dayList.innerHTML = Array.from({ length: dayCount }, (_, dayIndex) =>
        `<span class="day-chip is-week">${String(firstDay + dayIndex).padStart(2, '0')}</span>`
      ).join('');
      weekPanel?.classList.remove('is-switching');
    }, reducedMotion ? 0 : 130);
  };
  document.querySelectorAll('[data-week]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const index = Number(tab.dataset.week);
      document.querySelectorAll('[data-week]').forEach((button) => {
        const active = button === tab;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-selected', String(active));
      });
      updateWeek(index);
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...document.querySelectorAll('[data-week]')];
      const current = tabs.indexOf(tab);
      const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });

  // Keep one FAQ answer open at a time.
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      document.querySelectorAll('.faq-item').forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  // Checkout configuration: never send visitors to a fabricated payment URL.
  const checkoutUrl = typeof config.checkoutUrl === 'string' ? config.checkoutUrl.trim() : '';
  const priceLabel = typeof config.priceLabel === 'string' ? config.priceLabel.trim() : '';
  let validCheckout = false;
  try {
    const parsed = new URL(checkoutUrl);
    validCheckout = parsed.protocol === 'https:' && parsed.hostname.length > 3;
  } catch (_) { validCheckout = false; }
  document.querySelectorAll('[data-price]').forEach((node) => {
    node.textContent = priceLabel || (validCheckout ? 'Consulte no checkout' : 'Configure seu preço');
  });
  const checkoutNote = document.querySelector('[data-checkout-note]');
  const configured = validCheckout;
  document.body.classList.toggle('is-configured', configured);
  if (checkoutNote && !configured) {
    checkoutNote.textContent = validCheckout
      ? 'Adicione o preço em config.js se quiser exibi-lo nesta página.'
      : 'Antes de publicar: preencha o preço e o link do checkout em config.js.';
  }
  document.querySelectorAll('[data-buy]').forEach((link) => {
    if (validCheckout) {
      link.href = checkoutUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'Comprar o ebook pelo checkout da Kiwify, abre em nova aba');
    } else {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showToast('O link de compra ainda precisa ser configurado em config.js.');
      });
    }
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
