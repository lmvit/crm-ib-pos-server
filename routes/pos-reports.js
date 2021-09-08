const { response } = require('express');
const express = require('express');
const router = express.Router();
const DataBase = require('../Database');
const { getReports } = require('./helper');

router.get('/get-life-insurance-pos-reports/:fromDate/:toDate',async(request,response)=>{
   try {
      // const data = await(await DataBase.DB.query(`select * from pos_life_insurance_transactions where date_of_entry between '${request.params.fromDate}' and '${request.params.toDate}'`)).rows;
      const data = await(await DataBase.DB.query(`select l.*,t.* from pos_life_insurance_transactions l,pos_life_transactions t where l.policy_number = t.policy_number and t.date_of_entry between
      '${request.params.fromDate}' and '${request.params.toDate}'`)).rows;
      data[0] ? response.send({responseData : data,status : 200}).end() : response.send({status:200,message : 'no data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/get-general-insurance-pos-reports/:fromDate/:toDate',async(request,response)=>{
   try {
      const data = await(await DataBase.DB.query(`select l.*,t.* from pos_general_insurance_transactions l,pos_life_transactions t where l.policy_number = t.policy_number and t.date_of_entry between
      '${request.params.fromDate}' and '${request.params.toDate}'`)).rows;
      // const data = await(await DataBase.DB.query(`select * from pos_general_insurance_transactions where date_of_entry between '${request.params.fromDate}' and '${request.params.toDate}'`)).rows;
      data[0] ? response.send({responseData : data,status : 200}).end() : response.send({status:200,message : 'no data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/life-reports-count/:posId',async(request,response)=>{
   try {
      const date = new Date();
      const getMonth = date.getMonth()+1;
      // console.log(getMonth);
      const data  = await(await DataBase.DB.query(`select count(t.*) from pos_life_insurance_transactions l,pos_life_transactions t where l.policy_number = t.policy_number and extract(month from t.date_of_entry) = ${getMonth} and l.submitted_pos_id = '${request.params.posId}'`)).rows;
      // const data  = await(await DataBase.DB.query(`select count(*) from pos_life_insurance_transactions where extract(month from date_of_entry) = ${getMonth}`)).rows;
      data ? response.send({responseData : data,status:200}).end() : response.send({status : 200,message:'No data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/general-reports-count/:posId',async(request,response)=>{
   try {
      const date = new Date();
      const getMonth = date.getMonth()+1;
      // console.log(getMonth);
      const data  = await(await DataBase.DB.query(`select count(t.*) from pos_general_insurance_transactions l,pos_life_transactions t where l.policy_number = t.policy_number and extract(month from t.date_of_entry) = ${getMonth} and l.submitted_pos_id = '${request.params.posId}'`)).rows;
      // const data  = await(await DataBase.DB.query(`select count(*) from pos_general_insurance_transactions where extract(month from date_of_entry) = ${getMonth}`)).rows;
      data ? response.send({responseData : data,status:200}).end() : response.send({status : 200,message:'No data found'}).end();
   } catch (error) {
      console.log(error);
   }
});

router.get('/monthly-life-revenue-data',async(req,res)=>{
   try {
      const result = await getReports('pos_life_transactions'); 
      // console.log(result);
      result ? res.send({responseData:result,status:200}).end : res.send({responseData:'No Data Found',status:200}).end();
   } catch (error) {
      console.log(error);
      res.send(error).end();
   }
});

router.get('/monthly-general-revenue-data',async(req,res)=>{
   try {
      const result = await getReports('pos_general_transactions'); 
      // console.log(result);
      result ? res.send({responseData:result,status:200}).end : res.send({responseData:'No Data Found',status:200}).end();
   } catch (error) {
      console.log(error);
      res.send(error).end();
   }
});

module.exports = router;