---
name: ensure-package-installed
description: Verifies a Lens Studio package is installed and installs it from the Asset Library if missing. Supports any package including SpectaclesUIKit and SpectaclesInteractionKit. When installing SpectaclesUIKit, also ensures SpectaclesInteractionKit is present first (UIKit depends on SIK). Use when a workflow depends on a specific Lens Studio package.
user-invocable: true
arguments:
  - name: package_name
    description: "Name of the package to ensure is installed (e.g., SpectaclesUIKit, SpectaclesInteractionKit)"
    required: true
---

# Ensure Package Installed

Verify a required package is present in the project, installing it if necessary.

## Step 1: Handle Dependency Order

If `package_name` is `"SpectaclesUIKit"` (or contains `"UIKit"`):
- Run this entire skill first with `package_name = "SpectaclesInteractionKit"` before proceeding
- SpectaclesUIKit depends on SpectaclesInteractionKit — SIK must be installed first

## Step 2: Check Installed Packages

Use `ListInstalledPackagesTool` with `includeDetails: false` to get all installed packages.

Scan the results for a case-insensitive substring match against `package_name`:
- Exact match: `"SpectaclesUIKit"` matches `"SpectaclesUIKit"`
- Partial match: `"UIKit"` matches `"SpectaclesUIKit"`

If a match is found → report "already installed" and exit successfully.

## Step 3: Search the Asset Library

If not installed, use `SearchLensStudioAssetLibrary` with:
- `query`: the `package_name` value
- `type`: `"Package"` (if the tool supports type filtering)

Identify the correct result from the search by matching the package name. Extract its URI or identifier.

## Step 4: Install the Package

Use `InstallLensStudioPackage` with the URI obtained from the search result.

Wait for installation to complete.

## Step 5: Verify Installation

Use `ListInstalledPackagesTool` again and confirm the package now appears in the list.

## Completion

Report:
- Package name
- Whether it was already installed or newly installed
- Installation status (success or failure)
- If failure: the search results found, and a suggestion to install manually via Window > Asset Library in Lens Studio
