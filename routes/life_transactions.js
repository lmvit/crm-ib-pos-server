var router = require('express').Router();
const DataBase = require('../Database');
const format = require('date-fns/format');
const { getDependentEmployees, queryFunction } = require('./helper');


router.get('/companies',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query('select company_name from lifeinsuranceproduct ')).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching Life companies", status : 404}).end();
    }
})


router.get('/relationship-managers',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query("select * from employees where role != 'telecaller'")).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching RMI's", status : 404}).end();
    }
})

router.get('/telecallers',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query("select * from employees where role = 'telecaller'")).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching telecallers", status : 404}).end();
    }
})

router.post('/products',  async (request, response) =>{
    try {  
        const responseData = await( await DataBase.DB.query(`select product_name from lifeinsuranceproduct where company_name = '${request.body.company_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching Life products", status : 404}).end();
    }
})

router.post('/plan-type',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_type from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching plan names without agent", status : 404}).end();
    }
})

router.post('/plan-name',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_name from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching plan names without agent", status : 404}).end();
    }
})

router.post('/ppt-revenue',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select premium_payment_term, revenue from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}' and plan_name = '${request.body.plan_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue without agent", status : 404}).end();
    }
})


router.post('/add-transaction', async (request, response) => {
    let valueIndex = () => {
        return Object.values(request.body).map((item, index) => `$${index+1}`).join(', ');
    }

    try {
        const responseData = await ( await DataBase.DB.query(`insert into life_insurance_transactions(${Object.keys(request.body).join(', ')}) values (${valueIndex()} ) returning *`, Object.values(request.body))).rows;
        responseData[0] ? response.status(200).send({message: 'Customer added successfully',  transaction_id: responseData[0].id}).end() : response.status(500).send({message : "Something went wrong while inserting data"})
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while adding transaction, please try again", status : 404}).end();
    }
})

router.get("/transaction-details/:id", async (request, response) => {
    try {
        const responseData = await ( await DataBase.DB.query(`select * from life_insurance_transactions where id = ${request.params.id}`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist",  transactionDetails: responseData[0]}).end() :  response.status(500).send({message : "Something went wrong"}).end();
    } catch (error) {
        console.log(error)
        response.status(404).json({message: "Error, Something went wrong while adding transaction, please try again", status : 404}).end();
    }
})


router.get('/pending-transactions/:id', async (request, response) => {
    try{
        const responseData = await ( await  DataBase.DB.query(`select * from pos_life_insurance_transactions where policy_number = '' or stage = '' or application_form is NULL or policy_form is NULL`)).rows;
        response.status(200).json({customerArray : responseData})
    }catch (error) {
        response.status(500).json({message : 'Something went wrong, while fetching pending transactions'})
    }
})

router.post('/update', async (request, response) => {
    try{
        const responseData = await ( await DataBase.DB.query(`update life_insurance_transactions set policy_number = '${request.body.policy_number}', stage = '${request.body.stage}', application_form = '${request.body.application_form}', policy_form = '${request.body.policy_form}' where id = '${request.body.id}'`)).rows
        response.status(200).send({transactions_details : responseData})
    } catch(error) {
        response.status(500).json({message : 'Something went wrong, while updating transactions'})
    }
})  

router.get('/dependent-transactions/:id', async (request, response) => {
    const employees = await getDependentEmployees(request.params.id);
    const responseData = await ( await DataBase.DB.query(`select * from life_insurance_transactions where ${queryFunction( employees, 'submitted_employee_id')}`)).rows;
    response.status(200).json(responseData);

})

router.post('/transactions-between-dates/:id', async (request, response) => {
    try {
        const employees = await getDependentEmployees(request.params.id);
        const responseData = await ( await DataBase.DB.query(`select * from customers where  date_of_entry >= '${format(new Date(request.body.start_date), 'yyyy-MM-dd')}' and date_of_entry  <= '${format(new Date(request.body.end_date), 'yyyy-MM-dd')} )' and ${queryFunction( employees, 'employee_id')} `)).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        console.log(error)
        response.status(500).json({message: error.message})
    }
})






module.exports = router;