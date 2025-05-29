import User from '../models/user.model.js';
import Auth_User from '../../auth/models/auth_user.model.js';
import Role from '../../roles/models/role.model.js';

export const getAllUser = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName'],
      include: [{
        model: Auth_User,
        as: 'auth',
        attributes: ['email'],
        include: [{ model: Role, as: 'role', attributes: ['name'] }]
      }]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách người dùng' });
  }
};

// Nâng cấp role cho auth user
export const updateAuthUserRole = async (req, res) => {
  try {
    const { id } = req.params; // id của Auth_User
    const { roleName } = req.body;

    if (req.user.authUserId == id) {
      return res.status(400).json({ message: 'Không thể tự đổi vai trò bản thân.' });
    }

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) return res.status(400).json({ message: 'Role không tồn tại.' });

    const authUser = await Auth_User.findByPk(id);
    if (!authUser) return res.status(404).json({ message: 'Auth user không tồn tại.' });

    authUser.roleId = role.id;
    await authUser.save();

    res.status(200).json({ message: `Đã cập nhật role thành ${role.name}` });
  } catch (error) {
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật role' });
  }
};
