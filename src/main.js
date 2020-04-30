import App from './App.svelte';
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

const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
});

export default app;
