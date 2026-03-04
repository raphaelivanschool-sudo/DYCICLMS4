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

  // Create sample messages between users
  const sampleMessages = [
    {
      content: 'Hello! Welcome to the EdTech Lab.',
      senderId: instructor1.id,
      receiverId: student1.id,
      status: 'READ'
    },
    {
      content: 'Hi sir, thank you! When is the next lab session?',
      senderId: student1.id,
      receiverId: instructor1.id,
      status: 'READ'
    },
    {
      content: 'It will be tomorrow at 2 PM. Please bring your laptop.',
      senderId: instructor1.id,
      receiverId: student1.id,
      status: 'DELIVERED'
    },
    {
      content: 'Got it! See you tomorrow.',
      senderId: student1.id,
      receiverId: instructor1.id,
      status: 'SENT'
    },
    {
      content: 'Hi Maria, can you help me with the React assignment?',
      senderId: student1.id,
      receiverId: student2.id,
      status: 'READ'
    },
    {
      content: 'Sure! Let us meet in the library after class.',
      senderId: student2.id,
      receiverId: student1.id,
      status: 'DELIVERED'
    }
  ];

  for (const msg of sampleMessages) {
    await prisma.message.create({
      data: msg
    });
  }
  console.log('Created sample messages');

  // Create a sample group for BSIT 3A
  const group = await prisma.group.create({
    data: {
      name: 'BSIT 3A - Programming Class',
      description: 'Group for BSIT 3A Programming discussions and announcements',
      createdBy: instructor1.id,
      members: {
        create: [
          { userId: instructor1.id, role: 'ADMIN' },
          { userId: instructor2.id, role: 'MEMBER' },
          { userId: student1.id, role: 'MEMBER' },
          { userId: student2.id, role: 'MEMBER' }
        ]
      }
    }
  });
  console.log('Created sample group:', group.name);

  // Add a group message
  await prisma.message.create({
    data: {
      content: 'Welcome everyone to our class group! Feel free to ask questions here.',
      senderId: instructor1.id,
      groupId: group.id,
      status: 'READ'
    }
  });
  console.log('Created sample group message');

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
