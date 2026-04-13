import bcrypt from 'bcryptjs';

const passwords = {
  admin: 'admin123',
  instructor1: 'instructor123',
  student1: 'student123'
};

console.log('Generate bcrypt hashes for passwords:\n');

for (const [username, password] of Object.entries(passwords)) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  console.log(`-- ${username} (${password})`);
  console.log(`UPDATE \`User\` SET \`password\` = '${hash}' WHERE \`username\` = '${username}';`);
  console.log('');
}
