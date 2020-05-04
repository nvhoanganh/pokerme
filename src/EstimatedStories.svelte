<script>
  import firebase from "firebase/app";
  import "firebase/firestore";
  import Icon from "./Icon.svelte";
  import { onDestroy } from "svelte";
  import { CONST } from "./consts";
  import { fade, fly } from "svelte/transition";

  export let sid;

  let estimatedStories = [];
  let show = false;
  function download() {
    window.location.href =
      "https://asia-northeast1-pokerme.cloudfunctions.net/sessions?id=" + sid;
  }

  function getEst(est) {
    if (!est) return [];
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
  <div class="text-center text-2xl text-grey-300 pb-5 font-mono cursor-pointer">
    <a href="javascript:void(0" on:click={() => (show = !show)}>

      <Icon classnames="inline-block cursor-pointer">
        {#if show}
          <path d="M19 9l-7 7-7-7" />
        {:else}
          <path d="M9 5l7 7-7 7" />
        {/if}
      </Icon>
    </a>
    Estimated Stories ({estimatedStories.length})
    <a href="javascript:void(0)" on:click={download} title="download CSV">
      <Icon classnames="inline-block cursor-pointer">
        <path
          d="M8 16a5 5 0 01-.916-9.916 5.002 5.002 0 019.832 0A5.002 5.002 0
          0116 16m-7 3l3 3m0 0l3-3m-3 3V10" />
      </Icon>
    </a>
  </div>
  {#if show}
    <div
      in:fly={{ y: 100, duration: 400 }}
      out:fade={{ y: 100, duration: 200 }}>
      {#each estimatedStories as story, id}
        <div
          in:fly={{ y: 100, duration: 400 }}
          class="m-6 p-4 overflow-hidden shadow-lg border mx-auto max-w-md
          rounded">
          <div class="pb-3 font-mono text-left">
            {id + 1}. {story.taskId} - {story.description}
          </div>
          {#if getEst(story.estimates).length > 0}
            <div class="grid grid-cols-2 gap-2 row-gap-2">
              {#each getEst(story.estimates) as est}
                <div
                  class="text-center border rounded shadow align-middle
                  uppercase"
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
          {:else}
            <div class="text-center text-xs text-grey-300">
              0 estimate given for this PBI
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
{/if}
