const auth = firebase.auth();
const db   = firebase.firestore();

auth.onAuthStateChanged(async user => {
     if (!user) {
       window.location = 'login.html';
       return;
     }
     // Armazena o uid na variável local usada pelo saveAll()/loadFromFirestore:
     currentUserId = user.uid;
     showLoading();
     // Depois, carregue os dados:
     await loadFromFirestore();
     ensureInitialList()
     initApp();
     hideLoading();
  });


let lists = [];
let currentListId = null;
let currentUserId = null;
let itemToDeleteId = null;
let deleteType = null;
let selectedCategory = null;

const categoriesContainer = document.getElementById("categoriesContainer");
const itemsPicked = document.getElementById("itemsPicked");
const totalItems = document.getElementById("totalItems");
const itemsRemaining = document.getElementById("itemsRemaining");

const sidebar = document.querySelector(".sidebar");
const menuToggle = document.getElementById("menuToggle");
const mainContent = document.getElementById("mainContent");


function toggleSidebar() {
  sidebar.classList.toggle("active");

  // Trocar o ícone de hambúrguer para "X" ou vice-versa
  const icon = menuToggle.querySelector("i");
  if (sidebar.classList.contains("active")) {
    icon.classList.remove("bi-list");
    icon.classList.add("bi-x");
  } else {
    icon.classList.remove("bi-x");
    icon.classList.add("bi-list");
  }
}

menuToggle.addEventListener("click", toggleSidebar);

document.addEventListener("click", function (event) {
  const isClickInsideSidebar = sidebar.contains(event.target);
  const isClickInsideToggleButton = menuToggle.contains(event.target);

  if (!isClickInsideSidebar && !isClickInsideToggleButton) {
    sidebar.classList.remove("active");
    const icon = menuToggle.querySelector("i");
    icon.classList.remove("bi-x");
    icon.classList.add("bi-list");
  }
});


// Função para adicionar uma nova lista
document
  .getElementById("addListFormInSidebar")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const listName = document
      .getElementById("newListNameInSidebar")
      .value.trim();

    if (listName === "") {
      alert("Por favor, insira o nome da lista.");
      return;
    }

    if (lists.some((list) => list.name === listName)) {
      alert("Esta lista já existe.");
      return;
    }

    addList(listName);
    document.getElementById("addListFormInSidebar").reset();
    renderListsInSidebar();
  });

// Função para adicionar uma nova lista
async function addList(name) {
  const newList = {
    id: Date.now()  + Math.random(),
    name,
    categories: [],
    productList: [],
  };

  lists.push(newList);
  currentListId = newList.id;
  saveAll();

  initCategories();
  renderListsInSidebar();
  switchToList(newList.id);
}

// Função para adicionar uma nova categoria
function addCategory(name) {
  const currentList = getCurrentList();
  if (!currentList) return;

  currentList.categories.push(name);
  saveAll();

}


function openEditProductModal(productId) {
  const currentList = getCurrentList();
  if (!currentList) return;

  // 1) Renderiza select e histórico para garantir que existam opções
  renderCategorySelect();
  renderPreviousProductsList();

  // 2) Busca o produto e pré-preenche os campos
  const product = currentList.productList.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("productName").value      = product.name;
  document.getElementById("productQuantity").value  = product.quantity;
  document.getElementById("unidade").value          = product.quantityType;
  document.getElementById("categorySelect").value   = product.category;

  // 3) Marca o form como “edição” para o submit saber
  document.getElementById("addProductForm").dataset.editingProductId = productId;

  // 4) Garante que a aba “Novo” esteja ativa
  const novoTabBtn = document.querySelector(
    '#productTabs button[data-bs-target="#newProduct"]'
  );
  bootstrap.Tab.getOrCreateInstance(novoTabBtn).show();

  // 5) Finalmente abre o modal
  const addProductModal = new bootstrap.Modal(
    document.getElementById("addProductModal")
  );
  addProductModal.show();
}

// Função para adicionar um novo produto
document
  .getElementById("addProductForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const form = this;
    // 1) Verifica se estamos editando (string ou undefined)
    const editingId = form.dataset.editingProductId;
    console.log("DEBUG: editingProductId =", editingId);

    // 2) Campos
    const productName    = document.getElementById("productName").value.trim();
    const productQuantity= parseInt(document.getElementById("productQuantity").value, 10);
    const quantityType   = document.getElementById("unidade").value;
    const category       = document.getElementById("categorySelect").value;

    // 3) Validações
    if (!productName) {
      return alert("Por favor, insira o nome do produto.");
    }
    if (productQuantity <= 0) {
      return alert("A quantidade deve ser pelo menos 1.");
    }
    if (!category) {
      return alert("Selecione uma categoria.");
    }

    // 4) Atualiza ou cria
    if (editingId) {
      // edição
      updateProduct(
        parseInt(editingId, 10),
        productName,
        category,
        productQuantity,
        quantityType
      );
      // Limpa flag de edição
      delete form.dataset.editingProductId;
    } else {
      // criação
      addProduct(
        productName,
        category,
        productQuantity,
        quantityType
      );
    }

    // 5) Fecha o modal e limpa form
    form.reset();
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addProductModal")
    );
    modal.hide();
  });


function updateProduct(productId, name, category, quantity, quantityType) {
  const currentList = getCurrentList();
  if (!currentList) return;

  const product = currentList.productList.find((prod) => prod.id === productId);
  if (product) {
    product.name = name;
    product.category = category;
    product.quantity = parseInt(quantity);
    product.quantityType = quantityType;
    saveAll();

    updateSummary();
    renderCategories();
  }
}

// Função para obter a lista atual
function getCurrentList() {
  return lists.find((list) => list.id === currentListId);
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
    document.querySelector(".header h1").textContent = currentList.name;
  }

  saveAll();

  initCategories();

  toggleSidebar();
  renderCategoriesInSidebar();

  const modalElement = document.getElementById("manageListsModal");
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

  currentList.productList.forEach((product) => {
    if (product.quantityType === "kg" || product.quantityType === "litros") {
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

  const product = currentList.productList.find((prod) => prod.id === id);
  if (product) {
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
      product.quantity = quantity;
      saveAll();

      updateSummary();
      renderCategories();
    } else {
      alert("A quantidade deve ser pelo menos 1.");
      document.getElementById(`productQuantity-${id}`).value = product.quantity;
    }
  }
}

// Função Renderizar o produto
function renderProducts(category) {
  const currentList = getCurrentList();
  if (!currentList) return "";

  // Ordenar os produtos para que os 'completos' fiquem no final
  const sortedProducts = currentList.productList
    .filter((product) => product.category === category)
    .sort((a, b) => a.completed - b.completed);

  return sortedProducts
    .map(
      (product) =>
        `<div class="category-item ${
          product.completed ? "completed" : ""
        }" onclick="toggleProductStatus(${product.id}, event)">
                <div class="form-check me-2">
                    <input 
                        class="form-check-input custom-checkbox-input"
                        id="customCheckbox-${product.id}"
                        type="checkbox"
                        ${product.completed ? "checked" : ""} 
                        style="display: none;"
                    />
                    <label for="customCheckbox-${
                      product.id
                    }" class="custom-checkbox" ></label>
                </div>
                <div class="flex-grow-1">
                    <span class="product-name" style="font-weight: 700; text-transform: capitalize;">${
                      product.name
                    }</span>
                    <div style="font-size: 12px;">
                        <span class="quantity-type">${product.quantity}</span>
                        <span class="quantity-type">${
                          product.quantityType
                        }</span>
                    </div>
                </div>
                <div class="quantity-controls">
                    <button class="btn-decrement" onclick="changeQuantity(${
                      product.id
                    }, -1); event.stopPropagation();">-</button>
                    <input 
                        id="productQuantity-${product.id}" 
                        type="number"
                        value="${product.quantity}" 
                        onchange="updateProductQuantity(${
                          product.id
                        }, this.value)"
                        class="quantity-input"
                        min="1"
                        onclick="event.stopPropagation()"
                    >
                    <button class="btn-increment" onclick="changeQuantity(${
                      product.id
                    }, 1); event.stopPropagation();">+</button>
                </div>
                <div class="menu-container">
                    <button class="menu-button" onclick="toggleMenu(${
                      product.id
                    }); event.stopPropagation();">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div id="menu-${
                      product.id
                    }" class="menu-options" style="display: none;">
                        <button onclick="openEditProductModal(${
                          product.id
                        }); event.stopPropagation();">Editar</button>
                        <button onclick="openDeleteModal(${
                          product.id
                        }, 'product', '${
          product.name
        }'); event.stopPropagation();">Excluir</button>
                    </div>
                </div>
            </div>`
    )
    .join("");
}

// Função para exibir/esconder o menu
function toggleMenu(productId) {
  const menu = document.getElementById(`menu-${productId}`);
  const isVisible = menu.style.display === "block";

  // Fecha todos os menus
  document.querySelectorAll(".menu-options").forEach((menu) => {
    menu.style.display = "none";
  });

  // Abre o menu atual se ainda não estiver visível
  if (!isVisible) {
    menu.style.display = "block";

    // Adiciona o event listener para cliques fora
    document.addEventListener("click", closeMenusOnClickOutside);
  }
}

function closeMenusOnClickOutside(event) {
  // Verifica se o clique foi fora de qualquer menu ou botão
  const isClickInsideMenu = event.target.closest(".menu-container");

  if (!isClickInsideMenu) {
    // Fecha todos os menus
    document.querySelectorAll(".menu-options").forEach((menu) => {
      menu.style.display = "none";
    });

    // Remove o event listener para otimizar o desempenho
    document.removeEventListener("click", closeMenusOnClickOutside);
  }
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
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/--+/g, "-")
    .toLowerCase();
}

// Função para renderizar categorias e produtos
function renderCategories() {
  const currentList = getCurrentList();
  if (!currentList || !Array.isArray(currentList.categories)) return;

  // Salvar estado atual dos colapsos
  const collapseStates = {};
  document.querySelectorAll(".category-content").forEach((collapse) => {
    collapseStates[collapse.id] = collapse.classList.contains("show");
  });

  categoriesContainer.innerHTML = "";
  let hasProducts = false;

  currentList.categories.forEach((category) => {
    const productsInCategory = currentList.productList.filter(
      (product) => product.category === category
    );
    if (productsInCategory.length > 0) {
      hasProducts = true;
      const categoryId =
        category.replace(/\s+/g, "-").toLowerCase() + "-" + currentList.id;

      // HTML da categoria com os botões e ícone animado
      const categoryDiv = document.createElement("div");
      categoryDiv.classList.add("category", "mb-4");

      categoryDiv.innerHTML = `
        <div class="category-title d-flex justify-content-between align-items-center" role="button" data-bs-toggle="collapse" href="#${categoryId}" aria-expanded="false">
          <h3 class="mb-0 d-flex align-items-center gap-2">
            ${category}
            <i class="bi bi-chevron-down rotate-icon transition"></i>
          </h3>
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-danger btn-clean" title="Limpar produtos da categoria"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <div class="collapse show category-content mt-2" id="${categoryId}">
          ${renderProducts(category)}
        </div>
      `;

      // Botões: excluir categoria e limpar produtos
      const btnClean = categoryDiv.querySelector(".btn-clean");

      btnClean.onclick = async () => {
        if (confirm(`Remover todos os produtos da categoria "${category}"?`)) {
          currentList.productList = currentList.productList.filter(p => p.category !== category);
          await saveAll();
          renderCategories();
          renderCategoriesInSidebar();
          renderCategorySelect();
          renderPreviousProductsList();
        }
      };

      categoriesContainer.appendChild(categoryDiv);
    }
  });

  // Restaurar o estado dos colapsos
  Object.keys(collapseStates).forEach((id) => {
    const collapse = document.getElementById(id);
    if (collapse) {
      if (collapseStates[id]) {
        collapse.classList.add("show");
      } else {
        collapse.classList.remove("show");
      }
    }
  });

  // Atualiza ícones de seta (animação)
  document.querySelectorAll(".category-title").forEach((title) => {
    const targetId = title.getAttribute("href")?.replace("#", "");
    if (!targetId) return;

    const icon = title.querySelector(".rotate-icon");
    const collapseEl = document.getElementById(targetId);

    if (collapseEl.classList.contains("show")) {
      icon.classList.add("rotate-180");
    } else {
      icon.classList.remove("rotate-180");
    }

    // Evento de animação ao expandir/retrair
    collapseEl.addEventListener("shown.bs.collapse", () => icon.classList.add("rotate-180"));
    collapseEl.addEventListener("hidden.bs.collapse", () => icon.classList.remove("rotate-180"));
  });

  // Mensagem de lista vazia
  const emptyMessage = document.getElementById("empty-message");
  if (currentList.productList.length === 0) {
    emptyMessage.style.display = "block";
    categoriesContainer.style.display = "none";
  } else {
    emptyMessage.style.display = "none";
    categoriesContainer.style.display = "block";
  }
}

// Função para adicionar o produto na lista
function addProduct(name, category, quantity, quantityType) {
  const currentList = getCurrentList();
  if (!currentList) return;

  const newProduct = {
    id: Date.now()  + Math.random(),
    name,
    category,
    quantity: parseInt(quantity),
    quantityType,
    completed: false,
  };
  currentList.productList.push(newProduct);
  saveAll();

  updateSummary();
  renderCategories();
}

// Função para alternar o status do produto
function toggleProductStatus(id) {
  const currentList = getCurrentList();
  if (!currentList) return;

  const product = currentList.productList.find((prod) => prod.id === id);
  if (product) {
    product.completed = !product.completed;
    saveAll();

    updateSummary();
    renderCategories();
  }
}

// Função para abrir o modal de exclusão
function openDeleteModal(id, type, name) {
  itemToDeleteId = id;
  deleteType = type;

  const modalMessage =
    deleteType === "product"
      ? `Você realmente deseja excluir o produto "${name}"?`
      : deleteType === "list"
      ? `Você realmente deseja excluir a lista "${name}"?`
      : `Você realmente deseja excluir a categoria "${name}"? Todos os produtos desta categoria serão removidos.`;

  document.getElementById("modalMessage").innerText = modalMessage;

  const confirmDeleteModal = new bootstrap.Modal(
    document.getElementById("confirmDeleteModal")
  );
  confirmDeleteModal.show();
}

// Evento de clique do botão de confirmação no modal
document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    if (deleteType === "product") {
      deleteProduct(itemToDeleteId);
    } else if (deleteType === "list") {
      deleteList(itemToDeleteId);
    } else if (deleteType === "category") {
      deleteCategory(itemToDeleteId);
    }

    const confirmDeleteModal = bootstrap.Modal.getInstance(
      document.getElementById("confirmDeleteModal")
    );
    confirmDeleteModal.hide();

    itemToDeleteId = null;
    deleteType = null;
  });

function renderCategoriesInProductModal() {
  const currentList = getCurrentList();
  if (!currentList) return;

  const categoriesList = document.getElementById(
    "categoriesListInProductModal"
  );
  categoriesList.innerHTML = "";

  const savedCategory = localStorage.getItem("selectedCategory");

  if (currentList.categories.length === 0) {
    categoriesList.innerHTML = "<p>Nenhuma categoria disponível.</p>";
    return;
  }

  currentList.categories.forEach((category) => {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    li.textContent = category;

    if (savedCategory === category) {
      selectedCategory = category;
      li.classList.add("selected-category");
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-delete", "btn-sm");
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = () => openDeleteModal(category, "category", category);
    li.appendChild(deleteBtn);
    categoriesList.appendChild(li);

    li.addEventListener("click", () => {
      selectedCategory = category;

      localStorage.setItem("selectedCategory", selectedCategory);

      renderCategoriesInProductModal();
    });
  });
}

function renderCategoriesListInProductModal() {
  renderCategoriesInProductModal();
}

function renderProductsInProductModal() {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "";

  const currentList = getCurrentList();
  if (!currentList || !currentList.productList) return;

  currentList.productList.forEach((product) => {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Excluir";
    deleteBtn.classList.add("btn", "btn-danger", "btn-sm");
    deleteBtn.onclick = () =>
      openDeleteModal(product.id, "product", product.name);
    productsContainer.appendChild(deleteBtn);
  });
}

// Função Deletar uma lista
function deleteList(listId) {
  lists = lists.filter((list) => list.id !== listId);

  if (lists.length > 0) {
    switchToList(lists[0].id);
  } else {
    location.reload();
  }

  saveAll();

  renderListsInSidebar();
}

// Função Deletar uma Categoria
function deleteCategory(name) {
  const currentList = getCurrentList();
  if (!currentList) return;

  // 1) Remove a categoria e os produtos relacionados
  currentList.categories = currentList.categories.filter(cat => cat !== name);
  currentList.productList = currentList.productList.filter(
    prod => prod.category !== name
  );

  // 2) Persiste
  saveAll();

  // 3) Atualiza apenas as UIs que existem:
  renderCategoriesInSidebar();  // sidebar com contador + botão
  renderCategories();           // view principal
  renderCategorySelect();       // select do modal de produto

  // 4) Se estiver usando quick‐add, esconde o grupo
  const quick = document.getElementById("quickAddGroup");
  if (quick) quick.style.display = "none";
}

document.getElementById("btnQuickAddSelected").addEventListener("click", () => {
  const cat = document.getElementById("categorySelect").value;
  if (!cat) return;

  DEFAULT_PRODUCTS[cat].forEach(name => {
    const cb = document.getElementById(`qprod-${name.replace(/\s+/g, "-")}`);
    if (cb && cb.checked) {
      // Adiciona direto via JS — sem usar o <form>
      addProduct(name, cat, 1, "Unidade");
    }
  });

  renderCategories();
  renderCategorySelect();
  document.getElementById("quickAddGroup").style.display = "none";
});


// Função para deletar o produto
function deleteProduct(id) {
  const currentList = getCurrentList();
  if (!currentList) return;

  currentList.productList = currentList.productList.filter(
    (product) => product.id !== id
  );

  saveAll();

  updateSummary();
  renderCategories();
}

// Função para renderizar listas na sidebar
function renderListsInSidebar() {
  const listsList = document.getElementById("listsListInSidebar");
  listsList.innerHTML = "";

  if (lists.length === 0) {
    listsList.innerHTML =
      '<li class="list-group-item">Nenhuma lista disponível.</li>';
    return;
  }

  lists.forEach((list) => {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "justify-content-between",
      "align-items-center"
    );
    li.textContent = list.name;
    li.onclick = () => switchToList(list.id);

    const btnGroup = document.createElement("div");

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-delete", "btn-sm");
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.onclick = () => openDeleteModal(list.id, "list", list.name);

    btnGroup.appendChild(deleteBtn);
    li.appendChild(btnGroup);

    listsList.appendChild(li);
  });
}

// 4.1 Carrega do Firestore para memória
async function loadFromFirestore() {
  const doc = await db.collection('users')
                      .doc(currentUserId)
                      .get();
  if (doc.exists) {
    const data = doc.data();
    lists = data.lists || [];
    currentListId = data.currentListId ?? (lists[0]?.id || null);
  } else {
    // Primeiro login: já deixa vazio para criar lista inicial
    lists = [];
    currentListId = null;
  }
}

// 4.2 Salva no Firestore + opcional localStorage
function saveAll() {
  // (opcional) mantem local para offline:
  localStorage.setItem('lists', JSON.stringify(lists));
  localStorage.setItem('currentListId', JSON.stringify(currentListId));

  // grava no Firestore
  return db.collection('users')
           .doc(currentUserId)
           .set({
             lists,
             currentListId
           }, { merge: true });
}


function initApp() {
    // Se for o primeiro login e não houver lista
    if (!currentListId && lists.length > 0) {
     currentListId = lists[0].id;
      saveAll().catch(console.error);
    }
  const currentList = getCurrentList();
  if (currentList) {
    document.title = currentList.name;
    document.querySelector(".header h1").textContent = currentList.name;
  }

  initCategories();
  renderListsInSidebar();
  renderCategoriesInSidebar();
}

// Botão de logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      window.location.href = 'login.html'; // Redireciona para login após sair
    })
    .catch(error => {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao sair. Tente novamente.');
    });
});

function renderCategoriesInSidebar() {
  const ul = document.getElementById("categoriesListInSidebar");
  ul.innerHTML = "";
  const currentList = getCurrentList();
  if (!currentList || currentList.categories.length === 0) {
    ul.innerHTML = '<li class="list-group-item">Nenhuma categoria.</li>';
    return;
  }

  currentList.categories.forEach(cat => {
    // conta quantos produtos existem nesta categoria
    const count = currentList.productList.filter(p => p.category === cat).length;

    // monta o <li> com nome + badge
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>${cat}</span>
      <span class="d-flex align-items-center">
        <span class="badge bg-secondary rounded-pill me-2">${count}</span>
      </span>
    `;

    // botão de excluir
    const btn = document.createElement("button");
    btn.className = "btn btn-sm btn-danger";
    btn.innerHTML = '<i class="fas fa-trash"></i>';
    btn.onclick = () => {
      deleteCategory(cat);
      renderCategoriesInSidebar();
      renderCategories();      // atualiza view principal
      renderCategorySelect();  // atualiza select do modal
    };

    // insere o botão dentro do <li>, junto à badge
    li.querySelector("span.d-flex").appendChild(btn);

    ul.appendChild(li);
  });
}


document
  .getElementById("addCategoryFormInSidebar")
  .addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("newCategoryNameInSidebar").value.trim();
    if (!name) return alert("Insira o nome da categoria.");
    const currentList = getCurrentList();
    if (currentList.categories.includes(name)) {
      return alert("Categoria já existe.");
    }
    addCategory(name);            // já existente — só insere em currentList.categories
    document.getElementById("addCategoryFormInSidebar").reset();
    renderCategoriesInSidebar();
    renderCategories();           // atualiza a lista principal
  });

  function renderPreviousProductsList() {
    const ul = document.getElementById("previousProductsContainer");
    ul.innerHTML = "";
    const currentList = getCurrentList();
    if (!currentList || currentList.productList.length === 0) {
      ul.innerHTML = '<li class="list-group-item">Nenhum produto cadastrado.</li>';
      return;
    }
    currentList.productList.forEach(prod => {
      const li = document.createElement("li");
      li.className = "list-group-item list-group-item-action";
      li.textContent = prod.name;
      li.onclick = () => prefillProduct(prod);
      ul.appendChild(li);
    });
  }
  
  function prefillProduct(prod) {
    // preenche os campos do form
    document.getElementById("productName").value = prod.name;
    document.getElementById("productQuantity").value = prod.quantity;
    document.getElementById("unidade").value = prod.quantityType;
    document.getElementById("categorySelect").value = prod.category;
    // volta para aba “Novo”
    bootstrap.Tab.getInstance(document.querySelector('#productTabs button[data-bs-target="#newProduct"]'))
      .show();
  }

  function renderCategorySelect() {
    const sel = document.getElementById("categorySelect");
    const quickGroup = document.getElementById("quickAddGroup");
    const quickSel   = document.getElementById("quickAddSelect");
    sel.innerHTML = '<option value="">Selecione uma categoria</option>';
    quickGroup.style.display = 'none';
    quickSel.innerHTML = '<option value="">Escolha um produto</option>';
  
    const currentList = getCurrentList();
    if (!currentList) return;
  
    currentList.categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      sel.appendChild(opt);
    });
  
    sel.onchange = () => {
      const cat = sel.value;
      if (!cat || !DEFAULT_PRODUCTS[cat]) {
        quickGroup.style.display = 'none';
        return;
      }
      // Popula quickAdd com os produtos DEFAULT_PRODUCTS[cat]
      quickSel.innerHTML = '<option value="">Escolha um produto</option>';
      DEFAULT_PRODUCTS[cat].forEach(name => {
        const o = document.createElement("option");
        o.value = name;
        o.textContent = name;
        quickSel.appendChild(o);
      });
      quickGroup.style.display = 'block';
    };
  }
  
  // Adiciona produto “rápido” quando clicar no botão
  document.getElementById("btnQuickAdd").addEventListener("click", () => {
    const name   = document.getElementById("quickAddSelect").value;
    const cat    = document.getElementById("categorySelect").value;
    if (!name || !cat) return alert("Selecione categoria e produto rápido.");
    addProduct(name, cat, 1, 'Unidade');
    // Fecha o grupo e reseta
    document.getElementById("quickAddGroup").style.display = 'none';
    document.getElementById("quickAddSelect").value     = '';
  });
  
  const addProductModalElement = document.getElementById("addProductModal");

  addProductModalElement.addEventListener("show.bs.modal", (e) => {
    const form = document.getElementById("addProductForm");
    // Se veio do clique no “Adicionar Produto” (botão com id="btnAddProduct"), zera o form
    if (e.relatedTarget && e.relatedTarget.id === "btnAddProduct") {
      form.reset();
      delete form.dataset.editingProductId;
      // força a aba “Novo”
      const novoTabBtn = document.querySelector(
        '#productTabs button[data-bs-target="#newProduct"]'
      );
      bootstrap.Tab.getOrCreateInstance(novoTabBtn).show();
    }
    // Em qualquer caso, (re)renderiza categorias e histórico
    renderCategorySelect();
    renderPreviousProductsList();
  });
  
const DEFAULT_CATEGORIES = [
  "Higiene Pessoal",
  "Limpeza",
  "Mercearia",
  "Molhos",
  "Frios e Laticínios",
  "Temperos",
  "Utilidades"
];

const DEFAULT_PRODUCTS = {
  "Higiene Pessoal": [
    "Shampoo Cond",
    "Desodorante",
    "Cotonete",
    "Algodao",
    "Absorvente",
    "Fio dental",
    "Papel higienico",
    "Sabonete",
    "Creme dental",
    "Esponja de banho"
  ],
  "Limpeza": [
    "Sabao em po",
    "Amaciante",
    "Água sanitária",
    "Esponja de cozinha",
    "Esponja de banheiro",
    "Flanela",
    "Tira manchas",
    "Detergente",
    "Inseticida",
    "Desengordurante",
    "Multiuso",
    "Alcool",
    "Palha de aco",
    "Saco de lixo",
    "Pinho",
    "Desinfetante",
    "Pastilha de vaso",
    "Odorizante"
  ],
  "Mercearia": [
    "Feijao",
    "Arroz",
    "Macarrao espaguete",
    "Macarrao parafuso",
    "Oleo",
    "Oleo de soja",
    "Ovos",
    "Açucar",
    "Cafe",
    "Leite condensado",
    "Creme de leite",
    "Cha",
    "Milho",
    "Cereal",
    "Biscoito",
    "Milho de pipoca",
    "Erva de tereré"
  ],
  "Molhos": [
    "Ketchup",
    "Maionese",
    "Molho de tomate",
    "Extrato de tomate",
    "Shoyo"
  ],
  "Frios e Laticínios": [
    "Leite",
    "Margarina"
  ],
  "Temperos": [
    "Sal",
    "Alho",
    "Chimichurri",
    "Salsa, alho e cebola",
    "Paprica",
    "Orégano"
  ],
  "Utilidades": [
    "Papel toalha",
    "Papel laminado",
    "Palito de dente"
  ]
};


  async function ensureInitialList() {
    if (lists.length === 0) {
      // Gera a lista de produtos padrão
      const initialProductList = Object.entries(DEFAULT_PRODUCTS)
        .flatMap(([category, names]) =>
          names.map(name => ({
            id: Date.now() + Math.random(),
            name,
            category,
            quantity: 1,
            quantityType: 'Unidade',
            completed: false
          }))
        );
      
      const initialList = {
        id: Date.now() + Math.random(),
        name: "Minha Primeira Lista",
        categories: [],         // ← começa sem categorias
        productList: []         // ← começa sem produtos
      };
      lists.push(initialList);
      currentListId = initialList.id;
      await saveAll();
    }
  }
  
  // 1) Renderiza checkboxes de categorias-padrão
function renderDefaultCategories() {
  const container = document.getElementById("defaultCategoriesContainer");
  container.innerHTML = DEFAULT_CATEGORIES
    .map(cat => `
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${cat}" id="defCat-${cat}">
        <label class="form-check-label" for="defCat-${cat}">${cat}</label>
      </div>`)
    .join("");
}

// 2) Mostra o modal
document.getElementById("btnManageCategories")
  .addEventListener("click", () => {
    renderDefaultCategories();
    bootstrap.Modal.getOrCreateInstance(
      document.getElementById("manageCategoriesModal")
    ).show();
  });

// 3) Ao clicar em “Adicionar Selecionadas”
document.getElementById("btnAddSelectedCategories")
  .addEventListener("click", async () => {
    const currentList = getCurrentList();
    DEFAULT_CATEGORIES.forEach(cat => {
      const cb = document.getElementById(`defCat-${cat}`);
      if (cb.checked && !currentList.categories.includes(cat)) {
        addCategory(cat);
      }
    });
    renderCategoriesInSidebar();
    renderCategorySelect();
    await saveAll();
    bootstrap.Modal.getInstance(
      document.getElementById("manageCategoriesModal")
    ).hide();
  });

  // referenciando os elementos
const categorySelect = document.getElementById("categorySelect");
const quickGroup     = document.getElementById("quickAddGroup");
const quickContainer = document.getElementById("quickCheckboxes");
const btnQuickAdd    = document.getElementById("btnQuickAddSelected");

// 1) ao mudar a categoria, renderiza os checkboxes
categorySelect.addEventListener("change", () => {
  const cat = categorySelect.value;
  quickContainer.innerHTML = "";
  
  if (!cat || !DEFAULT_PRODUCTS[cat]) {
    quickGroup.style.display = "none";
    return;
  }

  // monta um checkbox por produto padrão dessa categoria
  DEFAULT_PRODUCTS[cat].forEach(name => {
    const id = `qprod-${name.replace(/\s+/g, "-")}`;
    quickContainer.insertAdjacentHTML("beforeend", `
      <div class="form-check mb-1">
        <input class="form-check-input" type="checkbox" value="${name}" id="${id}">
        <label class="form-check-label" for="${id}">${name}</label>
      </div>
    `);
  });

  quickGroup.style.display = "block";
});

// 2) ao clicar em “Adicionar Selecionados”, faz bulk-add
btnQuickAdd.addEventListener("click", () => {
  const cat = categorySelect.value;
  if (!cat) return;

  DEFAULT_PRODUCTS[cat].forEach(name => {
    const cb = document.getElementById(`qprod-${name.replace(/\s+/g, "-")}`);
    if (cb && cb.checked) {
      addProduct(name, cat, 1, "Unidade");
    }
  });

  renderCategories();        // atualiza a view principal
  renderCategorySelect();    // “limpa” o quick-add
  quickGroup.style.display = "none";
});

document.getElementById("btnDeleteAllProducts").addEventListener("click", async () => {
  if (!confirm("Tem certeza que deseja excluir todos os produtos da lista atual?")) return;

  const currentList = getCurrentList();
  if (!currentList) return;

  currentList.productList = []; // limpa tudo
  await saveAll();
  renderCategories();           // atualiza view principal
  renderPreviousProductsList(); // atualiza histórico
});
