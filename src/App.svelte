<script>
  import firebase from "firebase/app";
  import "firebase/auth";

  let user;
  let initializing = true;
  firebase.auth().onAuthStateChanged(u => {
    initializing = false;
    user = u;
  });

  function login() {
    firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
  }
  function logout() {
    firebase.auth().signOut();
  }
</script>

{#if initializing}
  <p>Loading...</p>
{:else}
  {#if !user}
    <button on:click={login} class="button">Login Using Google</button>
  {:else}
    <div>
      <h1>Hello {user.displayName}</h1>
    </div>
    <div>
      <button class="button">Start New Planning Poker Session</button>
      <button on:click={logout} class="button">Sign Out</button>
    </div>
    <div class="home">
      <ul>
        <li>Session 1: do this</li>
      </ul>
    </div>
  {/if}
{/if}
