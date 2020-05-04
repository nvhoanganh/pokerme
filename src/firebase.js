import firebase from 'firebase/app';

firebase.initializeApp({
	apiKey: 'AIzaSyCCeYXP6AsMe2Imq5TV68cCGZztjUH9VuM',
	authDomain: 'pokerme.firebaseapp.com',
	databaseURL: 'https://pokerme.firebaseio.com',
	projectId: 'pokerme',
	storageBucket: 'pokerme.appspot.com',
	messagingSenderId: '801289526392',
	appId: '1:801289526392:web:966d747a2a6db238ade18d',
});

export const Sessions = firebase.firestore().collection('sessions');
export const auth = firebase.auth();
export const currentUser = firebase.auth().currentUser;

export function loginGoogle() {
  firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
}

export function logout() {
  firebase.auth().signOut();
}