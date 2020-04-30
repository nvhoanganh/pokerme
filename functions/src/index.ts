import * as functions from 'firebase-functions';
export const sessions = functions
	.region('asia-northeast1')
	.https.onRequest((request, response) => {
		response.send(['hello world']);
	});
