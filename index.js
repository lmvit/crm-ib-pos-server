const express = require('express');
const cors = require('cors');
const app = express();
const path =require('path');
const Database = require('./Database');
const posLoginRoutes = require('./routes/login-route');
const posCustomerRoutes = require('./routes/customer-routes');
// const posLifeInsurancTransactionRoutes = require('./routes/life-insurance-transaction');
const lifeTransactions = require('./routes/life_transactions');
const generalTransactions = require('./routes/general_transactions');
// const lifeInsuranceReports = require('./routes/life_insurance_reports');
const { transactions  } = require('./routes/transactions')
const client = Database.DB;
Database.Connect();
app.use(express.json({limit:'100mb'}));
app.use(express.urlencoded({limit: '100mb',extended:true}));

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/api/pos/login',posLoginRoutes);
app.use('/api/pos/customer',posCustomerRoutes);
// app.use('/api/pos/lifeInsuranceTransaction',posLifeInsurancTransactionRoutes);
app.use('/api/life-transactions',lifeTransactions);


app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  

app.listen(process.env.PORT || 5000, function () {
  console.log(`Application listening on ${process.env.PORT || 5000}`);
});

module.exports = client;