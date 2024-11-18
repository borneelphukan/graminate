<script lang="ts">
  export let query: string = '';

  const handleSearch = () => {
    console.log('Search query:', query);
  };
</script>

<div class="relative">
  <input
    type="text"
    bind:value={query}
    placeholder="Search"
    class="w-full px-4 py-2 border-2 border-green-200 rounded-md focus:outline-none"
  />
  <button
    class="absolute inset-y-0 right-4 flex items-center"
    on:click={handleSearch}
    aria-label="Search"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      class="size-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  </button>
</div>
