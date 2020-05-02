import * as functions from 'firebase-functions';

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

export const sessions = functions
	.region('asia-northeast1')
	.https.onRequest((request, response) => {
		console.log(request.query.id);
		return db
			.collection('sessions')
			.doc(request.query.id)
			.collection('estimatedStories')
			.get()
			.then((d: any) => {
				const docs = d.docs.map((x: any) => ({
					id: x.id,
					...x.data(),
				}));
				response.send(docs);
			});
	});
