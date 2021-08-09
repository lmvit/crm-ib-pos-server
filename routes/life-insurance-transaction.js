const express = require('express');
const Database = require('../Database');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/get-customers-by-date/:id',async(req,res)=>{
    try {
        const {from_date,to_date} = req.body;
        const result = await(await Database.DB.query(`select * from  pos_customers where pos_id = '${req.params.id}' and submitted_date between '${from_date}' and '${to_date}'`)).rows;
        res.send(result).end();
    } catch (error) {
        console.log(error);
    }
});





module.exports = router;