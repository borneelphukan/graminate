# Storybook Config

To implement components in isolation we use [Storybook](https://storybook.js.org/).

## Usage

To start the Storybook server just run the dev command in the root folder:

```bash
npm run dev
```

Any story (file that ends with `.stories.tsx`) that is located in the `apps` or `packages` folder will be automatically detected and added to the Storybook server.

## Configuration

The configuration is done in the `main.ts` file.
