import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Tải biến môi trường từ .env

// Cấu hình transporter cho Nodemailer
// Bạn cần thay thế các giá trị này bằng thông tin SMTP của nhà cung cấp email của bạn
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,    // Ví dụ: 'smtp.gmail.com' cho Gmail
    port: process.env.EMAIL_PORT,    // Ví dụ: 587 cho TLS, 465 cho SSL
    secure: process.env.EMAIL_SECURE === 'true', // true nếu port là 465 (SSL), false cho các port khác (TLS)
    auth: {
        user: process.env.EMAIL_USER,   // Địa chỉ email của bạn
        pass: process.env.EMAIL_PASS,   // Mật khẩu email hoặc mật khẩu ứng dụng (app password)
    },
});


export const sendPasswordResetEmail = async (email, resetLink) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,  // Địa chỉ email người gửi (ví dụ: 'noreply@yourdomain.com')
            to: email,                     // Địa chỉ email người nhận
            subject: 'Yêu cầu đặt lại mật khẩu của bạn', // Tiêu đề email
            html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
        <p>Vui lòng nhấp vào liên kết sau để đặt lại mật khẩu: <a href="${resetLink}">${resetLink}</a></p>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `, // Nội dung email dưới dạng HTML
        });
        console.log(`Email đặt lại mật khẩu đã được gửi đến: ${email}`);
    } catch (error) {
        console.error(`Lỗi khi gửi email đặt lại mật khẩu đến ${email}:`, error);
        // Trong môi trường thực tế, bạn có thể muốn xử lý lỗi này một cách tinh vi hơn,
        // ví dụ: ghi log lỗi, thông báo cho quản trị viên, v.v., nhưng không làm crash ứng dụng.
    }
};