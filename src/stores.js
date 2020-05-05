import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/firestore';
import slug from 'slug';
import { derived, writable } from 'svelte/store';
import { navigateTo } from 'svelte-router-spa';
import { CONST } from './consts.js';
import { Sessions, db } from './firebase.js';
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
export const createSessionError$ = writable(null);
export const sessionsList$ = writable([]);
export const currentStory$ = writable(null);
export const connected$ = writable([]);
export const previousSessions$ = writable([]);
export const activeSession$ = createSession();
export const userName$ = writable(null);
export const currentStoryEstimates$ = writable(null);
export const addNewStoryError$ = writable(null);
export const saveStoryError$ = writable(null);
export const loadingSession$ = writable(false);
export const loadingCurrentStory$ = writable(false);
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
			loadingCurrentStory$.set(true);
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

						storyRef.on('value', (snapshot) => {
							const story = snapshot.val();

							// update store
							loadingCurrentStory$.set(false);
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

						estimatesRef.on('value', (snapshot) => {
							currentStoryEstimates$.set(snapshot.val());
						});

						joinedRef.on('value', (snapshot) => {
							const joinedList = snapshot.val() || {};
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
			storyRef && storyRef.off();
			estimatesRef && estimatesRef.off();
			joinedRef && joinedRef.off();
		},
	};
}

// derived states
export const isOwner$ = derived(
	[user$, activeSession$],
	([user, session]) => user && session && user.uid === session.createdBy
);

export const currentStoryEstimatesArray$ = derived(
	currentStoryEstimates$,
	(x) =>
		x
			? Object.keys(x).map((k) => ({
					name: k,
					estimate: x[k],
			  }))
			: []
);

export const otherConnectedUsers$ = derived(
	[userName$, connected$],
	([userName, connected]) => {
		const others = connected.filter(
			(item) => item.user !== slug(userName || '')
		);
		return others;
	}
);

export const hideQrCode$ = derived(
	[isOwner$, otherConnectedUsers$],
	([isOwner, others]) => isOwner && others && others.length > 0
);

// functions
export const startNewStory = (sid, story) => {
	db.ref(`${CONST.sessions}/${sid}`).set(story, (error) =>
		addNewStoryError$.set(error)
	);
};

export const submitEstimate = (sid, user, est) => {
	db.ref(`${CONST.estimates}/${sid}`).update({
		[slug(user)]: est,
	});
};

export const revealEstimates = (sid) => {
	db.ref(`${CONST.sessions}/${sid}`).update({ timeRemaining: 10 });
};

export const updateUserStatus = (sid, user, connected) => {
	let update = {};
	update[`${CONST.joined}/${sid}/${slug(user)}`] = connected
		? new Date().toISOString()
		: null;
	firebase.database().ref().update(update);
};

export const saveResult = (sid, data) => {
	Sessions.doc(sid)
		.collection(CONST.estimatedStories)
		.doc(data.taskId.toString())
		.set(data)
		.then(() => {
			currentStory$.set(null);
			currentStoryEstimates$.set(null);
			saveStoryError$.set(null);
			db.ref(`${CONST.sessions}/${sid}`).remove();
			db.ref(`${CONST.estimates}/${sid}`).remove();
		})
		.catch((error) => saveStoryError$.set(error));
};

export const newSession = (user) => {
	Sessions.add({
		createdBy: user.uid,
		displayName: user.displayName,
		timeStampt: new Date(),
	})
		.then((doc) => {
			createSessionError$.set(null);
			navigateTo(`/sessions/${doc.id}`);
		})
		.catch((error) => createSessionError$.set(error));
};
let isOwner;
isOwner$.subscribe((x) => (isOwner = x));
