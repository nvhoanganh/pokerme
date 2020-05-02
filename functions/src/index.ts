import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const sessions = functions
	.region('asia-northeast1')
	.https.onRequest((request, response) => {
		return db
			.collection('sessions')
			.doc(request.query.id as string)
			.collection('estimatedStories')
			.limit(20)
			.get()
			.then((d: any) => {
				const docs = d.docs.map((x: any) => ({
					id: x.id,
					...x.data(),
				}));
				response.send(docs);
			});
	});
