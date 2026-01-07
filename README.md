# API REST - Plataforma de Cursos

API REST desenvolvida em Node.js + Express + MongoDB para uma plataforma de cursos.

## 📋 Funcionalidades

- ✅ Autenticação e autorização (JWT)
- ✅ Dois perfis: **admin** e **student**
- ✅ CRUD completo de cursos
- ✅ Sistema de matrículas (enrollments)
- ✅ Paginação e filtros
- ✅ Middlewares de autenticação e tratamento de erros

## 🚀 Como executar

### Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou MongoDB Atlas)
- Docker e Docker Compose (opcional, para usar MongoDB via Docker)

### Opção 1: Usando Docker para MongoDB (Recomendado)

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Inicie o MongoDB usando Docker Compose:

```bash
docker compose up -d
```

Isso irá:
- Criar um container MongoDB na porta 27017
- Criar um usuário admin (usuário: `admin`, senha: `admin123`)
- Criar o banco de dados `cursos_db`
- Persistir os dados em volumes Docker

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGODB_URI=mongodb://admin:admin123@localhost:27017/cursos_db?authSource=admin
JWT_SECRET=seu_secret_jwt_aqui
JWT_EXPIRE=7d
```

**Nota:** Se preferir usar MongoDB sem autenticação, você pode usar:
```env
MONGODB_URI=mongodb://localhost:27017/cursos_db
```

E remover as variáveis de ambiente de autenticação do `docker-compose.yml`.

4. Inicie o servidor:

```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

**Comandos úteis do Docker:**
```bash
# Parar o MongoDB
docker compose down

# Parar e remover volumes (apaga os dados)
docker compose down -v

# Ver logs do MongoDB
docker compose logs -f mongodb
```

### Opção 2: MongoDB Local

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Instale e configure o MongoDB localmente

3. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cursos_db
JWT_SECRET=seu_secret_jwt_aqui
JWT_EXPIRE=7d
```

4. Inicie o servidor:

```bash
# Modo desenvolvimento (com nodemon)
npm run dev

# Modo produção
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

Todas as rotas que exigem autenticação devem incluir o token no header:

```
Authorization: Bearer <seu_token>
```

---

## 🔐 Endpoints de Autenticação

### POST /auth/register

Registra um novo usuário (role padrão: student).

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/login

Realiza login e retorna token JWT.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### GET /auth/me

Retorna dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "João Silva",
      "email": "joao@example.com",
      "role": "student",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## 👥 Endpoints de Usuários (Admin apenas)

### GET /users

Lista todos os usuários com paginação. **Acesso restrito a admin.**

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `role` (opcional): Filtrar por role (`admin` ou `student`)

**Exemplo:**
```
GET /users?page=1&limit=10&role=student
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "João Silva",
        "email": "joao@example.com",
        "role": "student",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

## 📖 Endpoints de Cursos

### GET /courses

Lista cursos com paginação e filtros. **Acesso público.**

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `category` (opcional): Filtrar por categoria
- `status` (opcional): Filtrar por status (`draft` ou `published`)
  - **Nota:** Usuários não-autenticados só veem cursos `published`
  - **Admin** pode ver todos os cursos
- `sort` (opcional): Ordenação (ex: `createdAt`, `-createdAt`)

**Exemplo:**
```
GET /courses?page=1&limit=10&category=nodejs&status=published&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "507f1f77bcf86cd799439011",
        "title": "Node.js Avançado",
        "description": "Curso completo de Node.js",
        "category": "nodejs",
        "status": "published",
        "instructor": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

### GET /courses/:id

Retorna detalhes de um curso específico. **Acesso público.**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Node.js Avançado",
      "description": "Curso completo de Node.js",
      "category": "nodejs",
      "status": "published",
      "instructor": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /courses

Cria um novo curso. **Acesso restrito a admin.**

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Request:**
```json
{
  "title": "Node.js Avançado",
  "description": "Curso completo de Node.js",
  "category": "nodejs",
  "status": "published",
  "instructor": null
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Curso criado com sucesso",
  "data": {
    "course": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Node.js Avançado",
      "description": "Curso completo de Node.js",
      "category": "nodejs",
      "status": "published",
      "instructor": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PATCH /courses/:id

Atualiza um curso. **Acesso restrito a admin.**

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Request:**
```json
{
  "title": "Node.js Avançado - Atualizado",
  "status": "published"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Curso atualizado com sucesso",
  "data": {
    "course": {
      "id": "507f1f77bcf86cd799439011",
      "title": "Node.js Avançado - Atualizado",
      "description": "Curso completo de Node.js",
      "category": "nodejs",
      "status": "published",
      "instructor": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### DELETE /courses/:id

Deleta um curso. **Acesso restrito a admin.**

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Curso deletado com sucesso"
}
```

---

## 🎓 Endpoints de Matrículas

### POST /courses/:courseId/enroll

Matricula o usuário autenticado em um curso. **Acesso restrito a student.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "success": true,
  "message": "Matrícula realizada com sucesso",
  "data": {
    "enrollment": {
      "id": "507f1f77bcf86cd799439011",
      "student": {
        "id": "507f1f77bcf86cd799439012",
        "name": "João Silva",
        "email": "joao@example.com"
      },
      "course": {
        "id": "507f1f77bcf86cd799439013",
        "title": "Node.js Avançado",
        "description": "Curso completo de Node.js",
        "category": "nodejs",
        "status": "published"
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Erros:**
- `400`: Já está matriculado neste curso
- `404`: Curso não encontrado

### GET /me/enrollments

Lista matrículas do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "enrollments": [
      {
        "id": "507f1f77bcf86cd799439011",
        "student": {
          "id": "507f1f77bcf86cd799439012",
          "name": "João Silva",
          "email": "joao@example.com"
        },
        "course": {
          "id": "507f1f77bcf86cd799439013",
          "title": "Node.js Avançado",
          "description": "Curso completo de Node.js",
          "category": "nodejs",
          "status": "published"
        },
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### DELETE /enrollments/:id

Cancela uma matrícula. O aluno pode cancelar apenas suas próprias matrículas. **Admin pode cancelar qualquer matrícula.**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Matrícula cancelada com sucesso"
}
```

**Erros:**
- `403`: Não tem permissão para cancelar esta matrícula
- `404`: Matrícula não encontrada

---

## 🔒 Regras de Negócio

### Autenticação e Autorização

- Senhas são armazenadas com hash (bcrypt)
- Senhas nunca são retornadas nas respostas
- Tokens JWT são necessários para rotas protegidas
- Admin tem acesso a todas as rotas administrativas
- Student só pode se matricular e ver suas próprias matrículas

### Cursos

- Cursos com `status: "draft"` não aparecem para usuários não-autenticados
- Admin pode ver todos os cursos (draft e published)
- Apenas admin pode criar, atualizar e deletar cursos

### Matrículas

- Não é possível matricular-se duas vezes no mesmo curso
- Aluno só vê suas próprias matrículas
- Aluno pode cancelar apenas suas próprias matrículas
- Admin pode cancelar qualquer matrícula

---

## 📁 Estrutura do Projeto

```
projeto_api_bruno/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do MongoDB
│   ├── controllers/
│   │   ├── authController.js    # Controllers de autenticação
│   │   ├── userController.js    # Controllers de usuários
│   │   ├── courseController.js  # Controllers de cursos
│   │   └── enrollmentController.js # Controllers de matrículas
│   ├── middlewares/
│   │   ├── auth.js              # Middleware de autenticação/autorização
│   │   └── errorHandler.js      # Middleware de tratamento de erros
│   ├── models/
│   │   ├── User.js              # Modelo de usuário
│   │   ├── Course.js            # Modelo de curso
│   │   └── Enrollment.js        # Modelo de matrícula
│   ├── routes/
│   │   ├── authRoutes.js        # Rotas de autenticação
│   │   ├── userRoutes.js        # Rotas de usuários
│   │   ├── courseRoutes.js      # Rotas de cursos
│   │   └── enrollmentRoutes.js  # Rotas de matrículas
│   └── server.js                # Arquivo principal do servidor
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```

---

## 🧪 Testando a API

### Exemplo com cURL

1. **Registrar usuário:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","email":"joao@example.com","password":"senha123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'
```

3. **Listar cursos:**
```bash
curl http://localhost:3000/courses
```

4. **Criar curso (admin):**
```bash
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token_admin>" \
  -d '{"title":"Node.js","description":"Curso de Node.js","category":"programming","status":"published"}'
```

5. **Matricular-se em curso:**
```bash
curl -X POST http://localhost:3000/courses/<courseId>/enroll \
  -H "Authorization: Bearer <token>"
```

### Exemplo com Postman/Insomnia

Importe as rotas e configure o token no header `Authorization: Bearer <token>`.

---

## 📝 Notas

- Para criar um usuário admin, você pode modificar diretamente no MongoDB ou criar um script de seed
- O token JWT expira em 7 dias por padrão (configurável via `JWT_EXPIRE`)
- Todas as respostas seguem o padrão JSON com `success` e `data`/`message`

---

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação baseada em tokens
- **bcryptjs** - Hash de senhas
- **express-validator** - Validação de dados

---

## 📄 Licença

ISC

