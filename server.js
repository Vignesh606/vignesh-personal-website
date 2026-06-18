const express = require('express');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Serve static assets directly from public context
app.use(express.static(path.join(__dirname, 'public')));

// Fallback logic route targeting layout page index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Mail Processing Endpoint Core Handle 
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    // Validate payloads early to avoid server abuse
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Missing mandatory payload field components.' });
    }

    // Configure Mailer Infrastructure
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: email,
        to: process.env.EMAIL_USER,
        subject: `💼 Portfolio Contact Signal from ${name}`,
        text: `Sender Identity: ${name}\nContact Point: ${email}\n\nPayload Description:\n${message}`,
        replyTo: email
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Data packet successfully routed to mail coordinator destination.' });
    } catch (error) {
        console.error('Mail system fault anomaly encountered:', error);
        return res.status(500).json({ error: 'Upstream transit infrastructure timed out. Please try later.' });
    }
});

// Only listen locally; Vercel will handle execution in production
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`[SYSTEM RUNNING] Server active on port: ${PORT}`);
    });
}

// CRITICAL: Export the app for Vercel's serverless environment
module.exports = app;
