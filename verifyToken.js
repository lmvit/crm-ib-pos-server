const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = function(req,res,next){
    const token = req.headers['authorization'];
    if(!token)res.status(401).send('Access Denied');
    try {
        const verify = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = verify;
        next();
    } catch (error) {
        res.status(400).send('Invalid token...')
    }
}
