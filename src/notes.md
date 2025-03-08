Também implementei o dashboard do gerente, que estava faltando no sistema. Agora você tem um sistema completo com dashboards para todos os perfis de usuário.
Para testar, você pode fazer login com as credenciais que criamos no script de seed:
Condutor:
Email: condutor1@exemplo.com
Senha: 123456
Mecânico:
Email: mecanico1@exemplo.com
Senha: 123456
Gerente:
Email: gerente@exemplo.com
Senha: 123456

Para criar contas de gerente (manager) e mecânico (mechanic), você tem duas opções:

## Opção 1: Usar as contas pré-criadas pelo script de seed

Quando executamos o script de seed, criamos algumas contas para teste, incluindo gerentes e mecânicos. Você pode usar essas contas para fazer login:

### Contas de Gerente:
- **Email**: gerente@exemplo.com
- **Senha**: 123456

### Contas de Mecânico:
- **Email**: mecanico1@exemplo.com
- **Senha**: 123456
- **Email**: mecanico2@exemplo.com
- **Senha**: 123456

Basta acessar a página de login (http://localhost:3000/login) e inserir essas credenciais.

## Opção 2: Criar novas contas manualmente no banco de dados

Se você quiser criar novas contas de gerente ou mecânico, precisará fazer isso diretamente no banco de dados, pois o formulário de registro padrão cria apenas contas de condutor. Aqui está como fazer isso:

1. Primeiro, vamos criar um script para adicionar um novo usuário com a função desejada:

```javascript:scripts/create-user.js
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

// Parâmetros para o novo usuário
const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];
const role = process.argv[5]; // 'MANAGER' ou 'MECHANIC'

if (!name || !email || !password || !role) {
  console.error('Uso: node scripts/create-user.js "Nome Completo" "email@exemplo.com" "senha" "MANAGER|MECHANIC"');
  process.exit(1);
}

if (role !== 'MANAGER' && role !== 'MECHANIC') {
  console.error('A função deve ser MANAGER ou MECHANIC');
  process.exit(1);
}

async function createUser() {
  try {
    // Verificar se o email já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error(`O email ${email} já está em uso.`);
      process.exit(1);
    }

    // Criptografar a senha
    const hashedPassword = await hash(password, 10);

    // Criar o usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    console.log(`Usuário criado com sucesso!`);
    console.log(`Nome: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Função: ${user.role}`);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
```
2. Agora, vamos criar um script para atualizar a função de um usuário existente:

```javascript:scripts/update-user-role.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Parâmetros para atualizar o usuário
const email = process.argv[2];
const role = process.argv[3]; // 'MANAGER', 'MECHANIC' ou 'DRIVER'

if (!email || !role) {
  console.error('Uso: node scripts/update-user-role.js "email@exemplo.com" "MANAGER|MECHANIC|DRIVER"');
  process.exit(1);
}

if (role !== 'MANAGER' && role !== 'MECHANIC' && role !== 'DRIVER') {
  console.error('A função deve ser MANAGER, MECHANIC ou DRIVER');
  process.exit(1);
}

async function updateUserRole() {
  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      console.error(`Usuário com email ${email} não encontrado.`);
      process.exit(1);
    }

    // Atualizar a função do usuário
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });

    console.log(`Função do usuário atualizada com sucesso!`);
    console.log(`Nome: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Nova função: ${user.role}`);
  } catch (error) {
    console.error('Erro ao atualizar função do usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
```
3. Vamos atualizar o arquivo package.json para adicionar scripts para criar e atualizar usuários:

```json:package.json
{
  "name": "assistencia-rodoviaria",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "ts-node prisma/seed.ts",
    "create-user": "node scripts/create-user.js",
    "update-role": "node scripts/update-user-role.js"
  },
  "dependencies": {
    "@hookform/resolvers": "^4.1.3",
    "@prisma/client": "^6.4.1",
    "axios": "^1.8.2",
    "bcrypt": "^5.1.1",
    "next": "15.2.1",
    "next-auth": "^4.24.11",
    "prisma": "^6.4.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/postcss": "^4",
    "@types/bcrypt": "^5.0.2",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.2.1",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  },
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```
Agora você tem duas maneiras de criar contas de gerente e mecânico:

## Como usar os scripts:

### 1. Para criar um novo usuário com função específica:

```bash
npm run create-user "Nome do Gerente" "gerente@exemplo.com" "senha123" "MANAGER"
```

ou

```bash
npm run create-user "Nome do Mecânico" "mecanico@exemplo.com" "senha123" "MECHANIC"
```

### 2. Para atualizar a função de um usuário existente:

Se você já criou um usuário como condutor (DRIVER) através do formulário de registro e deseja promovê-lo a gerente ou mecânico:

```bash
npm run update-role "email-existente@exemplo.com" "MANAGER"
```

ou

```bash
npm run update-role "email-existente@exemplo.com" "MECHANIC"
```

## Resumo:

1. **Usar contas pré-criadas**:
   - Gerente: gerente@exemplo.com / 123456
   - Mecânico: mecanico1@exemplo.com / 123456
   - Mecânico: mecanico2@exemplo.com / 123456

2. **Criar novas contas**:
   - Use o script `npm run create-user` para criar um novo usuário com função específica
   - Use o script `npm run update-role` para atualizar a função de um usuário existente

Depois de criar ou atualizar as contas, você pode fazer login normalmente através da página de login (http://localhost:3000/login) e será redirecionado para o dashboard correspondente à função do usuário.
