# Automate Documentation Publishing

This guide explains how to set up automated documentation publishing using GitHub Actions.

## Table of Contents

- [Overview](#overview)
- [Reference Implementation](#reference-implementation)
- [Required Setup](#required-setup)
  - [1. Repository Secrets](#1-repository-secrets)
  - [2. Permissions](#2-permissions)
- [Key Workflow Steps](#key-workflow-steps)
  - [1. Checkout Code](#1-checkout-code)
  - [2. Generate Documentation](#2-generate-documentation)
  - [3. Commit Changes](#3-commit-changes)
- [Push to Protected Branches](#push-to-protected-branches)
- [Usage](#usage)
  - [Automatic Publishing](#automatic-publishing)
  - [Manual Publishing](#manual-publishing)


## Overview

The automated publishing workflow automatically generates and commits documentation updates when:
- Pull requests are merged to the main branch
- Manual workflow dispatch is triggered
- Code changes are pushed (excluding documentation-only commits)

## Reference Implementation

See [formatting_and_docs.yml](https://github.com/ben-shepherd/simple-docs-extractor/blob/main/.github/workflows/formatting_and_docs.yml) for a complete working example.

Note: The deployment of Github Pages is triggered when a new change is pushed to the main branch.

## Required Setup

### 1. Repository Secrets

Configure these secrets in your repository settings:

- `ADMIN_TOKEN`: A personal access token with repository write permissions
- `GITHUB_TOKEN`: Automatically provided by GitHub (fallback)

### 2. Permissions

The workflow requires write access to commit documentation changes:

```yaml
permissions:
  contents: write
```

## Key Workflow Steps

### 1. Checkout Code
```yaml
- uses: actions/checkout@v5
  with:
    ref: ${{ github.head_ref }}
    token: ${{ secrets.ADMIN_TOKEN }}
```

### 2. Generate Documentation
```yaml
- name: Run Publish Docs
  run: npm run docs:publish
```

### 3. Commit Changes
```yaml
- name: Check for changes
  id: check-changes
  run: |
    if [ -n "$(git status --porcelain)" ]; then
      echo "changes=true" >> $GITHUB_OUTPUT
    else
      echo "changes=false" >> $GITHUB_OUTPUT
    fi

- uses: stefanzweifel/git-auto-commit-action@v6
  if: steps.check-changes.outputs.changes == 'true'
  with:
    commit_message: "docs: publish documentation updates: skip-checks:true"
    file_pattern: "docs/**"
    commit_author: "GitHub Actions <actions@github.com>"
    commit_user_name: "github-actions[bot]"
    commit_user_email: "actions@github.com"
    token: ${{ secrets.ADMIN_TOKEN || secrets.GITHUB_TOKEN }}
```

## Push to Protected Branches

If your repository uses protected branches you have to make some changes to your Workflow for the Action to work properly: You need a Personal Access Token and you either have to allow force pushes or the Personal Access Token needs to belong to an Administrator.

First, you have to create a new Personal Access Token (PAT), store the token as a secret in your repository and pass the new token to the actions/checkout Action step.

If you create a personal access token (classic), apply the `repo` and `workflow` scopes. If you create a fine-grained personal access token, apply the `Contents`-permissions.

For more details and troubleshooting, see the [git-auto-commit-action documentation](https://github.com/stefanzweifel/git-auto-commit-action).

## Usage

### Automatic Publishing
Documentation is automatically published when:
1. A pull request is merged to main
2. Code changes are pushed to main (excluding docs-only commits)

### Manual Publishing
To manually trigger documentation publishing:
1. Go to the Actions tab in your repository
2. Select "Formatting / Docs Changes" workflow
3. Click "Run workflow" button
