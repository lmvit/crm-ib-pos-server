const { request } = require('express');
const express = require('express');
const router = express.Router();
const Database = require('../Database');
const addDateFunction = require('date-fns/addDays');
const addMonthFunction = require('date-fns');

router.get('/get-records/:name/:id',async(request,response)=>{
   try {
      let renewalDateNotification;
      const result = await(await Database.DB.query(`select * from ${request.params.name} where submitted_pos_id = '${request.params.id}'`)).rows;
      const resData = result.filter((customer,index)=>{
         const date = new Date(result[index].renewal_date);
         let getPremiumPaymentMode = result[index].premium_payment_mode;
         const currentDate = new Date().toLocaleDateString('en-CA');
         switch (getPremiumPaymentMode) {
            case 'Monthly':
               renewalDateNotification = addMonthFunction.subDays(date,15).toLocaleDateString('en-CA');
               break;
            case 'Quaterly':
               renewalDateNotification = addMonthFunction.subMonths(date,1).toLocaleDateString('en-CA');
               break;
            case 'Half Yearly':
               renewalDateNotification = addMonthFunction.subMonths(date,1).toLocaleDateString('en-CA');
               break;
            case 'Annually':
               renewalDateNotification = addMonthFunction.subMonths(date,1).toLocaleDateString('en-CA');
               break;
            default:
               renewalDateNotification = addMonthFunction.subDays(date,15).toLocaleDateString('en-CA');
               break;
         }
         if(currentDate >= result[index].renewal_date || renewalDateNotification < currentDate){
            return true;
         }
         return false;
      })
      // console.log(resData)
      response.send(resData ? resData : 'No Data Found').end()
   } catch (error) {
      console.log(error);
   }
});

module.exports = router;