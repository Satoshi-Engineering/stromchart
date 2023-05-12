# Stromchart

## Setup for development

### Prerequisites
- [nodejs 16.18.0 LTS](https://nodejs.org/en/)
- npm

### Setup

```bash
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

If you are working at Satoshi Engineering, please configure your GIT repo to use the GIT hooks from  the directory `.githooks`:
```bash
git config core.hooksPath .githooks
```

### Frontend

* Create a `frontend/.env.development.local` file  (or copy it from `frontend/.env.development`)  and add the following variable:
  - `VITE_BACKEND_API_ORIGIN` probably http://localhost:4000 -> where your backend api routes will be served

### VSCode

#### Extensions

* [Vue Language Features (Volar)](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)
* [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
* [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

Do _not_ use Vetur, deinstall it, it was for Vue 2. Volar is recommended by the [Vue 3 Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).  
Do _not_ use the "TypeScript Vue Plugin (Volar)", but use "take over mode" of Volar (see right below).

#### Use Volar's take over mode (disable builtin Typescript extension)

* Make sure "Vue Language Features (Volar)" is installed and activated (see above)
* In the commands input (Cmd/ctrl + shift + P), type in `builtin`
* Click on "Extensions: Show built-in Extensions"
* Search for `typescript`
* Disable "TypeScript and JavaScript Language Support" for Workspace only


## Run from source

Start the frontend server on http://localhost:5173
```bash
cd frontend && npm run dev
```

Start the backend server on http://localhost:4000
```bash
cd backend && npm run dev
```


## Production

Deployment is done via Gitlab CI/CD, see .gitlab-ci.yml
