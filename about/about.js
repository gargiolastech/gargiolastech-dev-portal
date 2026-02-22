
async function safeJson(url){
  try{
    const r = await fetch(url + `?ts=${Date.now()}`, { cache: 'no-store' });
    if(!r.ok) return null;
    return await r.json();
  }catch{
    return null;
  }
}

function pill(text, href){
  const a = document.createElement('a');
  a.className = 'pill accent';
  a.textContent = text;
  a.href = href;
  a.target = "_blank";
  a.rel = "noreferrer";
  return a;
}

(async function(){
  const profile = await safeJson('/data/profile.json');
  if(profile){
    if(profile.name) document.getElementById('name').textContent = profile.name;
    if(profile.headline) document.getElementById('headline').textContent = profile.headline;
    if(profile.focus) document.getElementById('focus').textContent = profile.focus;
    if(profile.stack) document.getElementById('stack').textContent = profile.stack;

    if(profile.links?.githubOrg) {
      const el = document.getElementById('githubLink');
      el.href = profile.links.githubOrg;
    }
    if(profile.links?.githubProfile) {
      const el = document.getElementById('profileLink');
      el.href = profile.links.githubProfile;
    }
  }

  const featured = await safeJson('/data/featured.json');
  const wrap = document.getElementById('featured');
  wrap.innerHTML = '';
  const items = featured?.items ?? [];
  if(items.length === 0){
    const span = document.createElement('span');
    span.className = 'pill';
    span.textContent = 'Nessun repo in evidenza configurato';
    wrap.appendChild(span);
    return;
  }
  for(const it of items){
    wrap.appendChild(pill(it.label ?? it.repo, it.url));
  }
})();
