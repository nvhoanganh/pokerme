<script>
  import firebase from "firebase/app";
  import "firebase/auth";
  import "firebase/firestore";
  import { Navigate, navigateTo } from "svelte-router-spa";

  import { user$, init$ } from "./stores";

  export let currentRoute;

  let session;
  let errorMsg;
  let newTask;
  const db = firebase.firestore();

  user$.subscribe(u => {
    if (currentRoute.namedParams.id) {
      db.collection("sessions")
        .doc(currentRoute.namedParams.id)
        .get()
        .then(doc => {
          if (doc.exists) {
            session = doc.data();
          } else {
            errorMsg = "Invalid session";
          }
        })
        .catch(e => {
          errorMsg = e;
        });
    }
  });

  function startNew() {}
</script>

<style>
  table {
    width: 100%;
  }

  td {
    border: solid 1px grey;
  }
</style>

{#if errorMsg}
  <p style="color: red">{errorMsg}</p>
{/if}

{#if session}
  <h1>Plannnig Poler Session, created by {session.displayName}</h1>

  <h2>Estimated Stories</h2>
  <table>
    <thead>
      <tr>
        <th>Story URL #</th>
        <th>Estimations</th>
        <th>AVG.</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <a target="_blank" href="http://jira.com/task/123">
            http://jira.com/task/123
          </a>
        </td>
        <td>
          <ul>
            <li>Anthony: 3</li>
            <li>John: 3</li>
            <li>David: 3</li>
          </ul>
        </td>
        <td>3</td>
      </tr>
      <tr>
        <td>
          <a target="_blank" href="http://jira.com/task/123">
            http://jira.com/task/123
          </a>
        </td>
        <td>
          <ul>
            <li>Anthony: 10</li>
            <li>John: 8</li>
            <li>David: 10</li>
          </ul>
        </td>
        <td>10</td>
      </tr>
    </tbody>
  </table>

  {#if $user$ && $user$.uid === session.createdBy}
    <br />
    <div>
      <input type="text" bind:value={newTask} style="width: 35%" placeholder="Story URL">
      <button on:click={startNew} class="button">
        Start Estimating New Story
      </button>
    </div>
    <p>
      <Navigate to="/">Go Back</Navigate>
    </p>
  {/if}
{/if}
