import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email, resetLink) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Đặt lại mật khẩu',
    html: `
      <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>
      <p>Nhấn vào đây để đặt lại mật khẩu: <a href="${resetLink}">${resetLink}</a></p>
      <p>Liên kết sẽ hết hạn sau 1 giờ.</p>
    `,
  });
};
