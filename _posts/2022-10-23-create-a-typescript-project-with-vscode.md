---
layout: post
title: "Part 1: Create a TypeScript project with VSCode"
date: 2022-10-23T09:00:00.000Z
tags:
  - tutorial
  - typescript
  - development
---

It is pretty easy to create a TypeScript project but the problem (at least for me) is the configuration with VSCode in order for the debugger works. Following I have fetched some configuration that helps create a TypeScript project and configure VSCode in order that you can simply use your regular shortcuts to start debugging it.

For completeness' sake, you first have to install TypeScript of course. &nbsp;I assume you have NodeJS already installed (if not Google or DuckDuckGo NodeJS and you should find very helpful entries).

### Install typescript

    npm install -g typescript

### Create the Project

Create a new folder and change it.

    mkdir project 
    cd project

Then init a NodeJS project with npm, which asks you a few things and creates the package.json file afterward.

    npm init

Then initialize TypeScript, which creates the tsconfig.json with your compiler options.

    npx tsc --init

### VSCode Configuration

Create a `.vscode` folder and the two files launch.json and tasks.json. By now, your folder structure should look something like the following:

    |- .vscode 
      |- launch.json 
      |- tasks.json 
    |- tsconfig.json 
    |- package.json

Now use the following settings for the launch.json and tasks.json files. The launch.json tells VSCode what to do when you start the debugging (F5), and the tasks.json tells it to run TypeScript without tsconfig.json options.

```json launch.json
{
    "configurations": [
        {
            "name": "Launch via NPM",
            "request": "launch",
            "runtimeArgs": [
                "run",
                "dev"
            ],
            "runtimeExecutable": "npm",
            "skipFiles": [
                "&lt;node_internals&gt;/**"
            ],
            "type": "node"
        },
    ]
}
```

```json tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "type": "typescript",
            "tsconfig": "tsconfig.json",
            "problemMatcher": [
                "$tsc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

Now in your package.json file, you should add the dev script so we can start it.

```json package.json
"scripts": {
    "test": "echo \"Error: no test specified\" &amp;&amp; exit 1",
    "dev": "ts-node-dev ./src/app.ts"
}
```

Now if you try the in-build debugger in VSCode you should be able to debug it like any other application.

For the next part, we will look at how to create a docker container that runs the completed TypeScript project so stay tuned.

### Sources & Ressources

- **VSCode Language**, [https://code.visualstudio.com/Docs/languages/)](https://code.visualstudio.com/Docs/languages/) (last visited May 26, 2023).
- **VSCode Typescript**, [https://code.visualstudio.com/assets/docs/languages/typescript/languages_typescript.png](https://code.visualstudio.com/assets/docs/languages/typescript/languages_typescript.png) (last visited May 26, 2023).
