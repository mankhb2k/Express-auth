// src/modules/roles/models/role.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../../../config/database.js';

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: true }
}, {
  timestamps: false,
  tableName: 'Roles',
});

export default Role;
