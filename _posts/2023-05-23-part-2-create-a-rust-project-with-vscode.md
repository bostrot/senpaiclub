---
layout: post
title: "Part 2: Create a Rust project with VSCode"
date: 2023-05-23T09:01:34.681Z
author: eric
categories: [blog, wiki]
---
## VSCode Extensions for Rust

To make Rust programming easier and more efficient in VSCode, consider installing the following extensions:

1. **Rust Analyzer**: This is an alternative to the Rust (rls) extension. It's a powerful tool that provides a range of features, including type inference, auto-completion, and real-time error checking.
2. **CodeLLDB**: A LLDB extension for Visual Studio Code, which is especially useful for debugging Rust code.
3. **TOML Language Support**: Offers syntax highlighting and other features for TOML files, which are used by Rust for configuration.

To install any extension, follow these steps:

1. Open VSCode.
2. Click on the Extensions view icon on the sidebar or press `Ctrl+Shift+X`.
3. Search for the extension you want to install.
4. Click Install.

## Installing Rust and Its Build Dependencies

Here's a quick guide on how to install Rust and its build dependencies on Linux, Windows, and macOS.

### Linux

1. Open Terminal.
2. Download and install rustup by running:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

3. Source the cargo environment:

```bash
source $HOME/.cargo/env
```

### Windows

1. Open Terminal.
2. Download and install rustup by running:

```bash
winget install Rustlang.Rustup
rustup toolchain install stable-x86_64-pc-windows-msvc
```

3. You might need to add the Rust path to your environment.

### macOS

1. Open Terminal
2. Download and install rustup by running:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

3. Source the cargo environment:

```bash
source $HOME/.cargo/env
```

## Create a new project with `Cargo`

```bash
cargo new <your-project-name>
# Or with an existing directory
# cargo init
```

## Setting Up Debugging in VSCode

After installing the CodeLLDB extension, you need to set up your launch.json and tasks.json files to enable debugging.

### launch.json

Create a new file in your `.vscode` directory and name it `launch.json`. Copy and paste the following configuration:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Windows",
            "type": "cppvsdbg",
            "request": "launch",
            "program": "${workspaceFolder}/target/debug/<your-project-name>.exe",
            "preLaunchTask": "rust: cargo build",
            "args": [
            ],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "console": "internalConsole",
        },
        {
            "name": "Debug Linux",
            "type": "lldb",
            "request": "launch",
            "program": "${workspaceFolder}/target/debug/<your-project-name>",
            "preLaunchTask": "rust: cargo build",
            "args": [
            ],
            "cwd": "${fileDirname}",
            "console": "internalConsole",
            "stopOnEntry": false,
            "sourceLanguages": ["rust"],
            
        },
    ]
}
```

Replace `<your-project-name>` with your project's name.

### tasks.json

Create another new file in your `.vscode` directory and name it `tasks.json`. Copy and paste the following configuration:

```json
{
    "version": "2.0.0",
     "tasks": [
        {
            "type": "cargo",
            "command": "build",
            "problemMatcher": [
                "$rustc"
            ],
            "group": "build",
            "label": "rust: cargo build"
        }
    ]
}
```

Now, you're all set! You can run your program by pressing `F5`, and VSCode will build and debug your Rust application.

### Sources

- **Rust Analyzer**, [https://marketplace.visualstudio.com/items?itemName=matklad.rust-analyzer](https://marketplace.visualstudio.com/items?itemName=matklad.rust-analyzer) (last visited May 26, 2023).
- **CodeLLDB**, [https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) (last visited May 26, 2023).
- **Other Installation Methods - Rust Forge**, [https://forge.rust-lang.org/infra/other-installation-methods.html](https://forge.rust-lang.org/infra/other-installation-methods.html) (last visited May 26, 2023).
