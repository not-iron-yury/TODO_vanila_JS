const todoFormElem = document.querySelector('.form');
const todoInputElem = document.querySelector('.formInput');
const todoListElem = document.querySelector('.list');
const donedTodosElem = document.querySelector('.donedTodos');
const completedTasksVisible = document.querySelector('.completedTasks');
const completedTasksCheckbox = document.querySelector('.completedTasks_checkbox');

// ------------------- LocalStorage ------------------- //
const setItemToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
const removeItemFromLocalStorage = key => {
  localStorage.removeItem(key);
};
const getItemFromLocalStorage = key => {
  return JSON.parse(localStorage.getItem(key));
};
// ------------------- /LocalStorage ------------------- //

const todos = {
  _count: getItemFromLocalStorage('TODO_counter') || 0,
  _items: getItemFromLocalStorage('TODO_list') || [],
  _isCompletedHidden: getItemFromLocalStorage('TODO_isCompletedHidden') || false,

  get count() {
    return this._count;
  },
  set count(newValue) {
    this._count = newValue;
    todosCountDonedOutput();
    this._isCompletedHidden && hideСompletedTasks(this._isCompletedHidden);
    setItemToLocalStorage('TODO_counter', this._count);
  },

  get items() {
    return this._items;
  },
  set items(newItems) {
    this._items = newItems;
    setItemToLocalStorage('TODO_list', this._items);
    renderTodoList(todos._items);
    this._isCompletedHidden && hideСompletedTasks(this._isCompletedHidden);
  },

  get isCompletedHidden() {
    return this._isCompletedHidden;
  },
  set isCompletedHidden(value) {
    this._isCompletedHidden = value;
    setItemToLocalStorage('TODO_isCompletedHidden', this._isCompletedHidden);
    hideСompletedTasks(this._isCompletedHidden);
  },
};

// todos.items (вывод на экран)
function renderTodoList(todos) {
  todoListElem.innerHTML = null; // обнуляем список, что бы пункты не повторялись

  todos.forEach(elem => {
    todoListElem.append(createTodoElem(elem.key, elem.value, elem.doned));
  });
}

// todo.count (вывод на экран)
const todosCountDonedOutput = () => {
  donedTodosElem.textContent = todos.count;
};

// инициализация списка todos после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  completedTasksCheckbox.checked = todos.isCompletedHidden;
  renderTodoList(todos.items);
  hideСompletedTasks(todos.isCompletedHidden);
  todosCountDonedOutput();
});

// create data-key
const createDataKey = () => {
  return Date.now();
};

// createTodoElem
function createTodoElem(key, value, doned = false) {
  const todoItem = document.createElement('li');
  todoItem.setAttribute('class', 'item');
  todoItem.setAttribute('data-key', key);
  doned && todoItem.setAttribute('data-doned', '');

  const todoItemText = document.createElement('p');
  todoItemText.addEventListener('click', doneTodo);
  todoItemText.setAttribute('class', doned ? 'todotext completed' : 'todotext');
  todoItemText.textContent = value;

  const todoButtons = document.createElement('div');
  todoButtons.setAttribute('class', 'todoButtons');

  const todoRemoveBtn = document.createElement('button');
  todoRemoveBtn.addEventListener('click', removeTodo);
  todoRemoveBtn.setAttribute('class', 'btn_remove');
  todoRemoveBtn.innerHTML = '&times';

  const todoEditBtn = document.createElement('button');
  todoEditBtn.addEventListener('click', editTodo);
  todoEditBtn.setAttribute('class', 'btn_edit');
  todoEditBtn.innerHTML = '&#10000';

  todoButtons.append(todoRemoveBtn);
  todoButtons.append(todoEditBtn);

  todoItem.append(todoItemText);
  todoItem.append(todoButtons);

  return todoItem;
}

// addTodo
todoFormElem.addEventListener('submit', e => {
  e.preventDefault();
  if (todoInputElem.value) {
    const newItem = {
      key: createDataKey(),
      value: todoInputElem.value,
      doned: false,
    };
    todos.items = [...todos.items, newItem];
    todoInputElem.value = null;
  }
});

// removeTodo
const removeTodo = e => {
  const target = e.target;
  const todoItem = target.closest('li');
  const key = Number(todoItem.dataset.key);

  todoItem.hasAttribute('data-doned') && todos.count--;
  todos.items = todos.items.filter(todo => key !== todo.key);
};

// doneTodo
const doneTodo = e => {
  const target = e.target;
  const todo = target.closest('li');
  const todoKey = Number(todo.dataset.key);

  if (todo.hasAttribute('data-doned')) {
    todo.removeAttribute('data-doned', '');
    todos.count--;
  } else {
    todo.setAttribute('data-doned', '');
    todos.count++;
  }

  target.classList.toggle('completed');

  updatedTodoStatus(todoKey);
};

function updatedTodoValue(key, newText) {
  todos.items = todos.items.map(todo => {
    return todo.key === key ? { ...todo, value: newText } : todo;
  });
}

function updatedTodoStatus(key) {
  const todoUpdate = todos.items.map(todo => {
    return todo.key === key ? { ...todo, doned: !todo.doned } : todo;
  });

  todos.items = todoUpdate.toSorted((a, b) => a.doned - b.doned);
}

// ==================================================== //
// редактирование уже созданных заданий

const editTodo = e => {
  const editBtn = e.target;
  const todo = editBtn.closest('li');
  const todoKey = Number(todo.dataset.key);
  const todoText = todo.querySelector('p');

  if (editBtn.hasAttribute('data-edit-active')) {
    updatedTodoValue(todoKey, todoText.textContent);
  } else {
    editBtn.classList.add('btn_green');
    editBtn.setAttribute('data-edit-active', '');

    todoText.removeEventListener('click', doneTodo);
    todoText.setAttribute('contentEditable', 'true');
    todoText.focus();

    document.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        updatedTodoValue(todoKey, todoText.textContent);
      }
    });
  }
};
// ==================================================== //
// скрытие выполненных заданий

// hideСompletedTasks
const hideСompletedTasks = checked => {
  const list = todoListElem.children;
  for (let i = 0; i < list.length; i++) {
    if (list[i].hasAttribute('data-doned')) {
      list[i].classList.toggle('hidden', checked);
    }
  }
};
completedTasksVisible.addEventListener('change', e => {
  todos.isCompletedHidden = e.target.checked;
});
