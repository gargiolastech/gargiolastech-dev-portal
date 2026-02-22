
async function loadMd(){
  const el = document.getElementById('content');
  try{
    const r = await fetch('/data/vision.md?ts=' + Date.now(), { cache: 'no-store' });
    if(!r.ok) throw new Error('missing');
    const md = await r.text();

    // ultra-light markdown rendering (safe): headings + bullets + paragraphs
    const lines = md.split(/\r?\n/);
    const out = [];
    for(const line of lines){
      const t = line.trim();
      if(!t){ out.push('<div style="height:10px"></div>'); continue; }
      if(t.startsWith('### ')) out.push(`<h3 style="margin:12px 0 6px;font-weight:980">${escapeHtml(t.slice(4))}</h3>`);
      else if(t.startsWith('## ')) out.push(`<h2 style="margin:16px 0 8px;font-weight:980">${escapeHtml(t.slice(3))}</h2>`);
      else if(t.startsWith('# ')) out.push(`<h2 style="margin:0 0 10px;font-weight:980">${escapeHtml(t.slice(2))}</h2>`);
      else if(t.startsWith('- ')) out.push(`<div style="margin:6px 0;color:var(--muted)"><span style="color:var(--accent);font-weight:980">▹</span> ${escapeHtml(t.slice(2))}</div>`);
      else out.push(`<p style="margin:8px 0;color:var(--muted)">${escapeHtml(t)}</p>`);
    }
    el.innerHTML = out.join('');
  }catch{
    el.innerHTML = '<b>vision.md non trovato.</b> Crea /data/vision.md per personalizzare questa pagina.';
  }
}
function escapeHtml(s){
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
loadMd();
