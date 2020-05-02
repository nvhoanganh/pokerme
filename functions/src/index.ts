import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as R from 'ramda';

const json2csv = require('json2csv').parse;

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
			.then((d) => {
				const docs = d.docs.map((x) => ({
					id: x.id,
					...x.data(),
				}));

				response.setHeader(
					'Content-disposition',
					'attachment; filename=SessionsReport.csv'
				);
				response.set('Content-Type', 'text/csv');
				const csv = json2csv(toFlatCSV(docs));
				response.status(200).send(csv);
			});
	});

const toFlatCSV = (data) => {
	const getAllUsersInSessions = R.pipe(
		R.map((x) => ({
			taskId: x.taskId,
			users: R.keys(x.estimates),
		})),
		R.map((x) => R.flatten(x.users)),
		R.flatten,
		R.uniq
	);

	const users = getAllUsersInSessions(data);

	const getEstForUser = (usrs: string[], estimates) => {
		const newobj = {};
		usrs.forEach((x) => {
			if (x in estimates) {
				newobj[x] = estimates[x];
			} else {
				newobj[x] = '';
			}
		});

		return newobj;
	};

	const flatten = data.map((x) => ({
		taskId: x.taskId,
		description: x.description,
		...getEstForUser(users, x.estimates),
	}));

	return flatten;
};
