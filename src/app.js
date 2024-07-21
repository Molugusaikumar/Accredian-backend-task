const express = require('express');
const cors = require('cors');
const referralRoutes = require('./routes/referral');
const errorHandler = require('./middleware/errorHandlers');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/referrals', referralRoutes);
app.use(errorHandler);

module.exports = app;
