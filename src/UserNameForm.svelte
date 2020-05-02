<script>
  import { CONST } from "./consts.js";
  import { userName$, user$ } from "./stores.js";
  import { onMount } from "svelte";

  let usernameInput;
  let _userName = localStorage.getItem("name");

  function saveName() {
    localStorage.setItem("name", _userName);
    userName$.set(_userName);
  }

  onMount(() => usernameInput.focus() );
</script>

{#if !$userName$}
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label
          class="block text-gray-700 text-sm mb-2 text-left uppercase"
          for="username">
          Enter your name
        </label>
        <input
          minlength="3"
          maxlength="20"
          bind:this={usernameInput}
          class="shadow appearance-none border rounded w-full py-2 px-3
          text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          bind:value={_userName}
          placeholder="Your name" />
      </div>

      <div class="flex items-center justify-between">
        <button
          on:click={saveName}
          class="bg-blue-100 hover:bg-blue-500 text-blue-800 font-semibold
          w-full hover:text-white py-2 px-4 border border-blue-500
          hover:border-transparent rounded"
          disabled={!_userName}
          type="button">
          Join Session
        </button>
      </div>
    </div>
  </div>
{/if}
