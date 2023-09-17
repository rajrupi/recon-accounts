const {
    addDoc,
    collection,
    getDocs,
    getFirestore,
    query,
    serverTimestamp,
    where,
    getDoc,
    doc,
  } = require('firebase/firestore');

const {firebaseApp} = require('.')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const Excel = require('exceljs');

const firestore = getFirestore(firebaseApp)

const paymentSuccessful = async () => {
    const data = []
    const querySnapshot = await getDocs(
      query(
        collection(firestore, 'transactions'),
        where('status', '==', 'PAYMENT_SUCCESS')
      )
    )
  
    querySnapshot.forEach((doc) => {
       console.log(doc.data(),"dddddd")
      // doc.data() is never undefined for query doc snapshots
        const createdAtDate = new Date(doc.data().createdAt.seconds * 1000);
        const today = new Date();
        const differenceInMilliseconds = today - createdAtDate;
        const millisecondsInADay = 24 * 60 * 60 * 1000; 

        const daysDifference = differenceInMilliseconds / millisecondsInADay;
        const requiredData = {
            userId: doc.data().userId,
            invoiceDate: createdAtDate,
            utr: doc.data()?.pgResponse?.data?.paymentInstrument?.utr ?? '',
            mode: doc.data().pg,
        }

        if (daysDifference <= 1) {
            data.push(requiredData);
        }
    })
    return data;
  }
  


    
module.exports = {
    paymentSuccessful
  };

