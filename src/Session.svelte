<script>
  import firebase from "firebase/app";
  import "firebase/auth";
  import "firebase/firestore";
  import "firebase/database";
  import { Navigate, navigateTo } from "svelte-router-spa";
  import { onMount, onDestroy } from "svelte";
  import EstimatedStories from "./EstimatedStories.svelte";
  import slug from "slug";
  import { fade, fly } from "svelte/transition";
  import UserNameForm from "./UserNameForm.svelte";
  import AddNewStory from "./AddNewStory.svelte";
  import ShareLink from "./ShareLink.svelte";
  import ConnectedUsers from "./ConnectedUsers.svelte";
  import OwnerButtons from "./OwnerButtons.svelte";
  import EstimatingTask from "./EstimatingTask.svelte";
  import { CONST } from "./consts.js";
  import {
    user$,
    init$,
    connected$,
    userName$,
    currentStory$,
    isOwner$,
    currentSession$,
    updateUserStatus,
    currentStoryEstimates$
  } from "./stores";

  export let currentRoute;

  let session;
  let _isOwner;
  let ping;
  let _userName;
  let errorMsg;

  let loadingSession = true;
  let loadingCurrentStory = true;

  let activeConnections = [];

  // how often to ping
  const pingTimer = 2000;
  const pingTimeOut = 10000;
  const db = firebase.firestore();
  const rtdb = firebase.database();
  const sid = currentRoute ? currentRoute.namedParams.id : null;

  // get session information from Firestore
  db.collection(CONST.sessions)
    .doc(sid)
    .get()
    .then(doc => {
      if (doc.exists) {
        session = { id: doc.id, ...doc.data() };
        currentSession$.set(session);
      } else {
        errorMsg = "Invalid session";
      }
    })
    .catch(e => {
      errorMsg = e;
    })
    .finally(() => (loadingSession = false));

  // realtime listeners
  const rdbRef = rtdb.ref(`${CONST.sessions}/${sid}`);
  const estimatesRef = rtdb.ref(`${CONST.estimates}/${sid}`);
  const joinedRef = rtdb.ref(`${CONST.joined}/${sid}`);

  onMount(() => {
    console.log("listening on changes via websockets");
    rdbRef.on("value", function(snapshot) {
      loadingCurrentStory = false;

      const story = snapshot.val();

      // update store
      currentStory$.set(story);

      // start counting ONLY from Owner Session
      if (_isOwner && story && story.timeRemaining >= 0) {
        setTimeout(() => {
          if (story.timeRemaining <= 0) {
            rtdb.ref(`${CONST.sessions}/${sid}`).update({
              timeRemaining: -1,
              showResult: true
            });
          } else {
            rtdb.ref(`${CONST.sessions}/${sid}`).update({
              timeRemaining: story.timeRemaining - 1
            });
          }
        }, 1000);
      }
    });

    estimatesRef.on("value", function(snapshot) {
      currentStoryEstimates$.set(snapshot.val());
    });

    joinedRef.on("value", function(snapshot) {
      const joinedList = snapshot.val() || {};
      const list = Object.keys(joinedList).map(k => ({
        user: k,
        lastConnected: joinedList[k]
      }));

      activeConnections = list.filter(x => {
        return (
          x.lastConnected &&
          new Date() - new Date(x.lastConnected) < pingTimeOut
        );
      });

      let disconnected = list.filter(x => {
        return (
          x.lastConnected &&
          new Date() - new Date(x.lastConnected) >= pingTimeOut
        );
      });
      if (disconnected.length > 0) {
        console.log("Disconnnected", disconnected);
      }

      connected$.set(activeConnections);
    });
  });

  onDestroy(() => {
    rdbRef && rdbRef.off();
    estimatesRef && estimatesRef.off();
    joinedRef && joinedRef.off();

    // remove ping
    clearInterval(ping);
    updateUserStatus(sid, _userName, false);
  });

  isOwner$.subscribe(x => (_isOwner = x));
  userName$.subscribe(x => {
    _userName = x;
    if (_userName && !ping) {
      ping = setInterval(
        () => updateUserStatus(sid, _userName, true),
        pingTimer
      );
    }
  });
</script>

<main class="text-center">
  {#if errorMsg}
    <div class="text-red-300 text-xl">{errorMsg}</div>
  {/if}

  {#if loadingCurrentStory || loadingSession}
    <div>Loading...</div>
  {:else if session}
    <div class="mb-6">
      <div class="text-grey-300 text-sm">
        Session created on {session.timeStampt.toDate().toLocaleDateString()} at
        {session.timeStampt.toDate().toLocaleTimeString()}
      </div>
      {#if !_isOwner}
        <div class="text-grey-300 text-sm">Owner: {session.displayName}</div>
      {:else}
        <ShareLink />
      {/if}
    </div>

    <!-- list of connected users -->
    <ConnectedUsers {activeConnections} userName={_userName} />

    <!-- forms: add new story or username form -->
    <div class="pt-6">
      {#if _isOwner}
        <AddNewStory sid={currentRoute.namedParams.id} />
      {:else}
        <UserNameForm {sid} />
      {/if}
    </div>

    {#if $userName$}
      <div class="pt-8">
        <EstimatingTask {sid} />
      </div>
      <div class="pt-8">
        <EstimatedStories {sid} />
      </div>
    {/if}
  {/if}
</main>
