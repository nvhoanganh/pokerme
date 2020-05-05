<script>
  import copy from "copy-to-clipboard";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import Button from "./Button.svelte";
  import { hideQrCode$ } from "./stores.js";
  import Icon from "./Icon.svelte";

  let copied;
  let showQr = true;
  let showQrClicked;

  function copyLink() {
    copy(window.location.href);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 1000);
  }

  function renderQr() {
    setTimeout(() => {
      QRCode.toCanvas(document.getElementById("canvas"), window.location.href);
    }, 0);
  }

  function showQrCode() {
    showQr = !showQr;
    showQrClicked = true;
    showQr && renderQr();
  }

  onMount(() => {
    if (showQr) {
      renderQr();
    }
  });

  hideQrCode$.subscribe(x => {
    // only show once if user hasn't click on show/hide button
    if (x && !showQrClicked) {
      showQr = false;
    }
  });
</script>

<div class="flex md:items-center max-w-md mx-auto pt-3">
  <div class="w-9/12">
    <input
      class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full
      py-2 px-4 text-gray-700 leading-tight"
      id="inline-full-name"
      type="text"
      value={window.location.href} />
  </div>
  <div class="w-3/12 whitespace-no-wrap">
    <Button
      on:click={copyLink}
      classes="bg-grey-100 hover:bg-grey-500 text-grey-800 border
      border-grey-500 hover:border-transparent rounded">
      <Icon classnames="inline-block">
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
      </Icon>
    </Button>
    <Button
      title="Show join QR code"
      on:click={showQrCode}
      classes="bg-grey-100 hover:bg-grey-500 text-grey-800 border
      border-grey-500 hover:border-transparent rounded">
      <Icon classnames="inline-block">
        <path
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4
          12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0
          001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001
          1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </Icon>
    </Button>
  </div>
</div>
{#if showQr}
  <canvas
    id="canvas"
    class="mx-auto"
    in:fade={{ x: 100, duration: 250 }}
    out:fade={{ x: 100, duration: 250 }} />
{/if}
{#if copied}
  <div
    in:fade={{ y: 100, duration: 400 }}
    out:fade={{ y: -100, duration: 400 }}
    class="text-sm text-grey-300 italic">
    Copied to clipboard!
  </div>
{/if}
