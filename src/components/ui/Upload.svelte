<script lang="ts">
	import { writable } from 'svelte/store';

	export let label: string;

	let file = writable<string | null>(null);
	let fileName = writable<string>('');

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (files && files[0]) {
			const selectedFile = files[0];

			if (selectedFile.type !== 'application/pdf') {
				alert('Only PDF files are allowed!');
				target.value = '';
				return;
			}

			fileName.set(selectedFile.name);
			const reader = new FileReader();
			reader.onload = (e: ProgressEvent<FileReader>) => {
				if (e.target?.result) {
					file.set(e.target.result as string);
				}
			};
			reader.readAsDataURL(selectedFile);
		}
	}

	function removeFile() {
		file.set(null);
		fileName.set('');
	}
</script>

<div class="w-full">
	<label
		for="file_upload"
		class="block mb-1 text-base font-medium text-gray-200 dark:text-gray-300"
	>
		{label}
	</label>
	<label
		class="flex justify-center w-full h-24 px-4 transition bg-light border-2 border-gray-400 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none"
	>
		<span class="flex items-center space-x-2">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="w-6 h-6 text-gray-300"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
				/>
			</svg>
			<span class="font-medium text-gray-600">
				Drag your PDF file here or
				<span class="text-green-200 font-bold">browse</span>
			</span>
		</span>
		<input
			type="file"
			name="file_upload"
			class="hidden"
			accept="application/pdf"
			on:change={handleChange}
		/>
	</label>
</div>

{#if $file}
	<div
		class="flex items-center justify-start w-full mt-2 p-3 border border-gray-400 rounded-md relative"
	>
		<span class="ml-4">📄 {$fileName}</span>

		<button
			class="absolute right-0 p-1 m-3 bg-red-400 rounded-full"
			aria-label="remove file"
			on:click={removeFile}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
				class="h-6 w-6 text-red-200"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
{/if}
