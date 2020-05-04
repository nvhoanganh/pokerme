import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import slug from 'slug';
import { derived, writable } from 'svelte/store';
import { CONST } from './consts.js';
import { Sessions } from './firebase.js';
export const user$ = writable(null);

let user;
export const init$ = writable(true, function start(set) {
	firebase.auth().onAuthStateChanged((u) => {
		user = u;
		set(false);
		user$.set(u);
		if (u) {
			userName$.set(u.displayName);
			// subscribe to the list of sessions for the current user
			Sessions.where('createdBy', '==', u.uid)
				.orderBy('timeStampt', 'desc')
				.limit(100)
				.onSnapshot(
					(snapshot) => {
						let list = [];
						snapshot.forEach((doc) =>
							list.push({
								id: doc.id,
								...doc.data(),
								timeStampt: doc.data().timeStampt.toDate(),
							})
						);
						fbError$.set(null);
						sessionsList$.set(list);
					},
					(e) => fbError$.set(e)
				);
		}
	});
});

export const fbError$ = writable(null);
export const sessionsList$ = writable([]);
export const currentStory$ = writable(null);
export const connected$ = writable([]);
export const previousSessions$ = writable([]);
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
