<<<<<<< HEAD
    const auth = firebase.auth();

    // Fazer login
    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      auth.signInWithEmailAndPassword(email, senha)
        .catch(err => alert('Falha no login: ' + err.message));
    });

    // Se estiver logado, redireciona para app principal
    auth.onAuthStateChanged(user => {
      if (user) {
        window.location.href = 'index.html';
      }
=======
    const auth = firebase.auth();

    // Fazer login
    document.getElementById('loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const senha = document.getElementById('senha').value;
      auth.signInWithEmailAndPassword(email, senha)
        .catch(err => alert('Falha no login: ' + err.message));
    });

    // Se estiver logado, redireciona para app principal
    auth.onAuthStateChanged(user => {
      if (user) {
        window.location.href = 'index.html';
      }
>>>>>>> c5e4f847c668822bf5b319a09e1222e431a0721b
    });