<script>
  import firebase from "firebase/app";
  import "firebase/auth";
  import { Router } from "svelte-router-spa";
  import { routes } from "./routes";
  import { user$, init$ } from "./stores";

  init$.set(true);
  firebase.auth().onAuthStateChanged(u => {
    init$.set(false);
    user$.set(u);
  });
</script>

<Router {routes} />
