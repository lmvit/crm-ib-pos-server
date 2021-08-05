const express = require('express');
const Database = require('../Database');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/customer-details/exists',async(req,res)=>{
    try {
        const {aadhar,posId} = req.body;
        const request = await(await Database.DB.query(`select aadhar_number = ${aadhar} from pos_customers where pos_id = '${posId}'`)).rows;
        const exists = request.filter(e => {
            if (Object.values(e).toString() === "true") {
                return true;
            } else return false;
        })
        if (exists.length > 0) {
            res.send(`customer exists`).end();
        } else {
            return res.send(`not found`).end();
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/update-customer-details/exists',async(req,res)=>{
    try {
        const {aadhar,posId,customerId} = req.body;
        const exists = await(await Database.DB.query(`select aadhar_number = ${aadhar}  from pos_customers where pos_id = '${posId}' and customer_id != '${customerId}'`)).rows;
        if (exists) {
            res.send(`not found`).end();
        } else {
            return res.send(`customer exists`).end();
        }
    } catch (error) {
        console.log(error);
    }
})

router.post('/customer-details',async(req,res)=>{
    try {
        let customerId;
        const count = await(await Database.DB.query(`select * from pos_customers`)).rowCount;
        if(count===0){
            customerId = 'custp30001'
        }else{
            const rows = await(await Database.DB.query(`select customer_id from pos_customers order by customer_id desc limit 1`)).rows;
            const id = rows[0].customer_id;
            const customerIdSeq = id.slice(0,6);
            const idIncrement = parseInt(id.slice(6))+1;
            const increment = '000'+idIncrement.toString();
            const customerIdIncrement = increment.slice(-4);
            customerId = (customerIdSeq+customerIdIncrement).toString();
        }
        const date = new Date();
        const submittedDate = date.toLocaleDateString('fr-CA');
        const cust_id = {
            customer_id : customerId,
            submitted_date : submittedDate.toString()
        }
        const obj = {...req.body,...cust_id};
        let valueIndex =()=>{
            return  Object.values(obj).map((ele,index)=>`$${index+1}`).join(',')
        }
        const result = await Database.DB.query(`insert into pos_customers (${Object.keys(obj).join(',')}) values (${valueIndex()})`,Object.values(obj));
        res.send(result ?{message:'successfully registered',status:200}:{message:'failed',status:300}).end();
        
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-customers/:id',async(req,res)=>{
    try {
        res.send(await(await Database.DB.query(`select * from pos_customers where pos_id='${req.params.id}' order by customer_id`)).rows).end();
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-customer-details/:posId/:custId',async(req,res)=>{
    try {
        res.send(await(await Database.DB.query(`select * from pos_customers where pos_id = '${req.params.posId}' and customer_id='${req.params.custId}'`)).rows).end();
    } catch (error) {
        console.log(error);
    }
});

router.put('/update-customer-details/:id/:pos',async(req,res)=>{
    try {
       const {custId,title,first_name,last_name,mobile_number,email,dob,pancard,gender,locations,branch,aadhar_number,present_address1,present_address2,present_country,present_states,present_city,present_district,present_pincode,permanent_address1,permanent_address2,permanent_district, permanent_country,permanent_states,permanent_city,permanent_pincode} = req.body;
       await(await Database.DB.query(`update pos_customers set title='${title}',first_name='${first_name}',last_name='${last_name}',mobile_number=${mobile_number},email='${email}',dob='${dob}',pancard='${pancard}',gender='${gender}',locations='${locations}',
       branch='${branch}',aadhar_number=${aadhar_number},present_address1='${present_address1}',present_address2='${present_address2}',present_country='${present_country}',present_states='${present_states}',present_city='${present_city}',present_district='${present_district}',present_pincode='${present_pincode}',
       permanent_address1='${permanent_address1}',permanent_address2='${permanent_address2}',permanent_country='${permanent_country}',permanent_states='${permanent_states}',permanent_city='${permanent_city}',permanent_district='${permanent_district}',permanent_pincode='${permanent_pincode}' where customer_id = '${req.params.id}' and pos_id='${req.params.pos}'`)).rows;
       res.send('updated successfully').end();
    } catch (error) {
        console.log(error);
    }
});

router.put('/update-aadhar/:custId/:user',async(req,res)=>{
    try {
        const updated = await(await Database.DB.query(`update pos_customers set aadhar = '${req.body.aadhar}' where customer_id = '${req.params.custId}' and pos_id = '${req.params.user}'`)).rows;
        res.send(updated?"successfull":"failed").end();
    } catch (error) {
        console.log(error);
    }
});

router.put('/update-pan/:custId/:user',async(req,res)=>{
    try {
        const updated = await(await Database.DB.query(`update pos_customers set pan = '${req.body.pan}' where customer_id = '${req.params.custId}' and pos_id = '${req.params.user}'`)).rows;
        res.send(updated?"successfull":"failed").end();
    } catch (error) {
        console.log(error);
    }
});

router.put('/update-photo/:custId/:user',async(req,res)=>{
    try {
        const updated = await(await Database.DB.query(`update pos_customers set photo = '${req.body.photo}' where customer_id = '${req.params.custId}' and pos_id = '${req.params.user}'`)).rows;
        res.send(updated?"successfull":"failed").end();
    } catch (error) {
        console.log(error);
    }
});

router.put('/update-passbook/:custId/:user',async(req,res)=>{
    try {
        const updated = await(await Database.DB.query(`update pos_customers set passbook = '${req.body.passbook}' where customer_id = '${req.params.custId}' and pos_id = '${req.params.user}'`)).rows;
        res.send(updated?"successfull":"failed").end();
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-location', async (req, res) => {
    try {
        res.send(await (await Database.DB.query('select distinct(location) from branch')).rows).end();
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-branches/:branch', async (req, res) => {
    try {
        res.send(await (await Database.DB.query(`select branch from branch where location = '${req.params.branch}'`)).rows).end();
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;