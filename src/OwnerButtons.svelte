<script>
  import firebase from "firebase/app";
  import "firebase/firestore";
  import { CONST } from "./consts";
  import { currentStory$, currentStoryEstimates$ } from "./stores.js";

  export let sid;

  const rtdb = firebase.database();
  let errorMsg;
  let currentStory;
  function showResultNow() {
    // start 10 seconds count down on all users
    rtdb.ref(`${CONST.sessions}/${sid}`).update({ timeRemaining: 10 });
  }

  function saveResultNow(story, estimates) {
    console.log(story, estimates);
    // save estimate to firestore
    firebase
      .firestore()
      .collection(CONST.sessions)
      .doc(sid)
      .collection(CONST.estimatedStories)
      .doc(story.taskId.toString())
      .set({
        estimates,
        ...story
      })
      .then(function() {
        rtdb.ref(`${CONST.sessions}/${sid}`).remove();
        rtdb.ref(`${CONST.estimates}/${sid}`).remove();
      })
      .catch(function(error) {
        errorMsg = error;
      });
  }

  currentStory$.subscribe(x => (currentStory = x));
</script>

{#if errorMsg}
  <p style="color: red">{errorMsg}</p>
{/if}

{#if currentStory}
  {#if !currentStory.showResult && !currentStory.timeRemaining}
    <button
      on:click={showResultNow}
      class="bg-blue-100 hover:bg-blue-500 text-blue-800 font-semibold
      hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent
      rounded w-full">
      Reveal
    </button>
  {/if}

  {#if currentStory.showResult}
    <button
      on:click={() => saveResultNow(currentStory, $currentStoryEstimates$)}
      class="bg-blue-100 hover:bg-blue-500 text-blue-800 font-semibold
      hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent
      rounded w-full">
      Save
    </button>
  {/if}
{/if}
