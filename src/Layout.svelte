<script>
  import { Route } from "svelte-router-spa";
  import { Navigate } from "svelte-router-spa";
  import LoadingFlat from "./LoadingFlat.svelte";
  import { init$ } from "./stores";
  export let currentRoute;
</script>

<main class="text-center container mx-auto h-screen">
  <div class="text-3xl pt-3 pb-5 uppercase font-mono">
    <Navigate to="/">Poker Me!</Navigate>
  </div>
  {#if $init$}
    <LoadingFlat />
  {/if}
  <div class:hidden={$init$} class="font-mono">
    <Route {currentRoute} />
  </div>
</main>
