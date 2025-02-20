import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Function to send Register OTP via email
export const sendOtpToEmail = async (email, otp) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS,
      },
    });

    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #444; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
        <h2 style="text-align: center; color: #333;">Welcome to LiZ Fashions!</h2>
        <p style="font-size: 16px; text-align: center;">Thank you for registering with us. Please use the following OTP to complete your registration:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #666;">
          This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} LiZ Fashions. All rights reserved.
        </p>
      </div>
    `;

    // Mail options
    const mailOptions = {
      from: `LiZ Fashions - <${process.env.NOREPLY_EMAIL_USER}>`,
      to: email, // Recipient's email
      subject: "Your OTP for Registration - LiZ Fashions",
      html: htmlContent, // The OTP content in HTML format
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

// Function to send forgot pass OTP via email

export const sendForgotOtpToEmail = async (email, otp) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS,
      },
    });

    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #444; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
        <h2 style="text-align: center; color: #333;">Hello From LiZ Fashions!</h2>
        <p style="font-size: 16px; text-align: center;">Forgot your password? No worries! We've got your back. Please use the following OTP to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #666;">
          This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} LiZ Fashions. All rights reserved.
        </p>
      </div>
    `;

    // Mail options
    const mailOptions = {
      from: `LiZ Fashions <${process.env.NOREPLY_EMAIL_USER}>`,
      to: email, // Recipient's email
      subject: "OTP for Password Reset - LiZ Fashions",
      html: htmlContent, // The OTP content in HTML format
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

// Function to send Delivered via email
export const sendStatusToEmail = async (email, orderId, name, status) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS,
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
            <a href="https://lizfashions.store/dashboard/user/orders/${orderId}"><button>Click here review</button></a>
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
      from: `LiZFashions - <${process.env.NOREPLY_EMAIL_USER}>`, // Sender's email
      to: email, // Recipient's email
      subject: `Delivery of Order #LF${orderId} at LiZ Fashions`,
      html: emailContent, // HTML email content
    };
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("email sent to:", email);
  } catch (error) {
    console.error("Error sending status email:", error);
    throw new Error("Failed to send status");
  }
};

// Function to Confirm Order via email
export const sendOrderCorfirmationToEmail = async (email, name, orderId) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.SALES_EMAIL_USER, // Your email address
        pass: process.env.SALES_EMAIL_PASS, // Your email password or app-specific password
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
          .tracking-btn{
            text-decoration:none;
            color:white;
          }
          .tracking-btn button{
            background:rgb(0, 106, 4);
            color:white;
            padding:8px;
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
            <p><span class="status">Order ID: #LF${orderId}</span></p>
            <p><span class="status">Track Your Order Here 👇.</span></p>
            <a class="tracking-btn" href="https://lizfashions.store/dashboard/user/orders/${orderId}"><button>Click Here To Track</button></a>
            <p><span class="status">We are processing your order.</span></p>
            <p>If you want to cancel this order, Reply to this mail or talk to support.</p>
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
      from: `LiZ Fashions <${process.env.SALES_EMAIL_USER}>`, // Sender's email
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

// Function to Confirm Order via email
export const sendContactEmail = async (
  name,
  email,
  phone,
  subject,
  message
) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.SUPPORT_EMAIL_USER, // Your email address
        pass: process.env.SUPPORT_EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // HTML template with dynamic content
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Need Support</title>
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
          .tracking-btn{
            text-decoration:none;
            color:white;
          }
          .tracking-btn button{
            background:rgb(0, 106, 4);
            color:white;
            padding:8px;
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
          <h1>Need Assistance on the following matter.</h1>
          <p>Hello, I am ${name}, my email is ${email}, my phone no. is ${phone}</p>
          <p>Hi I am concerned about "${subject}".</p>
          <div class="order-details">
            <p class="order-id"></p>
            <p><span class="status">${message}</span></p>
          </div>
          <div class="footer">
            <p>&copy; 2025 LiZ Fashions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `${name} <${process.env.SUPPORT_EMAIL_USER}>`, // Sender's email
      to: [process.env.SUPPORT_EMAIL_USER, "sabbir183023@yahoo.com"], // Recipient's email
      subject: `${subject}`,
      html: emailContent, // HTML email content
    };
    // Send the email
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending confirming email:", error);
    throw new Error("Failed to confirm order");
  }
};

// Function to send newsletter via email
export const sendNewsletterToEmail = async (emails, blog) => {
  try {
    // Set up the transporter for Gmail or your preferred email service
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NEWSLETTER_EMAIL_USER, // Your email address
        pass: process.env.NEWSLETTER_EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // HTML template with dynamic content and blog image
    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LiZ Fashions Newsletter</title>
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
          .header {
            text-align: center;
            padding-bottom: 15px;
          }
          .header img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
          h1 {
            color: #333333;
            font-size: 24px;
            text-align: center;
          }
          .content {
            color: #555;
            line-height: 1.5;
            padding: 0 15px;
          }
          .blog-image {
            width: 100%;
            max-width: 500px;
            height: auto;
            border-radius: 8px;
            display: block;
            margin: 15px auto;
          }
          .cta-button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 12px;
            text-align: center;
            background-color: #008000;
            color: white;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
          }
          .unsubscribe{
            color:"blue";
            text-decoration:"underline";
            font-size:"10px";
            text-align:"center";
          } 
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>LiZ Fashions Newsletter</h1>
          </div>
          ${
            blog?.photo?.url
              ? `<img src="${blog.photo.url}" alt="Blog Image" class="blog-image" />`
              : ""
          }
          <div class="content">
            <h2>${blog?.title}</h2>
            ${blog?.content}
          </div>
          <a href="https://lizfashions.store/blog" class="cta-button">Read More</a>
          <div class="footer">
            <p>&copy; 2025 LiZ Fashions. All rights reserved.</p>
            <a href="https://lizfashions.store/unsubscribenewsletter" class="unsubscribe">Unsubscribe</a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Mail options
    const mailOptions = {
      from: `LizFashions-Newsletter<${process.env.NEWSLETTER_EMAIL_USER}>`, // Sender's email
      to: emails, // Recipient's email (Array of emails or single email)
      subject: `${blog?.title} - LiZ Fashions`,
      html: emailContent, // HTML email content
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Newsletter sent successfully!");
  } catch (error) {
    console.error("Error sending newsletter email:", error);
    throw new Error("Failed to send newsletter");
  }
};
