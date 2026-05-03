// ================= OBTÉM IDENTIFICAÇÃO DO GRUPO =================

// Recupera o identificador do grupo armazenado na sessão
const userGP = sessionStorage.getItem("userGP");

// Exibe no console para fins de depuração
console.log("Grupo atual:", userGP);

// ================= VALIDAÇÃO DE SESSÃO =================

// Caso não exista grupo válido, redireciona para o login
if (!userGP) {
  alert("Sessão inválida. Faça login novamente.");
  window.location.href = "../Login/login.html";
}

// ================= FUNÇÃO PARA CARREGAR ESTOQUE =================
function carregarEstoque() {

  // Realiza requisição ao backend para obter os produtos do grupo
  fetch(`http://localhost:3000/estoque/${userGP}`)
    .then(res => res.json())
    .then(data => {

      // Seleciona o elemento HTML onde a lista será exibida
      const lista = document.getElementById("lista");

      // Limpa o conteúdo atual da lista
      lista.innerHTML = "";

      // Percorre os itens retornados e cria elementos na tela
      data.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.nome_produto} - ${item.quantidade}`;
        lista.appendChild(li);
      });
    });
}

// ================= FUNÇÃO PARA ADICIONAR PRODUTO =================
function addProduto() {

  // Obtém os valores digitados pelo usuário
  const nome = document.getElementById("produto").value;
  const quantidade = document.getElementById("quantidade").value;

  // Validação simples dos campos
  if (!nome || !quantidade) {
    alert("Preencha todos os campos.");
    return;
  }

  // Envia os dados para o backend
  fetch("http://localhost:3000/estoque", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome,
      quantidade,
      userGP // Identificador do grupo
    })
  })
  .then(res => res.json())
  .then(() => {

    // Após adicionar, recarrega o estoque atualizado
    carregarEstoque();
  });
}

// ================= FUNÇÃO DE LOGOUT =================
function logout() {

  // Remove o grupo da sessão
  sessionStorage.removeItem("userGP");

  // Redireciona para a tela de login
  window.location.href = "../Login/login.html";
}

// ================= INICIALIZAÇÃO =================

// Carrega os dados do estoque ao abrir a página
carregarEstoque();  