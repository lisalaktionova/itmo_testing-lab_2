(function () {
  const STORAGE_KEY = 'todo_lab_tasks'; // имя, под которым задачи хранятся в localStorage
  let tasks = []; // массив с задачами
  let sortAscending = true; // направление сортировки
  let currentFilter = 'all'; // фильтр (все / выполненные / невыполненные)
  let currentSearch = ''; // текущий текст в поле поиска
  let dragSrcId = null; // id задачи, которую перетаскивают

  function saveTasks() { // сохраняет список задач как строку JSON в браузере
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() { // загружает задачи при старте, чтобы они не пропали после перезагрузки
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  function formatDate(iso) { // преобразует дату из формата ISO в обычный вид
    if (!iso) return 'Без даты';
    const d = new Date(iso);
    return d.toLocaleDateString();
  }

  function clearChildren(node) { // очищает элемент списка после удаления задачи
    node.replaceChildren();
  }

  // основной контейнер
  const app = document.createElement('main');
  app.className = 'container';

  const header = document.createElement('header');
  header.className = 'header';

  const title = document.createElement('h1');
  title.className = 'title';
  title.textContent = 'To-Do List';
  header.appendChild(title);

  const controls = document.createElement('div');
  controls.className = 'controls';

  const search = document.createElement('input');
  search.className = 'search-input';
  search.placeholder = 'Поиск по названию...';
  search.addEventListener('input', () => {
    currentSearch = search.value.toLowerCase();
    renderTasks();
  });

  // фильтр задач
  const filter = document.createElement('select');
  filter.className = 'select';
  [['all', 'Все'], ['active', 'Невыполненные'], ['done', 'Выполненные']].forEach(([val, text]) => {
    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = text;
    filter.appendChild(opt);
  });
  filter.addEventListener('change', () => {
    currentFilter = filter.value;
    renderTasks();
  });

  // сортировка по дате
  const sortBtn = document.createElement('button');
  sortBtn.className = 'btn secondary';
  sortBtn.textContent = 'Сортировать по дате ↑';
  sortBtn.addEventListener('click', () => {
    sortAscending = !sortAscending;
    sortBtn.textContent = sortAscending ? 'Сортировать по дате ↑' : 'Сортировать по дате ↓';
    renderTasks();
  });

  controls.appendChild(search);
  controls.appendChild(filter);
  controls.appendChild(sortBtn);
  header.appendChild(controls);
  app.appendChild(header);

  const formCard = document.createElement('section');
  formCard.className = 'card';

   // добавление задач
  const form = document.createElement('form');
  form.className = 'form-row';
  form.addEventListener('submit',(e) => {
    e.preventDefault();
    addTask();
  });

  const titleInput = document.createElement('input');
  titleInput.className = 'input';
  titleInput.placeholder = 'Название задачи';
  titleInput.required = true;

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'date-input';

  const addBtn = document.createElement('button'); //кнопка «Добавить»
  addBtn.type = 'submit';
  addBtn.className = 'btn';
  addBtn.textContent = 'Добавить';

  form.appendChild(titleInput);
  form.appendChild(dateInput);
  form.appendChild(addBtn);
  formCard.appendChild(form);
  app.appendChild(formCard);

  const listCard = document.createElement('section');
  listCard.className = 'card';

  // список задач
  const list = document.createElement('ul');
  list.className = 'tasks-list';
  list.addEventListener('dragover',(e) => e.preventDefault());
  list.addEventListener('drop',(e) => {
    const targetLi = e.target.closest('li');
    if (!targetLi) return;
    const targetId = targetLi.dataset.id;
    if (!dragSrcId || !targetId || dragSrcId === targetId) return;

    const srcIndex = tasks.findIndex((t) => String(t.id) === dragSrcId);
    const targetIndex = tasks.findIndex((t) => String(t.id) === targetId);
    if (srcIndex === -1 || targetIndex === -1) return;

    const [moved] = tasks.splice(srcIndex, 1);
    tasks.splice(targetIndex, 0, moved);
    saveTasks();
    renderTasks();
  });

  listCard.appendChild(list);
  app.appendChild(listCard);

  const info = document.createElement('p');
  info.textContent = 'Все задачи сохраняются в localStorage вашего браузера.';
  app.appendChild(info);

  document.body.appendChild(app);

  function addTask() { // добавление задачи
    const title = titleInput.value.trim();
    if (!title) return;
    const date = dateInput.value ? new Date(dateInput.value).toISOString() : null;
    const newTask = { id: Date.now(), title, date, done: false };
    tasks.unshift(newTask);
    saveTasks();
    titleInput.value = '';
    dateInput.value = '';
    renderTasks();
  }

  function removeTask(id) { // удаление задачи
    tasks = tasks.filter((t) => String(t.id) !== String(id));
    saveTasks();
    renderTasks();
  }

  function toggleDone(id) { // отметка выполнения задачи
    const task = tasks.find((t) => String(t.id) === String(id));
    if (task) {
      task.done = !task.done;
      saveTasks();
      renderTasks();
    }
  }

  function startEdit(id, li) { // редактирование задачи
    const task = tasks.find((t) => String(t.id) === String(id));
    if (!task) return;

    const inputTitle = document.createElement('input');
    inputTitle.className = 'input';
    inputTitle.value = task.title;

    const inputDate = document.createElement('input');
    inputDate.type = 'date';
    inputDate.className = 'date-input';
    if (task.date) inputDate.value = new Date(task.date).toISOString().slice(0, 10);

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn';
    saveBtn.textContent = 'Сохранить';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn secondary';
    cancelBtn.textContent = 'Отмена';

    const editBox = document.createElement('div');
    editBox.style.display = 'flex';
    editBox.style.gap = '8px';
    editBox.appendChild(inputTitle);
    editBox.appendChild(inputDate);
    editBox.appendChild(saveBtn);
    editBox.appendChild(cancelBtn);

    const content = li.querySelector('.task-title');
    content.replaceChildren(editBox);

    saveBtn.addEventListener('click', () => {
      const newTitle = inputTitle.value.trim();
      const newDate = inputDate.value ? new Date(inputDate.value).toISOString() : null;
      if (!newTitle) return alert('Название не может быть пустым');
      task.title = newTitle;
      task.date = newDate;
      saveTasks();
      renderTasks();
    });

    cancelBtn.addEventListener('click', renderTasks);
  }

  function renderTasks() { // отображение задач
    clearChildren(list);

    let filtered = tasks.slice();
    // фильтрация задач
    if (currentFilter === 'done') filtered = filtered.filter((t) => t.done);
    if (currentFilter === 'active') filtered = filtered.filter((t) => !t.done);
    if (currentSearch) filtered = filtered.filter((t) => t.title.toLowerCase().includes(currentSearch));
    // сортировка по дате 
    filtered.sort((a, b) => {
      const ad = a.date ? new Date(a.date).getTime() : 0;
      const bd = b.date ? new Date(b.date).getTime() : 0;
      return sortAscending ? ad - bd : bd - ad;
    });

    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-item';
      empty.textContent = 'Задачи не найдены.';
      list.appendChild(empty);
      return;
    }
    // создание DOM-элементы для каждой задачи
    filtered.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.draggable = true;
      li.dataset.id = String(task.id);

      li.addEventListener('dragstart', () => (dragSrcId = String(task.id)));
      li.addEventListener('dragend', () => (dragSrcId = null));

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => toggleDone(task.id));

      const titleBox = document.createElement('div');
      titleBox.className = 'task-title';

      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = task.title;
      if (task.done) name.classList.add('task-done');

      const meta = document.createElement('span');
      meta.className = 'task-meta';
      meta.textContent = formatDate(task.date);

      titleBox.appendChild(name);
      titleBox.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'task-actions';

      const editBtn = document.createElement('button');
      editBtn.className = 'icon-btn';
      editBtn.textContent = '✏️';
      editBtn.addEventListener('click', () => startEdit(task.id, li));

      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn';
      delBtn.textContent = '🗑️';
      delBtn.addEventListener('click', () => {
        if (confirm(`Удалить задачу «${task.title}»?`)) removeTask(task.id);
      });

      actions.appendChild(editBtn);
      actions.appendChild(delBtn);

      li.appendChild(checkbox);
      li.appendChild(titleBox);
      li.appendChild(actions);

      list.appendChild(li);
    });
  }

  tasks = loadTasks();
  renderTasks();
})();
