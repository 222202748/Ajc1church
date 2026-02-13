const nodemailer = require('nodemailer');

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email options
    const mailOptions = {
      from: email,
      to: process.env.CHURCH_EMAIL,
      subject: `Contact Form Message from ${name}`,
      text: message,
      html: `
        <h3>Contact Form Message</h3>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Email sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};