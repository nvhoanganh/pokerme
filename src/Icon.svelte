<script>
  export let classnames;
  export let width = "22";
  export let height = "22";
</script>

<svg
  fill="none"
  stroke-linecap="round"
  stroke-linejoin="round"
  stroke-width="2"
  {width}
  {height}
  class={classnames}
  stroke="currentColor"
  viewBox="0 0 24 24">
  <slot />
</svg>
