<<<<<<< HEAD
function showLoading() {
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("loading");

    const loader = document.createElement("div");
    loader.classList.add("loader-circle");

    loadingDiv.appendChild(loader);
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector(".loading");
    if (loadingDiv) {
        loadingDiv.remove();
    }
}
=======
function showLoading() {
    const loadingDiv = document.createElement("div");
    loadingDiv.classList.add("loading");

    const loader = document.createElement("div");
    loader.classList.add("loader-circle");

    loadingDiv.appendChild(loader);
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.querySelector(".loading");
    if (loadingDiv) {
        loadingDiv.remove();
    }
}
>>>>>>> c5e4f847c668822bf5b319a09e1222e431a0721b
