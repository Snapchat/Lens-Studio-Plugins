# Update Deprecated API - Lens Studio Chat Tool

A Chat Tool plugin for Lens Studio AI that helps developers identify deprecated APIs and provides modern replacements with migration guidance.

## Overview

This tool provides instant access to a comprehensive database of **351 deprecated Lens Studio APIs** with their modern replacements, organized into 5 type-based categories.

## Features

- **Comprehensive Coverage**: 351 deprecated APIs with replacements
- **Smart Search**: Exact, partial, and category-based search modes
- **5 Categories**: `classes`, `methods`, `properties`, `events`, `enums`
- **Migration Examples**: Context-aware code examples
- **Tag System**: `[Deprecated]`, `[Replaced]` tags
- **Diff Tool**: Script to detect new deprecations from `StudioLib.d.ts`

## Installation

1. Copy this folder to your Lens Studio plugins directory
2. In Lens Studio, go to **Edit** → **Preferences** → **Plugins**
3. Enable "Update Deprecated API"
4. Open Developer Mode and start using the tool

## Directory Structure

```
ChatTools-UpdateDeprecatedApi/
├── src/
│   ├── index.ts                      # Entry point
│   ├── updateDeprecatedAPI.ts        # Tool implementation
│   ├── updateDeprecatedAPI.json      # Schema definition
│   ├── replacements_grouped.json     # Deprecated API data (5 categories)
│   └── types.d.ts                    # Type declarations
├── scripts/
│   └── update_deprecated.py          # Diff tool to find new deprecations
├── module.json                       # Plugin manifest
├── package.json                      # Node.js configuration
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

## Usage

### Basic Search

Ask the AI to find replacements for deprecated APIs:

```
"What's the replacement for Animation class?"
"How do I update AnimationMixer.start?"
"Is getFacesCount deprecated?"
```

### Direct Tool Usage

```typescript
Tool: UpdateDeprecatedAPI
Parameters:
  apiName: "Animation"
  includeExamples: true
```

### Search Modes

1. **Partial Search (Default)**: `apiName: "Animation"` → Finds all Animation* APIs
2. **Exact Search**: `searchMode: "exact"` → Finds exact match only
3. **Category Search**: `searchMode: "category"` → Lists all APIs in category

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiName` | string | Yes | API name to search for |
| `category` | string | No | Filter by category |
| `includeExamples` | boolean | No | Include code examples (default: true) |
| `searchMode` | string | No | Search mode: `exact`, `partial`, `category` |

## Categories

| Category | Count | Description |
|----------|-------|-------------|
| `classes` | 55 | Deprecated class types (Animation, VoiceMLModule, BlendShapes, etc.) |
| `methods` | 121 | Deprecated methods (SceneObject.getAllComponents, fetch, hitTest, etc.) |
| `properties` | 121 | Deprecated properties (Camera.enableClearColor, AnimationMixer.speedRatio, etc.) |
| `events` | 4 | Deprecated event classes (CandideUpdatedEvent, TurnOnEvent, etc.) |
| `enums` | 48 | Deprecated enum types and values (Colorspace, WeightedMode.Both, RGBA, etc.) |

## Tag System

- **`[Deprecated]`**: API deprecated/removed with no direct replacement
- **`[Replaced]`**: API has a modern replacement with migration guidance

## Examples

### Animation Migration

**Query**: "How do I replace AnimationMixer?"

**Response**:
```
Found replacement for "AnimationMixer":
[Replaced] Use AnimationPlayer instead

Before:
var mixer = script.animationMixer;
mixer.start("AnimationMixer", 0, -1);

After:
var player = script.animationPlayer;
player.start("animation_name");
```

### Face Tracking

**Query**: "What replaced getFacesCount?"

**Response**:
```
Found replacement for "getFacesCount":
[Replaced] Use SceneObject.isEnabledInHierarchy on the object containing the Head component

Before:
var count = getFacesCount();

After:
// @input Component.FaceTracking faceTracking
if (script.faceTracking.faceFound) {
    print("Face detected!");
}
```

## Development

### Building

```bash
npm install
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory and copies `replacements_grouped.json` to `dist/`.

### Updating Deprecated APIs

When a new version of Lens Studio is released, use the diff tool to find newly deprecated APIs:

#### Prerequisites

- Python 3.9+
- Access to the latest `StudioLib.d.ts` file from Lens Studio

#### Steps

1. **Run the diff tool** against the new `StudioLib.d.ts`:

   ```bash
   python3 scripts/update_deprecated.py <path_to_new_StudioLib.d.ts>
   ```

   For example:
   ```bash
   python3 scripts/update_deprecated.py ~/LensStudio/StudioPlugins/GUI/Project/Resources/StudioLib.d.ts
   ```

2. **Review the output** — the script will:
   - Parse all `@deprecated` and `DEPRECATED` markers in the `.d.ts` file
   - Compare them against existing entries in `replacements_grouped.json`
   - List any **new** deprecated APIs not yet tracked

3. **For each new API**, the script will interactively prompt you to:
   - Choose a tag: `[Deprecated]` or `[Replaced]`
   - Enter a replacement description
   - Confirm the auto-classified category (`classes`/`methods`/`properties`/`events`/`enums`)

4. **Build and test**:

   ```bash
   npm run build
   ```

5. **Verify** the changes in Lens Studio by testing the chat tool.

#### Example Session

```
  ═══════════════════════════════════════════════════════
    Lens Studio Deprecated API Diff Tool
  ═══════════════════════════════════════════════════════

  StudioLib version:       5.19.0
  Existing entries:        351

  Found 2 NEW deprecated API(s) not in replacements_grouped.json:

    1. SomeClass.oldMethod  (methods, line 1234)
       Use SomeClass.newMethod() instead.
    2. OldComponent         (classes, line 5678)

  Add these to replacements_grouped.json? (y/n): y

  API:      SomeClass.oldMethod
  Type:     method
  Line:     1234
  Message:  Use SomeClass.newMethod() instead.

  Choose tag (1/2/s/q): 2
  Replacement description: Use SomeClass.newMethod() instead
  Category (classes/methods/properties/events/enums) [methods]:
  ✓ Added SomeClass.oldMethod → methods
```

### Data File

- **`src/replacements_grouped.json`**: 351 entries organized into 5 type-based categories (`classes`, `methods`, `properties`, `events`, `enums`) with O(1) lookups

## Troubleshooting

**Tool Not Found**: Enable plugin in Lens Studio Preferences → Plugins, then restart

**Data Not Loading**: Ensure JSON files are present and valid

**TypeScript Errors**: Install TypeScript (`npm install -g typescript`) and run `tsc`

## Version History

**v1.1.0** (2026-02-11)
- Restructured from 14 topic-based categories to 5 type-based categories (`classes`, `methods`, `properties`, `events`, `enums`)
- Removed 113 duplicate short-name entries
- Added 4 missing deprecated APIs (MeshVisual, TextToSpeech.VoiceNames, VoiceML.NlpIntentsModelOptions, VoiceML.NlpKeywordModelOptions)
- Added `scripts/update_deprecated.py` diff tool for detecting new deprecations
- 351 total entries

**v1.0.0** (2026-01-26)
- Initial release with 460 deprecated APIs across 14 topic-based categories

## API Reference

Documentation: https://developers.snap.com/api/lens-api-deprecation
