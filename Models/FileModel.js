const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const fileSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    imageUrl:{
        type:String,
    },
    tags:{
        type:String,
    },
    email:{
        type:String,
    }
});

// Post Middleware
fileSchema.post("save", async function (doc) {
  try {
    console.log(doc);

    // 1️⃣ Create transporter
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // smtp.gmail.com
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // 2️⃣ Send mail
    let info = await transporter.sendMail({
      from: `"File Upload App" <${process.env.MAIL_USER}>`,
      to: doc.email,               
      subject: "File Uploaded Successfully",
      html: `<p>Your file <b>${doc.name}</b> has been uploaded on Cloudinary.</p>`,
    });

    console.log("Mail sent:", info.messageId);
  } catch (err) {
    console.log(err);
  }
});

const File = mongoose.model("File",fileSchema);
module.exports = File;
