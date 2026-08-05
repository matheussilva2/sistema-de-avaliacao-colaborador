# 🚀 Plataforma de Gestão de Capacitação

Uma plataforma web desenvolvida para apoiar empresas na gestão de programas de capacitação, permitindo a aplicação de formulários, acompanhamento do progresso dos participantes e registro de feedbacks sobre a evolução da aprendizagem.

---

## 📋 Sobre o Projeto

O sistema foi desenvolvido com o objetivo de centralizar informações relacionadas a treinamentos corporativos, proporcionando uma plataforma simples e eficiente para o gerenciamento de cursos de capacitação.

A aplicação segue uma arquitetura cliente-servidor, onde o frontend consome uma API REST desenvolvida em Spring Boot.

---

## ✨ Funcionalidades

- 👤 Cadastro e gerenciamento de usuários
- 🔐 Autenticação de usuários
- 📝 Aplicação de formulários
- 📊 Acompanhamento do progresso dos participantes
- 💬 Registro de feedbacks
- 🌐 API REST para comunicação entre frontend e backend

---

## 🛠 Tecnologias Utilizadas

### Frontend

- TypeScript
- Tailwind CSS

### Backend

- Java
- Spring Boot

### Banco de Dados

- MySQL

---

## 🏗 Arquitetura

```text
                +---------------------+
                |      Frontend       |
                | TypeScript/Tailwind |
                +----------+----------+
                           |
                     HTTP / REST API
                           |
                           ▼
                +---------------------+
                | Spring Boot Backend |
                +----------+----------+
                           |
                         JPA/Hibernate
                           |
                           ▼
                +---------------------+
                |       MySQL         |
                +---------------------+
```

---

## 📂 Estrutura do Projeto

```text
.
├── frontend/
├── backend/
├── database/
└── README.md
```

---

## ⚙️ Pré-requisitos

Antes de executar o projeto, é necessário possuir instalado:

- Java 17 ou superior
- Maven
- Node.js
- npm
- MySQL 8+

---

## 🚀 Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/usuario/repositorio.git
cd repositorio
```

### 2. Configure o banco de dados

Crie um banco de dados MySQL e configure as credenciais no arquivo:

```
application.properties
```

ou

```
application.yml
```

### 3. Execute o Backend

```bash
cd backend
mvn spring-boot:run
```

O backend ficará disponível em:

```
http://localhost:8080
```

### 4. Execute o Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend ficará disponível em:

```
http://localhost:5173
```

---

## 📡 API REST

O backend disponibiliza endpoints responsáveis por:

- Autenticação de usuários;
- Gerenciamento de usuários;
- Gerenciamento de formulários;
- Registro de feedbacks;
- Acompanhamento do progresso dos participantes.

---

## 🎯 Objetivo

Desenvolver uma plataforma que facilite o gerenciamento de programas de capacitação, permitindo às empresas acompanhar a evolução dos participantes e organizar informações relacionadas aos treinamentos em um único ambiente.

---

## 👨‍💻 Desenvolvido com

- ☕ Java
- 🌱 Spring Boot
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🐬 MySQL

---

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.
