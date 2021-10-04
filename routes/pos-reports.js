const { response } = require('express');
const express = require('express');
const router = express.Router();
const DataBase = require('../Database');
const { getReports } = require('./helper');

router.get('/get-life-insurance-pos-reports/:fromDate/:toDate',async(request,response)=>{
   try {
      const data = await(await DataBase.DB.query(`select l.*,t.* from pos_life_insurance_transactions l,pos_life_transactions t where l.policy_number = t.policy_number and t.date_of_entry between
      '${request.params.fromDate}' and '${request.params.toDate}' and l.submitted_pos_id = '${request.body.user.pos_id}'`)).rows;
      data[0] ? response.send({responseData : data,status : 200}).end() : response.send({status:200,message : 'no data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/get-general-insurance-pos-reports/:fromDate/:toDate',async(request,response)=>{
   try {
      const data = await(await DataBase.DB.query(`select l.*,t.* from pos_general_insurance_transactions l,pos_general_transactions t where l.policy_number = t.policy_number and t.date_of_entry between
      '${request.params.fromDate}' and '${request.params.toDate}' and l.submitted_pos_id = '${request.body.user.pos_id}'`)).rows;
      data[0] ? response.send({responseData : data,status : 200}).end() : response.send({status:200,message : 'no data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/life-reports-count',async(request,response)=>{
   try {
      // console.log(request.body);
      const date = new Date();
      const getMonth = date.getMonth()+1;
      const data  = await(await DataBase.DB.query(`select count(t.*) from pos_life_insurance_transactions l,pos_life_transactions t where l.policy_number = t.policy_number and extract(month from t.date_of_entry) = ${getMonth} and l.submitted_pos_id = '${request.body.user.pos_id}'`)).rows;
      data ? response.send({responseData : data,status:200}).end() : response.send({status : 200,message:'No data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/general-reports-count',async(request,response)=>{
   try {
      // console.log(request.body);
      const date = new Date();
      const getMonth = date.getMonth()+1;
      const data  = await(await DataBase.DB.query(`select count(t.*) from pos_general_insurance_transactions l,pos_general_transactions t where l.policy_number = t.policy_number and extract(month from t.date_of_entry) = ${getMonth} and l.submitted_pos_id = '${request.body.user.pos_id}'`)).rows;
      data ? response.send({responseData : data,status:200}).end() : response.send({status : 200,message:'No data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/monthly-life-revenue-data',async(req,res)=>{
   try {
      const result = await getReports('pos_life_transactions','pos_life_insurance_transactions',req.body.user.pos_id); 
      result ? res.send({responseData:result,status:200}).end : res.send({responseData:'No Data Found',status:200}).end();
   } catch (error) {
      console.log(error);
      res.send(error).end();
   }
});

router.get('/monthly-general-revenue-data',async(req,res)=>{
   try {
      const result = await getReports('pos_general_transactions','pos_general_insurance_transactions',req.body.user.pos_id); 
      result ? res.send({responseData:result,status:200}).end : res.send({responseData:'No Data Found',status:200}).end();
   } catch (error) {
      console.log(error);
      res.send(error).end();
   }
});



module.exports = router;