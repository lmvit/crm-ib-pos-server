const express = require('express');
const router = express.Router();
const Database = require('../Database');

router.get('/get-life-payouts/:from_date/:to_date',async(request,response)=>{
    try {
       const result =  await(await Database.DB.query(`select pl.*,pli.* from pos_life_transactions pl inner join pos_life_insurance_transactions pli on pli.policy_number = pl.policy_number
        where pli.submitted_pos_id='${request.body.user.pos_id}' and pl.type_of_business = 'New Business' and policy_issue_date between '${request.params.from_date}' and '${request.params.to_date}' and pl.status = 'Approved'`)).rows;
       result ? response.send(result).end() : response.send('No data found').end();
    } catch (error) {
        console.log(error);
    }
});

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

module.exports = router;
