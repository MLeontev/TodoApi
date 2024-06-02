const categoryList = document.getElementById('categories');

const addCategoryForm = document.getElementById('add-category-form');
const addCategoryInput = document.getElementById('new-category-name');
const errorMessageAddCategory = document.getElementById('error-message-add-category');

window.addEventListener('DOMContentLoaded', async () => {
    await getCategories();
});

async function getCategories() {
    try {
        await fetch('api/Categories')
            .then(response => response.json())
            .then(categories => displayCategories(categories));
    } catch (error) {
        console.error("Ошибка получения категорий:", error);
    }
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
                <button class="button edit-category">Редактировать</button>
                <button class="button delete-category">Удалить</button>
            </div>
        </div>
        <form class="edit-category-form">
            <div class="edit-form-content">
                <input class="edit-category-name" placeholder="Новое название" type="text" value="${category.name}">
                <div>
                    <button type="submit" class="button submit-edit-category">Сохранить</button>
                    <button type="button" class="button cancel-edit-category">Отмена</button>
                </div>
            </div>
            <div class="error-message"></div>
        </form>
    `;

    const editCategoryForm = categoryElement.querySelector('.edit-category-form');

    categoryElement.querySelector('.edit-category').addEventListener('click', function () {
        editCategoryForm.style.display = 'block';
        editCategoryForm.querySelector('.edit-category-name').value = category.name;
    });

    categoryElement.querySelector('.delete-category').addEventListener('click', () => deleteCategory(category.id));
    categoryElement.querySelector('.cancel-edit-category').addEventListener('click', () => editCategoryForm.style.display = 'none');

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
        await getCategories();
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

        await getCategories();
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

        await getCategories();
    } catch (error) {
        console.error('Ошибка удаления: ', error);
    }
}


