const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Criar tipos de problemas
  const problemTypes = [
    { name: 'Pneu furado', description: 'Problema com pneu furado ou danificado' },
    { name: 'Motor não liga', description: 'Problemas para dar partida no motor' },
    { name: 'Bateria descarregada', description: 'Bateria sem carga ou com problemas' },
    { name: 'Superaquecimento', description: 'Motor superaquecendo' },
    { name: 'Problema elétrico', description: 'Problemas com o sistema elétrico do veículo' },
    { name: 'Problema de freios', description: 'Problemas com o sistema de freios' },
    { name: 'Problema de transmissão', description: 'Problemas com a transmissão do veículo' },
    { name: 'Outro', description: 'Outros problemas não listados' },
  ];

  for (const problemType of problemTypes) {
    await prisma.problemType.upsert({
      where: { name: problemType.name },
      update: {},
      create: problemType,
    });
  }

  console.log('Tipos de problemas criados com sucesso!');

  // Criar usuários
  const hashedPassword = await hash('123456', 10);

  // Criar gerente
  await prisma.user.upsert({
    where: { email: 'gerente@exemplo.com' },
    update: {},
    create: {
      name: 'Gerente',
      email: 'gerente@exemplo.com',
      password: hashedPassword,
      role: 'MANAGER',
    },
  });

  // Criar mecânicos
  await prisma.user.upsert({
    where: { email: 'mecanico1@exemplo.com' },
    update: {},
    create: {
      name: 'Mecânico 1',
      email: 'mecanico1@exemplo.com',
      password: hashedPassword,
      role: 'MECHANIC',
    },
  });

  await prisma.user.upsert({
    where: { email: 'mecanico2@exemplo.com' },
    update: {},
    create: {
      name: 'Mecânico 2',
      email: 'mecanico2@exemplo.com',
      password: hashedPassword,
      role: 'MECHANIC',
    },
  });

  // Criar condutores
  await prisma.user.upsert({
    where: { email: 'condutor1@exemplo.com' },
    update: {},
    create: {
      name: 'Condutor 1',
      email: 'condutor1@exemplo.com',
      password: hashedPassword,
      role: 'DRIVER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'condutor2@exemplo.com' },
    update: {},
    create: {
      name: 'Condutor 2',
      email: 'condutor2@exemplo.com',
      password: hashedPassword,
      role: 'DRIVER',
    },
  });

  console.log('Usuários criados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 