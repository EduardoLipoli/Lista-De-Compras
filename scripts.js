let lists = [];
let currentListId = null;
let itemToDeleteId = null;
let deleteType = null;
let selectedCategory = null;

const categoriesContainer = document.getElementById('categoriesContainer');
const itemsPicked = document.getElementById('itemsPicked');
const totalItems = document.getElementById('totalItems');
const itemsRemaining = document.getElementById('itemsRemaining');

const sidebar = document.querySelector('.sidebar');
const menuToggle = document.getElementById('menuToggle');
const mainContent = document.getElementById('mainContent');

// Funções de LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('lists', JSON.stringify(lists));
    localStorage.setItem('currentListId', JSON.stringify(currentListId));
}

function loadFromLocalStorage() {
    const storedLists = localStorage.getItem('lists');
    const storedCurrentListId = localStorage.getItem('currentListId');

    if (storedLists) {
        try {
            lists = JSON.parse(storedLists);
        } catch (e) {
            console.error('Erro ao carregar listas do LocalStorage:', e);
            lists = [];
        }
    }

    if (storedCurrentListId !== null) {
        try {
            currentListId = JSON.parse(storedCurrentListId);
        } catch (e) {
            console.error('Erro ao carregar currentListId do LocalStorage:', e);
            currentListId = null;
        }
    }

    if (lists.length === 0) {
        addList('Lista de Compras');
    
        // Adicionando as categorias
        addCategory('Higiene Pessoal');
        addCategory('Limpeza');
        addCategory('Mercearia');
        addCategory('Molhos');
        addCategory('Frutas');
        addCategory('Frios e Laticínios');
        addCategory('Temperos');
        addCategory('Utilidades');
    
        // Adicionando produtos nas categorias correspondentes
        // Higiene Pessoal
        addProduct('Shampoo/Condicionador', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Desodorante', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Cotonete', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Algodão', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Absorvente', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Fio dental', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Papel higiênico', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Sabonete', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Creme dental', 'Higiene Pessoal', 1, 'Unidade');
        addProduct('Esponja de banho', 'Higiene Pessoal', 1, 'Unidade');
    
        // Limpeza
        addProduct('Sabão em pó', 'Limpeza', 1, 'Unidade');
        addProduct('Amaciante', 'Limpeza', 1, 'Unidade');
        addProduct('Água sanitária', 'Limpeza', 1, 'Unidade');
        addProduct('Esponja de cozinha', 'Limpeza', 1, 'Unidade');
        addProduct('Esponja de banheiro', 'Limpeza', 1, 'Unidade');
        addProduct('Flanela', 'Limpeza', 1, 'Unidade');
        addProduct('Tira manchas', 'Limpeza', 1, 'Unidade');
        addProduct('Detergente', 'Limpeza', 1, 'Unidade');
        addProduct('Inseticida', 'Limpeza', 1, 'Unidade');
        addProduct('Desengordurante', 'Limpeza', 1, 'Unidade');
        addProduct('Multiuso', 'Limpeza', 1, 'Unidade');
        addProduct('Álcool', 'Limpeza', 1, 'Unidade');
        addProduct('Palha de aço', 'Limpeza', 1, 'Unidade');
        addProduct('Saco de lixo', 'Limpeza', 1, 'Unidade');
        addProduct('Pinho', 'Limpeza', 1, 'Unidade');
        addProduct('Desinfetante', 'Limpeza', 1, 'Unidade');
        addProduct('Pastilha de vaso', 'Limpeza', 1, 'Unidade');
        addProduct('Odorizante', 'Limpeza', 1, 'Unidade');
    
        // Mercearia
        addProduct('Feijão', 'Mercearia', 1, 'Unidade');
        addProduct('Arroz', 'Mercearia', 1, 'Unidade');
        addProduct('Macarrão espaguete', 'Mercearia', 1, 'Unidade');
        addProduct('Macarrão parafuso', 'Mercearia', 1, 'Unidade');
        addProduct('Óleo', 'Mercearia', 1, 'Unidade');
        addProduct('Óleo de soja', 'Mercearia', 1, 'Unidade');
        addProduct('Ovos', 'Mercearia', 1, 'Unidade');
        addProduct('Açúcar', 'Mercearia', 1, 'Unidade');
        addProduct('Café', 'Mercearia', 1, 'Unidade');
        addProduct('Leite condensado', 'Mercearia', 1, 'Unidade');
        addProduct('Creme de leite', 'Mercearia', 1, 'Unidade');
        addProduct('Chá', 'Mercearia', 1, 'Unidade');
        addProduct('Milho', 'Mercearia', 1, 'Unidade');
        addProduct('Cereal', 'Mercearia', 1, 'Unidade');
        addProduct('Biscoito', 'Mercearia', 1, 'Unidade');
        addProduct('Milho de pipoca', 'Mercearia', 1, 'Unidade');
        addProduct('Erva de tereré', 'Mercearia', 1, 'Unidade');
    
        // Molhos
        addProduct('Ketchup', 'Molhos', 1, 'Unidade');
        addProduct('Maionese', 'Molhos', 1, 'Unidade');
        addProduct('Molho de tomate', 'Molhos', 1, 'Unidade');
        addProduct('Extrato de tomate', 'Molhos', 1, 'Unidade');
        addProduct('Shoyo', 'Molhos', 1, 'Unidade');
    
        // Frios e Laticínios
        addProduct('Leite', 'Frios e Laticínios', 1, 'Unidade');
        addProduct('Margarina', 'Frios e Laticínios', 1, 'Unidade');
    
        // Temperos
        addProduct('Sal', 'Temperos', 1, 'Unidade');
        addProduct('Alho', 'Temperos', 1, 'Unidade');
        addProduct('Chimichurri', 'Temperos', 1, 'Unidade');
        addProduct('Salsa, alho e cebola', 'Temperos', 1, 'Unidade');
        addProduct('Paprica', 'Temperos', 1, 'Unidade');
        addProduct('Orégano', 'Temperos', 1, 'Unidade');
    
        // Utilidades
        addProduct('Papel toalha', 'Utilidades', 1, 'Unidade');
        addProduct('Papel laminado', 'Utilidades', 1, 'Unidade');
        addProduct('Palito de dente', 'Utilidades', 1, 'Unidade');
    }    
}

// Toggle Sidebar
function toggleSidebar() {
    sidebar.classList.toggle('active');

    if (sidebar.classList.contains('active')) {
        menuToggle.style.left = '265px';
    } else {
        menuToggle.style.left = '15px';
    }
}

// Toggle Sidebar
menuToggle.addEventListener('click', toggleSidebar);
document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickInsideToggleButton = menuToggle.contains(event.target);

    if (!isClickInsideSidebar && !isClickInsideToggleButton) {
        sidebar.classList.remove('active');
        menuToggle.style.left = '15px';
    }
});

// Função para adicionar uma nova lista
document.getElementById('addListFormInSidebar').addEventListener('submit', function (event) {
    event.preventDefault();
    const listName = document.getElementById('newListNameInSidebar').value.trim();

    if (listName === '') {
        alert('Por favor, insira o nome da lista.');
        return;
    }

    if (lists.some(list => list.name === listName)) {
        alert('Esta lista já existe.');
        return;
    }

    addList(listName);
    document.getElementById('addListFormInSidebar').reset();
    renderListsInSidebar();
});

// Função para adicionar uma nova lista
function addList(name) {
    const newList = {
        id: Date.now(),
        name,
        categories: [],
        productList: [],
    };
    lists.push(newList);
    currentListId = newList.id;
    saveToLocalStorage();
    initCategories();
    renderListsInSidebar();
    switchToList(newList.id);
}

// Função para adicionar uma nova categoria
function addCategory(name) {
    const currentList = getCurrentList();
    if (!currentList) return;

    currentList.categories.push(name);
    saveToLocalStorage();
}

// Adicionar Categoria no Modal de Adicionar Produto
document.getElementById('addCategoryFormInProductModal').addEventListener('submit', function (event) {
    event.preventDefault();
    const categoryInput = document.getElementById('newCategoryNameInProductModal').value.trim();

    if (categoryInput === '') {
        alert('Por favor, insira o nome da categoria.');
        return;
    }

    const currentList = getCurrentList();
    if (!currentList) return;

    if (currentList.categories.includes(categoryInput)) {
        alert('Esta categoria já existe.');
        return;
    }

    addCategory(categoryInput);
    document.getElementById('addCategoryFormInProductModal').reset();
    renderCategoriesInProductModal();
});

const addProductModalElement = document.getElementById('addProductModal');
addProductModalElement.addEventListener('show.bs.modal', () => {
    selectedCategory = null;
    renderCategoriesListInProductModal();
});

function openEditProductModal(productId) {
    const currentList = getCurrentList();
    if (!currentList) return;

    const product = currentList.productList.find(prod => prod.id === productId);
    if (!product) return;

    // Preencher os campos do modal com os dados do produto a ser editado
    document.getElementById('productName').value = product.name;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('unidade').value = product.quantityType;

    // Guardar o ID do produto para saber que estamos no modo de edição
    document.getElementById('addProductForm').dataset.editingProductId = productId;

    // Abrir o modal
    const addProductModal = new bootstrap.Modal(document.getElementById('addProductModal'));
    addProductModal.show();
}


// Função para adicionar um novo produto
document.getElementById('addProductForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const productName = document.getElementById('productName').value.trim();
    const productQuantity = document.getElementById('productQuantity').value;
    const quantityType = document.getElementById('unidade').value;

    if (productName === '') {
        alert('Por favor, insira o nome do produto.');
        return;
    }

    if (productQuantity <= 0) {
        alert('A quantidade deve ser pelo menos 1.');
        return;
    }

    if (!selectedCategory) {
        alert('Por favor, selecione uma categoria.');
        return;
    }

    const productId = document.getElementById('addProductForm').dataset.editingProductId;

    if (productId) {
        // Modo de edição: Atualizar o produto existente
        updateProduct(parseInt(productId), productName, selectedCategory, productQuantity, quantityType);
        delete document.getElementById('addProductForm').dataset.editingProductId;
    } else {
        // Modo de criação: Adicionar um novo produto
        addProduct(productName, selectedCategory, productQuantity, quantityType);
    }

    document.getElementById('addProductForm').reset();
    selectedCategory = null;
    const addProductModal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    addProductModal.hide();
});

function updateProduct(productId, name, category, quantity, quantityType) {
    const currentList = getCurrentList();
    if (!currentList) return;

    const product = currentList.productList.find(prod => prod.id === productId);
    if (product) {
        product.name = name;
        product.category = category;
        product.quantity = parseInt(quantity);
        product.quantityType = quantityType;
        saveToLocalStorage();
        updateSummary();
        renderCategories();
    }
}


// Função para obter a lista atual
function getCurrentList() {
    return lists.find(list => list.id === currentListId);
}

// Inicializar categorias
function initCategories() {
    renderCategories();
    updateSummary();
}

// Função para alternar para uma lista
function switchToList(id) {
    currentListId = id;
    const currentList = getCurrentList(); 

    if (currentList) {
        document.title = `Lista de Compras - ${currentList.name}`;
        document.querySelector('.header h1').textContent = currentList.name;
    }

    saveToLocalStorage();
    initCategories();

    toggleSidebar();

    const modalElement = document.getElementById('manageListsModal');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
        modalInstance.hide();
    }
}

// Atualizar os contadores no topo
function updateSummary() {
    const currentList = getCurrentList();
    if (!currentList) return;

    let total = 0;
    let completed = 0;
    let totalUnidades = 0;

    currentList.productList.forEach(product => {
        if (product.quantityType === 'kg' || product.quantityType === 'litros') {
            total += 1;
            totalUnidades += product.quantity;
            if (product.completed) {
                completed += 1;
            }
        } else {
            total += product.quantity;
            totalUnidades += product.quantity;
            if (product.completed) {
                completed += product.quantity;
            }
        }
    });

    const totalItem = total;
    const remaining = total - completed;

    totalItems.textContent = totalItem;
    itemsPicked.textContent = completed;
    itemsRemaining.textContent = remaining;
}

// Função Atualizar a quantidade do produto
function updateProductQuantity(id, newQuantity) {
    const currentList = getCurrentList();
    if (!currentList) return;

    const product = currentList.productList.find(prod => prod.id === id);
    if (product) {
        const quantity = parseInt(newQuantity);
        if (quantity > 0) {
            product.quantity = quantity;
            saveToLocalStorage();
            updateSummary();
            renderCategories();
        } else {
            alert('A quantidade deve ser pelo menos 1.');
            document.getElementById(`productQuantity-${id}`).value = product.quantity;
        }
    }
}

// Função Renderizar o produto
function renderProducts(category) {
    const currentList = getCurrentList();
    if (!currentList) return '';

    // Ordenar os produtos para que os 'completos' fiquem no final
    const sortedProducts = currentList.productList
        .filter(product => product.category === category)
        .sort((a, b) => a.completed - b.completed);

    return sortedProducts
        .map(product =>
            `<div class="category-item ${product.completed ? 'completed' : ''}" onclick="toggleProductStatus(${product.id}, event)">
                <div class="form-check me-2">
                    <input 
                        class="form-check-input custom-checkbox-input"
                        id="customCheckbox-${product.id}"
                        type="checkbox"
                        ${product.completed ? 'checked' : ''} 
                        style="display: none;"
                    />
                    <label for="customCheckbox-${product.id}" class="custom-checkbox"></label>
                </div>
                <div class="flex-grow-1">
                    <span class="product-name" style="font-weight: 700; text-transform: capitalize;">${product.name}</span>
                    <div style="font-size: 12px;">
                        <span class="quantity-type">${product.quantity}</span>
                        <span class="quantity-type">${product.quantityType}</span>
                    </div>
                </div>
                <div class="quantity-controls">
                    <button class="btn-decrement" onclick="changeQuantity(${product.id}, -1); event.stopPropagation();">-</button>
                    <input 
                        id="productQuantity-${product.id}" 
                        type="number"
                        value="${product.quantity}" 
                        onchange="updateProductQuantity(${product.id}, this.value)"
                        class="quantity-input"
                        min="1"
                        onclick="event.stopPropagation()"
                    >
                    <button class="btn-increment" onclick="changeQuantity(${product.id}, 1); event.stopPropagation();">+</button>
                </div>
                <div>
                    <button class="btn-edit" onclick="openEditProductModal(${product.id}); event.stopPropagation();">✎</button>
                    <button class="btn-delete" onclick="openDeleteModal(${product.id}, 'product', '${product.name}'); event.stopPropagation();">✖</button>
                </div>
            </div>`
        ).join('');
}

function changeQuantity(productId, increment) {
    const input = document.getElementById(`productQuantity-${productId}`);
    let quantity = parseInt(input.value, 10);
    quantity = Math.max(1, quantity + increment); // Evita quantidade menor que 1
    input.value = quantity;
    updateProductQuantity(productId, quantity); // Atualiza quantidade no sistema
}

// Função para sanitizar o nome da categoria
function sanitizeCategoryName(category) {
    return category
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/--+/g, '-')
        .toLowerCase();
}

// Função para renderizar categorias e produtos
function renderCategories() {
    const currentList = getCurrentList();
    if (!currentList) return;

    categoriesContainer.innerHTML = '';
    let hasProducts = false;

    currentList.categories.forEach(category => {
        const productsInCategory = currentList.productList.filter(product => product.category === category);
        if (productsInCategory.length > 0) {
            hasProducts = true;
            const categoryId = category.replace(/\s+/g, '-').toLowerCase() + '-' + currentList.id;
            let categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category', 'mb-4');
            categoryDiv.innerHTML = `
                <div class="category-title" data-bs-toggle="collapse" href="#${categoryId}" role="button" aria-expanded="false">
                    <h3>${category}</h3> <h4><i class="bi bi-chevron-down"></i></h4>
                </div>
                <div class="collapse show category-content" id="${categoryId}">
                    ${renderProducts(category)}
                </div>
            `;
            categoriesContainer.appendChild(categoryDiv);
        }
    });

    const emptyMessage = document.getElementById('empty-message');
    if (currentList.productList.length === 0) {
        emptyMessage.style.display = 'block';
        categoriesContainer.style.display = 'none';
    } else {
        emptyMessage.style.display = 'none';
        categoriesContainer.style.display = 'block';
    }
}

// Função para adicionar o produto na lista
function addProduct(name, category, quantity, quantityType) {
    const currentList = getCurrentList();
    if (!currentList) return;

    const newProduct = {
        id: Date.now(),
        name,
        category,
        quantity: parseInt(quantity),
        quantityType,
        completed: false
    };
    currentList.productList.push(newProduct);
    saveToLocalStorage();
    updateSummary();
    renderCategories();
}

// Função para alternar o status do produto
function toggleProductStatus(id) {
    const currentList = getCurrentList();
    if (!currentList) return;

    const product = currentList.productList.find(prod => prod.id === id);
    if (product) {
        product.completed = !product.completed;
        saveToLocalStorage();
        updateSummary();
        renderCategories();
    }
}

// Função para abrir o modal de exclusão
function openDeleteModal(id, type, name) {
    itemToDeleteId = id;
    deleteType = type;

    const modalMessage = deleteType === 'product'
        ? `Você realmente deseja excluir o produto "${name}"?`
        : deleteType === 'list'
            ? `Você realmente deseja excluir a lista "${name}"?`
            : `Você realmente deseja excluir a categoria "${name}"? Todos os produtos desta categoria serão removidos.`;

    document.getElementById('modalMessage').innerText = modalMessage;

    const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.show();
}

// Evento de clique do botão de confirmação no modal
document.getElementById('confirmDeleteBtn').addEventListener('click', function () {
    if (deleteType === 'product') {
        deleteProduct(itemToDeleteId);
    } else if (deleteType === 'list') {
        deleteList(itemToDeleteId);
    } else if (deleteType === 'category') {
        deleteCategory(itemToDeleteId);
    }

    const confirmDeleteModal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal'));
    confirmDeleteModal.hide();

    itemToDeleteId = null;
    deleteType = null;
});

function renderCategoriesInProductModal() {
    const currentList = getCurrentList();
    if (!currentList) return;

    const categoriesList = document.getElementById('categoriesListInProductModal');
    categoriesList.innerHTML = '';

    const savedCategory = localStorage.getItem('selectedCategory');

    if (currentList.categories.length === 0) {
        categoriesList.innerHTML = '<p>Nenhuma categoria disponível.</p>';
        return;
    }

    currentList.categories.forEach(category => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.textContent = category;

        if (savedCategory === category) {
            selectedCategory = category;
            li.classList.add('selected-category');
        }

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'btn-delete', 'btn-sm');
        deleteBtn.innerHTML = '✖';
        deleteBtn.onclick = () => openDeleteModal(category, 'category', category);
        li.appendChild(deleteBtn);
        categoriesList.appendChild(li);

        li.addEventListener('click', () => {
            selectedCategory = category;

            localStorage.setItem('selectedCategory', selectedCategory);

            renderCategoriesInProductModal();
        });
    });
}

function renderCategoriesListInProductModal() {
    renderCategoriesInProductModal();
}

function renderProductsInProductModal() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    const currentList = getCurrentList();
    if (!currentList || !currentList.productList) return;

    currentList.productList.forEach(product => {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Excluir';
        deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
        deleteBtn.onclick = () => openDeleteModal(product.id, 'product', product.name);
        productsContainer.appendChild(deleteBtn);
    });
}

// Função Deletar uma lista
function deleteList(listId) {
    lists = lists.filter(list => list.id !== listId);

    if (lists.length > 0) {
        switchToList(lists[0].id);
    } else {
        location.reload();
    }

    saveToLocalStorage();
    renderListsInSidebar();
}

// Função Deletar uma Categoria
function deleteCategory(name) {
    const currentList = getCurrentList();
    if (!currentList) return;

    currentList.categories = currentList.categories.filter(cat => cat !== name);

    currentList.productList = currentList.productList.filter(prod => prod.category !== name);

    saveToLocalStorage();
    initCategories();
    renderCategoriesInProductModal();
}

// Função para deletar o produto
function deleteProduct(id) {
    const currentList = getCurrentList();
    if (!currentList) return;

    currentList.productList = currentList.productList.filter(product => product.id !== id);

    saveToLocalStorage();
    updateSummary();
    renderCategories();
}

// Função para renderizar listas na sidebar
function renderListsInSidebar() {
    const listsList = document.getElementById('listsListInSidebar');
    listsList.innerHTML = '';

    if (lists.length === 0) {
        listsList.innerHTML = '<li class="list-group-item">Nenhuma lista disponível.</li>';
        return;
    }

    lists.forEach(list => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        li.textContent = list.name;
        li.onclick = () => switchToList(list.id);

        const btnGroup = document.createElement('div');

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'btn-delete', 'btn-sm');
        deleteBtn.innerHTML = '✖';
        deleteBtn.onclick = () => openDeleteModal(list.id, 'list', list.name);

        btnGroup.appendChild(deleteBtn);
        li.appendChild(btnGroup);

        listsList.appendChild(li);
    });
}

function initApp() {
    loadFromLocalStorage();
    if (!currentListId && lists.length > 0) {
        currentListId = lists[0].id;
        saveToLocalStorage();
    }

    const currentList = getCurrentList();
    if (currentList) {
        document.title = currentList.name;
        document.querySelector('.header h1').textContent = currentList.name;
    }

    initCategories();
    renderListsInSidebar();
}

document.addEventListener('DOMContentLoaded', initApp);