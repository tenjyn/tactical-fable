// dashboard.js (hardened)
(function(){
  'use strict';

  function loadProjects(){
    try {
      const raw = localStorage.getItem('projects');
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed.filter(x => typeof x === 'string') : [];
    } catch(e){
      console.warn('Failed to parse projects from storage:', e);
      return [];
    }
  }

  function saveProjects(list){
    try {
      localStorage.setItem('projects', JSON.stringify(list));
      return true;
    } catch(e){
      console.error('Failed to save projects:', e);
      return false;
    }
  }

  function render(){
    const listEl = document.getElementById('projectList');
    if(!listEl) return;
    listEl.innerHTML = '';

    const projects = loadProjects();
    if(projects.length === 0){
      const li = document.createElement('li');
      li.textContent = 'No projects yet. Create one above.';
      li.style.opacity = '0.7';
      listEl.appendChild(li);
      return;
    }

    projects.forEach(name => {
      const li = document.createElement('li');

      const span = document.createElement('span');
      span.textContent = name;

      const controls = document.createElement('div');

      const open = document.createElement('a');
      open.href = `index.html?project=${encodeURIComponent(name)}`;
      open.textContent = 'Open';
      open.style.marginRight = '8px';

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style.marginLeft = '0';
      del.addEventListener('click', () => {
        const updated = loadProjects().filter(p => p !== name);
        if (saveProjects(updated)) render();
      });

      controls.appendChild(open);
      controls.appendChild(del);

      li.appendChild(span);
      li.appendChild(controls);
      listEl.appendChild(li);
    });
  }

  function init(){
    const input = document.getElementById('projectName');
    const btn = document.getElementById('createProject');
    if(!input || !btn){
      console.error('Missing #projectName or #createProject in dashboard.html');
      return;
    }

    function addProject(){
      const name = (input.value || '').trim();
      if(!name) return;
      const projects = loadProjects();

      // Case-insensitive de-dupe
      const exists = projects.some(p => p.toLowerCase() === name.toLowerCase());
      if(!exists){
        projects.push(name);
        if(!saveProjects(projects)){
          alert('Unable to save project (storage disabled?).');
        }
      }
      input.value = '';
      render();
    }

    btn.addEventListener('click', addProject);
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') addProject();
    });

    render();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
