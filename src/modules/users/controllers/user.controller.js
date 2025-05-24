import User from '../../auth/models/auth_user.model.js'; // Sửa đường dẫn

export const getAllUser = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email'],
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy danh sách người dùng' });
  }
};