var router = require('express').Router();
const DataBase = require('../Database');
const { getDependentEmployees, queryFunction, getDetails, getRenwalDate, validateLifeTransactionCount, validateLifeTransactionDues, getRenewalDate, getPolicyRenewalDate } = require('./helper');
const dateFunction = require('date-fns');
const { response } = require('express');

router.get('/companies', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query('select company_name from lifeinsuranceproduct ')).rows;
        responseData[0] ? response.status(200).send({ message: "Customer exist", status: 200, data: responseData }).end() : response.status(200).send({ message: "Something went wrong", status: 500 }).end();
    } catch (error) {
        response.status(404).send({ message: "Error, Something went wrong while fetching Life companies", status: 404 }).end();
    }
})

router.post('/products', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`select product_name from lifeinsuranceproduct where company_name = '${request.body.company_name}'`)).rows;
        responseData[0] ? response.status(200).send({ message: "Customer exist", status: 200, data: responseData }).end() : response.status(200).send({ message: "Something went wrong", status: 500 }).end();
    } catch (error) {
        // console.log(error);
        response.status(404).send({ message: "Error, Something went wrong while fetching Life products", status: 404 }).end();
    }
})

router.post('/plan-type', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`select distinct plan_type from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}'`)).rows;
        responseData[0] ? response.status(200).send({ message: "Customer exist", status: 200, data: responseData }).end() : response.status(200).send({ message: "Something went wrong", status: 500 }).end();
    } catch (error) {
        response.status(404).send({ message: "Error, Something went wrong while fetching plan names without agent", status: 404 }).end();
    }
})

router.post('/plan-name', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`select distinct plan_name from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}'`)).rows;
        responseData[0] ? response.status(200).send({ message: "Customer exist", status: 200, data: responseData }).end() : response.status(200).send({ message: "Something went wrong", status: 500 }).end();
    } catch (error) {
        response.status(404).send({ message: "Error, Something went wrong while fetching plan names without agent", status: 404 }).end();
    }
})

router.post('/ppt-revenue', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`select premium_payment_term, revenue from lifeinsurancerevenuedetails where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}' and plan_name = '${request.body.plan_name}'`)).rows;
        responseData[0] ? response.status(200).send({ message: "Customer exist", status: 200, data: responseData }).end() : response.status(200).send({ message: "Something went wrong", status: 500 }).end();
    } catch (error) {
        response.status(404).send({ message: "Error, Something went wrong while fetching ppt and revenue without agent", status: 404 }).end();
    }
});

router.post('/get-ppt-revenue', async (request, response) => {
    try {
        const { company_name, product_name, plan_type, plan_name, premium_payment_term } = request.body.obj;
        const responseData = await (await DataBase.DB.query(`select distinct revenue from lifeinsurancerevenuedetails where company_name = '${company_name}' and product_name = '${product_name}' and plan_type = '${plan_type}' and plan_name = '${plan_name}' and premium_payment_term='${premium_payment_term}'`)).rows;
        responseData[0] ? response.status(200).send(responseData).end() : response.status(200).send("No ppt or revenue information found").end();
    } catch (error) {
        console.log(error)
        response.status(404).send("Error, Something went wrong....!").end();
    }
})


router.post('/add-transaction', async (request, response) => {
    try {
        const customer_id = await (await DataBase.DB.query(`select customer_id,dob from pos_customers where aadhar_number = ${request.body.customer_aadhar} and pos_id = '${request.body.submitted_pos_id}'`)).rows;
        const customerRowCount = await (await DataBase.DB.query(`select * from pos_life_insurance_transactions where customer_aadhar =${request.body.customer_aadhar} and submitted_pos_id='${request.body.submitted_pos_id}'`)).rowCount;
        const getPosRate = await(await DataBase.DB.query(`select revenue from pos_life_insurance_revenue_details where company_name = '${request.body.company_name}' and product_name = '${request.body.product_name}' and plan_type = '${request.body.plan_type}'and  plan_name = '${request.body.plan_name}' and premium_payment_term =${request.body.premium_payment_term} and status = 'T'`)).rows;
        let renewal_date = '';

        if (customerRowCount === 0) {
            if (request.body.premium_payment_mode === 'Monthly') {
                renewal_date = await getRenwalDate(request.body.policy_issue_date, 1);
            } else if (request.body.premium_payment_mode === 'Quaterly') {
                renewal_date = await getRenwalDate(request.body.policy_issue_date, 3);
            } else if (request.body.premium_payment_mode === 'Half Yearly') {
                renewal_date = await getRenwalDate(request.body.policy_issue_date, 6);
            } else if (request.body.premium_payment_mode === 'Annually') {
                renewal_date = await getRenwalDate(request.body.policy_issue_date, 12);
            } const renewal = {
                renewal_date: renewal_date,
                customer_id: customer_id[0].customer_id,
                dob: customer_id[0].dob
            }
            const requestObj = {
                company_name: request.body.company_name,
                product_name: request.body.product_name,
                // type_of_business: request.body.type_of_business,
                plan_type: request.body.plan_type,
                plan_name: request.body.plan_name,
                policy_term: request.body.policy_term,
                gross_premium: request.body.gross_premium,
                // net_premium: request.body.net_premium,
                policy_number: request.body.policy_number,
                policy_issue_date: request.body.policy_issue_date,
                premium_payment_term: request.body.premium_payment_term,
                // date_of_entry: request.body.date_of_entry,
                revenue: request.body.revenue,
                customer_mobile: request.body.customer_mobile,
                customer_aadhar: request.body.customer_aadhar,
                customer_pan: request.body.customer_pan,
                customer_name: request.body.customer_name,
                submitted_pos_id: request.body.submitted_pos_id,
                pos_rate : getPosRate[0].revenue
            }
            const obj = {
                ...requestObj, ...renewal
            }

            let valueIndex = () => {
                return Object.values(obj).map((item, index) => `$${index + 1}`).join(', ');
            }
            const responseData = await (await DataBase.DB.query(`insert into pos_life_insurance_transactions(${Object.keys(obj).join(', ')}) values (${valueIndex()} ) returning *`, Object.values(obj))).rows;
        } else {
            const getPolicyRenewalDate = await (await DataBase.DB.query(`select renewal_date from pos_life_insurance_transactions where customer_aadhar =${request.body.customer_aadhar} and submitted_pos_id='${request.body.submitted_pos_id}' order by renewal_date desc limit 1`)).rows;
            // console.log(getPolicyRenewalDate[0].renewal_date)
            if (request.body.premium_payment_mode === 'Monthly') {
                renewal_date = await getRenwalDate(getPolicyRenewalDate[0].renewal_date, 1);
            } else if (request.body.premium_payment_mode === 'Quaterly') {
                renewal_date = await getRenwalDate(getPolicyRenewalDate[0].renewal_date, 3);
            } else if (request.body.premium_payment_mode === 'Half Yearly') {
                renewal_date = await getRenwalDate(getPolicyRenewalDate[0].renewal_date, 6);
            } else if (request.body.premium_payment_mode === 'Annually') {
                renewal_date = await getRenwalDate(getPolicyRenewalDate[0].renewal_date, 12);
            }
            await (await DataBase.DB.query(`update pos_life_insurance_transactions set renewal_date = '${renewal_date}' where customer_aadhar =${request.body.customer_aadhar} and submitted_pos_id='${request.body.submitted_pos_id}'`)).rows;
        }
        const txn = {
            policy_number: request.body.policy_number,
            premium_payment_mode: request.body.premium_payment_mode,
            date_of_entry: request.body.date_of_entry,
            renewal_date: renewal_date,
            revenue: request.body.revenue,
            status: 'pending',
            cheque_number: request.body.cheque_number,
            cheque_account: request.body.cheque_account,
            cheque_date: request.body.cheque_date,
            bank_name: request.body.bank_name,
            reference_number: request.body.reference_number,
            account_number: request.body.account_number,
            net_premium: request.body.net_premium,
            mode_of_payment: request.body.mode_of_payment,
            stage: request.body.stage,
            type_of_business: request.body.type_of_business,
            reason: request.body.reason,
            application_form: request.body.application_form,
            policy_form: request.body.policy_form,
            application_number: request.body.application_number
        }
        let valueIndex = () => {
            return Object.values(txn).map((item, index) => `$${index + 1}`).join(', ');
        }
        const responseTxn = await (await DataBase.DB.query(`insert into pos_life_transactions(${Object.keys(txn).join(', ')}) values (${valueIndex()} ) returning *`, Object.values(txn))).rows;
        responseTxn[0] ? response.status(200).send({ message: 'Customer added successfully', transaction_id: responseTxn[0].id }).end() : response.status(500).send({ message: "Something went wrong while inserting data" })
    } catch (error) {
        console.log('Error', error);
        response.status(404).send({ message: "Error, Something went wrong while adding transaction, please try again", status: 404 }).end();
    }
});

router.get("/transaction-details/:id", async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`select * from pos_life_insurance_transactions where id = ${request.params.id}`)).rows;
        responseData[0] ? response.status(200).send({ message: "Customer exist", transactionDetails: responseData[0] }).end() : response.status(500).send({ message: "Something went wrong" }).end();
    } catch (error) {
        response.status(404).json({ message: "Error, Something went wrong while adding transaction, please try again", status: 404 }).end();
    }
})


router.get('/pending-transactions/:id', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`select * from pos_life_insurance_transactions where policy_number = '' or stage = '' or appilication_form is NULL or policy_form is NULL and pos_id ='${request.params.id}'`)).rows;
        response.status(200).json({ customerArray: responseData })
    } catch (error) {
        response.status(500).json({ message: 'Something went wrong, while fetching pending transactions' })
    }
})

router.post('/update', async (request, response) => {
    try {
        const responseData = await (await DataBase.DB.query(`update pos_life_insurance_transactions set policy_number = '${request.body.policy_number}', stage = '${request.body.stage}', application_form = '${request.body.application_form}', policy_form = '${request.body.policy_form}' where id = '${request.body.id}'`)).rows
        response.status(200).send({ transactions_details: responseData })
    } catch (error) {
        response.status(500).json({ message: 'Something went wrong, while updating transactions' })
    }
})

router.post('/transactions-between-dates/:id', async (request, response) => {
    try {
        const pos_id = request.params.id;
        const { start_date, end_date } = request.body;
        const responseData = await (await DataBase.DB.query(`select * from pos_customers where pos_id = '${pos_id}' and submitted_date between '${start_date}' and '${end_date}'`)).rows;
        responseData[0] ? response.status(200).json({ message: "Customer exist", data: responseData }).end() : response.status(200).send({ message: "Something went wrong", status: 500 }).end();
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: error.message })
    }
})

router.get('/customer-details/:id', async (request, response) => {
    try {
        const str = request.params.id;
        const posId = request.body.user.pos_id;
        if (str.length === 12 && str.match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)) {
            const result = await getDetails('aadhar_number', str, posId);
            result.length > 0 ? response.status(200).json({ message: "customer exists", data: result }).end() : response.status(200).json({ message: "customer aadhar number not exists" }).end();
        } else if (str.length === 10 && str.match(/^[6-9]\d{9}$/)) {
            const result = await getDetails('mobile_number', str, posId);
            result.length > 0 ? response.status(200).json({ message: "customer exists", data: result }).end() : response.status(200).json({ message: "customer mobile number not exists" }).end();
        } else if (str.length === 10 && str.match(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/)) {
            const result = await getDetails('pancard', str, posId);
            result.length > 0 ? response.status(200).json({ message: "customer exists", data: result }).end() : response.status(200).json({ message: "customer pancard number not exists" }).end();
        } else {
            response.send('details not found').end();
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/check-transaction-count/:id', async (request, response) => {
    try {
        const str = request.params.id;
        const posId = request.body.user.pos_id;
        if (str.length === 12 && str.match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)) {
            const result = await validateLifeTransactionCount('customer_aadhar', str, posId);
            result.length > 0 ? response.status(200).json({ message: "customer exists", data: result }).end() : response.status(200).json({ message: "customer aadhar number not exists" }).end();
        } else if (str.length === 10 && str.match(/^[6-9]\d{9}$/)) {
            const result = await validateLifeTransactionCount('customer_mobile', str, posId);
            result.length > 0 ? response.status(200).json({ message: "customer exists", data: result }).end() : response.status(200).json({ message: "customer mobile number not exists" }).end();
        } else if (str.length === 10 && str.match(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/)) {
            const result = await validateLifeTransactionCount('customer_pan', str, posId);
            result.length > 0 ? response.status(200).json({ message: "customer exists", data: result }).end() : response.status(200).json({ message: "customer pancard number not exists" }).end();
        } else {
            response.send('details not found').end();
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/check-transaction-dues/:input', async (request, response) => {
    try {
        const posId = request.body.user.pos_id;
        const str = request.params.input;
        if (str.length === 12 && str.match(/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/)) {
            const result = await validateLifeTransactionDues('customer_aadhar', str, posId);
            const ppm = result[0].premium_payment_mode;
            const renewal_date = result[0].renewal_date;
            const getRenewalDate = await getPolicyRenewalDate(ppm, renewal_date);
            getRenewalDate ? response.status(200).json({renewalDate : getRenewalDate}).end() : response.status(200).json({message:"customer aadhar number not exists"}).end();
        } else if (str.length === 10 && str.match(/^[6-9]\d{9}$/)) {
            const result = await validateLifeTransactionDues('customer_mobile', str, posId);
            const ppm = result[0].premium_payment_mode;
            const renewal_date = result[0].renewal_date;
            const getRenewalDate = await getPolicyRenewalDate(ppm, renewal_date);
            getRenewalDate ? response.status(200).json({renewalDate : getRenewalDate}).end() : response.status(200).json({message:"customer mobile number not exists"}).end();
        } else if (str.length === 10 && str.match(/^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/)) {
            const result = await validateLifeTransactionDues('customer_pan', str, posId);
            const ppm = result[0].premium_payment_mode;
            const renewal_date = result[0].renewal_date;
            const getRenewalDate = await getPolicyRenewalDate(ppm, renewal_date);
            getRenewalDate ? response.status(200).json({renewalDate : getRenewalDate}).end() : response.status(200).json({message:"customer pancard number not exists"}).end();
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-life-insurance-policy-details/:id',async(req,res)=>{
    try {
        const result = await(await DataBase.DB.query(`select pl.*,p.* from pos_life_insurance_transactions pl inner join pos_life_transactions p on p.policy_number = pl.policy_number where customer_pan = '${req.params.id}' and submitted_pos_id = '${req.body.user.pos_id}'`)).rows;
        result ? res.send(result).end() : res.send('Transaction details not exists').end();
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
