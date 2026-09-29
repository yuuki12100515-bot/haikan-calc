(() => {
  'use strict';
  const tools = {
    'cut-length.html':'芯々から切り寸','cut-el.html':'カットエルボ','offset.html':'配管の逃げ寸法',
    'rolling-offset.html':'3方向振り・タスキ振り','slope.html':'配管勾配・高低差','right-triangle.html':'斜め寸法・直角三角形',
    'reducer-geometry.html':'レジューサ偏芯・テーパー','pipe-circumference.html':'配管円周・等分ピッチ',
    'flange-hole-layout.html':'フランジ穴割付','stock-cut.html':'定尺取り・切断割付','flow-velocity.html':'流量・流速',
    'pipe-diameter.html':'配管口径の目安','pressure-loss.html':'直管の圧力損失','reynolds.html':'レイノルズ数・摩擦係数',
    'water-head-pressure.html':'水頭・圧力換算','pump-head.html':'ポンプ必要揚程','pipe-volume.html':'配管内容積・充水量',
    'fill-time.html':'タンク・配管の充填時間','sgp-weight.html':'SGP重量・保有水量','surface-area.html':'配管表面積・保温面積',
    'thermal-expansion.html':'配管の熱伸び・伸縮量'
  };
  const aliases = {
    'cut-length.html':'切断 長さ 芯芯 c-c bw sw ねじ 塩ビ vp hivp',
    'cut-el.html':'角度 エルボ lr sr 引き寸 外r 内r',
    'offset.html':'逃げ オフセット ずらし 45度',
    'rolling-offset.html':'角度振り 3d 奥行き タスキ 振り',
    'slope.html':'勾配 高低差 パーセント 1/100 ドレン 排水',
    'right-triangle.html':'三平方 斜辺 角度 水平 高さ',
    'reducer-geometry.html':'異径 偏心 同心 径違い インチ',
    'pipe-circumference.html':'円周 外周 等分 罫書き マーキング',
    'flange-hole-layout.html':'フランジ pcd ボルト 穴 ピッチ',
    'stock-cut.html':'定尺 取り合い 端材 材料 切断',
    'flow-velocity.html':'流量 流速 l/min m3/h',
    'pipe-diameter.html':'口径 内径 サイズ 選定',
    'pressure-loss.html':'損失 圧損 darcy',
    'reynolds.html':'層流 乱流 摩擦係数',
    'water-head-pressure.html':'水頭 圧力 mpa kpa bar',
    'pump-head.html':'ポンプ 揚程 吐出',
    'pipe-volume.html':'容量 内容積 水量 リットル',
    'fill-time.html':'時間 充填 タンク 流量',
    'sgp-weight.html':'重さ 重量 満水 水量 鋼管',
    'surface-area.html':'面積 塗装 保温 ラッキング',
    'thermal-expansion.html':'熱 伸び 収縮 温度'
  };
  const page = location.pathname.split('/').pop() || 'index.html';
  const storageKey = 'haikanCalcRecentV1';

  function readRecent() {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]').filter(x => tools[x]); }
    catch (_) { return []; }
  }
  function saveRecent(file) {
    if (!tools[file]) return;
    try { localStorage.setItem(storageKey, JSON.stringify([file, ...readRecent().filter(x => x !== file)].slice(0, 3))); }
    catch (_) {}
  }
  if (tools[page]) saveRecent(page);

  const recentBox = document.getElementById('recentTools');
  const recentSection = document.getElementById('recentSection');
  if (recentBox && recentSection) {
    const recent = readRecent();
    if (recent.length) {
      recentSection.hidden = false;
      for (const file of recent) {
        const a = document.createElement('a');
        a.href = file;
        a.textContent = tools[file];
        recentBox.appendChild(a);
      }
    }
  }

  const search = document.getElementById('toolSearch');
  const searchStatus = document.getElementById('searchStatus');
  const list = document.getElementById('calculator-list');
  if (search && list) {
    const cards = [...list.querySelectorAll('.card')];
    const groups = [...list.querySelectorAll('.grid')];
    const update = () => {
      const query = search.value.trim().toLowerCase().replace(/\s+/g, ' ');
      let count = 0;
      for (const card of cards) {
        const file = (card.getAttribute('href') || '').split('#')[0];
        const text = (card.textContent + ' ' + (aliases[file] || '')).toLowerCase();
        const match = !query || query.split(' ').every(word => text.includes(word));
        card.hidden = !match;
        if (match) count++;
      }
      for (const group of groups) {
        const visible = [...group.querySelectorAll('.card')].some(card => !card.hidden);
        group.hidden = !visible;
        const heading = group.previousElementSibling;
        if (heading && heading.tagName === 'H3') heading.hidden = !visible;
      }
      searchStatus.textContent = query ? (count ? count + '件見つかりました' : '該当する計算機がありません') : '';
    };
    search.addEventListener('input', update);
  }

  const offlineStatus = document.getElementById('offlineStatus');
  function updateConnection() {
    if (!offlineStatus) return;
    offlineStatus.textContent = navigator.onLine ? 'オンライン：最新版を確認できます' : 'オフライン：保存済みの計算機を使用できます';
  }
  addEventListener('online', updateConnection);
  addEventListener('offline', updateConnection);
  updateConnection();

  async function copyText(text) {
    if (navigator.clipboard && location.protocol === 'https:') {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  if (tools[page]) {
    const results = [...document.querySelectorAll('.result[id],.res[id],.r[id]')];
    for (const result of results) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '結果をコピー';
      button.setAttribute('aria-label', 'この計算結果をコピー');
      button.style.cssText = 'width:100%;margin:8px 0 14px;padding:11px;border:1px solid #b9cbe0;border-radius:10px;background:#eef5ff;color:#1768cc;font-weight:800;font-size:15px';
      button.addEventListener('click', async () => {
        const text = result.innerText.trim();
        if (!text) return;
        try {
          await copyText(tools[page] + '\n' + text + '\nHAIKAN CALC');
          button.textContent = 'コピーしました';
          setTimeout(() => { button.textContent = '結果をコピー'; }, 1500);
        } catch (_) {
          button.textContent = 'コピーできませんでした';
        }
      });
      result.insertAdjacentElement('afterend', button);
    }
  }

  if ('serviceWorker' in navigator) {
    addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
