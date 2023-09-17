//import { reckonedUsers } from 'services/Firebase/firestore'

require('dotenv').config();

let nodemailer = require('nodemailer')
let cron = require('node-cron')
const fs = require('fs');
const Excel = require('exceljs');
const path = require('path');
const XLSX = require('xlsx');
var toCsv = require('to-csv');
const { paymentSuccessful } = require('./Firebase/firestore');
const { getDoc, getFirestore, doc } = require('firebase/firestore');
const { firebaseApp } = require('./Firebase');

//sanchit@arthvit.in,srimanta@rupicard.com

const firestore = getFirestore(firebaseApp)

const mainFn = async() => {
    let reckonedUserList = await paymentSuccessful();
    
    const newreckonedUserList = await Promise.all(reckonedUserList.map(async (user) => {
        const userDoc = await getDoc(doc(firestore,'users',user.userId));
        const userDocData =  userDoc?.data();
        const requireUserData = 
            {
            invoiceDate: user.invoiceDate,
            place: userDocData.pincode,
            mode: user.mode,
            utr: user.utr,
            gross: 83.90,
            cgst: userDocData.pincode >=560001 && userDocData.pincode <= 591346 ? 7.55 : null,
            sgst: userDocData.pincode >=560001 && userDocData.pincode <= 591346 ? 7.55 : null,
            igst: userDocData.pincode >=560001 && userDocData.pincode <= 591346 ? null : 15.10,
            total: 99.00,
            userId: user.userId
            }
            return (requireUserData);
        
    }))
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'rajprakash@rupicard.com',
          pass: process.env.GMAIL_PASSWORD,
        },
      });
      
      cron.schedule('* * * * *', async () => {
        console.log('running a task every min')

        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet('Accounts');
        worksheet.columns = [
                    {header: 'Invoice Date', key: 'invoiceDate'},
                    {header: 'Place of Supply', key: 'place'},
                    {header: 'Mode of Payment', key: 'mode'},
                    {header: 'Unique Transaction Ref No. (provided by Payment Aggregator)', key: 'utr'},
                    {header: 'Gross Amount', key: 'gross'},
                    {header: 'CGST', key: 'cgst'},
                    {header: 'SGST', key: 'sgst'},
                    {header: 'IGST', key: 'igst'},
                    {header: 'Total', key: 'total'},
                    {header: 'userId', key: 'userId'}
                ];
      
        {newreckonedUserList.length ? (worksheet.addRows(newreckonedUserList),
        workbook.xlsx.writeBuffer().then((buffer) => {
            // Attach the generated Excel file
            let mailOptions = {
                from: 'rajprakash@rupicard.com',
                to: 'rajprakash@rupicard.com',
                subject: `Yesterday's Account Details`,
                text: `PFA yesterday's accounts' details having successfull payments`,
                attachments: [
                  {
                      filename: 'reckoned_accounts.xlsx',
                      content: buffer,
                  },
              ],
            };
        
            //send the mail
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error)
                } else {
                  console.log('Email sent: ' + info.response)
                }
              })
        })): console.log("emptyyyyyy")
       }
      })
}

mainFn();


