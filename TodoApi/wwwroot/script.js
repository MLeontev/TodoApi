const addCategoryForm = document.getElementById('add-category-form');
const addCategoryInput = document.getElementById('new-category-name')
const errorMessageAddCategory = document.getElementById('error-message-add-category')

addCategoryForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    
    const categoryName = addCategoryInput.value.trim();

    errorMessageAddCategory.textContent = '';

    if (!categoryName) {
        errorMessageAddCategory.textContent = 'Название категории не может быть пустым';
        return;
    }

    await fetch('/api/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: categoryName,
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
            addCategoryInput.value = '';
            getCategories();
        })
        .catch(error => {
            errorMessageAddCategory.textContent = 'Ошибка: ' + error.message;
        });
});

window.addEventListener('DOMContentLoaded', async () => {
    await getCategories();
});

async function getCategories() {
    const categories = await fetch('api/Categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении категорий: ' + response.statusText);
            }
            return response.json();
        })
        .then(categories => {
            console.log(categories);
            displayCategories(categories);
        })
        .catch(error => {
            console.error('Ошибка при получении категорий: ', error);
        });
    
    console.log(categories)
    
    displayCategories(categories);
}

function displayCategories(categories) {
    const categoryList = document.getElementById('categories');
    
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.classList.add('category');

        const categoryTitle = document.createElement('label');
        categoryTitle.textContent = category.name;

        categoryElement.appendChild(categoryTitle);
        categoryList.appendChild(categoryElement);
    });
}



