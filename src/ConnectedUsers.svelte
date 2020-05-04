<script>
  import { userName$, connected$, otherConnectedUsers$ } from "./stores.js";
  import { fly } from "svelte/transition";
  import Icon from "./Icon.svelte";

  let others;
  otherConnectedUsers$.subscribe(x => {
    console.log("others are", others);
    others = x;
  });
</script>

<div class="max-w-md mx-auto">
  {#if !$userName$}
    <div class="text-center text-xs text-grey-300 pb-3">
      Connected users: {others.length}
    </div>
  {:else if others.length > 0}
    <div class="text-center text-xs text-grey-300 pb-3">
      Other users: {others.length}
    </div>
    <div class="grid grid-cols-2 gap-3 row-gap-3">
      {#each others as item}
        <div
          class="text-center border rounded shadow-lg p-3 align-middle uppercase"
          in:fly={{ x: 100, duration: 300 }}>
          {item.user}
          <div class="text-center">
            <Icon classnames="inline-block text-green-500">
              <path
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9
                0 11-18 0 9 9 0 0118 0z" />
            </Icon>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="text-center text-xs text-grey-300">
      Waiting for users to connect...
    </div>
  {/if}
</div>
