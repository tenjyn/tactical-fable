(function(){
  function loadProjects(){
    try { return JSON.parse(localStorage.getItem('projects') || '[]'); }
    catch(e){ return []; }
  }
  function saveProjects(list){
    localStorage.setItem('projects', JSON.stringify(list));
  }
  function render(){
    const listEl = document.getElementById('projectList');
    listEl.innerHTML = '';
    const projects = loadProjects();
    projects.forEach(name => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = name;
      const open = document.createElement('a');
      open.href = `index.html?project=${encodeURIComponent(name)}`;
      open.textContent = 'Open';
      li.appendChild(span);
      li.appendChild(open);
      listEl.appendChild(li);
    });
  }
  document.getElementById('createProject').addEventListener('click', () => {
    const input = document.getElementById('projectName');
    const name = input.value.trim();
    if(!name) return;
    const projects = loadProjects();
    if(!projects.includes(name)){
      projects.push(name);
      saveProjects(projects);
    }
    input.value = '';
    render();
  });
  render();
})();
