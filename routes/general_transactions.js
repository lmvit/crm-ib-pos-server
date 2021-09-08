var router = require('express').Router();
const DataBase = require('../Database');
const format = require('date-fns/format');
const { getDependentEmployees, queryFunction,getRenwalDate,getRenewalDate } = require('./helper');
const dateFunction = require('date-fns');

router.post('/add-transaction', async (request, response) => {
    try {
        console.log(request.body);
     const customer_id = await (await DataBase.DB.query(`select customer_id,dob from pos_customers where aadhar_number = ${request.body.customer_aadhar} and pos_id = '${request.body.submitted_pos_id}'`)).rows;
     const customerRowCount = await(await DataBase.DB.query(`select * from pos_general_insurance_transactions where customer_aadhar =${request.body.customer_aadhar} and submitted_pos_id='${request.body.submitted_pos_id}'`)).rowCount;
    //  console.log('error',customerRowCount,request.body.premium_payment_mode,request.body.policy_issue_date);
     let renewal_date;
     if(customerRowCount <= 0){
         if (request.body.premium_payment_mode === 'Monthly') {
             renewal_date = await getRenwalDate(request.body.date_of_policy_login, 1);
         } else if (request.body.premium_payment_mode === 'Quaterly') {
             renewal_date = await getRenwalDate(request.body.date_of_policy_login, 3);
         } else if (request.body.premium_payment_mode === 'Half Yearly') {
             renewal_date = await getRenwalDate(request.body.date_of_policy_login, 6);
         } else if (request.body.premium_payment_mode === 'Annually') {
             renewal_date = await getRenwalDate(request.body.date_of_policy_login, 12);
         }
         const renewal = {
            renewal_date: renewal_date,
            customer_id: customer_id[0].customer_id,
            dob : customer_id[0].dob
        }
        const obj = {
            ...request.body, ...renewal
        }
       let valueIndex = () => {
           return Object.values(obj).map((item, index) => `$${index+1}`).join(', ');
       }
           const responseData = await ( await DataBase.DB.query(`insert into pos_general_insurance_transactions(${Object.keys(obj).join(', ')}) values (${valueIndex()} ) returning *`, Object.values(obj))).rows;
     }else{
         const getPolicyRenewalDate = await(await DataBase.DB.query(`select renewal_date from pos_general_insurance_transactions where customer_aadhar =${request.body.customer_aadhar} and submitted_pos_id='${request.body.submitted_pos_id}' order by renewal_date desc limit 1`)).rows;
        //  console.log(getPolicyRenewalDate[0].renewal_date)
         if (request.body.premium_payment_mode === 'Monthly') {
             renewal_date = await getRenewalDate(getPolicyRenewalDate[0].renewal_date, 1);
         } else if (request.body.premium_payment_mode === 'Quaterly') {
             renewal_date = await getRenewalDate(getPolicyRenewalDate[0].renewal_date, 3);
         } else if (request.body.premium_payment_mode === 'Half Yearly') {
             renewal_date = await getRenewalDate(getPolicyRenewalDate[0].renewal_date, 6);
         } else if (request.body.premium_payment_mode === 'Annually') {
             renewal_date = await getRenewalDate(getPolicyRenewalDate[0].renewal_date, 12);
         }
         console.log(renewal_date)
         await(await DataBase.DB.query(`update pos_general_insurance_transactions set renewal_date = '${renewal_date}' where customer_aadhar =${request.body.customer_aadhar} and submitted_pos_id='${request.body.submitted_pos_id}'`)).rows;
     }
     const txn = {
        policy_number : request.body.policy_number,
        date_of_entry : request.body.date_of_entry,
        renewal_date : renewal_date,
        revenue : request.body.revenue
    }
    let valueIndex = () => {
        return Object.values(txn).map((item, index) => `$${index + 1}`).join(', ');
    }
    const responseTxn = await (await DataBase.DB.query(`insert into pos_general_transactions(${Object.keys(txn).join(', ')}) values (${valueIndex()} ) returning *`, Object.values(txn))).rows;
    responseTxn[0] ? response.status(200).send({ message: 'Customer added successfully', transaction_id: responseTxn[0].txn_id }).end() : response.status(500).send({ message: "Something went wrong while inserting data" })
    } catch (error) {
        console.log(error);
        response.status(404).json({message: "Error, Something went wrong while adding transaction, please try again", status : 404}).end();
    }
})


router.post('/general-insurance-transactions-data-select', async (request, response) => {

    const value = request.body.customer_mobile ? `customer_mobile =  '${request.body.customer_mobile}'` :  `customer_aadhar = '${request.body.customer_aadhar}'`
        try{
            const responseData = await ( await DataBase.DB.query(`select * from pos_general_insurance_transactions where ${value} `)).rows;
             responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData[0]}).end() :  response.status(200).json({message : "Customer does not exist", status : 302}).end();
            } catch (error) {
                response.status(400).json({message: "Error, Something went wrong while fetching transaction details"}).end();
        }
})


router.get('/companies',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query('select * from generalinsurancerevenuedetails')).rows;
        // console.log(responseData)
        responseData[0] ? response.status(200).json({message: "Fetched list of companies",  data: responseData}).end() :  response.status(400).json({message : "No compaines found"}).end();
    } catch (error) {
        response.status(500).json({message: "Error, Something went wrong while fetching companies"}).end();
    }
})

router.post('/products',  async (request, response) =>{
    try {  
        console.log(request.body)
        const responseData = await( await DataBase.DB.query(`select product_name from generalinsuranceproduct where company_name = '${request.body.company_name}'`)).rows;
        console.log(responseData)
        responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while fetching Life products", status : 404}).end();
    }
})

router.post('/type-of-insurance',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select  type_of_insurance from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}'`)).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while fetching type of  insurance without agent", status : 404}).end();
    }
})

router.post('/plan-type',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_type, revenue from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and type_of_insurance = '${request.body.type_of_insurance}'` )).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while fetching ppt and revenue with agent", status : 404}).end();
    }
})

router.post('/plan-name',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_name, revenue from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and type_of_insurance = '${request.body.type_of_insurance}' and plan_type= '${request.body.plan_type}'` )).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while fetching ppt and revenue with agent", status : 404}).end();
    }
})


router.post('/revenue',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select revenue from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and type_of_insurance = '${request.body.type_of_insurance}' and plan_type= '${request.body.plan_type}' and plan_name = '${request.body.plan_name}'`)).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while fetching ppt and revenue without agent", status : 404}).end();
    }
})

router.get('/pending-transactions/:id', async (request, response) => {
    try{
        const responseData = await ( await  DataBase.DB.query(`select * from pos_general_insurance_transactions where policy_number = '' or stage = '' or policy_form is NULL and pos_id='${request.params.id}'`)).rows;
        response.status(200).json({customerArray : responseData})
    }catch (error) {
        response.status(500).json({message : 'Something went wrong, while fetching pending transactions'})
    }
})

router.get('/dependent-transactions/:id', async (request, response) => {
    const employees = await getDependentEmployees(request.params.id);
    const responseData = await ( await DataBase.DB.query(`select * from general_insurance_transactions where ${queryFunction( employees, 'submitted_employee_id')}`)).rows;
    response.status(200).json(responseData);
})

router.post('/transactions-between-dates/:id', async (request, response) => {
    try {
        const pos_id = request.params.id;
        const {start_date,end_date} =request.body;
        const responseData = await ( await DataBase.DB.query(`select * from pos_customers where pos_id = '${pos_id}' and submitted_date between '${start_date}' and '${end_date}'`)).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        console.log(error);
        response.status(500).json({message: error.message})
    }
})

router.post('/update', async (request, response) => {
    try{
        const responseData = await ( await DataBase.DB.query(`update pos_general_insurance_transactions set policy_number = '${request.body.policy_number}', stage = '${request.body.stage}',  policy_form = '${request.body.policy_form}' where id = '${request.body.id}'`)).rows
        response.status(200).json({transactions_details : responseData})
    } catch(error) {
        response.status(500).json({message : 'Something went wrong, while updating transactions'})
    }
})  




module.exports = router;