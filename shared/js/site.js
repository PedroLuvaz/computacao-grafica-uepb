/* =====================================================================
   CG·UEPB — shell compartilhado do site
   ---------------------------------------------------------------------
   • Manifesto único de projetos e módulos (navegação, breadcrumbs, cards)
   • Tema claro/escuro (respeita o sistema e lembra a escolha)
   • Topbar, cabeçalho do palco e grades de módulos gerados a partir do manifesto
   • Toasts no lugar de window.alert()
   • Animação de rasterização no hero das páginas iniciais

   Uso: inclua no <head> de cada página
       <script src="<raiz>/shared/js/site.js"></script>
   e marque o <body> com data-project="cg|pi" e data-module="<id>".
   ===================================================================== */
(function () {
    'use strict';

    /* -----------------------------------------------------------------
       Raiz do site, calculada a partir do próprio script
       (funciona em Live Server, GitHub Pages em subpasta e file://)
       ----------------------------------------------------------------- */
    const ROOT = new URL('../../', document.currentScript.src).href;
    const url = (path) => new URL(path, ROOT).href;

    /* -----------------------------------------------------------------
       Tema — aplicado antes da primeira pintura para evitar "flash"
       ----------------------------------------------------------------- */
    const THEME_KEY = 'cg-uepb:tema';
    const storage = {
        get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* modo privado */ } }
    };
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (theme) => document.documentElement.setAttribute('data-theme', theme);
    applyTheme(storage.get(THEME_KEY) || (systemDark.matches ? 'dark' : 'light'));
    systemDark.addEventListener?.('change', (e) => { if (!storage.get(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light'); });

    function toggleTheme() {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        storage.set(THEME_KEY, next);
    }

    /* -----------------------------------------------------------------
       Manifesto
       ----------------------------------------------------------------- */
    const SITE = {
        semester: '2025.1',
        professor: 'Robson Pequeno de Sousa',
        team: ['Pedro Lucas Vaz Andrade', 'Erick Nathan Almeida do Nascimento'],
        repo: 'https://github.com/PedroLuvaz/computacao-grafica-uepb',
        projects: [
            {
                id: 'cg', num: '01', icon: 'pen',
                name: 'Computação Gráfica', short: 'CG',
                lead: 'Rasterização de primitivas, sistemas de coordenadas, transformações geométricas 2D e 3D e recorte — tudo pixel a pixel.',
                modules: [
                    { id: 'coordenadas', icon: 'grid', name: 'Sistemas de Coordenadas', short: 'Coordenadas',
                      desc: 'Conversão entre coordenadas de mundo, NDC, NDC centralizado e dispositivo.', tags: ['Mundo', 'NDC', 'Dispositivo'] },
                    { id: 'retas', icon: 'line', name: 'Rasterização de Retas', short: 'Retas',
                      desc: 'Desenho de retas com os algoritmos DDA e Ponto Médio (Bresenham) nos 8 oitantes.', tags: ['DDA', 'Bresenham'] },
                    { id: 'circunferencias', icon: 'circle', name: 'Rasterização de Circunferências', short: 'Circunferências',
                      desc: 'Equação explícita, método trigonométrico e Ponto Médio com simetria de oito vias.', tags: ['Explícita', 'Trigonométrica', 'Ponto Médio'] },
                    { id: 'transformacoes-2d', icon: 'move', name: 'Transformações 2D', short: '2D',
                      desc: 'Translação, escala, rotação, reflexão e cisalhamento em objetos e imagens PGM, com viewport.', tags: ['Matrizes 3×3', 'Viewport', 'PGM'] },
                    { id: 'transformacoes-3d', icon: 'cube', name: 'Transformações 3D', short: '3D',
                      desc: 'Matrizes homogêneas 4×4, projeção isométrica, câmera orbital e viewport 3D.', tags: ['Matrizes 4×4', 'Isométrica'] },
                    { id: 'batimentos', icon: 'pulse', name: 'Batimentos Cardíacos', short: 'Batimentos', accent: 'ecg',
                      desc: 'Simulação de eletrocardiograma em tempo real com ondas P-QRS-T e estimativa de BPM.', tags: ['ECG', 'Animação'] },
                    { id: 'recorte', icon: 'crop', name: 'Recorte de Cohen-Sutherland', short: 'Recorte',
                      desc: 'Recorte de segmentos contra uma janela retangular usando códigos de região de 4 bits.', tags: ['Clipping', 'Outcodes'] }
                ]
            },
            {
                id: 'pi', num: '02', icon: 'image',
                name: 'Processamento de Imagens', short: 'PI',
                lead: 'Operações sobre imagens PGM/PBM: filtragem espacial, aritmética, intensidade, histograma, morfologia e morfismo.',
                modules: [
                    { id: 'filtros', icon: 'filter', name: 'Filtros Espaciais', short: 'Filtros',
                      desc: 'Convolução 3×3: média, mediana, passa-alta, Roberts, Prewitt, Sobel e alto reforço.', tags: ['Convolução', 'Bordas'] },
                    { id: 'combinacao', icon: 'layers', name: 'Combinação de Imagens', short: 'Combinação',
                      desc: 'Operações aritméticas (+ − × ÷) e lógicas (OR, AND, XOR) pixel a pixel entre duas imagens.', tags: ['Aritméticas', 'Lógicas'] },
                    { id: 'transformacoes', icon: 'sliders', name: 'Transformações de Intensidade', short: 'Intensidade',
                      desc: 'Negativo, gama, logarítmica, sigmoide, faixa dinâmica e transferência linear.', tags: ['Gama', 'Log', 'Sigmoide'] },
                    { id: 'histograma', icon: 'chart', name: 'Histograma e Equalização', short: 'Histograma',
                      desc: 'Distribuição de intensidades e equalização pela função de distribuição acumulada.', tags: ['CDF', 'Contraste'] },
                    { id: 'morfologia', icon: 'shapes', name: 'Morfologia Matemática', short: 'Morfologia',
                      desc: 'Erosão, dilatação, abertura, fechamento, contornos, gradiente, top-hat e bottom-hat.', tags: ['Binária', 'Níveis de cinza'] },
                    { id: 'morfismo', icon: 'film', name: 'Morfismo Temporal', short: 'Morfismo',
                      desc: 'Interpolação linear (cross-dissolve) entre duas imagens em uma animação de 60 quadros.', tags: ['Cross-dissolve', 'Animação'] }
                ]
            }
        ]
    };

    /* -----------------------------------------------------------------
       Ícones (traço, 24×24)
       ----------------------------------------------------------------- */
    const ICONS = {
        logo: '<rect x="3" y="3" width="5" height="5" rx="1"/><rect x="10" y="10" width="5" height="5" rx="1"/><rect x="16" y="16" width="5" height="5" rx="1"/><path d="M8 5.5h6.5a2 2 0 0 1 2 2V10M5.5 8v6.5a2 2 0 0 0 2 2H10"/>',
        pen: '<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
        image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
        grid: '<path d="M3 3v18h18"/><path d="M7 14h.01M11 10h.01M15 6h.01"/><path d="M7 3v18M11 3v18M15 3v18M19 3v18M3 7h18M3 11h18M3 15h18" opacity=".35"/>',
        line: '<path d="M4 20 20 4"/><path d="M4 20h2v-2H4zM9 15h2v-2H9zM14 10h2V8h-2zM18 6h2V4h-2z" fill="currentColor" stroke="none"/>',
        circle: '<circle cx="12" cy="12" r="8"/><path d="M12 12h8" stroke-dasharray="2 2"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
        move: '<path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>',
        cube: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>',
        pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
        crop: '<path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/>',
        filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
        layers: '<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
        sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
        chart: '<path d="M3 3v18h18"/><path d="M7 16v-3M11 16V8M15 16v-6M19 16V5"/>',
        shapes: '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
        film: '<rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>',
        arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
        chevron: '<path d="m9 18 6-6-6-6"/>',
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
        moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
        home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
        github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
        cursor: '<path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="m13 13 6 6"/>',
        info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
        alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>',
        x: '<path d="M18 6 6 18M6 6l12 12"/>',
        heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
        upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
        download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
        refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
        trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
        play: '<polygon points="6 3 20 12 6 21 6 3"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
        eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
        frame: '<path d="M22 6H2M22 18H2M6 2v20M18 2v20"/>',
        code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
        palette: '<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 11.996 2z"/>'
    };

    const icon = (name, cls = '') =>
        `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

    const initials = (name) => name.split(' ').filter(Boolean).map((p) => p[0]).filter((_, i, a) => i === 0 || i === a.length - 1).join('');

    /* -----------------------------------------------------------------
       Renderização
       ----------------------------------------------------------------- */
    const ctx = () => {
        const body = document.body;
        const project = SITE.projects.find((p) => p.id === body.dataset.project) || null;
        const module = project?.modules.find((m) => m.id === body.dataset.module) || null;
        return { project, module };
    };

    const moduleHref = (project, module) => url(`${project.id}/${module.id}/`);
    const projectHref = (project) => url(`${project.id}/`);

    function renderTopbar() {
        const { project, module } = ctx();
        const header = document.createElement('header');
        header.className = 'topbar' + (project ? ' has-modules' : '');
        header.innerHTML = `
            <a class="brand" href="${url('')}" aria-label="Página inicial">
                <span class="brand-mark">${icon('logo')}</span>
                <span>CG·UEPB <small>${SITE.semester}</small></span>
            </a>
            <nav class="project-switch" aria-label="Projetos">
                ${SITE.projects.map((p) => `
                    <a href="${projectHref(p)}" ${project?.id === p.id ? 'aria-current="true"' : ''}>
                        ${p.short}<span class="label-long"> · ${p.name}</span>
                    </a>`).join('')}
            </nav>
            ${project ? `
            <nav class="module-nav" aria-label="Módulos de ${project.name}">
                ${project.modules.map((m) => `
                    <a href="${moduleHref(project, m)}" ${module?.id === m.id ? 'aria-current="page"' : ''}>${m.short}</a>`).join('')}
            </nav>` : ''}
            <div class="topbar-actions">
                <a class="icon-btn" href="${SITE.repo}" target="_blank" rel="noopener" title="Repositório no GitHub" aria-label="Repositório no GitHub">${icon('github')}</a>
                <button class="icon-btn" type="button" data-theme-toggle title="Alternar tema" aria-label="Alternar tema claro/escuro">
                    ${icon('moon', 'icon-moon')}${icon('sun', 'icon-sun')}
                </button>
            </div>`;
        document.body.prepend(header);
        header.querySelector('[data-theme-toggle]').addEventListener('click', toggleTheme);
        header.querySelector('.module-nav [aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    }

    /* Cabeçalho do palco: <div data-stage-head data-hint="..."></div> */
    function renderStageHeads() {
        const { project, module } = ctx();
        document.querySelectorAll('[data-stage-head]').forEach((el) => {
            if (!project || !module) return;
            const hint = el.dataset.hint;
            el.classList.add(el.dataset.stageHead === 'page' ? 'pi-head' : 'stage-head');
            el.innerHTML = `
                <div>
                    <div class="crumbs">
                        <a href="${url('')}">Início</a><span class="sep">/</span>
                        <a href="${projectHref(project)}">${project.name}</a><span class="sep">/</span>
                        <span>${module.short}</span>
                    </div>
                    <h1 class="stage-title">${module.name}</h1>
                    <p class="stage-desc">${module.desc}</p>
                </div>
                ${hint ? `<p class="hint">${icon('cursor')}<span>${hint}</span></p>` : ''}`;
        });
        if (module) document.title = `${module.name} · ${project.name} · CG·UEPB`;
    }

    /* Grade de módulos: <div data-module-grid="cg"></div> */
    function renderModuleGrids() {
        document.querySelectorAll('[data-module-grid]').forEach((el) => {
            const project = SITE.projects.find((p) => p.id === el.dataset.moduleGrid);
            if (!project) return;
            el.classList.add('module-grid');
            el.innerHTML = project.modules.map((m, i) => `
                <a class="module-card reveal" href="${moduleHref(project, m)}" ${m.accent ? `data-accent="${m.accent}"` : ''}>
                    <div class="module-card-top">
                        <span class="module-icon">${icon(m.icon)}</span>
                        <span class="module-num">${String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3>${m.name}</h3>
                    <p>${m.desc}</p>
                    <div class="tags">${m.tags.map((t) => `<span>${t}</span>`).join('')}</div>
                </a>`).join('');
        });
    }

    /* Cards de projeto: <div data-project-grid></div> */
    function renderProjectGrids() {
        document.querySelectorAll('[data-project-grid]').forEach((el) => {
            el.classList.add('project-grid');
            el.innerHTML = SITE.projects.map((p) => `
                <a class="project-card reveal" href="${projectHref(p)}" data-project="${p.id}">
                    <div class="project-card-top">
                        <span class="project-icon">${icon(p.icon)}</span>
                        <span class="project-num">Projeto ${p.num} · ${p.modules.length} módulos</span>
                    </div>
                    <div>
                        <h3>${p.name}</h3>
                        <p style="margin-top:8px">${p.lead}</p>
                    </div>
                    <ul class="project-modules">${p.modules.map((m) => `<li>${m.short}</li>`).join('')}</ul>
                    <span class="project-cta">Explorar projeto ${icon('arrow')}</span>
                </a>`).join('');
        });
    }

    /* Equipe: <div data-team></div> */
    function renderTeam() {
        document.querySelectorAll('[data-team]').forEach((el) => {
            el.classList.add('team');
            el.innerHTML = SITE.team.map((n) => `<span class="person"><span class="avatar">${initials(n)}</span>${n}</span>`).join('') +
                `<span class="person prof"><span class="avatar">${initials(SITE.professor)}</span>Prof. ${SITE.professor}</span>`;
        });
    }

    /* Ícones declarativos: <span data-icon="nome"></span> */
    function renderIcons() {
        document.querySelectorAll('[data-icon]').forEach((el) => {
            el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon));
            el.removeAttribute('data-icon');
        });
    }

    function renderFooter() {
        document.querySelectorAll('[data-footer]').forEach((el) => {
            el.className = 'footer';
            el.innerHTML = `<div class="page">
                <span>Computação Gráfica · UEPB ${SITE.semester} · Prof. ${SITE.professor}</span>
                <span><a href="${SITE.repo}" target="_blank" rel="noopener">Código-fonte no GitHub</a></span>
            </div>`;
        });
    }

    /* -----------------------------------------------------------------
       Toasts (substituem window.alert, que bloqueia a página)
       ----------------------------------------------------------------- */
    let region;
    function toast(message) {
        if (!region) {
            region = document.createElement('div');
            region.className = 'toast-region';
            region.setAttribute('role', 'status');
            region.setAttribute('aria-live', 'polite');
            document.body.appendChild(region);
        }
        const el = document.createElement('div');
        el.className = 'toast';
        el.innerHTML = `${icon('alert')}<span></span><button type="button" aria-label="Fechar">${icon('x')}</button>`;
        el.querySelector('span').textContent = String(message);
        const close = () => { el.classList.add('leaving'); setTimeout(() => el.remove(), 250); };
        el.querySelector('button').addEventListener('click', close);
        region.appendChild(el);
        while (region.children.length > 3) region.firstElementChild.remove();
        setTimeout(close, 5200);
    }
    window.alert = (message) => (document.body ? toast(message) : console.warn(message));

    /* -----------------------------------------------------------------
       Hero: retas e circunferências rasterizadas pixel a pixel (Bresenham)
       ----------------------------------------------------------------- */
    function heroRaster() {
        const canvas = document.querySelector('[data-hero-raster]');
        if (!canvas) return;
        const g = canvas.getContext('2d');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const CELL = 10;
        let cols, rows, shapes = [], queue = [], lit = new Map(), raf;

        const css = (v) => getComputedStyle(canvas).getPropertyValue(v).trim();

        function bresenham(x0, y0, x1, y1) {
            const pts = [];
            const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
            const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
            let err = dx + dy;
            for (;;) {
                pts.push([x0, y0]);
                if (x0 === x1 && y0 === y1) break;
                const e2 = 2 * err;
                if (e2 >= dy) { err += dy; x0 += sx; }
                if (e2 <= dx) { err += dx; y0 += sy; }
            }
            return pts;
        }

        function midpointCircle(cx, cy, r) {
            const pts = [];
            let x = 0, y = r, d = 1 - r;
            while (x <= y) {
                [[x, y], [y, x], [-x, y], [-y, x], [x, -y], [y, -x], [-x, -y], [-y, -x]].forEach(([a, b]) => pts.push([cx + a, cy + b]));
                if (d < 0) d += 2 * x + 3; else { d += 2 * (x - y) + 5; y--; }
                x++;
            }
            return pts.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const { width, height } = canvas.getBoundingClientRect();
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            g.setTransform(dpr, 0, 0, dpr, 0, 0);
            cols = Math.ceil(width / CELL);
            rows = Math.ceil(height / CELL);
            lit.clear();
            queue = [];
            seed();
        }

        const rnd = (a, b) => Math.floor(a + Math.random() * (b - a));
        function seed() {
            for (let i = 0; i < 3; i++) addShape();
        }
        function addShape() {
            const edge = Math.random() < 0.5;
            const pts = Math.random() < 0.55
                ? bresenham(rnd(0, cols), edge ? rnd(0, rows) : 0, rnd(0, cols), edge ? rnd(0, rows) : rows - 1)
                : midpointCircle(rnd(4, cols - 4), rnd(4, rows - 4), rnd(4, Math.max(5, Math.min(cols, rows) / 3)));
            const color = Math.random() < 0.6 ? 'accent' : 'accent2';
            queue.push({ pts, i: 0, color });
        }

        function frame() {
            const accent = css('--accent'), accent2 = css('--accent-2'), grid = css('--bg-grid');
            const { width, height } = canvas.getBoundingClientRect();
            g.clearRect(0, 0, width, height);

            g.fillStyle = grid;
            for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) g.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);

            queue.forEach((s) => {
                for (let k = 0; k < (reduce ? s.pts.length : 2) && s.i < s.pts.length; k++, s.i++) {
                    const [x, y] = s.pts[s.i];
                    lit.set(`${x},${y}`, { x, y, life: 1, color: s.color });
                }
            });
            queue = queue.filter((s) => s.i < s.pts.length);
            if (!reduce && queue.length < 3 && Math.random() < 0.03) addShape();

            lit.forEach((p, key) => {
                g.globalAlpha = Math.max(0, p.life) * 0.55;
                g.fillStyle = p.color === 'accent' ? accent : accent2;
                g.fillRect(p.x * CELL + 1, p.y * CELL + 1, CELL - 2, CELL - 2);
                if (!reduce) p.life -= 0.0035;
                if (p.life <= 0) lit.delete(key);
            });
            g.globalAlpha = 1;
            if (!reduce) raf = requestAnimationFrame(frame);
        }

        resize();
        frame();
        let t;
        window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { cancelAnimationFrame(raf); resize(); frame(); }, 150); });
        new MutationObserver(() => { if (reduce) frame(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    /* -----------------------------------------------------------------
       Inicialização
       ----------------------------------------------------------------- */
    function init() {
        const { module } = ctx();
        if (module?.accent) document.body.dataset.accent = module.accent;
        renderTopbar();
        renderStageHeads();
        renderProjectGrids();
        renderModuleGrids();
        renderTeam();
        renderFooter();
        renderIcons();
        heroRaster();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.CGUEPB = { SITE, icon, toast, url };
})();
