# lens-studio-core

Core agent components for Lens Studio — Lens API reference, Editor API delegation, debugging, and environment management

## Skills

| Skill | Purpose |
|-------|---------|
| `ensure-package-installed` | Verifies a Lens Studio package is installed and installs it from the Asset Library if missing. Supports any package including SpectaclesUIKit and SpectaclesInteractionKit. When installing SpectaclesUIKit, also ensures SpectaclesInteractionKit is present first (UIKit depends on SIK). Use when a workflow depends on a specific Lens Studio package. |
| `logs-skill` | Lens Studio log format, thread categories, and grep patterns for reading compiler and preview logs. Use when analyzing logs, debugging compilation failures, or reading preview runtime output. |
| `reset-preview-environment` | Reset the Lens Studio preview to a clean state before scene generation. Captures a baseline log timestamp. Use before any scene generation task or when starting fresh. |

## Installation

```
/plugin marketplace add Snapchat/Lens-Studio-Plugins
/plugin install lens-studio-core@lens-studio-extensions
```
