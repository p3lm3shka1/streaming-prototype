import './styles.scss';

type RoomState = {
  roomCode: string | null;
  isPlaying: boolean;
  displayName: string;
};

const STORAGE_KEY = 'watchparty-prototype-state';
const fallback: RoomState = { roomCode: null, isPlaying: true, displayName: 'Ты' };
const app = document.querySelector<HTMLElement>('#app')!;

async function readState(): Promise<RoomState> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return { ...fallback, ...(result[STORAGE_KEY] as Partial<RoomState> | undefined) };
  }
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch {
    return fallback;
  }
}

async function saveState(state: RoomState): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage?.local) {
    await chrome.storage.local.set({ [STORAGE_KEY]: state });
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeCode(): string {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
}

function renderHome(): void {
  app.innerHTML = `
    <section class="shell">
      <header class="topbar">
        <a class="brand" href="#" aria-label="Watchparty — главная"><span class="brand-mark">w</span><span>watchparty</span></a>
        <button class="icon-button" type="button" aria-label="Настройки" title="Настройки"><span class="gear">⚙</span></button>
      </header>
      <div class="hero">
        <div class="eyebrow"><span class="live-dot"></span> ВАШЕ КИНО. ВАША КОМПАНИЯ.</div>
        <h1>Вечер<br>становится <em>лучше</em><br>вместе.</h1>
        <p>Соберите друзей в одной комнате и смотрите синхронно.</p>
      </div>
      <div class="poster-card" aria-label="Иллюстрация киновечера">
        <div class="poster-glow"></div><div class="poster-moon"></div>
        <div class="poster-hill hill-back"></div><div class="poster-hill hill-front"></div>
        <div class="poster-caption"><span>ПОРА ВЫБИРАТЬ</span><strong>Что смотрим сегодня?</strong></div>
        <span class="spark spark-one">✦</span><span class="spark spark-two">✧</span>
      </div>
      <div class="actions">
        <button class="button button-primary" id="create-room"><span class="play-icon">▶</span> Создать комнату <span class="button-arrow">↗</span></button>
        <div class="join-row"><label class="sr-only" for="room-code">Код комнаты</label><input id="room-code" maxlength="4" inputmode="numeric" placeholder="Код комнаты" autocomplete="one-time-code"><button class="button button-secondary" id="join-room">Войти</button></div>
      </div>
      <div class="privacy-note"><span class="lock-icon">◈</span><span>Каждый смотрит со своего аккаунта.<br><b>Никаких паролей и видеопотоков.</b></span></div>
      <footer class="footer"><span>ПРЕВЬЮ · ЛОКАЛЬНЫЙ РЕЖИМ</span><span class="status-pill"><i></i> ПРОТОТИП</span></footer>
    </section>`;

  document.querySelector('#create-room')?.addEventListener('click', async () => {
    await saveState({ ...fallback, roomCode: makeCode() });
    renderRoom(await readState());
  });
  document.querySelector('#join-room')?.addEventListener('click', async () => {
    const input = document.querySelector<HTMLInputElement>('#room-code');
    const code = input?.value.trim();
    if (!code || code.length !== 4) {
      input?.setCustomValidity('Введите четырёхзначный код комнаты');
      input?.reportValidity();
      return;
    }
    await saveState({ ...fallback, roomCode: code });
    renderRoom(await readState());
  });
  document.querySelector<HTMLInputElement>('#room-code')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    input.setCustomValidity('');
  });
}

function renderRoom(state: RoomState): void {
  const code = state.roomCode ?? makeCode();
  app.innerHTML = `
    <section class="shell room-shell">
      <header class="topbar"><a class="brand" href="#" aria-label="Watchparty — главная"><span class="brand-mark">w</span><span>watchparty</span></a><button class="icon-button" id="leave-room" type="button" aria-label="Выйти из комнаты" title="Выйти">×</button></header>
      <div class="room-heading"><div class="eyebrow"><span class="live-dot"></span> КОМНАТА ОТКРЫТА</div><h1>Кино <em>вместе.</em></h1><p>Поделись кодом — пусть друзья присоединятся.</p></div>
      <button class="invite-card" id="copy-code" type="button"><span class="invite-label">КОД ПРИГЛАШЕНИЯ</span><span class="invite-code">${escapeHtml(code.split('').join(' '))}</span><span class="copy-hint" id="copy-hint">Нажми, чтобы скопировать <b>⧉</b></span></button>
      <div class="section-label"><span>В КОМНАТЕ</span><span class="participant-count">1 участник</span></div>
      <div class="participant"><span class="avatar">Я</span><span class="participant-name">Ты <small>организатор</small></span><span class="host-badge">ХОСТ</span></div>
      <div class="now-playing"><div class="film-art"><span>✦</span></div><div class="film-copy"><span class="eyebrow">СЕЙЧАС СМОТРИТЕ</span><strong>Выберите фильм<br>на стриминге</strong><small>Плеер ещё не подключён</small></div></div>
      <div class="sync-card"><div class="sync-top"><span class="sync-symbol">◉</span><div><strong>Управление просмотром</strong><small>Демо-переключатель · локально</small></div><span class="demo-tag">DEMO</span></div><div class="media-controls"><button id="rewind" class="control" aria-label="Назад на 10 секунд">↶<small>10</small></button><button id="toggle-play" class="control control-play" aria-label="Воспроизвести или поставить на паузу">${state.isPlaying ? 'Ⅱ' : '▶'}</button><button id="forward" class="control" aria-label="Вперёд на 10 секунд">↷<small>10</small></button><span class="sync-separator"></span><button id="resync" class="resync">⟳ <span>Синхронизировать</span></button></div><div class="timeline"><i></i></div><div class="time-labels"><span>00:00</span><span>—:—</span></div></div>
      <div class="prototype-note"><span>✳</span> Это визуальный прототип. Участники и управление пока не синхронизируются между устройствами.</div>
      <footer class="footer"><span>ПРЕВЬЮ · ЛОКАЛЬНЫЙ РЕЖИМ</span><span class="status-pill"><i></i> ПРОТОТИП</span></footer>
    </section>`;

  document.querySelector('#leave-room')?.addEventListener('click', async () => {
    await saveState(fallback);
    renderHome();
  });
  document.querySelector('#copy-code')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      const hint = document.querySelector<HTMLElement>('#copy-hint');
      if (hint) hint.innerHTML = 'Код скопирован <b>✓</b>';
    } catch {
      const hint = document.querySelector<HTMLElement>('#copy-hint');
      if (hint) hint.textContent = `Код комнаты: ${code}`;
    }
  });
  document.querySelector('#toggle-play')?.addEventListener('click', async () => {
    const updated = { ...state, isPlaying: !state.isPlaying };
    await saveState(updated);
    renderRoom(updated);
  });
  for (const id of ['rewind', 'forward', 'resync']) {
    document.querySelector(`#${id}`)?.addEventListener('click', (event) => {
      const button = event.currentTarget as HTMLButtonElement;
      button.classList.add('is-clicked');
      window.setTimeout(() => button.classList.remove('is-clicked'), 350);
    });
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

void readState().then((state) => state.roomCode ? renderRoom(state) : renderHome());
