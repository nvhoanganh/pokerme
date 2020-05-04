<script>
  import { fly } from "svelte/transition";
  import OwnerButtons from "./OwnerButtons.svelte";
  import Icon from "./Icon.svelte";
  import { CONST } from "./consts";
  import {
    currentStory$,
    currentStoryEstimates$,
    userName$,
    isOwner$,
    submitEstimate
  } from "./stores.js";
  import slug from "slug";

  export let sid;

  let votes = [];
  let myEstimate;
  let currentStory;

  currentStoryEstimates$.subscribe(x => {
    if (x) {
      votes = Object.keys(x).map(k => ({
        name: k,
        estimate: x[k]
      }));
    }
  });

  currentStory$.subscribe(x => {
    currentStory = x;
    if (!currentStory) {
      myEstimate = "";
    }
  });

  function submitMyEstimate() {
    if (myEstimate) {
      submitEstimate(sid, userName, myEstimate);
    }
  }
  
  let userName;
  userName$.subscribe(x => (userName = x));
</script>

{#if currentStory}
  <div class="p-5 overflow-hidden shadow-lg border mx-auto max-w-md rounded">
    <div class="pt-2">
      <div class="text-3xl">PBI {currentStory.taskId}</div>
      <div class="font-mono text-sm italic">{currentStory.description}</div>
    </div>

    <div class="py-6">
      <div class="grid grid-cols-2 gap-3 row-gap-3">
        {#each votes as item}
          <div
            class="text-center border rounded shadow p-3 align-middle uppercase"
            in:fly={{ y: 100, duration: 400 }}>
            {userName && item.name === slug(userName) ? 'You' : item.name}
            {#if currentStory.showResult}
              <div
                class="text-3xl font-mono"
                class:text-green-600={item.estimate < 5}
                class:text-orange-600={item.estimate >= 5 && item.estimate < 13}
                class:text-red-600={item.estimate >= 13}>
                {item.estimate}
              </div>
            {:else}
              <div class="text-center">
                <Icon classnames="inline-block text-green-500">
                  <path
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42
                    3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138
                    3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42
                    3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0
                    00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0
                    00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0
                    00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946
                    3.42 3.42 0 013.138-3.138z" />
                </Icon>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    {#if currentStory.timeRemaining >= 0}
      <div class="text-grey-300 text-sm">
        Revealing estimates in: {currentStory.timeRemaining} seconds
      </div>
    {/if}
    <div class="py-6">
      <label
        class="block text-gray-700 text-sm mb-2 text-left uppercase"
        for="username">
        Select Story Point for this PBI
      </label>
      <select
        bind:value={myEstimate}
        class="appearance-none block w-full text-gray-700 border border-gray-300
        rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white
        focus:border-gray-500"
        on:change={submitMyEstimate}>
        <option value="">Select</option>
        {#each CONST.estSizes as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </div>

    {#if $isOwner$}
      <OwnerButtons {sid} />
    {:else}
      <div class="text-grey-300 text-sm">
        Only session owner can reveal estimates
      </div>
    {/if}
  </div>
{:else if !$isOwner$}
  <div class="p-5 overflow-hidden shadow-lg border mx-auto max-w-md">
    <div class="text-center font-mono text-grey-300">
      Waiting for session owner...
    </div>
  </div>
{/if}
