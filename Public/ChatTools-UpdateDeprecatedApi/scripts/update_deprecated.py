#!/usr/bin/env python3
"""
Deprecated API Diff Tool for Lens Studio

Compares a new StudioLib.d.ts against replacements_grouped.json to find
newly deprecated APIs not yet tracked. Prompts the user for replacement
descriptions and updates the JSON.

Usage:
    python3 update_deprecated.py <path_to_StudioLib.d.ts>
"""

import json
import re
import sys
from datetime import date
from pathlib import Path

# ─── Paths ───────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
JSON_PATH = REPO_ROOT / "src" / "replacements_grouped.json"

# ─── Colours (ANSI) ─────────────────────────────────────────────────────────

GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RED = "\033[91m"
DIM = "\033[2m"
BOLD = "\033[1m"
RESET = "\033[0m"

# ─── Helpers ─────────────────────────────────────────────────────────────────


def load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: dict) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    # ensure trailing newline
    with open(path, "a", encoding="utf-8") as f:
        f.write("\n")


def get_all_existing_keys(data: dict) -> set[str]:
    """Collect every API key across all categories."""
    keys: set[str] = set()
    for cat in data.get("categories", {}).values():
        keys.update(cat.get("items", {}).keys())
    return keys


def count_code_braces(line: str, in_block_comment: bool) -> tuple[int, int, bool]:
    """
    Count { and } braces that are in code (not in comments).
    Returns (open_count, close_count, still_in_block_comment).
    """
    opens = 0
    closes = 0
    j = 0
    while j < len(line):
        if in_block_comment:
            end_idx = line.find("*/", j)
            if end_idx == -1:
                break
            j = end_idx + 2
            in_block_comment = False
        else:
            block_start = line.find("/*", j)
            line_comment = line.find("//", j)

            # Single-line comment starts before block comment
            if line_comment != -1 and (block_start == -1 or line_comment < block_start):
                # Count braces before the comment
                segment = line[j:line_comment]
                opens += segment.count("{")
                closes += segment.count("}")
                break

            if block_start != -1:
                segment = line[j:block_start]
                opens += segment.count("{")
                closes += segment.count("}")
                end_idx = line.find("*/", block_start + 2)
                if end_idx != -1:
                    j = end_idx + 2
                else:
                    in_block_comment = True
                    break
            else:
                segment = line[j:]
                opens += segment.count("{")
                closes += segment.count("}")
                break

    return opens, closes, in_block_comment


# ─── StudioLib.d.ts Parser ──────────────────────────────────────────────────


class DeprecatedItem:
    """Represents a deprecated item found in StudioLib.d.ts."""

    def __init__(self, name: str, context: str, message: str, line: int):
        self.name = name  # e.g. "TextToSpeech.VoiceNames"
        self.context = context  # e.g. "class", "property", "method", "enum_value"
        self.message = message  # deprecation message from @deprecated or DEPRECATED
        self.line = line

    def __repr__(self):
        return f"DeprecatedItem({self.name!r}, ctx={self.context!r}, line={self.line})"


def parse_dts(filepath: Path) -> list[DeprecatedItem]:
    """
    Parse StudioLib.d.ts for @deprecated and DEPRECATED markers.

    Strategy:
    1. Read all lines and track namespace/class scope via brace counting
    2. Find lines with @deprecated or 'DEPRECATED'
    3. Look ahead to determine what declaration follows
    4. Build fully-qualified names using scope context

    The key insight is that in .d.ts files, top-level declarations use `declare`
    keyword and nested declarations (inside namespace/class) don't.

    IMPORTANT: Brace counting must ignore braces inside comments, since JSDoc
    comments in .d.ts files contain examples and @link{} tags with braces.
    """
    with open(filepath, "r", encoding="utf-8") as f:
        lines = f.readlines()

    items: list[DeprecatedItem] = []

    # === Pass 1: Build scope map ===
    # Track which namespace/class scope each line belongs to.
    # We must strip comments before counting braces to avoid JSDoc braces.
    scope_at_line: dict[int, list[str]] = {}
    scope_stack: list[tuple[str, int]] = []  # (name, brace_depth when scope was entered)
    bd = 0  # brace depth
    in_block_comment = False  # track multi-line /* ... */ comments

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Count braces outside of comments
        open_b, close_b, in_block_comment = count_code_braces(line, in_block_comment)

        # Detect scope-opening declarations BEFORE updating brace depth
        ns_match = re.match(r"declare\s+namespace\s+(\w+(?:\.\w+)*)\s*\{", stripped)
        cls_match = re.match(r"declare\s+(?:class|enum)\s+(\w+)", stripped)
        inner_match = None
        if not stripped.startswith("declare") and scope_stack:
            inner_match = re.match(r"(?:class|enum)\s+(\w+)", stripped)

        if ns_match:
            scope_stack.append((ns_match.group(1), bd))
        elif cls_match:
            scope_stack.append((cls_match.group(1), bd))
        elif inner_match:
            scope_stack.append((inner_match.group(1), bd))

        # Build the full scope path for this line
        # For `declare namespace TextToSpeech { class VoiceNames {`
        # the scope should be ["TextToSpeech"] when we see `class VoiceNames`
        scope_at_line[i] = [s[0] for s in scope_stack]

        # Update brace depth
        bd += open_b - close_b

        # Pop scopes whose braces have closed
        while scope_stack and bd <= scope_stack[-1][1]:
            scope_stack.pop()

    # === Pass 2: Find deprecated items ===
    # Skip zones
    SKIP_NAMESPACES = {"_palette"}

    i = 0
    while i < len(lines):
        stripped = lines[i].strip()

        # Skip the _palette namespace (it's just a reference namespace, not real APIs)
        ns_skip = re.match(r"declare\s+namespace\s+(\w+)\s*\{", stripped)
        if ns_skip and ns_skip.group(1) in SKIP_NAMESPACES:
            depth = 0
            skip_in_comment = False
            while i < len(lines):
                o, c, skip_in_comment = count_code_braces(lines[i], skip_in_comment)
                depth += o - c
                i += 1
                if depth <= 0:
                    break
            continue

        is_deprecated = False
        dep_message = ""

        # Check for @deprecated JSDoc tag
        if "@deprecated" in stripped:
            is_deprecated = True
            dep_match = re.search(r"@deprecated\s*(.*?)(?:\*/|\*)?$", stripped)
            if dep_match:
                dep_message = dep_match.group(1).strip().rstrip("*").strip()
                # Clean up {@link Foo} → Foo
                dep_message = re.sub(r"\{@link\s+(\w+)\}", r"\1", dep_message)

        # Check for "DEPRECATED" in comments (not JSDoc @deprecated, but prose)
        elif "DEPRECATED" in stripped and ("*" in stripped or stripped.startswith("//")):
            is_deprecated = True
            dep_message = stripped.lstrip("/*").rstrip("*/").strip()

        if is_deprecated:
            dep_line = i
            # Look ahead (up to 15 lines) to find the declaration this deprecation applies to
            j = i + 1

            while j < len(lines) and j < i + 15:
                decl = lines[j].strip()

                # Skip blank, comment continuation, @hidden, constructor
                if (
                    not decl
                    or decl.startswith("*")
                    or decl.startswith("/**")
                    or decl == "*/"
                    or "@hidden" in decl
                    or "protected constructor" in decl
                ):
                    j += 1
                    continue

                # Determine scope: use the PARENT scope, not the declaration's own scope
                # e.g. for `class VoiceNames` inside `namespace TextToSpeech`,
                # scope_at_line[j] = ["TextToSpeech", "VoiceNames"] but we want
                # the name to be "TextToSpeech.VoiceNames", so we use scope BEFORE this decl.
                parent_scope = scope_at_line.get(dep_line, [])

                # Class declaration (top-level or nested)
                m = re.match(r"(?:declare\s+)?class\s+(\w+)", decl)
                if m:
                    name = m.group(1)
                    # For nested classes, parent_scope has the enclosing namespace
                    if parent_scope:
                        name = ".".join(parent_scope) + "." + name
                    items.append(DeprecatedItem(name, "class", dep_message, dep_line + 1))

                    break

                # Enum declaration
                m = re.match(r"(?:declare\s+)?enum\s+(\w+)", decl)
                if m:
                    name = m.group(1)
                    if parent_scope:
                        name = ".".join(parent_scope) + "." + name
                    items.append(DeprecatedItem(name, "enum", dep_message, dep_line + 1))

                    break

                # Namespace declaration
                m = re.match(r"(?:declare\s+)?namespace\s+(\w+(?:\.\w+)*)\s*\{", decl)
                if m:
                    name = m.group(1)
                    # Skip namespaces in the skip list (e.g. _palette)
                    if name in SKIP_NAMESPACES:
                        break
                    items.append(DeprecatedItem(name, "namespace", dep_message, dep_line + 1))

                    break

                # Method: name followed by parentheses
                m = re.match(r"(?:static\s+)?(\w+)\s*[\(<]", decl)
                if m and m.group(1) not in (
                    "if",
                    "for",
                    "while",
                    "switch",
                    "return",
                    "class",
                    "enum",
                    "declare",
                    "namespace",
                ):
                    name = m.group(1)
                    if parent_scope:
                        name = ".".join(parent_scope) + "." + name
                    items.append(DeprecatedItem(name, "method", dep_message, dep_line + 1))

                    break

                # Let in namespace
                m = re.match(r"let\s+(\w+)\s*:", decl)
                if m:
                    # Skip _palette-style underscore names
                    let_name = m.group(1)
                    if "_" in let_name:
                        j += 1
                        continue
                    name = let_name
                    if parent_scope:
                        name = ".".join(parent_scope) + "." + name
                    items.append(DeprecatedItem(name, "property", dep_message, dep_line + 1))
                    break

                # Property/field: name : type
                m = re.match(r"(?:readonly\s+)?(\w+)\s*[?]?\s*:\s*", decl)
                if m:
                    name = m.group(1)
                    if parent_scope:
                        name = ".".join(parent_scope) + "." + name
                    items.append(DeprecatedItem(name, "property", dep_message, dep_line + 1))
                    break

                # If we've hit something we can't parse, stop looking
                break

            j += 1

        i += 1

    return items


# ─── Category Classification ────────────────────────────────────────────────


def classify_api(name: str, context: str) -> str:
    """
    Classify an API into one of: classes, methods, properties, events, enums.
    Uses the context hint from parsing plus heuristics.
    """
    lower = name.lower()

    # Context-based
    if context == "enum":
        return "enums"
    if context == "method":
        return "methods"

    # Event patterns
    if "event" in lower or lower.startswith("on") or "callback" in lower:
        return "events"

    # Enum value patterns (all caps, known enums)
    if context == "enum_value":
        return "enums"

    # Class detection: PascalCase without dots, or context says class
    if context == "class":
        return "classes"

    # Property: has a dot (ClassName.propertyName) where propertyName is camelCase
    if "." in name:
        parts = name.rsplit(".", 1)
        member = parts[1]
        # Methods have parens or are known action verbs
        if (
            member.startswith("get")
            or member.startswith("set")
            or member.startswith("create")
            or member.startswith("add")
            or member.startswith("remove")
            or member.startswith("start")
            or member.startswith("stop")
        ):
            return "methods"
        return "properties"

    # Default heuristics
    if name[0].isupper():
        return "classes"

    return "properties"


# ─── Interactive Prompt ──────────────────────────────────────────────────────


def prompt_replacement(item: DeprecatedItem) -> tuple[str, str] | None:
    """
    Prompt user for a replacement description for a newly deprecated API.
    Returns (tag, replacement_text) or None to skip.
    """
    print()
    print(f"  {BOLD}{CYAN}API:{RESET}      {item.name}")
    print(f"  {DIM}Type:{RESET}     {item.context}")
    print(f"  {DIM}Line:{RESET}     {item.line}")
    if item.message:
        print(f"  {DIM}Message:{RESET}  {item.message}")
    print()

    # Ask for tag
    print(f"  {YELLOW}Tag options:{RESET}")
    print("    1) [Deprecated] - API deprecated, no direct replacement")
    print("    2) [Replaced]   - API replaced with a modern alternative")
    print("    s) Skip this API")
    print("    q) Quit (save what we have so far)")
    print()

    while True:
        choice = input(f"  {BOLD}Choose tag (1/2/s/q):{RESET} ").strip().lower()
        if choice in ("1", "2", "s", "q"):
            break
        print(f"  {RED}Invalid choice. Enter 1, 2, s, or q.{RESET}")

    if choice == "s":
        print(f"  {DIM}Skipped.{RESET}")
        return None
    if choice == "q":
        return "QUIT", ""

    tag = "[Deprecated]" if choice == "1" else "[Replaced]"

    # Pre-fill with deprecation message if available
    default_desc = item.message if item.message else ""
    if default_desc:
        print(f"  {DIM}Suggested:{RESET} {default_desc}")

    desc = input(f"  {BOLD}Replacement description:{RESET} ").strip()
    if not desc and default_desc:
        desc = default_desc
    if not desc:
        desc = f"Removed (entire {item.name} no longer available)"

    return tag, f"{tag} {desc}"


# ─── Main ────────────────────────────────────────────────────────────────────


def main():
    # Resolve StudioLib.d.ts path
    if len(sys.argv) < 2:
        print(f"{RED}Error:{RESET} Missing required argument.")
        print(f"Usage: python3 {sys.argv[0]} <path_to_StudioLib.d.ts>")
        sys.exit(1)

    dts_path = Path(sys.argv[1]).resolve()
    if not dts_path.exists():
        print(f"{RED}Error:{RESET} StudioLib.d.ts not found at: {dts_path}")
        sys.exit(1)

    if not JSON_PATH.exists():
        print(f"{RED}Error:{RESET} replacements_grouped.json not found at: {JSON_PATH}")
        sys.exit(1)

    # Extract version from StudioLib.d.ts
    dts_version = "unknown"
    with open(dts_path, "r", encoding="utf-8") as f:
        for line in f:
            m = re.search(r"@version\s+([\d.]+)", line)
            if m:
                dts_version = m.group(1)
                break

    print()
    print(f"  {BOLD}═══════════════════════════════════════════════════════{RESET}")
    print(f"  {BOLD}  Lens Studio Deprecated API Diff Tool{RESET}")
    print(f"  {BOLD}═══════════════════════════════════════════════════════{RESET}")
    print()
    print(f"  {DIM}StudioLib.d.ts:{RESET}         {dts_path}")
    print(f"  {DIM}StudioLib version:{RESET}       {dts_version}")
    print(f"  {DIM}replacements_grouped:{RESET}    {JSON_PATH}")
    print()

    # Load existing data
    data = load_json(JSON_PATH)
    existing_keys = get_all_existing_keys(data)
    json_version = data.get("_metadata", {}).get("lensstudioapiversion", "?")
    print(f"  {DIM}JSON API version:{RESET}        {json_version}")
    print(f"  {DIM}Existing entries:{RESET}         {len(existing_keys)}")
    print()

    # Parse StudioLib.d.ts
    print(f"  {CYAN}Parsing StudioLib.d.ts...{RESET}")
    deprecated_items = parse_dts(dts_path)
    print(f"  {DIM}Found {len(deprecated_items)} deprecated items in StudioLib.d.ts{RESET}")
    print()

    # Find new items (not in existing keys)
    new_items: list[DeprecatedItem] = []
    for item in deprecated_items:
        if item.name not in existing_keys:
            new_items.append(item)

    if not new_items:
        # Still update the API version if it changed
        old_version = data.get("_metadata", {}).get("lensstudioapiversion", "")
        if old_version != dts_version:
            data["_metadata"]["lensstudioapiversion"] = dts_version
            data["_metadata"]["last_updated"] = date.today().isoformat()
            save_json(JSON_PATH, data)
            print(f"  {GREEN}✓ No new deprecated APIs found!{RESET}")
            print(f"  {GREEN}✓ Updated lensstudioapiversion: {old_version} → {dts_version}{RESET}")
        else:
            print(f"  {GREEN}✓ No new deprecated APIs found!{RESET}")
        print(f"  {DIM}replacements_grouped.json is up to date with StudioLib.d.ts v{dts_version}.{RESET}")
        print()
        return

    print(f"  {YELLOW}Found {len(new_items)} NEW deprecated API(s) not in replacements_grouped.json:{RESET}")
    print()
    for idx, item in enumerate(new_items, 1):
        suggested_cat = classify_api(item.name, item.context)
        print(f"    {idx}. {BOLD}{item.name}{RESET}  {DIM}({suggested_cat}, line {item.line}){RESET}")
        if item.message:
            print(f"       {DIM}{item.message}{RESET}")
    print()

    # Ask user whether to proceed
    proceed = input(f"  {BOLD}Add these to replacements_grouped.json? (y/n):{RESET} ").strip().lower()
    if proceed != "y":
        print(f"  {DIM}Aborted.{RESET}")
        return

    # Process each new item
    added_count = 0
    for item in new_items:
        result = prompt_replacement(item)
        if result is None:
            continue
        if result[0] == "QUIT":
            print(f"\n  {YELLOW}Quitting early. Saving {added_count} new entries...{RESET}")
            break

        tag, replacement_text = result
        category = classify_api(item.name, item.context)

        # Allow user to override category
        print(f"  {DIM}Auto-classified as:{RESET} {category}")
        cat_override = (
            input(f"  {BOLD}Category (classes/methods/properties/events/enums) [{category}]:{RESET} ").strip().lower()
        )
        if cat_override in ("classes", "methods", "properties", "events", "enums"):
            category = cat_override

        # Add to data
        if category not in data["categories"]:
            print(f"  {RED}Category '{category}' not found, using 'properties'.{RESET}")
            category = "properties"

        data["categories"][category]["items"][item.name] = replacement_text
        added_count += 1
        print(f"  {GREEN}✓ Added {item.name} → {category}{RESET}")

    if added_count == 0:
        print(f"\n  {DIM}No changes made.{RESET}")
        return

    # Sort items in each category
    for cat in data["categories"].values():
        cat["items"] = dict(sorted(cat["items"].items()))

    # Update metadata
    total = sum(len(cat["items"]) for cat in data["categories"].values())
    data["_metadata"]["total_entries"] = total
    data["_metadata"]["last_updated"] = date.today().isoformat()
    data["_metadata"]["lensstudioapiversion"] = dts_version

    # Save
    save_json(JSON_PATH, data)

    print()
    print(f"  {GREEN}═══════════════════════════════════════════════════════{RESET}")
    print(f"  {GREEN}  Done! Added {added_count} new entries.{RESET}")
    print(f"  {GREEN}  Total entries: {total}{RESET}")
    print(f"  {GREEN}  Version: {dts_version}{RESET}")
    print(f"  {GREEN}  Saved to: {JSON_PATH}{RESET}")
    print(f"  {GREEN}═══════════════════════════════════════════════════════{RESET}")
    print()
    print(f"  {YELLOW}Next steps:{RESET}")
    print("    1. Review the changes in replacements_grouped.json")
    print(f"    2. Run: cd {REPO_ROOT} && npm run build")
    print("    3. Test the chat tool in Lens Studio")
    print()


if __name__ == "__main__":
    main()
