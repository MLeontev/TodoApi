document.addEventListener('DOMContentLoaded', function () {
    const categoriesList = document.getElementById('categories-list');
    
    const addForm = document.getElementById('category-form');
    const categoryInput = document.getElementById('category-name');

    const editForm = document.getElementById('edit-category-form');
    const editCategoryIdInput = document.getElementById('edit-category-id');
    const editCategoryNameInput = document.getElementById('edit-category-name');
    const cancelEditButton = document.getElementById('cancel-edit');
    
    const errorMessage = document.getElementById('error-message');

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
                });
            });
    }
    
    loadCategories();

    function deleteCategory(id) {
        if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
            fetch(`/api/categories/${id}`, {
                method: 'DELETE'
            })
                .then(() => loadCategories());
        }
    }

    addForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const categoryName = categoryInput.value.trim();
        errorMessage.textContent = '';

        if (!categoryName) {
            errorMessage.textContent = 'Название категории не может быть пустым.';
            return;
        }
        
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
                errorMessage.textContent = 'Ошибка: ' + error.message;
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
        errorMessage.textContent = '';

        if (!updatedName) {
            errorMessage.textContent = 'Название категории не может быть пустым.';
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
                errorMessage.textContent = 'Ошибка ' + error.message;
            });
    });
    
    cancelEditButton.addEventListener('click', function () {
        hideEditForm();
    });
});