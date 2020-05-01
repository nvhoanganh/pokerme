<script>
  import { Route } from "svelte-router-spa";
  import { Navigate, navigateTo } from "svelte-router-spa";
  export let currentRoute;
</script>

<main class="text-center">
  <div class="text-3xl pt-3 pb-5 uppercase font-mono">
    <a href="/">Poker Me!</a>
  </div>
  <Route {currentRoute} />
</main>
