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
        console.log(listOfSessions);
      })
      .catch(function(error) {
        errorMsg = error;
      });
  });
</script>

{#if $init$}
  <p>Loading...</p>
{:else}
  {#if errorMsg}
    <span style="color: red">{errorMsg}</span>
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
      <ol>
        {#each listOfSessions as item}
          <li>
            Created on {item.timeStampt.toDate().toLocaleDateString()} at {item.timeStampt.toDate().toLocaleTimeString()} : 
            <Navigate to={'/sessions/' + item.id}>View</Navigate>
          </li>
        {/each}
      </ol>
    </div>
  {/if}
{/if}
