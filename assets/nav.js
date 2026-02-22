
(function(){
  const path = location.pathname.replace(/\/+$/, "") || "/";
  const map = {
    "/": "nav-home",
    "/repos": "nav-repos",
    "/about": "nav-about",
    "/vision": "nav-vision",
  };
  const id = map[path] || (path.startsWith("/repos") ? "nav-repos" : null);
  if(id){
    const el = document.getElementById(id);
    if(el) el.classList.add("active");
  }
})();
