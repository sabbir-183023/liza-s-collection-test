import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Function to send OTP via email
export const sendOtpToEmail = async (email, otp) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email
      to: email, // Recipient's email
      subject: "Registration at LiZ Fashions",
      text: ` Your OTP for registering with us is: ${otp}`, // The OTP content of the email
    };

    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

// Function to send Status via email
export const sendStatusToEmail = async (email, orderId, name, status) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // HTML template with dynamic content
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333333;
            font-size: 24px;
            text-align: center;
          }
          .order-details {
            background-color: #f9f9f9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .order-details a button{
            border:none;
            background:blue;
            border-radius:8px;
            color:white;
            padding:5px;
          }
          .order-id {
            font-weight: bold;
          }
          .status {
            color: #4CAF50;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>Product Delivered</h1>
          <p>Hello ${name},</p>
          <p>We wanted to let you know that your order #LF${orderId} at LiZ Fashions has been ${status}</p>
          <div class="order-details">
            <p class="order-id">Order ID: #LC${orderId}</p>
            <p>Status: <span class="status">${status}</span></p>
            <p>Feel free to give the product a review so that others can purchase easily</p>
            <a href="https://lizfashions.freewebhostmost.com/"><button>Click here review</button></a>
          </div>
          <p>Thank you for shopping with us! If you have any questions, feel free to contact us.</p>
          <div class="footer">
            <p>&copy; 2025 LiZ Fashions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email
      to: email, // Recipient's email
      subject: `Update on your order #LC${orderId} at LiZ Fashions`,
      html: emailContent, // HTML email content
    };
    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending status email:", error);
    throw new Error("Failed to send status");
  }
};

// Function to Confirm Order via email
export const sendOrderCorfirmationToEmail = async (email, name) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // HTML template with dynamic content
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Received</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            margin: 0;
            padding: 0;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #333333;
            font-size: 24px;
            text-align: center;
          }
          .order-details {
            background-color: #f9f9f9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .order-id {
            font-weight: bold;
          }
          .status {
            color: #4CAF50;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>Order Received</h1>
          <p>Hello ${name},</p>
          <p>We wanted to thank you for ordering at LiZ Fashions. We have received your order.</p>
          <div class="order-details">
            <p class="order-id"></p>
            <p><span class="status">We are processing your order.</span></p>
          </div>
          <p>Thank you for shopping with us! If you have any questions, feel free to contact us.</p>
          <div class="footer">
            <p>&copy; 2025 LiZ Fashions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender's email
      to: [email, "sabbir183023@yahoo.com"], // Recipient's email
      subject: `Order Received - LiZ Fashions`,
      html: emailContent, // HTML email content
    };
    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending confirming email:", error);
    throw new Error("Failed to confirm order");
  }
};
