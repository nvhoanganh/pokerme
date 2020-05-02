<script>
  import slug from "slug";
  import { fade, fly } from "svelte/transition";

  export let activeConnections = [];
  export let userName = "";

  $: others = activeConnections.filter(
    item => userName && item.user !== slug(userName)
  );
</script>

<!-- list of connected users -->
<div class="max-w-md mx-auto">
  {#if !userName}
    <div class="text-center text-xs text-grey-300 pb-3">
      Connected users: {activeConnections.length}
    </div>
  {:else if others.length > 0}
    <div class="text-center text-xs text-grey-300 pb-3">
      Other users: {others.length}
    </div>
    <div class="grid grid-cols-2 gap-3 row-gap-3">
      {#each others as item}
        <div
          class="text-center border rounded shadow-lg p-3 align-middle uppercase"
          in:fly={{ x: 100, dufration: 300 }}>
          {item.user}
          <div class="text-center">
            <svg
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              class="inline-block text-green-500"
              width="22"
              height="22"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9
                0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
