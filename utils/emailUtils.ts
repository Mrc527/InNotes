import nodemailer from 'nodemailer'; // Import nodemailer

export async function sendEmail(targetAddress: string, subject: string, message: string) {
  if (!process.env.ICLOUD_PASSWORD){
    console.log("Skipping email send: no env set.")
    return;
  }
  console.log(`Sending welcome email to ${targetAddress}`);
  // Example using Nodemailer (install it with `npm install nodemailer`):

  const transporter = nodemailer.createTransport({
    // Configure your targetAddress service here
    service: 'iCloud', // Use iCloud as the service
    host: 'smtp.mail.me.com', // iCloud SMTP server
    port: 587, // or 465 for SSL
    secure: false, // Use `true` for port 465, `false` for other ports
    auth: {
      user: 'm.visin@icloud.com', // Replace with your iCloud targetAddress
      pass: process.env.ICLOUD_PASSWORD // Replace with your iCloud password or app-specific password
    }
  });

  const mailOptions = {
    from: 'info@innotes.me', // Replace with your iCloud targetAddress
    to: targetAddress,
    subject: subject,
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome targetAddress sent successfully');
  } catch (error) {
    console.error('Error sending welcome targetAddress:', error);
    throw new Error('Failed to send welcome targetAddress'); // Re-throw to be caught in POST
  }
}
