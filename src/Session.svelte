<script>
  import LoadingFlat from "./LoadingFlat.svelte";
  import { Navigate, navigateTo } from "svelte-router-spa";
  import { onDestroy } from "svelte";
  import EstimatedStories from "./EstimatedStories.svelte";
  import UserNameForm from "./UserNameForm.svelte";
  import AddNewStory from "./AddNewStory.svelte";
  import ShareLink from "./ShareLink.svelte";
  import ConnectedUsers from "./ConnectedUsers.svelte";
  import OwnerButtons from "./OwnerButtons.svelte";
  import EstimatingTask from "./EstimatingTask.svelte";
  import {
    user$,
    userName$,
    isOwner$,
    updateUserStatus,
    activeSession$,
    loadingSessionError$,
    loadingSession$
  } from "./stores";

  export let currentRoute;

  let ping;
  let _userName;

  const sid = currentRoute ? currentRoute.namedParams.id : null;

  if (sid) {
    activeSession$.load(sid);
  }

  onDestroy(() => {
    activeSession$.destroy(sid);
    clearInterval(ping);
    updateUserStatus(sid, _userName, false);
  });

  
  userName$.subscribe(x => {
    _userName = x;
    if (_userName && !ping) {
      ping = setInterval(() => updateUserStatus(sid, _userName, true), 2000);
    }
  });

  let session;
  activeSession$.subscribe(x => (session = x));
</script>

{#if $loadingSessionError$}
  <div class="text-red-500">{$loadingSessionError$}</div>
{/if}

{#if $loadingSession$}
  <div>Loading...</div>
{:else if session}
  <div class="mb-6">
    <div class="text-grey-300 text-sm">
      Session created on {session.timeStampt.toDate().toLocaleDateString()} at {session.timeStampt.toDate().toLocaleTimeString()}
    </div>
    {#if !$isOwner$}
      <div class="text-grey-300 text-sm">Owner: {session.displayName}</div>
    {:else}
      <ShareLink />
    {/if}
  </div>

  <ConnectedUsers />

  <div class="pt-6">
    {#if $isOwner$}
      <AddNewStory sid={currentRoute.namedParams.id} />
    {:else}
      <UserNameForm {sid} />
    {/if}
  </div>

  {#if $userName$}
    <div class="pt-8">
      <EstimatingTask {sid} />
    </div>
    <div class="pt-8">
      <EstimatedStories {sid} />
    </div>
  {/if}
{/if}
