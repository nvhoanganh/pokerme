<script>
  import firebase from "firebase/app";
  import "firebase/auth";
  import "firebase/firestore";
  import "firebase/database";
  import { CONST } from "./consts.js";
  import { currentStory$ } from "./stores.js";

  export let sid;

  let errorMsg;
  let taskId;
  let description;

  function startNew() {
    firebase
      .database()
      .ref(`${CONST.sessions}/${sid}`)
      .set(
        {
          taskId,
          description,
          startTime: new Date()
        },
        function(error) {
          errorMsg = error;
        }
      );
  }

  currentStory$.subscribe(x => {
    if (!x) {
      taskId = "";
      description = "";
    }
  });
</script>

{#if errorMsg}
  <p style="color: red">{errorMsg}</p>
{/if}

<!-- do not allow adding multiple -->
{#if !$currentStory$}
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white shadow-lg rounded px-8 pt-6 pb-8 mb-4">
      <div class="mb-4">
        <label
          class="block uppercase text-gray-700 text-sm mb-2 text-left"
          for="username">
          PBI
        </label>
        <input
          minlength="4"
          class="shadow appearance-none border rounded w-full py-2 px-3
          text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="number"
          bind:value={taskId}
          placeholder="Enter PBI number" />
      </div>
      <div class="mb-4">
        <label
          class="block uppercase text-gray-700 text-sm mb-2 text-left"
          for="username">
          Description
        </label>
        <textarea
          minlength="4"
          class="shadow appearance-none border rounded w-full py-2 px-3
          text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          rows="4"
          type="text"
          bind:value={description}
          placeholder="Enter PBI description" />
      </div>

      <div class="flex items-center justify-between">
        <button
          on:click={startNew}
          class="w-full bg-blue-100 hover:bg-blue-500 text-blue-800
          font-semibold hover:text-white py-2 px-4 border border-blue-500
          hover:border-transparent rounded"
          disabled={!taskId || !description}
          type="button">
          Start
        </button>
      </div>
    </div>
  </div>
{/if}
