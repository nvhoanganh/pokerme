<script>
  export let classes = `w-full bg-blue-100 hover:bg-blue-500 text-blue-800 font-semibold
  hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent
  rounded`;
</script>

<button class={classes} on:click type="button">
  <slot />
</button>
