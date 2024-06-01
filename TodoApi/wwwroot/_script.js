document.addEventListener('DOMContentLoaded', function () {
    const categoriesList = document.getElementById('categories-list');
    const todosList = document.getElementById('todos-list');

    const addCategoryForm = document.getElementById('category-form');
    const categoryInput = document.getElementById('category-name');

    const addTodoForm = document.getElementById('todo-form');
    const todoNameInput = document.getElementById('todo-name');
    const todoCategorySelect = document.getElementById('todo-category-select')

    const editForm = document.getElementById('edit-category-form');
    const editCategoryIdInput = document.getElementById('edit-category-id');
    const editCategoryNameInput = document.getElementById('edit-category-name');
    const cancelEditButton = document.getElementById('cancel-edit');

    const errorMessageCategory = document.getElementById('error-message-category');
    const errorMessageTodo = document.getElementById('error-message-todo');

    function loadCategories() {
        fetch('/api/categories')
            .then(response => response.json())
            .then(categories => {
                categoriesList.innerHTML = '';
                categories.forEach(category => {
                    const li = document.createElement('li');

                    li.textContent = category.name;

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Удалить';
                    deleteButton.style.marginLeft = '10px';
                    deleteButton.addEventListener('click', function () {
                        deleteCategory(category.id);
                    });

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Редактировать';
                    editButton.style.marginLeft = '10px';
                    editButton.addEventListener('click', function () {
                        showEditForm(category.id, category.name);
                    });

                    li.appendChild(deleteButton);
                    li.appendChild(editButton);

                    categoriesList.appendChild(li);

                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    todoCategorySelect.appendChild(option);
                });
            });
    }

    function loadTodos() {
        fetch('api/TodoItems')
            .then(response => response.json())
            .then(todos => {
                todosList.innerHTML = '';
                todos.forEach(todo => {
                    const tr = document.createElement('tr');

                    const nameTd = document.createElement('td');
                    nameTd.textContent = todo.name;

                    const categoryTd = document.createElement('td');
                    categoryTd.textContent = todo.category.name;

                    const completeTd = document.createElement('td');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = todo.isComplete;
                    completeTd.appendChild(checkbox);

                    const actionsTd = document.createElement('td');

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Удалить';
                    deleteButton.addEventListener('click', function () {
                        deleteTodo(todo.id);
                    });
                    actionsTd.appendChild(deleteButton);

                    const editButton = document.createElement('button');
                    editButton.textContent = 'Редактировать';
                    editButton.addEventListener('click', function () {
                    });
                    actionsTd.appendChild(editButton);

                    tr.appendChild(nameTd);
                    tr.appendChild(categoryTd);
                    tr.appendChild(completeTd);
                    tr.appendChild(actionsTd);

                    todosList.appendChild(tr);
                });
            });
    }

    loadCategories();
    loadTodos();

    function deleteCategory(id) {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            fetch(`/api/categories/${id}`, {
                method: 'DELETE'
            })
                .then(() => loadCategories());
        }
    }

    function deleteTodo(id) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            fetch(`/api/TodoItems/${id}`, {
                method: 'DELETE'
            })
                .then(() => loadTodos());
        }
    }

    addCategoryForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const categoryName = categoryInput.value.trim();
        errorMessageCategory.textContent = '';

        if (!categoryName) {
            errorMessageCategory.textContent = 'Название категории не может быть пустым.';
            return;
        }

        console.log('Отправляемые данные о категории:', JSON.stringify({
            name: categoryName,
            todoItems: []
        }));
        
        fetch('/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: categoryName,
                todoItems: []
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.message);
                    });
                }
                return response.json();
            })
            .then(() => {
                categoryInput.value = '';
                loadCategories();
            })
            .catch(error => {
                errorMessageCategory.textContent = 'Ошибка: ' + error.message;
            });
    });

    addTodoForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const todoName = todoNameInput.value.trim();
        const todoCategoryId = todoCategorySelect.value;
        errorMessageTodo.textContent = '';

        if (!todoName || !todoCategoryId) {
            errorMessageTodo.textContent = 'Все поля должны быть заполнены.';
            return;
        }

        fetch(`api/Categories/${todoCategoryId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при загрузке данных о категории');
                }
                return response.json();
            })
            .then(categoryData => {
                console.log('Полученные данные о категории:', categoryData); // Отладка

                const todoItem = {
                    name: todoName,
                    isComplete: false,
                    categoryId: todoCategoryId,
                    category: categoryData
                };

                console.log('Отправляемые данные о задаче:', todoItem); // Отладка

                fetch('api/TodoItems', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(todoItem)
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(error => {
                                throw new Error(error.message);
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Ответ от сервера после создания задачи:', data); // Отладка

                        todoNameInput.value = '';
                        todoCategorySelect.value = '';
                        loadTodos();
                    })
                    .catch(error => {
                        console.error('Ошибка при отправке задачи:', error); // Отладка
                        errorMessageTodo.textContent = 'Ошибка: ' + error.message;
                    });

            })
            .catch(error => {
                console.error('Ошибка при загрузке данных о категории:', error); // Отладка
                errorMessageTodo.textContent = 'Ошибка: ' + error.message;
            });
    });


    function showEditForm(id, currentName) {
        editCategoryIdInput.value = id;
        editCategoryNameInput.value = currentName;
        editForm.style.display = 'block'
    }

    function hideEditForm() {
        editForm.style.display = 'none';
        editCategoryIdInput.value = '';
        editCategoryNameInput.value = '';
    }

    editForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const id = editCategoryIdInput.value;
        const updatedName = editCategoryNameInput.value.trim();
        errorMessageCategory.textContent = '';

        if (!updatedName) {
            errorMessageCategory.textContent = 'Название категории не может быть пустым.';
            return;
        }

        fetch(`/api/Categories/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: id,
                name: updatedName,
                todoItems: []
            })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.message);
                    });
                }
                return {};
            })
            .then(() => {
                hideEditForm();
                loadCategories();
            })
            .catch(error => {
                errorMessageCategory.textContent = 'Ошибка ' + error.message;
            });
    });

    cancelEditButton.addEventListener('click', function () {
        hideEditForm();
    });
});