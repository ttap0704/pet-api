import * as nodemailer from 'nodemailer'

interface SendEmailType {
  to_name: string;
  to: string;
  subject: string;
  message: string;
}

class EmailService {
  async sendEmail(data: SendEmailType) {
    return new Promise((resolve, reject) => {
      const { to_name, to, subject, message } = data
      const smtpTransport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail=.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD
        }
      });
      const mailOption = {
        from: {
          name: '테스트', // 보내는 사람 이름
          address: `${process.env.EMAIL_ADDRESS}` // 보내는 사람 이메일 주소
        },
        to: {
          name: to_name, // 받는 사람 아름
          address: to // 받는 사람 이메일 주소
        },
        subject, // 메일 제목
        html: message // 메일 메시지
      };
      smtpTransport.sendMail(mailOption, (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    })
  }
}

export default EmailService;
