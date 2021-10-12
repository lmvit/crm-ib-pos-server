const express = require('express');
const cors = require('cors');
const app = express();
const path =require('path');
const Database = require('./Database');
const posLoginRoutes = require('./routes/login-route');
const posCustomerRoutes = require('./routes/customer-routes');
const lifeTransactions = require('./routes/life_transactions');
const generalTransactions = require('./routes/general_transactions');
const InsuranceReports = require('./routes/pos-reports');
const renewalReports = require('./routes/renewal-reports');
const payouts = require('./routes/payouts');
const authorization = require('./verifyToken');
const otpAuthentication = require('./routes/auth');

const client = Database.DB;
Database.Connect();
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit: '100mb',extended:true}));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/pos/login',posLoginRoutes);
app.use('/api/pos/customer',authorization,posCustomerRoutes);
app.use('/api/life-transactions',authorization,lifeTransactions);
app.use('/api/general-transactions',authorization,generalTransactions);
app.use('/api/pos/reports',authorization,InsuranceReports);
app.use('/api/pos/renewal',authorization,renewalReports);
app.use('/api/payouts',authorization,payouts);
app.use('/api/otp-auth',authorization,otpAuthentication);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  

app.listen(process.env.PORT || 8080, function () {
  console.log(`Application listening on ${process.env.PORT || 8080}`);
});

module.exports = client;