// ================= FUNÇÃO DE LOGIN =================
function login() {

  // Obtém os valores digitados nos campos de usuário e senha
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;

  // Envia uma requisição HTTP para o backend com as credenciais
  fetch("http://localhost:3000/login", {
    method: "POST", // Define o método da requisição
    headers: {
      "Content-Type": "application/json" // Indica que o corpo da requisição está em formato JSON
    },
    body: JSON.stringify({ user, pass }) // Converte os dados para JSON
  })

  // Converte a resposta do servidor para JSON
  .then(res => res.json())

  // Processa os dados retornados pelo servidor
  .then(data => {
    console.log("Resposta do servidor:", data);

    // Verifica se o login foi bem-sucedido e se o grupo foi retornado
    if (data.success && data.userGP) {

      // Armazena o identificador do grupo na sessão do navegador
      sessionStorage.setItem("userGP", data.userGP);

      // Redireciona o usuário para a página de estoque
      window.location.href = "../Estoque/estoque.html";

    } else {
      // Exibe mensagem de erro caso as credenciais sejam inválidas
      alert("Usuário ou senha incorretos");
    }
  });
}