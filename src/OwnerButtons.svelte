<script>
  import { CONST } from "./consts";
  import Button from "./Button.svelte";
  import {
    saveResult,
    currentStory$,
    currentStoryEstimates$,
    saveStoryError$,
    revealEstimates
  } from "./stores.js";

  export let sid;

  function saveResultNow(story, estimates) {
    saveResult(sid, {
      estimates,
      ...story
    });
  }

  let currentStory;
  currentStory$.subscribe(x => (currentStory = x));
</script>

{#if $saveStoryError$}
  <p class="text-red-500">{$saveStoryError$}</p>
{/if}

{#if currentStory}
  {#if !currentStory.showResult && !currentStory.timeRemaining}
    <Button on:click={() => revealEstimates(sid)}>Reveal</Button>
  {/if}

  {#if currentStory.showResult}
    <Button
      on:click={() => saveResultNow(currentStory, $currentStoryEstimates$)}>
      Save
    </Button>
  {/if}
{/if}
