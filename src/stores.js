import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import slug from 'slug';
import { derived, writable } from 'svelte/store';
import { CONST } from './consts.js';
import { Sessions, db, fs } from './firebase.js';
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

export const loadingSession$ = writable(false);
export const loadingSessionError$ = writable(null);

// custom store
function createSession() {
	const { subscribe, set } = writable(null);
	let storyRef;
	let estimatesRef;
	let joinedRef;

	return {
		subscribe,
		load: (sid) => {
			loadingSession$.set(true);

			Sessions.doc(sid)
				.get()
				.then((doc) => {
					if (doc.exists) {
						const s = { id: doc.id, ...doc.data() };
						set(s);

						// session is valid
						storyRef = db.ref(`${CONST.sessions}/${sid}`);
						estimatesRef = db.ref(`${CONST.estimates}/${sid}`);
						joinedRef = db.ref(`${CONST.joined}/${sid}`);

						console.log('listening on active Story');
						storyRef.on('value', (snapshot) => {
							const story = snapshot.val();
							console.log('new story', story);

							// update store
							currentStory$.set(story);

							// start counting ONLY from Owner Sessionk
							if (isOwner && story && story.timeRemaining >= 0) {
								setTimeout(() => {
									if (story.timeRemaining <= 0) {
										storyRef.update({
											timeRemaining: -1,
											showResult: true,
										});
									} else {
										storyRef.update({
											timeRemaining:
												story.timeRemaining - 1,
										});
									}
								}, 1000);
							}
						});

						console.log('listening on estimates');
						estimatesRef.on('value', (snapshot) => {
							currentStoryEstimates$.set(snapshot.val());
							console.log('story', snapshot.val());
						});

						console.log('listening on connected users');
						joinedRef.on('value', (snapshot) => {
							const joinedList = snapshot.val() || {};
							console.log('joined list', snapshot.val());
							const list = Object.keys(joinedList).map((k) => ({
								user: k,
								lastConnected: joinedList[k],
							}));

							const stillActive = list.filter((x) => {
								return (
									x.lastConnected &&
									new Date() - new Date(x.lastConnected) <
										5000
								);
							});

							connected$.set(stillActive);
						});
					} else {
						loadingSessionError$.set('Invalid session');
					}
				})
				.catch((e) => loadingSessionError$.set('Invalid session'))
				.finally(() => loadingSession$.set(false));
		},
		destroy: () => {
			console.log('removing realtime listeners');
			storyRef && storyRef.off();
			estimatesRef && estimatesRef.off();
			joinedRef && joinedRef.off();
		},
	};
}
export const activeSession$ = createSession();

export const userName$ = writable(null);
export const currentStoryEstimates$ = writable(null);

// derived
export const isOwner$ = derived(
	[user$, activeSession$],
	([user, session]) => user && session && user.uid === session.createdBy
);

export const otherConnectedUsers$ = derived(
	[userName$, connected$],
	([userName, connected]) =>
		connected.filter((item) => userName && item.user !== slug(userName))
);

export const updateUserStatus = (sid, user, connected) => {
	let update = {};
	update[`${CONST.joined}/${sid}/${slug(user)}`] = connected
		? new Date().toISOString()
		: null;
	firebase.database().ref().update(update);
};

let isOwner;
isOwner$.subscribe((x) => (isOwner = x));
