<<<<<<< HEAD
const auth = firebase.auth();

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const confirmSenha = document.getElementById('confirmSenha').value.trim();

  if (senha !== confirmSenha) {
    alert('As senhas não coincidem!');
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, senha);
    alert('Conta criada com sucesso!');
    window.location.href = 'index.html'; // redireciona para o app
  } catch (error) {
    console.error(error);
    alert('Erro ao criar conta: ' + error.message);
  }
=======
const auth = firebase.auth();

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();
  const confirmSenha = document.getElementById('confirmSenha').value.trim();

  if (senha !== confirmSenha) {
    alert('As senhas não coincidem!');
    return;
  }

  try {
    await auth.createUserWithEmailAndPassword(email, senha);
    alert('Conta criada com sucesso!');
    window.location.href = 'index.html'; // redireciona para o app
  } catch (error) {
    console.error(error);
    alert('Erro ao criar conta: ' + error.message);
  }
>>>>>>> c5e4f847c668822bf5b319a09e1222e431a0721b
});