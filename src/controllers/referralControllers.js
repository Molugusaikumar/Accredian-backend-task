const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const emailService = require('../services/emailService');

exports.createReferral = async (req, res, next) => {
  const { name, email, phone, referredBy } = req.body;

  if (!name || !email || !phone || !referredBy) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: { name, email, phone, referredBy }
    });

    await emailService.sendReferralEmail(email, name);

    res.status(201).json(referral);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
};
