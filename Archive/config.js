var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://disaster-aware-default-rtdb.firebaseio.com/"
}); 
module.exports = admin;

// // Firestore 데이터베이스 인스턴스를 가져옵니다.
// const db = admin.firestore();

// // 새로운 데이터를 추가하는 함수
// function addData() {
//   const collectionRef = db.collection('users');

//   // 추가할 데이터 객체
//   const data = {
//     name: 'John Doe',
//     age: 25,
//     email: 'johndoe@example.com'
//   };

//   // 데이터를 추가합니다.
//   collectionRef.add(data)
//     .then((docRef) => {
//       console.log('Document written with ID:', docRef.id);
//     })
//     .catch((error) => {
//       console.error('Error adding document:', error);
//     });
// }

// // 데이터 추가 함수 호출
// addData();
