
const els = {
  org: document.getElementById('org'),
  reload: document.getElementById('reload'),
  q: document.getElementById('q'),
  sort: document.getElementById('sort'),
  grid: document.getElementById('grid'),
  empty: document.getElementById('empty'),
  stats: document.getElementById('stats'),
  updated: document.getElementById('updated'),
  topicChips: document.getElementById('topicChips'),
};

let state = {
  org: (els.org.value || "").trim(),
  repos: [],
  topics: [],
  selectedTopics: new Set(),
  query: '',
  sort: 'updated_desc',
  generatedAt: null,
};

function fmtDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'2-digit' });
  }catch{ return iso; }
}

function shields(org, name, updatedIso){
  return {
    stars: `https://img.shields.io/github/stars/${org}/${name}?style=flat`,
    lang: `https://img.shields.io/github/languages/top/${org}/${name}?style=flat`,
    updated: `https://img.shields.io/badge/updated-${encodeURIComponent(fmtDate(updatedIso ?? '—'))}-111827?style=flat`,
  };
}

function normalize(s){ return (s ?? '').toLowerCase(); }

function matchesTopic(repo){
  if(state.selectedTopics.size === 0) return true;
  const set = new Set(repo.topics ?? []);
  for(const t of state.selectedTopics){
    if(!set.has(t)) return false; // AND semantics
  }
  return true;
}

function matchesQuery(repo){
  if(!state.query) return true;
  const q = normalize(state.query);
  const hay = [repo.name, repo.description, ...(repo.topics ?? [])].map(normalize).join(' ');
  return hay.includes(q);
}

function sortRepos(repos){
  const s = state.sort;
  const copy = [...repos];
  if(s === 'updated_desc'){
    copy.sort((a,b)=> new Date(b.updated_at) - new Date(a.updated_at));
  } else if(s === 'stars_desc'){
    copy.sort((a,b)=> (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));
  } else if(s === 'name_asc'){
    copy.sort((a,b)=> a.name.localeCompare(b.name));
  }
  return copy;
}

function chip(text, active, onClick){
  const a = document.createElement('a');
  a.href = "javascript:void(0)";
  a.className = "pill" + (active ? " accent" : "");
  a.textContent = text;
  a.onclick = onClick;
  return a;
}

function renderTopics(){
  els.topicChips.innerHTML = '';
  els.topicChips.appendChild(chip("Tutti", state.selectedTopics.size === 0, () => { state.selectedTopics.clear(); update(); }));
  for(const t of state.topics){
    els.topicChips.appendChild(chip(t, state.selectedTopics.has(t), () => {
      if(state.selectedTopics.has(t)) state.selectedTopics.delete(t);
      else state.selectedTopics.add(t);
      update();
    }));
  }
}

function repoCard(repo){
  const org = state.org;
  const b = shields(org, repo.name, repo.updated_at);

  const card = document.createElement('div');
  card.className = 'card';

  const top = document.createElement('div');
  top.style.display = 'flex';
  top.style.justifyContent = 'space-between';
  top.style.gap = '10px';

  const left = document.createElement('div');
  const h = document.createElement('h3');
  const a = document.createElement('a');
  a.href = repo.html_url;
  a.target = '_blank';
  a.rel = 'noreferrer';
  a.textContent = repo.name;
  h.appendChild(a);

  const desc = document.createElement('p');
  desc.textContent = repo.description ?? '—';

  left.appendChild(h);
  left.appendChild(desc);

  const right = document.createElement('div');
  right.style.textAlign = 'right';
  right.style.color = 'var(--muted)';
  right.style.fontSize = '12px';
  right.innerHTML = `<div><b style="color:var(--fg)">${(repo.stargazers_count ?? 0).toLocaleString()}</b> ★</div>
                     <div>${repo.language ?? '—'}</div>
                     <div>${fmtDate(repo.updated_at)}</div>`;

  top.appendChild(left);
  top.appendChild(right);

  const badges = document.createElement('div');
  badges.className = 'badges';
  for(const url of [b.stars, b.lang, b.updated]){
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'badge';
    badges.appendChild(img);
  }

  const tags = document.createElement('div');
  tags.className = 'tags';
  const topicList = (repo.topics ?? []).slice(0, 10);
  for(const t of topicList){
    const el = document.createElement('span');
    el.className = 'tag' + (t.includes('devops') || t.includes('ci') ? ' alt' : '');
    el.textContent = t;
    tags.appendChild(el);
  }

  card.appendChild(top);
  card.appendChild(badges);
  if(topicList.length) card.appendChild(tags);
  return card;
}

function update(){
  state.query = els.q.value.trim();
  state.sort = els.sort.value;

  const filtered = sortRepos(state.repos.filter(r => matchesTopic(r) && matchesQuery(r)));
  els.grid.innerHTML = '';
  for(const r of filtered) els.grid.appendChild(repoCard(r));

  els.empty.classList.toggle('hidden', filtered.length !== 0);

  const topicInfo = state.selectedTopics.size ? ` • topic: ${[...state.selectedTopics].join('+')}` : '';
  els.stats.textContent = `${filtered.length} / ${state.repos.length} repo${state.repos.length===1?'':'s'}${topicInfo}`;
}

async function load(org){
  els.grid.innerHTML = '';
  els.stats.textContent = 'Caricamento…';
  els.updated.textContent = '—';
  els.topicChips.innerHTML = '';

  const res = await fetch(`/data/repos.json?ts=${Date.now()}`, { cache: 'no-store' });
  if(!res.ok) throw new Error(`Unable to load /data/repos.json (${res.status})`);
  const payload = await res.json();
  const data = payload[org] ?? payload.default ?? payload;

  state.repos = data.repos ?? [];
  state.generatedAt = data.generated_at ?? null;

  const allTopics = new Set();
  for(const r of state.repos){
    for(const t of (r.topics ?? [])) allTopics.add(t);
  }
  state.topics = [...allTopics].sort((a,b)=>a.localeCompare(b));
  state.selectedTopics.clear();

  renderTopics();
  update();
  els.updated.textContent = state.generatedAt ? `Dati aggiornati: ${fmtDate(state.generatedAt)}` : '—';
}

els.reload.onclick = async () => {
  const org = (els.org.value || "").trim() || state.org || "gargiolastech";
  state.org = org;
  await load(org);
};
els.q.oninput = () => update();
els.sort.onchange = () => update();

load(state.org).catch(err => {
  console.error(err);
  els.stats.textContent = 'Errore: dati non disponibili. Vedi /docs/REPO_HUB.md';
});
