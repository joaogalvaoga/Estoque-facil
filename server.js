// ================= IMPORTAÇÃO DE BIBLIOTECAS =================
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

// ================= CONFIGURAÇÃO DO SERVIDOR =================
const app = express();

// Habilita CORS para permitir requisições externas
app.use(cors());

// Permite o uso de JSON no corpo das requisições
app.use(bodyParser.json());

// ================= CONFIGURAÇÃO DO BANCO DE DADOS =================

// Cria ou conecta ao banco SQLite
const db = new sqlite3.Database("./database.db");

// Garante execução sequencial das operações
db.serialize(() => {

  // ================= CRIAÇÃO DA TABELA DE USUÁRIOS =================
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user TEXT,
      pass TEXT,
      group_id INTEGER
    )
  `);

  // ================= CRIAÇÃO DA TABELA DE ESTOQUE =================
  db.run(`
    CREATE TABLE IF NOT EXISTS estoque (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_produto TEXT,
      quantidade INTEGER,
      codigo_barras TEXT,
      valor_compra REAL,
      valor_venda REAL,
      min_stock INTEGER,
      group_id INTEGER,
      UNIQUE(nome_produto, group_id)
);
  `);

  // ================= INSERÇÃO DE USUÁRIO PADRÃO =================
  db.run(`
    INSERT OR IGNORE INTO users (id, user, pass, group_id)
    VALUES (1, 'admin', '123', 1)
  `);
});

// ================= ROTA DE LOGIN =================
app.post("/login", (req, res) => {

  // Obtém os dados enviados pelo cliente
  const { user, pass } = req.body;

  // Realiza consulta para validar credenciais
  db.get(
    "SELECT * FROM users WHERE user = ? AND pass = ?",
    [user, pass],
    (err, row) => {

      // Tratamento de erro
      if (err) {
        console.error("Erro ao consultar usuário:", err);
        return res.json({ success: false });
      }

      // Retorna sucesso e o grupo do usuário, caso encontrado
      if (row) {
        return res.json({ success: true, userGP: row.group_id });
      }

      // Caso não encontre usuário válido
      return res.json({ success: false });
    }
  );
});

// ================= ROTA PARA BUSCAR ESTOQUE =================
app.get("/estoque/:userGP", (req, res) => {

  // Obtém o identificador do grupo pela URL
  const userGP = req.params.userGP;

  // Consulta produtos pertencentes ao grupo
  db.all(
    "SELECT * FROM estoque WHERE group_id = ?",
    [userGP],
    (err, rows) => {

      // Tratamento de erro
      if (err) {
        console.error("Erro ao buscar estoque:", err);
        return res.json([]);
      }

      // Retorna lista de produtos
      return res.json(rows);
    }
  );
});

// ================= ROTA PARA ADICIONAR PRODUTO =================
app.post("/estoque", (req, res) => {

  const { 
    nome, 
    quantidade, 
    userGP, 
    codigo_barras, 
    valor_compra, 
    valor_venda,
    min_stock
  } = req.body;

  console.log("Dados recebidos:", req.body);

  db.get(
    "SELECT * FROM estoque WHERE nome_produto = ? AND group_id = ?",
    [nome, userGP],
    (err, row) => {

      if (err) {
        console.error(err);
        return res.json({ success: false });
      }

      if (row) {
        const novaQuantidade = row.quantidade + Number(quantidade);

        db.run(
          `UPDATE estoque 
           SET quantidade = ?, 
               codigo_barras = ?, 
               valor_compra = ?, 
               valor_venda = ?,
               min_stock = ?
           WHERE id = ?`,
          [novaQuantidade, codigo_barras, valor_compra, valor_venda, min_stock, row.id],
          (err) => {
            if (err) {
              console.error(err);
              return res.json({ success: false });
            }

            return res.json({ success: true, updated: true });
          }
        );

      } else {

        db.run(
          `INSERT INTO estoque 
           (nome_produto, quantidade, codigo_barras, valor_compra, valor_venda, min_stock, group_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [nome, quantidade, codigo_barras, valor_compra, valor_venda, min_stock, userGP],
          (err) => {

            if (err) {
              console.error(err);
              return res.json({ success: false });
            }

            return res.json({ success: true, created: true });
          }
        );
      }
    }
  );
});

// ================= ROTA PARA REMOVER PRODUTO =================
app.delete("/estoque/:id", (req, res) => {
  const id = req.params.id;

  db.run("DELETE FROM estoque WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});

// ================= EDITAR PRODUTO =================
app.put("/estoque/:id", (req, res) => {
  const id = req.params.id;

  const {
    nome,
    quantidade,
    codigo_barras,
    valor_compra,
    valor_venda,
    min_stock
  } = req.body;

  db.run(
    `UPDATE estoque 
     SET nome_produto = ?, 
         quantidade = ?, 
         codigo_barras = ?, 
         valor_compra = ?, 
         valor_venda = ?,
         min_stock = ?
     WHERE id = ?`,
    [nome, quantidade, codigo_barras, valor_compra, valor_venda, min_stock, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.json({ success: false });
      }

      res.json({ success: true });
    }
  );
});

// ================= INICIALIZAÇÃO DO SERVIDOR =================
app.listen(3000, () => {
  console.log("Servidor em execução: http://localhost:3000");
});