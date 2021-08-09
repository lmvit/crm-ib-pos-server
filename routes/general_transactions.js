var router = require('express').Router();
const DataBase = require('../Database');
const format = require('date-fns/format');
const { getDependentEmployees, queryFunction } = require('./helper');



router.post('/add-transaction', async (request, response) => {
    
    let valueIndex = () => {
        return Object.values(request.body).map((item, index) => `$${index+1}`).join(', ');
    }

    try {
        const responseData = await ( await DataBase.DB.query(`insert into general_insurance_transactions(${Object.keys(request.body).join(', ')}) values (${valueIndex()} ) returning *`, Object.values(request.body))).rows;
        responseData[0] ? response.status(200).json({message: 'Customer added successfully',  transaction_id: responseData[0].id}).end() : response.status(500).json({message : "Something went wrong while inserting data"})
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while adding transaction, please try again", status : 404}).end();
    }
})


router.post('/general-insurance-transactions-data-select', async (request, response) => {

    const value = request.body.customer_mobile ? `customer_mobile =  '${request.body.customer_mobile}'` :  `customer_aadhar = '${request.body.customer_aadhar}'`
        try{
            const responseData = await ( await DataBase.DB.query(`select * from general_insurance_transactions where ${value} `)).rows;
             responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData[0]}).end() :  response.status(200).json({message : "Customer does not exist", status : 302}).end();
            } catch (error) {
                response.status(400).json({message: "Error, Something went wrong while fetching transaction details"}).end();
        }
})


router.get('/companies',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query('select * from generalinsurancerevenuedetails')).rows;
        console.log(responseData)
        responseData[0] ? response.status(200).json({message: "Fetched list of companies",  data: responseData}).end() :  response.status(400).json({message : "No compaines found"}).end();
    } catch (error) {
        response.status(500).json({message: "Error, Something went wrong while fetching companies"}).end();
    }
})

router.post('/products',  async (request, response) =>{
    try {  
        const responseData = await( await DataBase.DB.query(`select product_name from generalinsuranceproduct where company_name = '${request.body.company_name}'`)).rows;
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
        const responseData = await ( await  DataBase.DB.query(`select * from general_insurance_transactions where policy_number = '' or stage = '' or policy_form is NULL `)).rows;
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
        const employees = await getDependentEmployees(request.params.id);
        const responseData = await ( await DataBase.DB.query(`select * from customers where  date_of_entry >= '${format(new Date(request.body.start_date), 'yyyy-MM-dd')}' and date_of_entry  <= '${format(new Date(request.body.end_date), 'yyyy-MM-dd')} )' and ${queryFunction( employees, 'employee_id')} `)).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(500).json({message: error.message})
    }
})

router.get('/relationship-managers',  async (request, response) =>{
    try {
        const responseData = await( await DataBase.DB.query("select * from employees where role != 'telecaller'")).rows;
        responseData[0] ? response.status(200).json({message: "Customer exist", status: 200, data: responseData}).end() :  response.status(200).json({message : "Something went wrong", status : 500}).end();
    } catch (error) {
        response.status(404).json({message: "Error, Something went wrong while fetching RMI's", status : 404}).end();
    }
})

router.post('/update', async (request, response) => {
    try{
        const responseData = await ( await DataBase.DB.query(`update general_insurance_transactions set policy_number = '${request.body.policy_number}', stage = '${request.body.stage}',  policy_form = '${request.body.policy_form}' where id = '${request.body.id}'`)).rows
        response.status(200).json({transactions_details : responseData})
    } catch(error) {
        response.status(500).json({message : 'Something went wrong, while updating transactions'})
    }
})  




module.exports = router;