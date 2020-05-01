<script>
  import firebase from "firebase/app";
  import { user$, init$ } from "./stores";
  import { navigateTo } from "svelte-router-spa";
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
</script>

{#if $init$}
  <p>Loading...</p>
{:else}
  {#if errorMsg}
    <span style="color: red">Error creating session</span>
  {/if}
  {#if !$user$}
    <button on:click={login} class="button">Login Using Google</button>
  {:else}
    <div>
      <h1>Hello {$user$.displayName}</h1>
    </div>
    <div>
      <button on:click={newSession} class="button">
        Start New Planning Poker Session
      </button>
      <button on:click={logout} class="button">Sign Out</button>
    </div>
    <div class="home">
      <ul>
        <li>Session 1: do this</li>
      </ul>
    </div>
  {/if}
{/if}
