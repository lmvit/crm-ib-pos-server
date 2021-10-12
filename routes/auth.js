require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const jwtAuthToken = process.env.ACCESS_TOKEN_SECRET;
const jwtRefreshToken = process.env.JWT_REFRESH_TOKEN;
const smsKey = process.env.SMS_SECRET_KEY;

router.post('/send-otp',async(req,res)=>{
    try {
        const phone = req.body.phone;
        const otp = Math.floor(100000 + Math.random()*900000);
        const ttl = 10*60*1000;
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = crypto.createHmac('sha256',smsKey).update(data).digest('hex');
        const fullHash = `${hash}.${expires}`;
       axios.post(`https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=${process.env.SMS_GATEWAY_HUB_KEY}&senderid=PAYNXT&channel=2&DCS=0&flashsms=0&number=${phone}&text=Dear ${phone}, ${otp} is OTP for your login at PAYNEXT portal Don't share the OTP to anyone. In case of dispute call us 8142044044. PAYNEXT never asks for OTP.&dlttemplateid=1307162866258553923`)
       .then(response=>res.send({phone,hash:fullHash}))
       .catch(err=>console.log(err))
    } catch (error) {
        console.log(error);
    }
});

router.post('/verify-otp',async(req,res)=>{
    try {
        const phone = req.body.obj.phone;
        const hash = req.body.obj.hash;
        const otp = req.body.obj.otp;
        let [hashValue,expires] = hash.split('.');
        let now = Date.now();
        if(now > parseInt(expires)){
            return res.status(504).send({message : 'Timeout Please try again'});
        }
        const data = `${phone}.${otp}.${expires}`;
        const newHash = crypto.createHmac('sha256',smsKey).update(data).digest('hex');
        if(newHash === hashValue){
            return res.status(200).send({message : 'Success'});
            // const accessToken = jwt.sign({data : phone},jwtAuthToken,{expiresIn:'30s'})
            // const refreshToken = jwt.sign({data:phone},refreshToken,{expiresIn:'30s'})
        }else{
            return res.status(400).send({verification : false,message : 'Incorrect OTP'})
        }
    } catch (error) {
        console.log(error);
    }
})


module.exports = router;