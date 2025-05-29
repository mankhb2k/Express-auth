import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';
import Auth_User from '../../auth/models/auth_user.model.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  authUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Auth_User, key: 'id' },
    unique: true,
  },
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  fullName: {
    type: DataTypes.VIRTUAL,
    get() { return `${this.firstName || ''} ${this.lastName || ''}`.trim(); },
    set(value) { throw new Error('fullName là trường ảo và không thể gán giá trị trực tiếp'); }
  },
  phone: DataTypes.STRING,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  country: DataTypes.STRING,
  birthday: DataTypes.DATE,
  gender: DataTypes.STRING,
  avatar: DataTypes.STRING,
  bio: DataTypes.TEXT,
  website: DataTypes.STRING,
  lastLogin: DataTypes.DATE,
  devicelogin: DataTypes.STRING,
  checkIP: DataTypes.STRING,
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING, allowNull: true },
  verificationTokenExpiry: { type: DataTypes.DATE, allowNull: true },
  provider: DataTypes.STRING,
  providerId: DataTypes.STRING,
}, {
  timestamps: true,
  tableName: 'Users',
});

User.belongsTo(Auth_User, { foreignKey: 'authUserId', as: 'auth' });

export default User;
