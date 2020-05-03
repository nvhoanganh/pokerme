# Planning Poker App with Svelte and Firebase in 1 day
In this tutorial, we will build a web app which will help Dev teams conduct Planning Poker sessions online (assuming COVID-19 will stay and we will have to work from home for another 2 years).

## Features of the PokerMe (or whatever you call it):
- user visit https://pokerme.web.app/
- home page will display: 
  - If user currently logged in: **Create new Session** button and table of all previous planning poker sessions
  - **Sign In With Google** button if user has not sign in yet
- to sign in/sign up, all they need to do is click on the **Sign In With Google** button and login using their Gmail account
- once signed in, user click **Create new Session**, user is redirected to https://pokerme.web.app/sessions/af334df3 (`af334df3` is unique session id)
- on that page, session owner will have the following elements:
  1. **Share** button which owner can send it to others to join in (same https://pokerme.web.app/sessions/af334df3)
  1. a table showing the list of Esimated Stories and response from each participants (columns)
  1. for example, if a session has 5 users (including owner) and 3 stories were estimated, we will have a table like below
  1. **Next Story** button and **Finish Session** button

| Story              | Anthony | David | John | Ken | Luke | - AVG - |
|--------------------|---------|-------|------|-----|------|---------|
| 233: Create a page | 8       | 12    | 10   | 8   | 8    | 10      |
| 234: login         | 6       | 6     | 6    | 6   | 8    | 6       |
| 235: logout        | 8       | 8     | 8    | 8   | 8    | 8       |
   
- click on **Next Story** button will open a form:
  - with textbox for the **URL** to the user story (e.g in Github or Azure Devops or JIRA) 
  - and **Create** button
- click **Create** will cause a modal to pop up shown on all **Participants** screen (cover all screen), displaying the URL to the story (automatically, via **websocket**)
- on **Partcipant** modal, there is only dropdown and they need to pick 1 value from: 0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100
- on **Owner** modal, there is 1 more button, **Reveal Score**, click on this button will cause a timer of 10 seconds to start simultanousely on all users screen.
- after 10 seconds, the score entered by all participants will be displayed to every one
- on **Owner** modal, there is now new button, **Save**, click on this button will close the modal for everyone (via **websocket**) and update the table above
- owner repeat the proces above for all required user stories
- once done, owner clicks on **Finish Session** button, user will get redirected to home page. All other participants will get a message saying `Thanks, poker session is now completed, you can close this window now`
- **other features:** 
  - REST API supports: user can call https://asia-northeast1-pokerme.cloudfunctions.net/sessions?api=key to get the list of all completed sessions.


## Tech stack: all free services from Google
- Front end: https://svelte.dev/ hosted on firebase hosting
- Planning Poker Sessions database: Firestore (NoSql) - (Equivalent to Azure CosmodDB)
- Realtime updates: Firebase Realtime Database (Equivalent to Azure SignalR service)
- REST Api: Firebase Functions (Equivalent to Azure functions)


## Prerequisites
- [ ] nodejs v10
- [ ] vscode
- [ ] gmail account
- [ ] install `Svelte`, `Svelte 3 Snippets` and `Svelte Intellisense` extension on VSCODE

# Step 1: setup our application components
**Note**: I registered my firebase app ID as `pokerme`, you won't be able to use this name, so make sure you replace `pokerme` in this guide with the project Id you choose below
## Create new svelte app
```sh
npx degit sveltejs/template pokerme
npm install
npm run dev
```

Then open `http://localhost:5000/` make sure you can see the app running

## Create firebase project
Go to https://console.firebase.google.com/?pli=1 and create new project
Then go to the project setting https://console.firebase.google.com/project/pokerme2-53a08/settings/general and pick the location for your project
```sh
npm i -g firebase-tools
firebase login
firebase init
# select: Hosting and Functions
# pick project you just created from the list from the list
# for function -> you can use either JS or TS
# for hosting -> use public as the deploy folder, select Y for rewriting to /index.html
```

## Deploy UI to firebase
```sh
firebase deploy --only hosting
```

Go to https://pokerme.web.app/ and make sure you can app live

## Create Realtime Database and Firestore Database on Firebase

-   Login to https://console.firebase.google.com and select your project
-   Click on Create Database
-   Select _Start in test mode_
-   Pick location closest to your user (can't be changed later)

## Enable Authentication

-   Go to _Authentication_ menu on the left and click on _Set up sign-in method_
-   Enable Google Authentication only (we won't be doing other types of Auth in the tutorial)

## Get the project config JSON file
We need this config file so that the UI can read/write into the database we created above
-   Click on the Cog icon next to project Overview and select _Project Settings_
-   Under Your apps => Click Web Icon to create new web app and Click on "Register Web app"
-   Click on _Continue to Console_
-   Under _Firebase SDK snippet_ select _Config_
-   You will need this config file later

```sh
const firebaseConfig = {
  apiKey: "<API>",
  authDomain: "pokerme.firebaseapp.com",
  databaseURL: "https://pokerme.firebaseio.com",
  projectId: "pokerme",
  storageBucket: "pokerme.appspot.com",
  messagingSenderId: "801289526392",
  appId: "1:801289526392:web:966d747a2a6db238ade18d"
};
```

## Deploy Functions (REST Api)
edit `index.ts` file under `functions\src` folder to:
```javascript
import * as functions from 'firebase-functions';
export const sessions = functions
	.region('asia-northeast1')
	.https.onRequest((request, response) => {
		response.send(['hello world']);
	});

```
then deploy it by running
```sh
firebase deploy --only functions
```
from the command line, it should tell you the deployed URL of the REST API. 

Mine at: https://asia-northeast1-pokerme.cloudfunctions.net/sessions

## Step 1: check list
- my UI is deployed
- my REST API is deployed 
- I have my `firebaseConfig` JSON file
- I have enable Google Authentication on Firebase console

# Step 2: Start coding the UI
.. on the day

for the time being, have a look https://svelte.dev/examples
