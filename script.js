const baseURL = 'https://api.github.com/';

// Url: repos/tryber/sd-013-b-project-zoo-functions/issues/131/comments

function saveLocalStorage(...content) {
  if (!localStorage.components) localStorage.components = JSON.stringify([content]);
  else {
    const savedComponents = JSON.parse(localStorage.getItem('components'));
    savedComponents.push(content);
    localStorage.components = JSON.stringify(savedComponents);
  }
}

function removeLocalStorage(target) {
  const userName = (target.parentElement.firstChild).innerText;
  const savedComponents = JSON.parse(localStorage.getItem('components'));
  const updatedComponent = [];
  savedComponents.forEach((component) => {
    if (component[2] === userName); // remove o array inteiro!
    else updatedComponent.push(component);
  });
  localStorage.components = JSON.stringify(updatedComponent);
}

function createTd(content) {
  const td = document.createElement('td');
  if (content === 'Suficiente' || content === 'Insuficiente') {
    content === 'Suficiente' ? td.innerHTML = '<i class="fas fa-check"></i>': td.innerHTML = '<i class="fas fa-times"></i>';
    return td;
  }
  td.innerText = content;
  return td;
}

function createTable([ username, repo, evaluator, performance, percentage ]) {
  const table = document.getElementById('table-information');
  const tr = document.createElement('tr');
  tr.appendChild(createTd(username));
  tr.appendChild(createTd(repo));
  tr.appendChild(createTd(evaluator));
  tr.appendChild(createTd(performance));
  tr.appendChild(createTd(percentage));
  tr.addEventListener('click', ({ target }) => {
    target.parentElement.remove(); // remove improvisado!
    removeLocalStorage(target);
  }); 
  table.appendChild(tr);
}

async function getContent(comment, repo, owner, pullRequest) {
  const evaluator = comment.match(/(?<=avaliação \| ).*/i)[0];
  const performance = comment.match(/(?<=desempenho \| ).*/i)[0];
  const percentage = comment.match(/(?<=totais \| ).*/i)[0];

  const response = await fetch(`${baseURL}repos/${owner}/${repo}/issues/${pullRequest}`);
  const data = await response.json();
  const username = data.user.login;

  return [username, repo, evaluator, performance, percentage];
}

async function getPull(owner, repo, pullRequest) {
  const response = await fetch(`${baseURL}repos/${owner}/${repo}/issues/${pullRequest}/comments?per_page=100`);
  const data = await response.json();
  const lastComment = data[data.length - 1].body;

  const content = await getContent(lastComment, repo, owner, pullRequest);
  const [ userName ] = content;
  createTable(content);
  saveLocalStorage(repo, pullRequest, userName);
}

function listenerClick() {
  const input = document.getElementById('link-add');
  const regexRepo = /(?<=tryber\/).*(?=\/pull)/;
  const regexPull = /(?<=pull\/)\d+/;

  if (!input.value || input.value.length === 0) alert('[Error] Put unavailable link!');
  
  try {
    const repository = input.value.match(regexRepo)[0];
    const pull = input.value.match(regexPull)[0];

    getPull('tryber', repository, pull);
    input.value = '';
  } catch {
    alert('[Error] Repository or PullRequest not found!');
  }
}

function init() {
  const addButton = document.getElementById('button-add');
  addButton.addEventListener('click', listenerClick);
}

function loadComponents() {
  if (localStorage.components) {
    const savedComponents = JSON.parse(localStorage.getItem('components'));
    savedComponents.forEach(async ([ repo, pullRequest ]) => {
      const response = await fetch(`${baseURL}repos/tryber/${repo}/issues/${pullRequest}/comments?per_page=100`);
      const data = await response.json();
      const lastComment = data[data.length - 1].body;

      const content = await getContent(lastComment, repo, 'tryber', pullRequest);
      createTable(content);
    });
  }
}

window.onload = () => {
  init();
  loadComponents();
};