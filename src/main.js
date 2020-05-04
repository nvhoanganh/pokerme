import App from './App.svelte';
import './firebase.js'

const app = new App({
	target: document.body,
	props: {
		name: 'world',
	},
});

export default app;
