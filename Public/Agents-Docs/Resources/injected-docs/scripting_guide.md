# Lens Studio Scripting Guide

## Overview

Lens Studio supports scripting in both JavaScript (ES2021) and TypeScript. Scripts run in a custom runtime environment, not a browser. There is no DOM.

## TypeScript Components

### Basic Component Structure

```typescript
@component
export class MyScript extends BaseScriptComponent {
    @input
    targetObject: SceneObject;

    onAwake() {
        print('Component initialized');

        if (this.targetObject) {
            print('Target: ' + this.targetObject.name);
        }
    }
}
```

### Input Decorators (TypeScript)

```typescript
@component
export class InputExample extends BaseScriptComponent {
    // Basic inputs
    @input
    myNumber: number;

    @input
    myString: string = 'default';

    @input
    myBool: boolean = false;

    // Scene references
    @input
    targetObject: SceneObject;

    @input
    textComponent: Text;

    @input
    material: Material;

    // Math types
    @input
    position: vec3;

    @input
    rotation: quat;

    // Arrays
    @input
    objects: SceneObject[];

    // Typed input (use 'int' for integers)
    @input('int')
    intValue: number;
}
```

### Input Validation and Assignment

#### How @input Validation Works

Lens Studio performs **runtime validation** on all `@input` properties when a component awakens. If a required input is not assigned, the component will fail to initialize with an error like:

```
Error: Input targetObject was not provided for the object MyScript Object
```

This validation ensures components have all required references before running.

#### Assigning Inputs via MCP Tools

When using MCP tools to set up script components, inputs must be assigned using `SetLensStudioProperty` with the `reference` valueType:

```
// After creating a ScriptComponent on a SceneObject:
SetLensStudioProperty(
    objectUUID: "<script-component-uuid>",
    propertyPath: "targetObject",  // The @input property name
    value: "<target-scene-object-uuid>",
    valueType: "reference"
)
```

**Important:** The `scriptAsset` property must be set first before other inputs become available:

```
SetLensStudioProperty(
    objectUUID: "<script-component-uuid>",
    propertyPath: "scriptAsset",
    value: "<typescript-asset-uuid>",
    valueType: "reference"
)
```

#### Making Inputs Optional with @allowUndefined

To allow an input to be undefined (not assigned), use the `@allowUndefined` decorator:

> **Warning:** Do NOT use TypeScript's optional property syntax (`?` suffix) for inputs. It is not supported by the Lens Studio compiler. Always use `@allowUndefined` instead.

```typescript
// BAD - Will not work as expected:
@input
optionalTarget?: SceneObject;  // Don't use ? suffix!

// GOOD - Use @allowUndefined decorator:
@input
@allowUndefined
optionalTarget: SceneObject;
```

```typescript
@component
export class OptionalInputExample extends BaseScriptComponent {
    // Required input - will fail if not assigned
    @input
    requiredTarget: SceneObject;

    // Optional input - can be undefined
    @input
    @allowUndefined
    optionalTarget: SceneObject;

    onAwake() {
        // requiredTarget is guaranteed to exist here
        print('Required: ' + this.requiredTarget.name);

        // optionalTarget must be null-checked
        if (this.optionalTarget) {
            print('Optional: ' + this.optionalTarget.name);
        } else {
            print('Optional target not assigned');
        }
    }
}
```

### UI Decorators (TypeScript)

```typescript
@component
export class UIExample extends BaseScriptComponent {
    @ui.separator
    @input
    section1Value: number;

    @ui.label('Custom Section')
    @input
    labeledInput: SceneObject;
}
```

## Imports and Custom Types

### Creating Custom Script Components

You can import custom script components to reference other objects in the scene.

```typescript
// CustomData.ts - Define the custom type
export class CustomData extends BaseScriptComponent {
    @input
    objectRef: SceneObject;

    @input
    value: number = 0;
}
```

```typescript
// MyComponent.ts - Use the custom type as an input
import { CustomData } from './CustomData';

@component
export class MyComponent extends BaseScriptComponent {
    @input
    customData: CustomData;

    onAwake() {
        if (!isNull(this.customData)) {
            print('Value: ' + this.customData.value);

            if (!isNull(this.customData.objectRef)) {
                print('Object: ' + this.customData.objectRef.name);
            }
        }
    }
}
```

### Inter-Script Communication with Imports

When one script needs to access methods from another, import the class type and use `@input` to create a typed reference:

```typescript
// DataProvider.ts
@component
export class DataProvider extends BaseScriptComponent {
    private _value: number = 0;

    getValue(): number {
        return this._value;
    }

    setValue(v: number): void {
        this._value = v;
    }
}
```

```typescript
// Consumer.ts
import { DataProvider } from './DataProvider';

@component
export class Consumer extends BaseScriptComponent {
    @input
    dataProvider: DataProvider;

    onAwake() {
        if (!isNull(this.dataProvider)) {
            const value = this.dataProvider.getValue();
            print('Value from provider: ' + value);

            this.dataProvider.setValue(42);
        }
    }
}
```

**Setup:** In the Inspector, use your set property tool to assign a reference to the `DataProvider` onto the `dataProvider` input field of `Consumer`.

## JavaScript Scripts

### Input Decorators (JavaScript)

```javascript
// Primitives
//@input bool myBool = true
//@input int myInt = 5
//@input float myFloat = 3.5
//@input string myString = "default"

// Math types
//@input vec2 myVec2 = {1, 2}
//@input vec3 myVec3 = {1, 2, 3}
//@input vec4 myVec4 = {1, 2, 3, 4}
//@input quat myQuat = {0, 0, 0, 1}
//@input mat4 myMatrix

// Scene references
//@input SceneObject targetObject
//@input Component.Text textComponent
//@input Asset.Material material

// Arrays
//@input SceneObject[] objectArray
//@input float[] floatArray = {0.1, 0.2, 0.3}
//@input string[] stringArray = {"one", "two", "three"}

// With UI labels
//@input float speed = 1.0 {"label": "Movement Speed"}
```

### UI Widgets (JavaScript)

```javascript
//@ui {"widget": "separator"}
//@input int mode = 0 {"widget": "combobox", "values": [{"label": "Option 1", "value": 0}, {"label": "Option 2", "value": 1}]}

//@ui {"widget": "group_start", "label": "Settings"}
//@input float value1
//@input float value2
//@ui {"widget": "group_end"}

// Conditional visibility
//@input bool showAdvanced = false
//@input float advancedValue {"showIf": "showAdvanced"}
```

### Accessing Inputs (JavaScript)

```javascript
//@input float speed = 1.0
//@input SceneObject target

// Access via script object
var currentSpeed = script.speed;
var targetTransform = script.target.getTransform();
```

## Lifecycle Events

### TypeScript

```typescript
@component
export class LifecycleExample extends BaseScriptComponent {
    // This is the ONLY event that will always be called. Other events must be created.
    onAwake() {
        // Called once when the script first becomes enabled
        print('Component initialized');

        // Register lifecycle events
        this.createEvent('UpdateEvent').bind(this.onUpdate.bind(this));
        this.createEvent('LateUpdateEvent').bind(this.onLateUpdate.bind(this));
        this.createEvent('DestroyEvent').bind(this.onDestroy.bind(this));
    }

    onUpdate() {
        // Called every frame
    }

    onLateUpdate() {
        // Called after all onUpdate calls
    }

    onDestroy() {
        // Called when the component or SceneObject is destroyed
        print('Component destroyed');
    }
}
```

### JavaScript

```javascript
function onAwake() {
    // Called once when the script first becomes enabled
}

function onUpdate() {
    // Called every frame
}

function onLateUpdate() {
    // Called after all onUpdate calls
}

function onDestroy() {
    // Called when destroyed
}

// Register update event
script.createEvent('UpdateEvent').bind(onUpdate);
script.createEvent('LateUpdateEvent').bind(onLateUpdate);
script.createEvent('DestroyEvent').bind(onDestroy);
```

### Delayed Callbacks

```javascript
// Delay by time
var delayedEvent = script.createEvent('DelayedCallbackEvent');
delayedEvent.bind(function() {
    print('Executed after delay');
});
delayedEvent.reset(2.0); // 2 second delay

// Delay by frames
var updateEvent = script.createEvent('UpdateEvent');
var frameCount = 0;
updateEvent.bind(function() {
    frameCount++;
    if (frameCount >= 60) {
        print('60 frames passed');
        updateEvent.enabled = false;
    }
});
```

## Communication Between Scripts

### Script API Pattern (JavaScript)

> **Note:** `script.api` is deprecated. Prefer using `@input` references to typed components or TypeScript class methods for inter-script communication.

```javascript
// dataProvider.js
//@input float initialValue = 0

script.api.getValue = function() {
    return script.initialValue;
};

script.api.setValue = function(v) {
    script.initialValue = v;
};

// consumer.js
//@input Component.ScriptComponent dataProvider

function onAwake() {
    var value = script.dataProvider.api.getValue();
    print(value);
}
```

## Global Functions

```javascript
// Logging
print('Debug message');

// Time
var dt = getDeltaTime();      // Time since last frame (seconds)
var time = getTime();         // Time since lens started (seconds)

// Check if in Lens Studio editor
var isEditor = global.deviceInfoSystem.isEditor();
```

## TypeScript Syntax Notes

### Explicit Return Types

Always use explicit return types for public methods:

```typescript
// GOOD: Explicit return type
getValue(): number {
    return this._value;
}

setValue(v: number): void {
    this._value = v;
}
```

### Type Casting for getComponent

When using `getComponent()`, cast the result to the expected type:

```typescript
// Cast to specific component type
const text = this.getSceneObject().getComponent('Component.Text') as Text;

// For dynamic type strings, use keyof ComponentNameMap
const comp = obj.getComponent(typeString as keyof ComponentNameMap);
```

### Use isNull() instead of truthy checks

```typescript
// BAD: Only checks if JS reference exists
if (this.targetObject) { ... }
if (obj != null) { ... }

// GOOD: Checks if object exists AND is still valid in the engine
if (!isNull(this.targetObject)) { ... }
```

The `isNull()` function is essential because Lens Studio objects can be in a "destroyed" state, such as when a SceneObject is destroyed at runtime via `destroy()`. Always use `isNull()` for SceneObjects, Components, Assets, and other engine types.

## Best Practices

1. **Use TypeScript** for larger projects - provides type safety and better tooling
2. **Avoid global variables** - use component state instead
3. **Use `@allowUndefined`** for optional reference inputs - never use `?` suffix
4. **Initialize in onAwake()** - not in the global scope
5. **Cache component references** - don't call `getComponent()` every frame
6. **Use `@input` for configuration** - makes scripts reusable
7. **Use imports** for inter-script communication - type-safe and explicit
8. **Add explicit return types** to methods - improves code clarity
9. **Use `isNull()` for object/component checks** - handles destroyed objects safely
