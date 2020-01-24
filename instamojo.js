const rx = require('rxjs');
const instamojoAPI = require('instamojo-nodejs');
const authToken = require('./credentials');
const operators = require('rxjs/operators');
const fs = require('fs')
const { rxToStream } = require('rxjs-stream');

function authorizeUser(authToken){
    if(!authToken){
        throw new Error("Something went wrong with the Instamojo credentials");
    }
    instamojoAPI.setKeys(authToken.key, authToken.token);
    return true;
}

function getPaymentDetails(authToken){
    if(authorizeUser(authToken)){
        return rx.from(new Promise((resolve, reject) => {
            instamojoAPI.getAllPaymentRequests(function (error, response) {            
                if(error){ reject(error); }            
                else{ resolve(response); }
            })
        })).pipe(
            operators.concatMap(response => response.payment_requests),    
        );
    }
}

function getRefundDetails(authToken){
    if(authorizeUser(authToken)){
        return rx.from(new Promise((resolve, reject) =>{
            instamojoAPI.getAllRefunds(function (error, response) { 
                if(error){ reject(error); }            
                else{ resolve(response); }
            });    
        })).pipe(
            operators.concatMap(response => response.refunds)
        );         
    }
}

function getSingleRefundDetails(refundId, authToken){
    if(authorizeUser(authToken)){
        return rx.of(new Promise((resolve, reject) =>{
            instamojoAPI.getRefundDetails(refundId, function (error, response) { 
                if(error){ reject(error); }            
                else{ resolve(response); }
            });    
        })).pipe(
            operators.concatMap(response => response)
        );         
    }
}

const allPayments$ = getPaymentDetails(authToken);
// allPayments$.subscribe(console.log);

// For writing to a file
// var fsStream = fs.createWriteStream('paymentDetails.json', 'utf-8');
// rxToStream(allPayments$.pipe(
//     operators.toArray(),
//     operators.map(value => JSON.stringify(value))))
// .pipe(fsStream);

const allRefunds$ = getRefundDetails(authToken);
allRefunds$.subscribe(console.log);

// For writing to a file
// fsStream = fs.createWriteStream('refundsDetails.json', 'utf-8');
// rxToStream(allRefunds$.pipe(
//     operators.toArray(),
//     operators.map(value => JSON.stringify(value))))
// .pipe(fsStream);

// const singleRefundDetails$ = getSingleRefundDetails('C9c0154657', authToken);
// singleRefundDetails$.subscribe(console.log);