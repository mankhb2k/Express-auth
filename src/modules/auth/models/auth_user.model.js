import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Role from '../../roles/models/role.model.js';

const Auth_User = sequelize.define('Auth_User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Role, key: 'id' }
  },
  resetToken: { type: DataTypes.STRING, allowNull: true },
  resetTokenExpiry: { type: DataTypes.DATE, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  provider: { type: DataTypes.STRING, allowNull: true },
  providerId: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: true,
  tableName: 'Auth_Users',
});

Auth_User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

export default Auth_User;
