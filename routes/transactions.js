var transactions = require('express').Router();
const DataBase = require('../Database');
const format = require('date-fns/format');
const { getDependentEmployees, queryFunction } = require('./helper');

////////Life Insurance

transactions.get('/life-insurance-companies',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query('select company_name from lifeinsuranceproduct ')).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching Life companies", status : 404}).end();
    }
})


transactions.get('/except-telecallers',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query("select * from employees where role != 'telecaller'")).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching RMI's", status : 404}).end();
    }
})

transactions.get('/telecallers',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query("select * from employees where role = 'telecaller'")).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching telecallers", status : 404}).end();
    }
})

transactions.post('/life-insurance-products',  async (request, response) =>{
    try {  
        const responseData = await( await DataBase.DB.query(`select product_name from lifeinsuranceproduct where company_name = '${request.body.company_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching Life products", status : 404}).end();
    }
})

transactions.post('/life-insurance-plan-type',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_type from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching plan names without agent", status : 404}).end();
    }
})

transactions.post('/life-insurance-plan-name',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_name from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching plan names without agent", status : 404}).end();
    }
})

transactions.post('/life-insurance-ppt-revenue',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select premium_payment_term, revenue from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}' and plan_name = '${request.body.plan_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue without agent", status : 404}).end();
    }
})


transactions.post('/life-insurance-transactions-add-data', async (request, response) => {
    // console.log(request.body)
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

transactions.get("/life-customer-transaction-details/:id", async (request, response) => {
    try {
        const responseData = await ( await DataBase.DB.query(`select * from life_insurance_transactions where id = ${request.params.id}`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist",  transactionDetails: responseData[0]}).end() :  response.status(500).send({message : "Something went wrong"}).end();
    } catch (error) {
        console.log(error)
        response.status(404).json({message: "Error, Something went wrong while adding transaction, please try again", status : 404}).end();
    }
})


transactions.get('/get-pending-transactions/:id', async (request, response) => {
    try{
        const responseData = await ( await  DataBase.DB.query(`select * from life_insurance_transactions where policy_number = '' or stage = '' or application_form is NULL or policy_form is NULL`)).rows;
        response.status(200).json({customerArray : responseData})
    }catch (error) {
        console.log(error)
    }
})

transactions.post('/life-transactions/update', async (request, response) => {
    try{
        const responseData = await ( await DataBase.DB.query(`update life_insurance_transactions set policy_number = '${request.body.policy_number}', stage = '${request.body.stage}', application_form = '${request.body.application_form}', policy_form = '${request.body.policy_form}' where id = '${request.body.id}'`)).rows
        response.status(200).send({transactions_details : responseData})
    } catch(error) {
        console.log(error)
    }
})  

transactions.get('/get-dependent-life-transactions/:id', async (request, response) => {

    const employees = await getDependentEmployees(request.params.id);
    const responseData = await ( await DataBase.DB.query(`select * from life_insurance_transactions where ${queryFunction( employees, 'submitted_employee_id')}`)).rows;
    response.status(200).json(responseData);

})

transactions.post('/life-transactions-of-given-dates/:id', async (request, response) => {
    try {
        const employees = await getDependentEmployees(request.params.id);
        const responseData = await ( await DataBase.DB.query(`select * from customers where  date_of_entry >= '${format(new Date(request.body.start_date), 'yyyy-MM-dd')}' and date_of_entry  <= '${format(new Date(request.body.end_date), 'yyyy-MM-dd')} )' and ${queryFunction( employees, 'employee_id')} `)).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        console.log(error)
        response.status(500).json({message: error.message})
    }
})












////////////////////////////////// General Insurance

transactions.post('/general-insurance-transactions-data', async (request, response) => {

    let valueIndex = () => {
        return Object.values(request.body).map((item, index) => `$${index+1}`).join(', ');
    }

    try {
        const responseData = await ( await DataBase.DB.query(`insert into general_insurance_transactions(${Object.keys(request.body).join(', ')}) values (${valueIndex()}) returning *`, Object.values(request.body)));
        response.status(200).send({message: 'Customer added successfully', status: 200, message: responseData[0]?.id}).end();
    } catch (error) {
        console.log(error);
        response.status(404).send({message: "Error, Something went wrong while adding the transaction", status : 404}).end();
    }
})


transactions.post('/general-insurance-transactions-data-select', async (request, response) => {

    const value = request.body.customer_mobile ? `customer_mobile =  '${request.body.customer_mobile}'` :  `customer_aadhar = '${request.body.customer_aadhar}'`
        try{
            const responseData = await ( await DataBase.DB.query(`select * from general_insurance_transactions where ${value} `)).rows;
             responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData[0]}).end() :  response.status(200).send({message : "Customer does not exist", status : 302}).end();
            } catch (error) {
                response.status(404).send({message: "Error, Something went wrong while fetching transaction details", status : 404}).end();
        }
})


// transactions.get('/general-insurance-agents',  async (request, response) =>{
//     try {
//         const responseData = await( await DataBase.DB.query('Select distinct a.firstname, l.agent_id from agentdetails a inner join agentgeneralinsurancedetails l on l.agent_id = a.agent_id')).rows;
//         responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
//     } catch (error) {
//         response.status(404).send({message: "Error, Something went wrong while fetching agents", status : 404}).end();
//     }
// })


transactions.get('/general-insurance-companies',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query('select * from generalinsurancerevenuedetails')).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching companies", status : 404}).end();
    }
})

transactions.post('/general-insurance-products',  async (request, response) =>{
    try {  
        const responseData = await( await DataBase.DB.query(`select product_name from generalinsuranceproduct where company_name = '${request.body.company_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching Life products", status : 404}).end();
    }
})


// transactions.post('/general-insurance-selected-agent',  async (request, response) =>{
//     try {
//         const responseData = await( await DataBase.DB.query(`select type_of_insurance from agentgeneralinsurancedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and agent_id = '${request.body.agent_id}'`)).rows;
//         responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
//     } catch (error) {
//         response.status(404).send({message: "Error, Something went wrong while feteching type of  insurance with agent", status : 404}).end();
//     }
// })


transactions.post('/general-insurance-no-agent',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select  type_of_insurance from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching type of  insurance without agent", status : 404}).end();
    }
})

transactions.post('/life-insurance-selected-agent-insurance',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_type, revenue from agentgeneralinsurancedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and agent_id = '${request.body.agent_id}' and type_of_insurance = '${request.body.type_of_insurance}'` )).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue with agent", status : 404}).end();
    }
})
transactions.post('/life-insurance-no-agent-insurance',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_type, revenue from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and type_of_insurance = '${request.body.type_of_insurance}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue without agent", status : 404}).end();
    }
})

transactions.post('/life-insurance-selected-agent-plan-name',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_name, revenue from agentgeneralinsurancedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and agent_id = '${request.body.agent_id}' and type_of_insurance = '${request.body.type_of_insurance}' and plan_type= '${request.body.plan_type}'` )).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue with agent", status : 404}).end();
    }
})

transactions.post('/life-insurance-no-agent-plan-name',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select plan_name, revenue from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and type_of_insurance = '${request.body.type_of_insurance}' and plan_type= '${request.body.plan_type}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue without agent", status : 404}).end();
    }
})
transactions.post('/life-insurance-selected-agent-revenue',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select revenue, revenue from agentgeneralinsurancedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and agent_id = '${request.body.agent_id}' and type_of_insurance = '${request.body.type_of_insurance}' and plan_type= '${request.body.plan_type}' and plan_name = '${request.body.plan_name}'` )).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue with agent", status : 404}).end();
    }
})
transactions.post('/life-insurance-no-agent-revenue',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query(`select revenue, revenue from generalinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and type_of_insurance = '${request.body.type_of_insurance}' and plan_type= '${request.body.plan_type}' and plan_name = '${request.body.plan_name}'`)).rows;
        responseData[0] ? response.status(200).send({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).send({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).send({message: "Error, Something went wrong while fetching ppt and revenue without agent", status : 404}).end();
    }
})

module.exports = { transactions }