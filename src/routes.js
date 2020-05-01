import Home from './Home.svelte';
import Session from './Session.svelte';
import Layout from './Layout.svelte';

const routes = [
	{
		name: '/',
		component: Home,
		layout: Layout,
	},
	{
		name: '/sessions/:id',
		component: Session,
		layout: Layout,
	},
];

export { routes };
