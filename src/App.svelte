<script>
  import firebase from "firebase/app";
  import "firebase/auth";
  import { Router } from "svelte-router-spa";
  import { routes } from "./routes";
  import { userName$, user$, init$ } from "./stores";

  init$.set(true);
  firebase.auth().onAuthStateChanged(u => {
    init$.set(false);
    user$.set(u);
    if (u) {
      userName$.set(u.displayName);
    }
  });
</script>

<div class="container mx-auto h-screen">
  <Router {routes} />
</div>
