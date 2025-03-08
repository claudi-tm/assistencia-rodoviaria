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