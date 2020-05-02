import Home from './Home.svelte';
import Session from './Session.svelte';
import Layout from './Layout.svelte';

const routes = [
	{
		name: '/sessions/:id',
		component: Session,
		layout: Layout,
	},
	{
		name: '/',
		component: Home,
		layout: Layout,
	},
];

export { routes };
