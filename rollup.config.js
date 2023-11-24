import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  output: {
    file: "index.js",
    format: "esm",
    compact: "true",
  },
  external: [
    "fs",
    "fs/promises",
    "path/posix",
    "node:readline/promises",
    "memoizee",
    "dotenv",
  ],
  plugins: [typescript()],
  watch: true,
};
