require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'senha',
  database: process.env.DB_NAME || 'ecomanta'
});

// Função para executar o script SQL
const runSchema = () => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  fs.readFile(schemaPath, 'utf8', (err, sql) => {
    if (err) {
      console.error('Erro ao ler o arquivo schema.sql:', err);
      return;
    }

    // Dividir o script em instruções separadas por ponto e vírgula
    const commands = sql.split(';').filter(command => command.trim() !== '');

    const executeCommands = (commands) => {
      if (commands.length === 0) {
        console.log('Schema executado com sucesso.');
        return;
      }

      const command = commands.shift(); // Remove o primeiro comando da lista

      db.query(command, (err) => {
        if (err) {
          console.error('Erro ao executar o script SQL:', err);
          return;
        }

        // Chama recursivamente para executar o próximo comando
        executeCommands(commands);
      });
    };

    executeCommands(commands);
  });
};

// Conectar ao MySQL
db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
  } else {
    console.log('Conectado ao banco de dados MySQL');

    // Criar banco de dados se não existir
    db.query('CREATE DATABASE IF NOT EXISTS ecomanta;', (err) => {
      if (err) {
        console.error('Erro ao criar o banco de dados:', err);
        return;
      }
      console.log('Banco de dados criado ou já existe.');

      // Mudar para o banco de dados 'ecomanta'
      db.query('USE ecomanta;', (err) => {
        if (err) {
          console.error('Erro ao usar o banco de dados:', err);
          return;
        }

        // Agora chama a função para executar o schema
        runSchema();
      });
    });
  }
});

// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'formulario.html'));
});

// Rota para login ou cadastro de usuários
app.post('/api/usuarios', (req, res) => {
  console.log('Requisição recebida:', req.body);

  const { login: cpf, senha } = req.body;

  if (cpf && senha) {
    const query = 'SELECT * FROM usuarios WHERE cpf = ?';
    db.query(query, [cpf], (err, results) => {
      if (err) {
        console.error('Erro ao buscar o usuário:', err);
        return res.status(500).json({ success: false, message: 'Erro no servidor' });
      }

      if (results.length === 0) {
        return res.status(401).json({ success: false, message: 'CPF ou senha incorretos.' });
      }

      const usuario = results[0];
      bcrypt.compare(senha, usuario.senha, (err, match) => {
        if (err) {
          console.error('Erro ao comparar senhas:', err);
          return res.status(500).json({ success: false, message: 'Erro no servidor' });
        }

        if (!match) {
          return res.status(401).json({ success: false, message: 'CPF ou senha incorretos.' });
        }

        res.json({ success: true, message: 'Login bem-sucedido!' });
      });
    });
  } else {
    const {
      nome, email, cpf, telefone, endereco,
      data_nascimento, sexo, quantidade_comodos,
      estado_civil, tipo_casa, localizacao
    } = req.body;

    if (!cpf || !senha) {
      return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
    }

    bcrypt.hash(senha, 10, (err, hash) => {
      if (err) {
        console.error('Erro ao hash da senha:', err);
        return res.status(500).send('Erro ao processar a senha');
      }

      const query = `INSERT INTO usuarios 
        (nome, email, cpf, telefone, endereco, data_nascimento, sexo, quantidade_comodos, estado_civil, tipo_casa, localizacao, senha) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(query, [
        nome, email, cpf, telefone, endereco, data_nascimento, sexo, quantidade_comodos,
        estado_civil, tipo_casa, localizacao, hash
      ], (err, result) => {
        if (err) {
          console.error('Erro ao inserir dados:', err);
          return res.status(500).send('Erro no servidor');
        }
        res.status(201).json({ message: 'Usuário cadastrado com sucesso', id: result.insertId });
      });
    });
  }
});

// Iniciar o servidor
app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
