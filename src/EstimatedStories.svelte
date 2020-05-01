<script>
  import firebase from "firebase/app";
  import "firebase/firestore";
  import { onDestroy } from "svelte";
  import { CONST } from "./consts";
  import { fade, fly } from "svelte/transition";
  export let sid;
  let estimatedStories = [];

  function getEst(est) {
    return Object.keys(est).map(k => ({
      name: k,
      est: est[k]
    }));
  }

  // list of completed stories
  let unsubscription = firebase
    .firestore()
    .collection(CONST.sessions)
    .doc(sid)
    .collection(CONST.estimatedStories)
    .onSnapshot(querySnapshot => {
      let stories = [];
      querySnapshot.forEach(function(d) {
        const doc = d.data();
        const est = getEst(doc.estimates);
        const sum = est.reduce((cur, pre) => cur + (+pre.est || 0), 0);
        stories.push({
          id: doc.id,
          ...doc,
          avg: (sum / est.length).toFixed(1)
        });
      });
      estimatedStories = stories;
    });

  onDestroy(() => {
    unsubscription();
  });
</script>

{#if estimatedStories.length}
  <div class="text-center text-3xl text-grey-300 pb-5">
    Estimated Stories ({estimatedStories.length})
  </div>
  {#each estimatedStories as story, id}
    <div
      in:fly={{ y: 100, duration: 400 }}
      class="m-6 p-4 overflow-hidden shadow-lg border mx-auto max-w-md rounded">
      <div class="text pb-3 font-mono text-left">
        {id + 1}. {story.taskId} - {story.description}
      </div>
      <div class="grid grid-cols-2 gap-2 row-gap-2">
        {#each getEst(story.estimates) as est}
          <div
            class="text-center border rounded shadow align-middle uppercase"
            in:fly={{ y: 100, duration: 250 }}>
            {est.name}
            <div
              class="text-lg font-mono"
              class:text-green-600={est.est < 5}
              class:text-orange-600={est.est >= 5 && est.est < 13}
              class:text-red-600={est.est >= 13}>
              {est.est}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
{/if}
