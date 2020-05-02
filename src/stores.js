import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/database';
import { writable, derived } from 'svelte/store';
import { CONST } from './consts.js';
import slug from 'slug';

export const user$ = writable(null);
export const init$ = writable(true);
export const currentStory$ = writable(null);
export const connected$ = writable([]);
export const currentSession$ = writable(null);
export const userName$ = writable(null);
export const currentStoryEstimates$ = writable(null);

// derived
export const isOwner$ = derived(
	[user$, currentSession$],
	([user, session]) => user && session && user.uid === session.createdBy
);

export const updateUserStatus = (sid, user, connected) => {
	let update = {};
	update[`${CONST.joined}/${sid}/${slug(user)}`] = connected
		? new Date().toISOString()
		: null;
	firebase.database().ref().update(update);
};