---
layout: post
title: "VS Code Remote SSH, Fish, and 1Password on Mac (Step by Step)"
date: 2026-04-14T10:00:00.000Z
author: eric
tags:
  - tutorial
  - vscode
  - ssh
  - fish
  - 1password
categories: [wiki]
---


This post is about one concrete goal: building a stable and repeatable remote development setup from a Mac to another machine, in my case a Mac Studio, while using VS Code Remote SSH, Fish as the default shell, and 1Password as the SSH agent. Each of these tools is excellent on its own, but in combination they introduce a few subtle integration points that are easy to miss and surprisingly hard to diagnose once something starts failing.

If you configure only one part of the stack and leave the rest on defaults, the symptoms can look completely unrelated to the real cause: random connection timeouts, repeated key prompts, or early authentication aborts with `Too many authentication failures`. The steps below are the complete setup I use now, including the small details that made the difference between "mostly works" and "works every day without surprises".

## What We Want to Achieve

After this setup, you should have:

1. reliable VS Code Remote SSH connections even with Fish shell
2. predictable key selection (no random key spam)
3. optional SSH agent forwarding for remote Git and nested SSH usage
4. a correct remote-machine configuration to prevent GitHub authentication errors
5. easy debugging when auth fails

## Step 1: Fix VS Code Remote + Fish Shell

In VS Code settings, explicitly set the remote platform for the host that uses Fish. This removes guesswork during connection setup and avoids the fragile auto-detection path that often causes the timeout behavior.

```json
"remote.SSH.remotePlatform": {
  "hostname-with-fish-shell": "linux"
}
```

This is the setting that fixed it for me from the issue thread:
[https://github.com/microsoft/vscode-remote-release/issues/2509#issuecomment-3410765419](https://github.com/microsoft/vscode-remote-release/issues/2509#issuecomment-3410765419)

Why this helps: VS Code Remote SSH no longer needs to infer platform details during shell startup, which is exactly the phase where Fish-based environments can behave differently from what the extension expects.

If your environment still behaves inconsistently, there is an additional fallback that has helped some users in the same issue thread:

```json
"remote.SSH.useLocalServer": false
```

## Step 2: Configure 1Password SSH Agent on macOS

On the local Mac, add the 1Password agent socket to `~/.ssh/config` so OpenSSH uses the same key source consistently, regardless of whether you connect from the terminal or through VS Code:

```ssh-config
Host *
    IdentityAgent "~/Library/Group Containers/2BUA8C4S2C.com.1password/t/agent.sock"
```

This tells OpenSSH to ask 1Password's agent for signatures, which means your private keys remain managed by 1Password and are not copied into ad-hoc local key files just to make a workflow function.

## Step 3: Create a Host-Specific SSH Entry

Define your remote host explicitly so SSH does not try every available identity in your agent. A host-specific entry reduces ambiguity and makes authentication deterministic, especially once you have multiple keys for different environments.

```ssh-config
Host macstudio
    HostName 192.168.1.100
    User eric
    IdentityFile ~/.ssh/macstudio_ed25519.pub
    IdentitiesOnly yes
    ForwardAgent yes
```

Important detail: with agent-backed keys, `IdentityFile` can point to the public key file. SSH uses that public key as the identity hint, matches it against identities exposed by the agent, and then asks only the matching private key to sign the challenge.

## Step 4: Enable Agent Forwarding in VS Code (Optional but Useful)

If you want `git push` and other SSH operations from inside the remote session to use your local keys, enable forwarding in VS Code so the remote side can ask your local agent for signatures through the SSH tunnel:

```json
"remote.SSH.enableAgentForwarding": true
```

On the remote host, ensure the SSH daemon allows forwarding as well, because both ends need to permit this behavior:

```text
AllowAgentForwarding yes
```

## Step 5: The "Dumb Pipe" Limitation (Configuring the Remote Host)

This is the most common pitfall when using Agent Forwarding. Agent Forwarding acts like a "dumb pipe"—**it forwards your keys, but it does NOT forward your local SSH rules.** 

When you open a VS Code terminal on your remote Mac Studio and type `git push`, the *remote* SSH client executes the connection. It sees all your forwarded 1Password keys, but because it doesn't have your local `~/.ssh/config` rules, it just blindly throws the first key it finds at GitHub. If you have multiple keys (like a deploy bot key), GitHub might log you in as the bot and deny access with `Repository not found`.

**The Fix:** You must recreate your routing rules in the `~/.ssh/config` file **on the remote machine** (the Mac Studio), using the public key trick from Step 3.

Create or edit `~/.ssh/config` on the *remote* host:

```ssh-config
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_personal.pub
    IdentitiesOnly yes
```
*(Make sure the specific `.pub` file actually exists on the remote machine).*

When the remote SSH client connects to GitHub, `IdentitiesOnly yes` forces it to look at the `.pub` file, ask your forwarded 1Password agent for the matching signature, and ignore all other forwarded keys. 

## Step 6: Verify Which Keys Are Actually Available

Check locally first:

```bash
ssh-add -l
```

Then check again in the remote VS Code terminal. This simple comparison immediately shows whether agent forwarding is active and whether the identities you expect are actually present where you need them.

## Step 7: Understand the "Too Many Keys" Problem

When 1Password contains many SSH keys, the client may offer several identities before it reaches the correct one. Because SSH servers usually enforce a maximum number of attempts (`MaxAuthTries`), authentication can fail early even though the right key is available in the agent.

```text
Too many authentication failures
```

Using `IdentitiesOnly yes` together with a host-specific `IdentityFile` keeps authentication deterministic and prevents this class of failure by narrowing the identity search space to exactly what should be used for that host.

## Technical Deep Dive: Fingerprints, Public Keys, and Private Keys

### SSH Fingerprints

A fingerprint is a short hash representation of a key, typically shown as SHA256, and it exists so humans can verify identity without comparing long raw key material character by character. In practice, fingerprints are the compact trust markers you check before accepting a new host or validating whether the agent is exposing the key you think it is.

- Server fingerprint: proves you are connecting to the expected host
- Key fingerprint in `ssh-add -l`: shows which identities the agent currently exposes

When SSH says:

```text
ED25519 key fingerprint is SHA256:...
```

you should compare that value with a trusted source before accepting the host, because that one check is what protects you from silently trusting the wrong machine.

### How Public/Private Key Auth Works

1. server has your public key in `~/.ssh/authorized_keys`
2. client proves possession of the matching private key by signing a challenge
3. server verifies signature using the public key

The private key is never transmitted, which is precisely why key-based SSH remains secure even over untrusted networks.

### How `IdentityFile` Maps Back to a Private Key

Even if you only reference a public key path in config, SSH treats that public key as an identity hint rather than as a standalone credential. It asks the configured agent for the corresponding private key capability, and if the agent has that identity (for example through 1Password), it signs the challenge and authentication succeeds.

So the mapping is:

1. `IdentityFile` selects identity (public side)
2. agent finds matching private key
3. agent signs challenge
4. server verifies against `authorized_keys`

## Step 8: Debug with Verbose SSH Logs

When authentication is unclear, go straight to verbose logs instead of guessing:

```bash
ssh -vvv macstudio
```

Look for these lines and read them in sequence, because they show the exact order of decisions SSH is making:

- `Trying private key`: which identities are attempted
- `Offering public key`: which public key is proposed
- `Server accepts key`: key matched
- `Permission denied (publickey)`: auth failed
- `Too many authentication failures`: too many keys attempted
- `Requesting authentication agent forwarding`: forwarding path is active

## Final Checklist

1. set `remote.SSH.remotePlatform` for Fish host
2. configure `IdentityAgent` to 1Password socket on macOS
3. use host-specific `IdentityFile` + `IdentitiesOnly yes`
4. enable agent forwarding if you need remote Git/SSH chaining
5. configure `IdentitiesOnly` on the **remote** host to manage outbound SSH
6. verify with `ssh-add -l` and debug with `ssh -vvv`

With this in place, VS Code Remote SSH, Fish, and 1Password behave like one integrated system instead of three tools that occasionally conflict with each other at startup or authentication time.
