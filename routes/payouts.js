const express = require('express');
const router = express.Router();
const Database = require('../Database');
const { getPolicyRenewalDate } = require('./helper');
const dateFns = require('date-fns');

router.get('/get-person-type',async(request,response)=>{
    try {
        const result = await(await Database.DB.query(`select * from pos_details where pos_id = '${request.body.user.pos_id}'`)).rows;
        result ? response.send(result).end() : response.send('No data found').end();
    } catch (error) {
        console.log(error);
    }
});

router.get('/get-general-payouts/:from_date/:to_date',async(request,response)=>{
    try {
       const result =  await(await Database.DB.query(`select pg.*,pgi.* from pos_general_transactions pg inner join pos_general_insurance_transactions pgi on pgi.policy_number = pg.policy_number
       where pgi.submitted_pos_id='${request.body.user.pos_id}' and pgi.date_of_policy_login between '${request.params.from_date}' and '${request.params.to_date}' and pg.status = 'Approved'`)).rows;
       result ? response.send(result).end() : response.send('No data found').end();
    } catch (error) {
        console.log(error);
    }
});

// router.get('/generate-payouts',async(req,res)=>{
//     try { 
//         let renualDates = [];
//         const getPolicyDate= await(await Database.DB.query(`select policy_issue_date from pos_life_insurance_transactions where submitted_pos_id = 'pos30001'`)).rows;
        
//         getPolicyDate.map((element,index)=>{
//             return(
//                dates= dateFns.addYears(new Date(getPolicyDate[0].policy_issue_date),1),
//                renualDates.push(dates)
//             )
//         })
//         console.log(renualDates);
//     } catch (error) {
//         console.log(error);
//     }
// });

router.get(`/get-life-insurance-payouts/:from_date/:to_date`,async(request,res)=>{
    try {
        const result = await(await Database.DB.query(`select pl.*,pli.* from pos_life_transactions pl inner join pos_life_insurance_transactions pli on pli.policy_number = pl.policy_number 
        where pli.submitted_pos_id='${request.body.user.pos_id}' and pl.date_of_entry between '${request.params.from_date}' and '${request.params.to_date}' and pl.status = 'Approved' and (pl.type_of_business = 'New Business' or (pl.type_of_business = '1 year' and pl.status = 'Approved'))`)).rows;
        result ? res.send({status : 200,data : result}).end() : res.send({status : 403,message:'No data found'}).end();
    } catch (error) {
        console.log(error);
    }
});

router.get(`/get-general-insurance-payouts/:from_date/:to_date`,async(request,res)=>{
    try {
        const result = await(await Database.DB.query(`select pl.*,pli.* from pos_life_transactions pl inner join pos_life_insurance_transactions pli on pli.policy_number = pl.policy_number
        where pli.submitted_pos_id='${request.body.user.pos_id}' and pl.date_of_entry between '${request.params.from_date}' and '${request.params.to_date}' and pl.status = 'Approved' and pl.type_of_business = 'New Business' or (pl.type_of_business = '1 year' and pl.status = 'Approved')`)).rows;
        result ? res.send({status : 200,data : result}).end() : res.send({status : 403,message:'No data found'}).end();
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;
