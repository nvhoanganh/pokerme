<script>
  import firebase from "firebase/app";
  import { Navigate, navigateTo } from "svelte-router-spa";
  import { user$, init$ } from "./stores";
  import "firebase/auth";
  import "firebase/firestore";

  const db = firebase.firestore();

  let errorMsg;

  function login() {
    firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }

  function logout() {
    firebase.auth().signOut();
  }

  function newSession() {
    const { uid, displayName } = firebase.auth().currentUser;
    db.collection("sessions")
      .add({
        createdBy: uid,
        displayName,
        timeStampt: new Date()
      })
      .then(function(docRef) {
        navigateTo(`/sessions/${docRef.id}`);
      })
      .catch(function(error) {
        errorMsg = error;
      });
  }

  let listOfSessions = [];
  user$.subscribe(u => {
    if (!u) return;

    db.collection("sessions")
      .where("createdBy", "==", u.uid)
      .get()
      .then(function(querySnapshot) {
        // can't push directly to listOfSessions
        let list = [];
        querySnapshot.forEach(function(doc) {
          list.push({ id: doc.id, ...doc.data() });
        });
        listOfSessions = list;
      })
      .catch(function(error) {
        errorMsg = error;
      });
  });
</script>

{#if $init$}
  <p>Loading...</p>
{:else}
  <main class="text-center">
    {#if errorMsg}
      <div class="text-red-300 text-xl">{errorMsg}</div>
    {/if}
    {#if !$user$}
      <div class="text-grey-300 text pb-4 font-mono">
        <svg
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          width="22"
          height="22"
          class="inline-block"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13
            21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        a FREE Scrum Planning Poker app
        <svg
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          width="22"
          height="22"
          class="inline-block"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13
            21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </div>
      <div class="text-grey-400 font-sm font-mono pb-8 pt-6">
        Sign in to create new session
      </div>
      <button
        on:click={login}
        type="button"
        class="max-w-sm mx-auto social bg-white hover:bg-red-400 block
        hover:text-white py-2 px-4 border border-red-700
        hover:border-transparent rounded">
        <svg
          width="20"
          height="20"
          class="inline-block mr-1"
          viewBox="0 0 256 262"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid">
          <path
            d="M255.878
            133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45
            12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023
            2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
            fill="#4285F4" />
          <path
            d="M130.55 261.1c35.248 0 64.839-11.605
            86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257
            13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298
            31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
            fill="#34A853" />
          <path
            d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994
            1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077
            89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
            fill="#FBBC05" />
          <path
            d="M130.55 50.479c24.514 0 41.05 10.589 50.479
            19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393
            29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251
            74.414-54.251"
            fill="#EB4335" />
        </svg>
        Sign In with Google
      </button>
    {:else}
      <div class="text-grey-400 font-sm">
        Hello {$user$.displayName}
        <a
          class="text-grey-400"
          title="Sign out"
          on:click={logout}
          href="javascript:void(0)">
          Sign out
        </a>
      </div>
      <div class="py-6">
        <button
          on:click={newSession}
          class="max-w-sm bg-blue-100 hover:bg-blue-500 text-blue-800
          font-semibold hover:text-white py-2 px-4 border border-blue-500
          hover:border-transparent rounded"
          type="button">
          Start New Planning Poker Session
        </button>
      </div>
      <div class="m-6 max-w-md mx-auto">
        <div class="text-center text-3xl text-grey-300 pb-5">
          Previous Sessions
        </div>
        {#each listOfSessions as item}
          <div
            class="border shadow p-4 my-3 font-mono cursor-pointer"
            on:click={() => navigateTo('/sessions/' + item.id)}>
            Created {item.timeStampt.toDate().toLocaleDateString()} at {item.timeStampt
              .toDate()
              .toLocaleTimeString()} :
            <Navigate to={'/sessions/' + item.id}>
              <svg
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="inline-block"
                width="24"
                height="24"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Navigate>
          </div>
        {/each}
      </div>
    {/if}
  </main>
{/if}
