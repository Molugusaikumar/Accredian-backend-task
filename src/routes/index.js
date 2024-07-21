const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const prisma = new PrismaClient();
app.use(bodyParser.json());

const oauth2Client = new OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'YOUR_REDIRECT_URL'
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

  // creating the post request
app.post('/referrals', async (req, res) => {
  const { name, email, referralCode } = req.body;

  if (!name || !email || !referralCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
   
  // saving the data in the database 
  try {
    const referral = await prisma.referral.create({
      data: {
        name,
        email,
        referralCode,
      },
    });

    await sendReferralEmail(email, referralCode);

    res.status(201).json(referral);
  } catch (error) {
    if (error.code === 'P2002' && error.meta.target.includes('email')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

const sendReferralEmail = async (toEmail, referralCode) => {
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  const emailContent = `
    Congratulations! You have been referred with the referral code: ${referralCode}. Enjoy!
  `;

  const rawMessage = createRawMessage('your-email@example.com', toEmail, 'You\'ve Been Referred!', emailContent);

  await gmail.users.messages.send({
    userId: 'me',
    resource: {
      raw: rawMessage,
    },
  });
};

const createRawMessage = (from, to, subject, message) => {
  const encodedMessage = Buffer.from(
    `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${message}`
  ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return encodedMessage;
};

app.get('/auth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send('Authentication successful! You can close this window.');
});

module.exports = router;
