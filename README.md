# awsome-components-vue3

This repository offers a collection of simple and flexible **Vue 3** components designed to help you rapidly build modern front-end pages (e.g. ChatGPT, Anthropic, and other AI applications). These components enable you to quickly prototype and develop your ideas with minimal setup. The goal is to eventually publish this as an npm package for broader community use.

# Notes

Practical tips for fresh users to initialize a project.

## Initialize a Vue 3 Project

```sh
npm create vue@latest
# select all supported features
# use Playwright

cd <project>
yarn install

git init && git add -A git commit

git commit -m "first commit"
git branch -M main
git remote add origin <repo addr>
git push -u origin main
```

## Vite CORS

In frontend development, when the Vite dev server (typically running on `localhost:5173`) calls backend APIs on different domains or ports, browsers will block these requests due to the Same-Origin Policy (this is the CORS – Cross-Origin Resource Sharing – issue). To work around this during local development, the Vite dev server can act as a reverse proxy: your frontend sends requests to `http://localhost:5173/api/...`, Vite matches `/api` via `server.proxy`, and then transparently forwards the request to the configured backend `target`.

```typescript
server: {
  proxy: {
    '/api': {
      target: proxyTarget,
      changeOrigin: true, // replace HOST in the request with `target`
      rewrite: (path) => path.replace(/^\/api/, ''), // don't need /api prefix when forwarding
    },
  },
},
```
