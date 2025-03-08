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