CREATE DATABASE IF NOT EXISTS ecomanta;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  cpf VARCHAR(11) DEFAULT NULL,
  telefone VARCHAR(15) DEFAULT NULL,
  endereco VARCHAR(255) DEFAULT NULL,
  data_nascimento DATE DEFAULT NULL,
  sexo ENUM('M', 'F', 'O') DEFAULT NULL,
  quantidade_comodos ENUM('1', '2', '3', '4', '5', '6 ou mais') NOT NULL,
  estado_civil ENUM('solteiro', 'casado', 'divorciado') NOT NULL,
  tipo_casa ENUM('terreo', 'sobrado') NOT NULL,
  localizacao ENUM('urbano', 'praia', 'fazenda', 'montanha') NOT NULL,
  senha VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
