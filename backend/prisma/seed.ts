/* eslint-disable no-console */
import { PrismaClient, UserRole, UserStatus, Campus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.user.deleteMany();

  // Hash passwords
  const adminPassword = await hashPassword('Admin@123');
  const presidentPassword = await hashPassword('President@123');
  const vpPassword = await hashPassword('VicePresident@123');
  const directorPassword = await hashPassword('Director@123');
  const officeHeadPassword = await hashPassword('OfficeHead@123');

  // Create Admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@university.edu',
      username: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      campus: Campus.TALISAY,
      department: 'IT Department',
      profilePic: 'no-photo.png',
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  // Create President user
  const president = await prisma.user.create({
    data: {
      email: 'president@university.edu',
      username: 'president',
      firstName: 'James',
      lastName: 'Wilson',
      password: presidentPassword,
      role: UserRole.PRESIDENT,
      status: UserStatus.ACTIVE,
      campus: Campus.TALISAY,
      department: 'Executive Office',
      profilePic: 'no-photo.png',
    },
  });
  console.log(`✅ Created president: ${president.email}`);

  // Create Vice President user
  const vicePresident = await prisma.user.create({
    data: {
      email: 'vp.academic@university.edu',
      username: 'vp_academic',
      firstName: 'Maria',
      lastName: 'Santos',
      password: vpPassword,
      role: UserRole.VICE_PRESIDENT,
      status: UserStatus.ACTIVE,
      campus: Campus.TALISAY,
      department: 'Academic Affairs',
      profilePic: 'no-photo.png',
    },
  });
  console.log(`✅ Created vice president: ${vicePresident.email}`);

  // Create Director user (under Vice President)
  const director = await prisma.user.create({
    data: {
      email: 'director.cs@university.edu',
      username: 'director_cs',
      firstName: 'John',
      lastName: 'Smith',
      password: directorPassword,
      role: UserRole.DIRECTOR,
      status: UserStatus.ACTIVE,
      campus: Campus.TALISAY,
      department: 'Computer Science',
      departmentId: 'DEPT-CS-001',
      vicePresidentId: vicePresident.id.toString(),
      vicePresidentName: `${vicePresident.firstName} ${vicePresident.lastName}`,
      profilePic: 'no-photo.png',
    },
  });
  console.log(`✅ Created director: ${director.email}`);

  // Create Office Head user (under Director)
  const officeHead = await prisma.user.create({
    data: {
      email: 'officehead.cs@university.edu',
      username: 'officehead_cs',
      firstName: 'Jane',
      lastName: 'Doe',
      password: officeHeadPassword,
      role: UserRole.OFFICE_HEAD,
      status: UserStatus.PENDING,
      campus: Campus.TALISAY,
      department: 'Computer Science',
      departmentId: 'DEPT-CS-001',
      vicePresidentId: vicePresident.id.toString(),
      vicePresidentName: `${vicePresident.firstName} ${vicePresident.lastName}`,
      directorId: director.id.toString(),
      directorName: `${director.firstName} ${director.lastName}`,
      profilePic: 'no-photo.png',
    },
  });
  console.log(`✅ Created office head: ${officeHead.email}`);

  // Create additional Office Head user (different campus)
  const officeHead2 = await prisma.user.create({
    data: {
      email: 'officehead.it@university.edu',
      username: 'officehead_it',
      firstName: 'Robert',
      lastName: 'Johnson',
      password: officeHeadPassword,
      role: UserRole.OFFICE_HEAD,
      status: UserStatus.ACTIVE,
      campus: Campus.BINALBAGAN,
      department: 'Information Technology',
      departmentId: 'DEPT-IT-001',
      profilePic: 'no-photo.png',
    },
  });
  console.log(`✅ Created office head: ${officeHead2.email}`);

  console.log('');
  console.log('📊 Seed Summary:');
  console.log('   - 1 Admin');
  console.log('   - 1 President');
  console.log('   - 1 Vice President');
  console.log('   - 1 Director');
  console.log('   - 2 Office Heads');
  console.log('');
  console.log('🔐 Default Passwords:');
  console.log('   - Admin: Admin@123');
  console.log('   - President: President@123');
  console.log('   - Vice President: VicePresident@123');
  console.log('   - Director: Director@123');
  console.log('   - Office Heads: OfficeHead@123');
  console.log('');
  console.log('🌱 Database seed completed!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
