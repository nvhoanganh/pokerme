<script>
  import copy from "copy-to-clipboard";
  import { fade } from "svelte/transition";

  let copied;

  function copyLink() {
    copy(window.location.href);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000);
  }
</script>

<div class="flex md:items-center max-w-md mx-auto pt-3">
  <div class="w-10/12">
    <input
      class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full
      py-2 px-4 text-gray-700 leading-tight"
      id="inline-full-name"
      type="text"
      value={window.location.href} />
  </div>
  <div class="w-2/12">
    <button
      on:click={copyLink}
      class="bg-grey-100 hover:bg-grey-500 text-grey-800 border border-grey-500
      hover:border-transparent rounded"
      type="button">
      <svg
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        stroke="currentColor"
        height="24"
        width="24"
        viewBox="0 0 24 24">
        {#if !copied}
          <path
            d="M8.684 13.342C8.886 12.938 9 12.482 9
            12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632
            3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367
            2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        {:else}
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0
            00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012
            2m-6 9l2 2 4-4" />
        {/if}
      </svg>
    </button>
  </div>

</div>
{#if copied}
  <div
    in:fade={{ y: 100, duration: 400 }}
    out:fade={{ y: -100, duration: 400 }}
    class="text-sm text-grey-300 italic">
    Copied to clipboard!
  </div>
{/if}
