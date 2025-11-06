export default {
  esbuild: {
    // Mark native and large packages as external
    external: [
      "better-sqlite3",
      "sql.js",
      "n8n",
      "n8n-core",
      "n8n-workflow",
      "@n8n/n8n-nodes-langchain",
      "pyodide"
    ],

    // Enable minification for production
    minify: true,

    // Set Node.js target version
    target: "node22",
    
    // Ensure we're building for Node.js
    platform: "node",
    
    // Use CJS format
    format: "cjs",
  },
};
