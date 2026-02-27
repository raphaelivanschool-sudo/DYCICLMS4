const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const instructorPassword = await bcrypt.hash('instructor123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      fullName: 'System Administrator',
      email: 'admin@dyci.edu'
    }
  });
  console.log('Created admin user:', admin.username);

  // Create instructor users
  const instructor1 = await prisma.user.upsert({
    where: { username: 'instructor1' },
    update: {},
    create: {
      username: 'instructor1',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      fullName: 'Mr. Cruz',
      email: 'instructor1@dyci.edu'
    }
  });
  console.log('Created instructor user:', instructor1.username);

  const instructor2 = await prisma.user.upsert({
    where: { username: 'instructor' },
    update: {},
    create: {
      username: 'instructor',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      fullName: 'Ms. Santos',
      email: 'instructor@dyci.edu'
    }
  });
  console.log('Created instructor user:', instructor2.username);

  // Create student users
  const student1 = await prisma.user.upsert({
    where: { username: 'student1' },
    update: {},
    create: {
      username: 'student1',
      password: studentPassword,
      role: 'STUDENT',
      fullName: 'Juan Dela Cruz',
      email: 'student1@dyci.edu'
    }
  });
  console.log('Created student user:', student1.username);

  const student2 = await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      password: studentPassword,
      role: 'STUDENT',
      fullName: 'Maria Santos',
      email: 'student@dyci.edu'
    }
  });
  console.log('Created student user:', student2.username);

  // Create sample laboratory
  const lab = await prisma.laboratory.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'EdTech Laboratory',
      roomNumber: 'Lab 101',
      capacity: 30,
      status: 'ACTIVE'
    }
  });
  console.log('Created laboratory:', lab.name);

  // Create sample computers
  for (let i = 1; i <= 5; i++) {
    await prisma.computer.upsert({
      where: { id: i },
      update: {},
      create: {
        name: `PC-${i.toString().padStart(2, '0')}`,
        ipAddress: `192.168.1.${100 + i}`,
        macAddress: `00:1A:2B:3C:4D:${i.toString().padStart(2, '0')}`,
        status: 'ONLINE',
        laboratoryId: lab.id
      }
    });
  }
  console.log('Created 5 computers');

  // Create sample inventory items
  const inventoryItems = [
    { name: 'HDMI Cable', category: 'Cables', quantity: 10, unit: 'pieces', location: 'Storage A' },
    { name: 'USB Mouse', category: 'Peripherals', quantity: 15, unit: 'pieces', location: 'Storage B' },
    { name: 'Keyboard', category: 'Peripherals', quantity: 15, unit: 'pieces', location: 'Storage B' },
    { name: 'Projector Bulb', category: 'Components', quantity: 3, unit: 'pieces', location: 'Storage A' }
  ];

  for (let i = 0; i < inventoryItems.length; i++) {
    await prisma.inventory.upsert({
      where: { id: i + 1 },
      update: {},
      create: {
        ...inventoryItems[i],
        status: 'ACTIVE'
      }
    });
  }
  console.log('Created 4 inventory items');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
