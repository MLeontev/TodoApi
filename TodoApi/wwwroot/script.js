//region Категории
const categoryList = document.getElementById('categories');

const addCategoryForm = document.getElementById('add-category-form');
const addCategoryInput = document.getElementById('new-category-name');
const errorMessageAddCategory = document.getElementById('error-message-add-category');

const filterCategorySelect = document.getElementById('filter-category');
const filterStatusSelect = document.getElementById('filter-status');

window.addEventListener('DOMContentLoaded', async () => {
    await getData();
});

async function getData() {
    await getCategories();
    await getTodos();
}

async function getCategoriesData() {
    try {
        const response = await fetch('api/Categories');
        return await response.json();
    } catch (error) {
        console.error("Ошибка получения категорий:", error);
        return [];
    }
}

async function getCategories() {
    const categories =  await getCategoriesData();
    displayCategories(categories);
    fillCategorySelect(categories, categorySelect);
    fillFilterCategorySelect(categories, filterCategorySelect);
}

function displayCategories(categories) {
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = createCategoryElement(category);
        categoryList.appendChild(categoryElement);
    });
}

function createCategoryElement(category) {
    const categoryElement = document.createElement('div');
    categoryElement.classList.add('category');

    categoryElement.innerHTML = `
        <div class="category-content">
            <label class="category-name">${category.name}</label>
            <div>
                <button class="button edit-button">Редактировать</button>
                <button class="button delete-button">Удалить</button>
            </div>
        </div>
        <form class="edit-category-form">
            <div class="edit-form-content">
                <input class="edit-category-name" placeholder="Новое название" type="text" value="${category.name}">
                <div>
                    <button type="submit" class="button submit-button">Сохранить</button>
                    <button type="button" class="button cancel-button">Отмена</button>
                </div>
            </div>
            <div class="error-message"></div>
        </form>
    `;

    const editCategoryForm = categoryElement.querySelector('.edit-category-form');

    categoryElement.querySelector('.edit-button').addEventListener('click', function () {
        editCategoryForm.style.display = 'block';
        editCategoryForm.querySelector('.edit-category-name').value = category.name;
    });

    categoryElement.querySelector('.delete-button').addEventListener('click', () => deleteCategory(category.id));
    categoryElement.querySelector('.cancel-button').addEventListener('click', () => editCategoryForm.style.display = 'none');

    editCategoryForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        await editCategory(category.id, editCategoryForm.querySelector('.edit-category-name').value, editCategoryForm.querySelector('.error-message'));
    });

    return categoryElement;
}

addCategoryForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const categoryName = addCategoryInput.value.trim();

    errorMessageAddCategory.textContent = '';

    if (!categoryName) {
        errorMessageAddCategory.textContent = 'Введите название категории';
        return;
    }

    try {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: categoryName,
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        addCategoryInput.value = '';
        await getData();
    } catch (error) {
        errorMessageAddCategory.textContent = 'Ошибка: ' + error.message;
    }
});

async function editCategory(categoryId, updatedName, errorMessageElement) {
    errorMessageElement.textContent = '';

    if (!updatedName) {
        errorMessageElement.textContent = 'Введите название категории';
        return;
    }

    try {
        const response = await fetch(`/api/Categories/${categoryId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: updatedName})
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        await getData();
    } catch (error) {
        errorMessageElement.textContent = 'Ошибка: ' + error.message;
    }
}

async function deleteCategory(categoryId) {
    try {
        const response = await fetch(`/api/Categories/${categoryId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        await getData();
    } catch (error) {
        console.error('Ошибка удаления: ', error);
    }
}
//endregion

//region Задачи
const todosList = document.getElementById('todos')

const addTodoForm = document.getElementById('add-todo-form');
const addTodoInput = document.getElementById('new-todo-name');
const errorMessageAddTodo = document.getElementById('error-message-add-todo');
const categorySelect = document.getElementById('select-category');

async function getTodosData() {
    const response = await fetch('api/TodoItems');
    const todos = await response.json();
    return todos;
}

async function getTodos() {
    const todos = await getTodosData();
    displayTodos(todos);
}

function displayTodos(todos) {
    todosList.innerHTML = '';
    todos.forEach(todo => {
        console.log(todo);
        const todoElement = createTodoElement(todo)
        todosList.appendChild(todoElement);
    });
}

function fillCategorySelect(categories, selectElement, selectedCategoryId = null) {
    selectElement.innerHTML = '<option value="" disabled selected>Выберите категорию</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        if (category.id === selectedCategoryId) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

function fillFilterCategorySelect(categories, selectElement) {
    selectElement.innerHTML = `<option value="" disabled selected>Фильтр по категории</option>
                               <option value="all">Все категории</option>`;
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        selectElement.appendChild(option);
    });
}

function createTodoElement(todo) {
    const todoElement = document.createElement('div');
    todoElement.classList.add('todo');
    todoElement.innerHTML = `
        <div class="todo-content">
            <div class="todo-checkbox-input">
                <input type="checkbox" class="todo-checkbox" ${todo.isComplete ? 'checked' : ''}>
                <label class="todo-text">${todo.name}</label>
            </div>
            
            <div class="todo-category-buttons">
                <label class="todo-category-name">${todo.categoryName}</label>
                <button class="button edit-button">Редактировать</button>
                <button class="button delete-button" onclick="deleteTodo(${todo.id})">Удалить</button>
            </div>
        </div>
        <form class="edit-todo-form">
            <div class="edit-todo-content">
                <div>
                    <select id="select-edit-category-${todo.id}" class="select-category select-edit-category">
                        <option value="" disabled selected>Выберите категорию</option>
                    </select>
                    <input id="input-edit-category-${todo.id}" class="edit-todo-name" placeholder="Новый текст" type="text" value="${todo.name}">
                </div>
                <div>
                    <button type="submit" class="button submit-button">Сохранить</button>
                    <button type="button" class="button cancel-button">Отмена</button>
                </div>
            </div>
            <div class="error-message"></div>
        </form>
    `;

    const editButton = todoElement.querySelector('.edit-button');
    const cancelButton = todoElement.querySelector('.cancel-button');
    const editForm = todoElement.querySelector('.edit-todo-form');

    todoElement.querySelector('.todo-checkbox').addEventListener('change', async (event) => {
        const isComplete = event.target.checked;
        await editTodo(todo.id,
            todo.name,
            todo.categoryId,
            isComplete,
            todoElement.querySelector('.error-message')
        );
    });
    
    editButton.addEventListener('click', async () => {
        const selectCategoryElement = document.getElementById(`select-edit-category-${todo.id}`);
        editForm.style.display = 'block';
        const categories = await getCategoriesData();
        fillCategorySelect(categories, selectCategoryElement, todo.categoryId);
        editForm.querySelector('.edit-todo-name').value = todo.name;
    });

    cancelButton.addEventListener('click', () => {
        editForm.style.display = 'none';
    });
    
    editForm.addEventListener('submit', async function (event) {
       event.preventDefault();
       await editTodo(todo.id,
           document.getElementById(`input-edit-category-${todo.id}`).value,
           document.getElementById(`select-edit-category-${todo.id}`).value,
           todo.isComplete,
           todoElement.querySelector('.error-message'));
    });
    
    return todoElement;
}

async function editTodo(todoId, updatedText, categoryId, isComplete, errorMessageElement) {
    errorMessageElement.textContent = '';
    
    if (!updatedText) {
        errorMessageElement.textContent = 'Введите текст задачи';
        return;
    }

    const response = await fetch(`/api/TodoItems/${todoId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: updatedText,
            isComplete: isComplete,
            categoryId: categoryId
        })
    });

    if (!response.ok) {
        const error = await response.json();
        errorMessageElement.textContent = 'Не удалось изменить задачу';
        console.error(error.message);
    }

    await getData();
}

async function deleteTodo(todoId) {
    const response = await fetch(`api/TodoItems/${todoId}`, {
        method: 'DELETE'
    });
    await getData();
}

addTodoForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    
    errorMessageAddTodo.textContent = '';
    
    const todoText = addTodoInput.value.trim();
    const categoryId = categorySelect.value;
    
    if (!todoText || !categoryId) {
        errorMessageAddTodo.textContent = 'Заполните все поля';
        return;
    }
    
    const response = await fetch('api/TodoItems', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify ({
            name: todoText,
            categoryId: categoryId
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        console.error(error.message)
        errorMessageAddTodo.textContent = 'Не удалось добавить задачу';
    }
    
    await getTodos();

    addTodoInput.value = '';
    categorySelect.selectedIndex = 0;
});
//endregion

//region Фильтры

filterCategorySelect.addEventListener('change', updateTodos);
filterStatusSelect.addEventListener('change', updateTodos);

async function filterTodosList(todos, selectedCategoryId, selectedStatus) {
    let filteredTodos = todos;

    if (selectedCategoryId && selectedCategoryId !== 'all') {
        filteredTodos = filteredTodos.filter(todo => todo.categoryId == selectedCategoryId);
    }

    if (selectedStatus === 'complete') {
        filteredTodos = filteredTodos.filter(todo => todo.isComplete);
    } else if (selectedStatus === 'incomplete') {
        filteredTodos = filteredTodos.filter(todo => !todo.isComplete);
    }
    
    return filteredTodos;
}

async function updateTodos() {
    const todos = await getTodosData();

    const selectedCategoryId = filterCategorySelect.value;
    const selectedStatus = filterStatusSelect.value;

    const filteredTodos = await filterTodosList(todos, selectedCategoryId, selectedStatus);
    displayTodos(filteredTodos);
}

//endregion