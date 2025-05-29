import sequelize from '../config/database.js';
import Role from '../modules/roles/models/role.model.js';
import Auth_User from '../modules/auth/models/auth_user.model.js';
import User from '../modules/users/models/user.model.js';
import bcrypt from 'bcrypt';

const seed = async () => {
  await sequelize.sync({ force: true }); // Reset DB

  // Seed roles
  const [admin, editor, userRole] = await Promise.all([
    Role.create({ name: 'admin', description: 'Quản trị viên' }),
    Role.create({ name: 'editor', description: 'Biên tập viên' }),
    Role.create({ name: 'user', description: 'Người dùng thường' })
  ]);

  // Seed auth users
  const hash = await bcrypt.hash('123456', 10);
  const adminAuth = await Auth_User.create({ email: 'admin@site.com', password: hash, roleId: admin.id });
  const editorAuth = await Auth_User.create({ email: 'editor@site.com', password: hash, roleId: editor.id });
  const userAuth = await Auth_User.create({ email: 'user@site.com', password: hash, roleId: userRole.id });

  // Seed user profile
  await User.create({ firstName: 'Admin', lastName: 'Master', authUserId: adminAuth.id });
  await User.create({ firstName: 'Ed', lastName: 'Itor', authUserId: editorAuth.id });
  await User.create({ firstName: 'Normal', lastName: 'User', authUserId: userAuth.id });

  console.log('Seeded roles, auth_users, and users!');
  process.exit();
};

seed();
