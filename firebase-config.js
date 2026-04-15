// Firebase Configuration for The Burnay Lab

const firebaseConfig = {
  apiKey: "AIzaSyAki3QaFgKY0cTWAt2R06c86WimoXRVWKs",
  authDomain: "lessonsplatform-e228c.firebaseapp.com",
  projectId: "lessonsplatform-e228c",
  storageBucket: "lessonsplatform-e228c.firebasestorage.app",
  messagingSenderId: "804556322280",
  appId: "1:804556322280:web:85ffeb6fd6a49e321c605d",
  measurementId: "G-C1W603VKQS",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
var db = firebase.firestore();
console.log("Firebase initialized");

console.log("Firebase initialized successfully!");
