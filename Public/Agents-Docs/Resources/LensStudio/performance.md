# Performance Best Practices

## Overview

Lenses run on mobile devices with limited resources. Optimizing for performance ensures smooth 60fps experiences across all devices.

## Frame Rate Optimization

### Avoid Per-Frame Allocations

```typescript
// BAD: Creates new vec3 every frame
onUpdate() {
    const offset = new vec3(0, 1, 0);
    transform.setLocalPosition(transform.getLocalPosition().add(offset));
}

// GOOD: Reuse pre-allocated objects
private readonly offset = new vec3(0, 1, 0);

onUpdate() {
    transform.setLocalPosition(transform.getLocalPosition().add(this.offset));
}
```

### Cache Component References

```typescript
// BAD: Lookup every frame
onUpdate() {
    const text = this.getSceneObject().getComponent('Component.Text') as Text;
    text.text = getTime().toString();
}

// GOOD: Cache in onAwake
private textComponent: Text;

onAwake() {
    const comp = this.getSceneObject().getComponent('Component.Text');
    if (!isNull(comp)) {
        this.textComponent = comp as Text;
    }
}

onUpdate() {
    if (!isNull(this.textComponent)) {
        this.textComponent.text = getTime().toString();
    }
}
```

### Limit Update Frequency

```typescript
// BAD: Heavy computation every frame
onUpdate() {
    this.expensiveCalculation();
}

// GOOD: Throttle updates
private lastUpdateTime: number = 0;
private readonly updateInterval: number = 0.1; // 10 times per second

onUpdate() {
    const now = getTime();
    if (now - this.lastUpdateTime >= this.updateInterval) {
        this.lastUpdateTime = now;
        this.expensiveCalculation();
    }
}
```

### Disable Unused Components

```typescript
// Disable components when not needed
this.heavyComponent.enabled = false;

// Disable entire SceneObjects when off-screen
this.distantObject.enabled = false;
```

## Memory Management

### Texture Memory

| Texture Size | Memory (RGBA) | Recommendation |
|--------------|---------------|----------------|
| 64x64 | 16 KB | Gradients, particles |
| 256x256 | 256 KB | Icons, small UI |
| 512x512 | 1 MB | Main textures (recommended max) |
| 1024x1024 | 4 MB | Rarely needed, only for texture atlases |

**Guidelines:**
- Use power-of-two dimensions (64, 256, 512)
- Keep textures at 512x512 or smaller whenever possible
- Use 64x64 or smaller for simple gradients and particle effects
- Use texture space efficiently - no empty space in textures
- Textures larger than 512 should be exceedingly rare

### Texture Compression

- Use .pvr format for hardware-compressed textures when available
- Enable compression in import settings
- Use ASTC format for best quality/size ratio
- Use ETC2 for broader compatibility
- Always use mipmaps (saves bandwidth when texels map to < 1 pixel)
- Test on actual devices

### Mesh Optimization

| Polygon Count | Use Case |
|---------------|----------|
| < 1,000 | Background objects |
| 1,000 - 5,000 | Secondary objects |
| 5,000 - 15,000 | Main character/focus |
| > 15,000 | Avoid for real-time |

**Guidelines:**
- Target < 50,000 total polygons per scene
- Use LOD (Level of Detail) for complex objects
- Merge static meshes when possible
- Remove unseen faces

## Script Performance

### Avoid String Operations in Loops

```typescript
// BAD: String concatenation in update
onUpdate() {
    let result = '';
    for (let i = 0; i < 100; i++) {
        result += i.toString();
    }
}

// GOOD: Use arrays and join
onUpdate() {
    const parts: string[] = [];
    for (let i = 0; i < 100; i++) {
        parts.push(i.toString());
    }
    const result = parts.join('');
}
```

### Minimize Object Iteration

```typescript
// BAD: Find component every frame
onUpdate() {
    const obj = scene.findObjectByName('Target');
    if (!isNull(obj)) {
        // use obj
    }
}

// GOOD: Cache reference via @input
@input
@allowUndefined
target: SceneObject;

onUpdate() {
    if (!isNull(this.target)) {
        // use this.target directly
    }
}
```

### Use Object Pools

```typescript
// Object pool for frequently created/destroyed objects
@component
export class ObjectPool extends BaseScriptComponent {
    @input
    @allowUndefined
    prefab: ObjectPrefab;

    @input
    poolSize: number = 20;

    private pool: SceneObject[] = [];
    private activeCount: number = 0;

    onAwake() {
        if (isNull(this.prefab)) {
            print('ObjectPool: No prefab assigned!');
            return;
        }

        for (let i = 0; i < this.poolSize; i++) {
            const obj = this.prefab.instantiate(this.getSceneObject());
            obj.enabled = false;
            this.pool.push(obj);
        }
    }

    acquire(): SceneObject | null {
        for (const obj of this.pool) {
            if (!obj.enabled) {
                obj.enabled = true;
                this.activeCount++;
                return obj;
            }
        }
        return null; // Pool exhausted
    }

    release(obj: SceneObject): void {
        obj.enabled = false;
        this.activeCount--;
    }
}
```

## Rendering Performance

### Reduce Draw Calls

- Combine meshes that share materials
- Use texture atlases for multiple images
- Batch similar objects
- Use instancing for repeated objects

### Shader Complexity

- Avoid complex math in fragment shaders
- Minimize texture samples
- Use mobile-optimized shaders
- Avoid `gl_FrontFacing` ("Is Front Facing" node) - has significant overhead
- Avoid integer math/division in shaders - use `floor()` and `mod()` with floats instead
- Avoid "Simple PBR" for everything - use minimal materials with only required features
- Shaders with `discard` statements disable depth prepass - render front-to-back to avoid overdraw
- Test on low-end devices

### Overdraw

- Minimize transparent objects
- Use opaque materials when possible
- Order transparent objects front-to-back
- Use alpha cutout instead of alpha blend when appropriate

## Physics Performance

```typescript
// Reduce physics updates
// Use simple colliders (box, sphere) over mesh colliders
// Disable physics on static objects
// Limit active rigid bodies (< 20 recommended)
```

## Audio Performance

- Use WAV files instead of MP3s (WAV decoding consumes ~2x less power)
- Limit simultaneous audio sources (< 8)
- Use AudioComponent pooling for sound effects
- Stop audio when not audible

## Profiling

### In-Editor

- Use Lens Studio's built-in profiler
- Monitor frame time and memory
- Check draw call count

### On Device

- Test on target hardware
- Use device-specific profiling tools
- Test on low-end devices

## Common Bottlenecks

| Issue | Symptom | Solution |
|-------|---------|----------|
| Too many draw calls | Low FPS, high CPU | Batch/combine meshes |
| Large textures | Memory warnings | Reduce resolution |
| Complex shaders | Low FPS, hot device | Simplify materials |
| Script allocations | Stuttering | Pool objects, cache refs |
| Too many objects | Slow scene load | Use prefabs, LOD |

## Target Metrics

| Metric | Target |
|--------|--------|
| Frame rate | 60 FPS (consider lower for static content) |
| Frame time | < 16.6ms |
| Draw calls | < 100 |
| Triangles | < 100,000 |
| Textures | < 50 MB total |
| Script time | < 2ms/frame |

**Frame Rate Considerations:**
- For static scenes or slow animations, consider lower frame rates to reduce power consumption
- The system compositor can compensate well for lower frame rates on mostly-static content
- Reducing frame rate has a direct positive impact on thermals and battery life
