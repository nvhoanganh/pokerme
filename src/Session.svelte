<script>
  import firebase from "firebase/app";
  import "firebase/auth";
  import "firebase/firestore";
  import copy from "copy-to-clipboard";
  import "firebase/database";
  import { Navigate, navigateTo } from "svelte-router-spa";
  import { onMount, onDestroy } from "svelte";
  import EstimatedStories from "./EstimatedStories.svelte";
  import slug from "slug";
  import { fade, fly } from "svelte/transition";
  import UserNameForm from "./UserNameForm.svelte";
  import AddNewStory from "./AddNewStory.svelte";
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
  let copied;

  let loadingSession = true;
  let loadingCurrentStory = true;

  let activeConnections = [];

  const db = firebase.firestore();
  const rtdb = firebase.database();
  const sid = currentRoute ? currentRoute.namedParams.id : null;

  function copyLink() {
    copy(window.location.href);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000);
  }
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
      console.log("story changed", story);

      // update store
      currentStory$.set(story);

      // start counting ONLY from Owner Session
      if (_isOwner && story && story.timeRemaining >= 0) {
        setTimeout(() => {
          if (story.timeRemaining <= 0) {
            console.log("time's up", story.timeRemaining);
            rtdb.ref(`${CONST.sessions}/${sid}`).update({
              timeRemaining: -1,
              showResult: true
            });
          } else {
            console.log("time left:", story.timeRemaining);
            rtdb.ref(`${CONST.sessions}/${sid}`).update({
              timeRemaining: story.timeRemaining - 1
            });
          }
        }, 1000);
      }
    });

    estimatesRef.on("value", function(snapshot) {
      console.log("estimates changed", snapshot.val());
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
          x.lastConnected && new Date() - new Date(x.lastConnected) < 5000
        );
      });
      console.log("joinlist changed", activeConnections);
      connected$.set(activeConnections);
    });
  });

  onDestroy(() => {
    console.log("removing websockets connections");
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
      ping = setInterval(() => updateUserStatus(sid, _userName, true), 1000);
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
        <!-- Share link -->
        <div class="flex md:items-center max-w-md mx-auto pt-3">
          <div class="w-10/12">
            <input
              class="bg-gray-200 appearance-none border-2 border-gray-200
              rounded w-full py-2 px-4 text-gray-700 leading-tight"
              id="inline-full-name"
              type="text"
              value={window.location.href} />
          </div>
          <div class="w-2/12">
            <button
              on:click={copyLink}
              class="bg-grey-100 hover:bg-grey-500 text-grey-800 border
              border-grey-500 hover:border-transparent rounded"
              type="button">
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                stroke="currentColor"
                height="24"
                width="24"
                viewBox="0 0 24 24">
                {#if !copied}
                  <path
                    d="M8.684 13.342C8.886 12.938 9 12.482 9
                    12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0
                    2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0
                    105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368
                    2.684 3 3 0 00-5.368-2.684z" />
                {:else}
                  <path
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0
                    00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2
                    2 0 012 2m-6 9l2 2 4-4" />
                {/if}
              </svg>
            </button>
          </div>

        </div>
        {#if copied}
          <div
            in:fade={{ y: 100, duration: 400 }}
            out:fade={{ y: -100, duration: 400 }}
            class="text-sm text-grey-300 italic">
            Copied to clipboard!
          </div>
        {/if}
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
