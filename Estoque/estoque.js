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

// ================= ESTADO LOCAL =================
// Armazena os dados de estoque e a fila de produtos a serem vendidos
let estoqueData = [];
let filaCompra = [];

// ================= FUNÇÃO PARA CARREGAR ESTOQUE =================
function carregarEstoque() {
  fetch(`http://localhost:3000/estoque/${userGP}`)
    .then(res => res.json())
    .then(data => {
      estoqueData = data || [];

      const container = document.getElementById("lista");
      container.innerHTML = "";

      data.forEach(item => {

        const div = document.createElement("div");
        div.className = "produto" + (item.quantidade < (item.min_stock || 0) ? " low-stock" : "");
        div.id = `produto-${item.id}`;

        div.innerHTML = `
          <div class="view-mode">

            <h3>${item.nome_produto}</h3>
            <p>Qtd: ${item.quantidade}</p>
            <p>Código: ${item.codigo_barras || "-"}</p>
            <p>Compra: ${item.valor_compra || 0}</p>
            <p>Venda: ${item.valor_venda || 0}</p>

            <button onclick="ativarEdicao(${item.id})">Editar</button>
            <button onclick="removerProduto(${item.id})">Excluir</button>

          </div>

          <div class="edit-mode" style="display:none;">

            <input id="nome-${item.id}" value="${item.nome_produto}">
            <input id="qtd-${item.id}" type="number" value="${item.quantidade}">
            <input id="cod-${item.id}" value="${item.codigo_barras || ""}">
            <input id="compra-${item.id}" type="number" value="${item.valor_compra || 0}">
            <input id="venda-${item.id}" type="number" value="${item.valor_venda || 0}">
            <input id="min-${item.id}" type="number" value="${item.min_stock || 0}">

            <button onclick="salvarEdicao(${item.id})">Salvar</button>
            <button onclick="cancelarEdicao(${item.id})">Cancelar</button>

          </div>
        `;

        container.appendChild(div);
      });

      pesquisar();
    });
}
// ================= FUNÇÃO PARA ADICIONAR PRODUTO =================
function addProduto() {
  const nome = document.getElementById("produto").value;
  const quantidade = document.getElementById("quantidade").value;
  const codigo = document.getElementById("codigo").value;
  const compra = document.getElementById("compra").value;
  const venda = document.getElementById("venda").value;
  const min_stock = document.getElementById("min_stock").value;

  fetch("http://localhost:3000/estoque", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome,
      quantidade,
      userGP,
      codigo_barras: codigo,
      valor_compra: compra,
      valor_venda: venda,
      min_stock
    })
  })
  .then(() => carregarEstoque());
}

// ================= FUNÇÕES PARA EDITAR PRODUTO ================= 
function ativarEdicao(id) {
  const produto = document.getElementById(`produto-${id}`);
  produto.querySelector(".view-mode").style.display = "none";
  produto.querySelector(".edit-mode").style.display = "block";
}

function cancelarEdicao(id) {
  const produto = document.getElementById(`produto-${id}`);
  produto.querySelector(".view-mode").style.display = "block";
  produto.querySelector(".edit-mode").style.display = "none";
}


function salvarEdicao(id) {
  const nome = document.getElementById(`nome-${id}`).value;
  const quantidade = document.getElementById(`qtd-${id}`).value;
  const codigo = document.getElementById(`cod-${id}`).value;
  const compra = document.getElementById(`compra-${id}`).value;
  const venda = document.getElementById(`venda-${id}`).value;
  const min_stock = document.getElementById(`min-${id}`).value;

  fetch(`http://localhost:3000/estoque/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nome,
      quantidade,
      codigo_barras: codigo,
      valor_compra: compra,
      valor_venda: venda,
      min_stock
    })
  })
  .then(() => carregarEstoque());
}


// ================= FUNÇÃO PARA PESQUISAR PRODUTOS =================
function pesquisar() {
  const query = document.getElementById('search').value.toLowerCase();
  const produtos = document.querySelectorAll('.produto');

  produtos.forEach(prod => {
    const nome = prod.querySelector('h3').textContent.toLowerCase();
    const codigo = prod.querySelector('p:nth-child(3)').textContent.toLowerCase(); // Código: ...
    const visible = nome.includes(query) || codigo.includes(query);
    prod.style.display = visible ? 'block' : 'none';
  });
}

// ================= POPUP DE VENDA =================
function abrirVendaPopup() {
  document.getElementById('venda-popup').style.display = 'flex';
  document.getElementById('search-venda').value = '';
  renderVendaSearch();
  renderFilaCompra();
}

function fecharVendaPopup() {
  document.getElementById('venda-popup').style.display = 'none';
}

function renderVendaSearch() {
  const query = (document.getElementById('search-venda')?.value || '').toLowerCase();
  const lista = document.getElementById('venda-lista');

  if (!lista) return;
  lista.innerHTML = '';

  const resultados = estoqueData.filter(item => {
    const nome = item.nome_produto.toLowerCase();
    const codigo = (item.codigo_barras || '').toLowerCase();
    return nome.includes(query) || codigo.includes(query);
  });

  if (resultados.length === 0) {
    lista.innerHTML = '<p class="empty">Nenhum produto encontrado.</p>';
    return;
  }

  resultados.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'popup-list-item';
    itemDiv.innerHTML = `
      <div>
        <strong>${item.nome_produto}</strong>
        <p>Estoque: ${item.quantidade} | R$ ${item.valor_venda || 0}</p>
      </div>
      <div class="venda-actions">
        <input id="venda-qtd-${item.id}" type="number" min="1" max="${item.quantidade}" value="1">
        <button onclick="adicionarFilaCompra(${item.id})">Adicionar</button>
      </div>
    `;

    lista.appendChild(itemDiv);
  });
}

// ================= LOGÍCA DE ADIÇÃO À FILA =================
function adicionarFilaCompra(id) {
  const produto = estoqueData.find(item => item.id === id);
  const input = document.getElementById(`venda-qtd-${id}`);

  if (!produto || !input) return;

  const quantidade = Number(input.value) || 0;
  if (quantidade < 1) {
    alert('Informe uma quantidade válida.');
    return;
  }

  if (quantidade > produto.quantidade) {
    alert('Quantidade maior que o estoque disponível.');
    return;
  }

  const filaItem = filaCompra.find(item => item.id === id);
  if (filaItem) {
    const novaQtd = filaItem.quantidade + quantidade;
    if (novaQtd > produto.quantidade) {
      alert('Quantidade total na fila não pode ultrapassar o estoque.');
      return;
    }
    filaItem.quantidade = novaQtd;
  } else {
    filaCompra.push({
      id: produto.id,
      nome: produto.nome_produto,
      quantidade,
      valor_venda: Number(produto.valor_venda) || 0
    });
  }

  renderFilaCompra();
  renderVendaSearch();
}

// ================= RENDERIZAÇÃO DA FILA DE COMPRA =================
function renderFilaCompra() {
  const lista = document.getElementById('fila-compra');
  if (!lista) return;

  lista.innerHTML = '';

  if (filaCompra.length === 0) {
    lista.innerHTML = '<p class="empty">Nenhum produto na fila.</p>';
    atualizarTotalVenda();
    return;
  }

  filaCompra.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'fila-item';
    itemDiv.innerHTML = `
      <div>
        <strong>${item.nome}</strong>
        <p>Qtd: ${item.quantidade}</p>
        <p>Subtotal: R$ ${(item.quantidade * item.valor_venda).toFixed(2)}</p>
      </div>
      <button onclick="removerDaFila(${item.id})">Remover</button>
    `;

    lista.appendChild(itemDiv);
  });

  atualizarTotalVenda();
}

function removerDaFila(id) {
  filaCompra = filaCompra.filter(item => item.id !== id);
  renderFilaCompra();
}

function atualizarTotalVenda() {
  const total = filaCompra.reduce((sum, item) => sum + item.quantidade * item.valor_venda, 0);
  document.getElementById('total-venda').textContent = total.toFixed(2);
}

// ================= FINALIZAR VENDA =================
function finalizarVenda() {
  if (filaCompra.length === 0) {
    alert('Adicione produtos à fila antes de finalizar a venda.');
    return;
  }

  for (const item of filaCompra) {
    const produto = estoqueData.find(prod => prod.id === item.id);
    if (!produto) {
      alert(`Produto não encontrado: ${item.nome}`);
      return;
    }

    const quantidadeAtual = Number(produto.quantidade) || 0;
    const quantidadeVenda = Number(item.quantidade) || 0;

    if (quantidadeVenda > quantidadeAtual) {
      alert(`Quantidade vendida maior que o estoque disponível para ${item.nome}.`);
      return;
    }
  }

  const atualizacoes = filaCompra.map(item => {
    const produto = estoqueData.find(prod => prod.id === item.id);
    const quantidadeAtual = Number(produto.quantidade) || 0;
    const novaQuantidade = quantidadeAtual - Number(item.quantidade);

    return fetch(`http://localhost:3000/estoque/${item.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: produto.nome_produto,
        quantidade: novaQuantidade,
        codigo_barras: produto.codigo_barras,
        valor_compra: produto.valor_compra,
        valor_venda: produto.valor_venda,
        min_stock: produto.min_stock
      })
    });
  });

  Promise.all(atualizacoes)
    .then(() => {
      filaCompra = [];
      fecharVendaPopup();
      carregarEstoque();
      alert('Venda concluída com sucesso!');
    })
    .catch(error => {
      console.error(error);
      alert('Ocorreu um erro ao finalizar a venda. Verifique o estoque e tente novamente.');
    });
}

// ================= FUNÇÃO DE REMOVER PRODUTO ================= 
function removerProduto(id) {
  fetch(`http://localhost:3000/estoque/${id}`, {
    method: "DELETE"
  })
  .then(() => carregarEstoque());
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