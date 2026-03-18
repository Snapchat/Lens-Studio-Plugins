import * as ChatTools from 'LensStudio:ChatTool';
import * as FileSystem from 'LensStudio:FileSystem';
import schemaJson from './updateDeprecatedAPI.json';

interface GroupedData {
  _metadata: {
    total_entries: number;
    lensstudioapiversion: string;
    categories: string[];
  };
  categories: Record<string, CategoryData>;
}

interface CategoryData {
  title: string;
  description: string;
  items: Record<string, string>;
}

interface ExamplePair {
  before: string;
  after: string;
}

interface SearchMatch {
  api: string;
  replacement: string;
  tag: string;
  category: string;
  categoryTitle: string;
  examples?: ExamplePair;
}

interface ExecuteParameters {
  data?: {
    apiName?: string;
    category?: string;
    includeExamples?: boolean;
    searchMode?: 'exact' | 'partial' | 'category';
  };
}

type SearchMode = 'exact' | 'partial' | 'category';
type TagType = 'Deprecated' | 'Replaced' | 'Unknown';

/**
 * Chat Tool for identifying deprecated Lens Studio APIs and providing replacements
 */
export class UpdateDeprecatedAPI extends ChatTools.ChatTool {
  private readonly DEBUG = false; // Set to true for verbose logging
  private replacementsGroupedData: GroupedData | null = null;
  private apiToCategoryCache: Map<string, string> = new Map();

  static descriptor() {
    return {
      id: schemaJson.name,
      name: schemaJson.displayName,
      description: schemaJson.modelDescription,
      schema: schemaJson,
    };
  }

  /**
   * Conditional logging based on DEBUG flag
   */
  private log(...args: any[]): void {
    if (this.DEBUG) {
      console.log('[UpdateDeprecatedAPI]', ...args);
    }
  }

  /**
   * Build category lookup cache for O(1) API-to-category mapping
   */
  private buildCategoryCache(): void {
    if (!this.replacementsGroupedData?.categories) return;

    this.apiToCategoryCache.clear();
    for (const [catId, category] of Object.entries(this.replacementsGroupedData.categories)) {
      if (category.items) {
        for (const apiName of Object.keys(category.items)) {
          this.apiToCategoryCache.set(apiName, catId);
        }
      }
    }
    this.log(`Built category cache with ${this.apiToCategoryCache.size} entries`);
  }

  /**
   * Load replacement data from JSON file (lazy loading)
   * Uses the same pattern as ChatTools-ApiDefinition reference implementation
   */
  private loadReplacementData(): boolean {
    if (this.replacementsGroupedData) {
      return true; // Already loaded
    }

    try {
      this.log('Starting data load...');

      // Use import.meta.resolve() to get absolute path
      const groupedJsonPathString = import.meta.resolve('./replacements_grouped.json');
      this.log('Resolved path:', groupedJsonPathString);

      // Create Editor.Path object (required by FileSystem API)
      const groupedJsonPath = new Editor.Path(groupedJsonPathString);
      this.log('Created Path object');

      // Load grouped replacements
      if (FileSystem.exists(groupedJsonPath)) {
        this.log('Data file exists, reading...');
        const fileContent = FileSystem.readFile(groupedJsonPath);
        this.replacementsGroupedData = JSON.parse(fileContent);
        this.log('Successfully loaded replacements_grouped.json');

        // Build category cache for fast O(1) lookups
        this.buildCategoryCache();

        return true;
      } else {
        console.error('[UpdateDeprecatedAPI] Data file not found at:', groupedJsonPathString);
        return false;
      }
    } catch (error) {
      console.error('[UpdateDeprecatedAPI] Failed to load data:', error);
      console.error('[UpdateDeprecatedAPI] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      return false;
    }
  }

  async execute(parameters: ExecuteParameters) {
    const result = new ChatTools.Result();

    try {
      // Load data on first use
      if (!this.loadReplacementData()) {
        result.error = 'Failed to load replacement data. Ensure replacements_grouped.json is present in plugin directory.';
        return result;
      }

      // Extract parameters with defaults
      const { apiName, category, includeExamples = true, searchMode = 'partial' } = parameters?.data || {};

      // Validate required parameter
      if (!apiName?.trim()) {
        result.error = 'Parameter "apiName" is required and must be non-empty. Example: { apiName: "Animation" }';
        return result;
      }

      // Validate searchMode
      const validSearchModes: SearchMode[] = ['exact', 'partial', 'category'];
      if (searchMode && !validSearchModes.includes(searchMode)) {
        result.error = `Invalid searchMode "${searchMode}". Must be one of: ${validSearchModes.join(', ')}`;
        return result;
      }

      // Validate category if provided
      if (category && this.replacementsGroupedData?.categories && !this.replacementsGroupedData.categories[category]) {
        const validCategories = Object.keys(this.replacementsGroupedData.categories);
        result.error = `Invalid category "${category}". Must be one of: ${validCategories.join(', ')}`;
        return result;
      }

      // Perform search
      const searchResults = this.performSearch(apiName.trim(), searchMode, category, includeExamples);

      // Handle no results
      if (!searchResults.length) {
        result.data = {
          found: false,
          message: `No deprecated API found matching "${apiName}"${category ? ` in category "${category}"` : ''}.`,
          suggestion: 'Try a different search term or use partial matching.',
          totalDeprecatedAPIs: this.getTotalCount()
        };
        return result;
      }

      // Build successful response
      result.data = {
        found: true,
        query: apiName,
        searchMode,
        ...(category && { category }),
        matches: searchResults,
        totalMatches: searchResults.length,
        message: searchResults.length === 1
          ? `Found replacement for "${searchResults[0].api}"`
          : `Found ${searchResults.length} deprecated APIs matching "${apiName}"`,
        metadata: {
          totalDeprecatedAPIs: this.getTotalCount(),
          dataVersion: this.replacementsGroupedData?._metadata.lensstudioapiversion || '1.0'
        }
      };

      return result;
    } catch (error) {
      result.error = `Execution failed: ${error instanceof Error ? error.message : String(error)}`;
      return result;
    }
  }

  /**
   * Unified search dispatcher
   */
  private performSearch(apiName: string, mode: SearchMode, categoryFilter?: string, includeExamples: boolean = true): SearchMatch[] {
    if (mode === 'category' && categoryFilter) {
      return this.searchByCategory(categoryFilter, includeExamples);
    }
    if (mode === 'exact') {
      return this.searchExact(apiName, includeExamples);
    }
    return this.searchPartial(apiName, categoryFilter, includeExamples);
  }

  /**
   * Search for exact API name match using category cache for O(1) lookup
   */
  private searchExact(apiName: string, includeExamples: boolean): SearchMatch[] {
    if (!this.replacementsGroupedData?.categories) return [];

    // Use cache to find category (O(1) lookup)
    const categoryId = this.findCategory(apiName);
    if (categoryId === 'unknown') return [];

    const category = this.replacementsGroupedData.categories[categoryId];
    const replacement = category?.items?.[apiName];

    if (!replacement) return [];

    const match: SearchMatch = {
      api: apiName,
      replacement,
      tag: this.extractTag(replacement),
      category: categoryId,
      categoryTitle: category.title
    };

    if (includeExamples) {
      const examples = this.generateExamples(apiName, replacement);
      if (examples) {
        match.examples = examples;
      }
    }

    return [match];
  }

  /**
   * Search for partial API name match (case-insensitive)
   */
  private searchPartial(apiName: string, categoryFilter?: string, includeExamples: boolean = true): SearchMatch[] {
    if (!this.replacementsGroupedData?.categories) return [];

    const matches: SearchMatch[] = [];
    const searchLower = apiName.toLowerCase();
    const categories = categoryFilter
      ? [categoryFilter]
      : Object.keys(this.replacementsGroupedData.categories);

    for (const catId of categories) {
      const category = this.replacementsGroupedData.categories[catId];
      if (!category?.items) continue;

      for (const [api, replacement] of Object.entries(category.items)) {
        if (api.toLowerCase().includes(searchLower)) {
          const match: SearchMatch = {
            api,
            replacement,
            tag: this.extractTag(replacement),
            category: catId,
            categoryTitle: category.title
          };

          if (includeExamples) {
            const examples = this.generateExamples(api, replacement);
            if (examples) {
              match.examples = examples;
            }
          }

          matches.push(match);
        }
      }
    }

    // Sort: exact matches first, then by API name length
    return matches.sort((a, b) => {
      const aExact = a.api.toLowerCase() === searchLower;
      const bExact = b.api.toLowerCase() === searchLower;
      if (aExact !== bExact) return aExact ? -1 : 1;
      return a.api.length - b.api.length;
    });
  }

  /**
   * Get all APIs in a category
   */
  private searchByCategory(categoryId: string, includeExamples: boolean = true): SearchMatch[] {
    const category = this.replacementsGroupedData?.categories?.[categoryId];
    if (!category?.items) return [];

    return Object.entries(category.items).map(([api, replacement]) => {
      const match: SearchMatch = {
        api,
        replacement,
        tag: this.extractTag(replacement),
        category: categoryId,
        categoryTitle: category.title
      };

      if (includeExamples) {
        const examples = this.generateExamples(api, replacement);
        if (examples) {
          match.examples = examples;
        }
      }

      return match;
    });
  }

  /**
   * Extract status tag from replacement string
   */
  private extractTag(replacement: string): TagType {
    if (replacement.startsWith('[Deprecated]')) return 'Deprecated';
    if (replacement.startsWith('[Replaced]')) return 'Replaced';
    return 'Unknown';
  }

  /**
   * Find which category an API belongs to (uses cache for O(1) lookup)
   */
  private findCategory(apiName: string): string {
    return this.apiToCategoryCache.get(apiName) || 'unknown';
  }

  /**
   * Get human-readable category title
   */
  private getCategoryTitle(categoryId: string): string {
    return this.replacementsGroupedData?.categories?.[categoryId]?.title || categoryId;
  }

  /**
   * Generate context-aware code migration examples
   * Based on documented migration patterns from EXAMPLES.md
   */
  private generateExamples(apiName: string, replacement: string): ExamplePair | null {
    const lowerApi = apiName.toLowerCase();

    // Pattern 1: AnimationMixer → AnimationPlayer
    if (lowerApi.includes('animationmixer') || lowerApi.includes('animation.') || lowerApi === 'animation') {
      if (replacement.includes('AnimationPlayer')) {
        return {
          before: `// Deprecated\n// @input Component.AnimationMixer animationMixer\nvar mixer = script.animationMixer;\nmixer.start("walk", 0, -1);\nmixer.speedRatio = 1.5;`,
          after: `// Modern\n// @input Component.AnimationPlayer animationPlayer\nvar player = script.animationPlayer;\nplayer.start("walk");\nplayer.playbackSpeed = 1.5;\n\n// Key Changes:\n// 1. AnimationMixer → AnimationPlayer\n// 2. start(name, offset, cycles) → start(name)\n// 3. speedRatio → playbackSpeed`
        };
      }
    }

    // Pattern 2: Expression Weights (getExpressionWeights, getExpressionNames, etc.)
    if (lowerApi.includes('getexpression') || lowerApi.includes('expressionweight')) {
      if (replacement.includes('onExpressionWeightsUpdate')) {
        return {
          before: `// Deprecated - Polling every frame\nfunction update() {\n    var expressions = getExpressionWeights();\n    var names = getExpressionNames();\n    // Process expressions...\n}`,
          after: `// Modern - Event-based\n// @input Asset.RenderMesh faceMesh\nvar weights = script.faceMesh.control.onExpressionWeightsUpdate.add(function(expWeights) {\n    // expWeights is a NamedValues object\n    var names = expWeights.names;      // Array of expression names\n    var values = expWeights.values;    // Array of weight values\n    print(names[0]);    // e.g., "EyeBlinkLeft"\n    print(values[0]);   // Strength value\n});\n\n// Benefits:\n// ✅ Event-driven (more efficient)\n// ✅ No polling overhead\n// ✅ Structured data (NamedValues)`
        };
      }
    }

    // Pattern 3: Component Access Methods
    if (lowerApi === 'getallcomponents' || lowerApi === 'getfirstcomponent' ||
        lowerApi === 'getcomponentcount' || lowerApi === 'getcomponentbyindex') {
      return {
        before: `// Deprecated\nvar components = sceneObject.getAllComponents();\nvar first = sceneObject.getFirstComponent("Component.Camera");\nvar count = sceneObject.getComponentCount("Component.Camera");\nvar byIndex = sceneObject.getComponentByIndex("Component.Camera", 0);`,
        after: `// Modern\n// Get all components of type\nvar components = sceneObject.getComponents("Component.Camera");\n\n// Get first component\nvar first = sceneObject.getComponent("Component.Camera");\n\n// Get count\nvar count = sceneObject.getComponents("Component.Camera").length;\n\n// Get by index\nvar byIndex = sceneObject.getComponents("Component.Camera")[0];\n\n// Key Changes:\n// getAllComponents() → getComponents(type)\n// getFirstComponent(type) → getComponent(type)\n// getComponentCount(type) → getComponents(type).length\n// getComponentByIndex(type, idx) → getComponents(type)[idx]`
      };
    }

    // Pattern 4: Label → MaterialMeshVisual
    if (lowerApi === 'label' || lowerApi.includes('label.')) {
      if (replacement.includes('MaterialMeshVisual')) {
        return {
          before: `// Deprecated\n// @input Component.Label label\nvar label = script.label;\nlabel.text = "Hello";\nlabel.textColor = new vec4(1, 0, 0, 1);`,
          after: `// Modern\n// Use MaterialMeshVisual with Text component\n// @input Component.Text text\nvar text = script.text;\ntext.text = "Hello";\ntext.textFill.color = new vec4(1, 0, 0, 1);`
        };
      }
    }

    // Pattern 5: BlendShapes component → RenderMeshVisual.blendShapesEnabled
    if (lowerApi === 'blendshapes' || lowerApi.includes('blendshape')) {
      if (replacement.includes('RenderMeshVisual') || replacement.includes('blendShapesEnabled')) {
        return {
          before: `// Deprecated\n// @input Component.BlendShapes blendShapes\nvar blendShapes = script.blendShapes;\nblendShapes.getBlendShape("smile");`,
          after: `// Modern\n// @input Component.RenderMeshVisual renderMeshVisual\nvar renderMesh = script.renderMeshVisual;\nrenderMesh.blendShapesEnabled = true;\n// Access blend shapes through RenderMeshVisual API`
        };
      }
    }

    // Pattern 6: Landmarks (getLandmark → Head.onLandmarksUpdate)
    if (lowerApi.includes('landmark')) {
      if (replacement.includes('onLandmarksUpdate')) {
        return {
          before: `// Deprecated - Polling\nfunction update() {\n    var landmark = getLandmark(index);\n}`,
          after: `// Modern - Event-based\n// @input Component.Head head\nscript.head.onLandmarksUpdate.add(function(landmarks) {\n    // landmarks contains updated positions\n    print(landmarks);\n});`
        };
      }
    }

    // Pattern 7: getFacesCount → Two approaches based on use case
    if (lowerApi === 'getfacescount') {
      return {
        before: `// Deprecated\nif (getFacesCount() > 0) {\n    // Face detected\n}`,
        after: `// SIMPLE: Just checking if face exists (most common)\n// @input Component.Head head\nif (script.head.isEnabledInHierarchy) {\n    // Face detected\n}\n\n// ADVANCED: Need actual count for multiple faces\n// @input SceneObject rootObject\n\nfunction getFacesCount(parentObject) {\n    return getComponentsRecursive(parentObject, "Component.Head")\n        .filter(head => head.isEnabledInHierarchy)\n        .length;\n}\n\nfunction getComponentsRecursive(object, componentType, results) {\n    results = results || [];\n    var components = object.getComponents(componentType);\n    for (var i=0; i<components.length; i++) {\n        results.push(components[i]);\n    }\n    var childCount = object.getChildrenCount();\n    for (var j=0; j<childCount; j++) {\n        getComponentsRecursive(object.getChild(j), componentType, results);\n    }\n    return results;\n}\n\n// Usage in update event:\nscript.createEvent("UpdateEvent").bind(function() {\n    var faceCount = getFacesCount(script.rootObject);\n    script.trackingMult = faceCount < 2 ? TrackingMult.ONE_FACE : TrackingMult.TWO_FACES;\n});`
      };
    }

    // Pattern 8: VoiceML (entire module removed)
    if (lowerApi.includes('voiceml')) {
      return {
        before: `// Deprecated - VoiceML module removed\nvar voiceML = script.voiceML;\nvoiceML.startListening();`,
        after: `// VoiceML module has been removed\n// No direct replacement available\n// Consider alternative voice recognition services`
      };
    }

    // Pattern 9: Sprite classes (removed)
    if (lowerApi.includes('sprite') || lowerApi === 'texturestretchmode') {
      return {
        before: `// Deprecated - Sprite classes removed\nvar sprite = script.spriteVisual;`,
        after: `// Sprite classes have been removed\n// Use Image component with MaterialMeshVisual instead`
      };
    }

    // Pattern 10: TextureStretchMode enum
    if (lowerApi === 'texturestretchmode') {
      return {
        before: `// Deprecated enum\nimage.stretchMode = TextureStretchMode.Fit;`,
        after: `// Use Image.StretchMode instead\nimage.stretchMode = Image.StretchMode.Fit;`
      };
    }

    // Pattern 11: BlendMode enum values
    if (lowerApi.includes('blendmode') && (lowerApi.includes('legacy') || lowerApi.includes('multiply') || lowerApi.includes('add'))) {
      return {
        before: `// Deprecated enum values\nmaterial.blendMode = BlendMode.MultiplyLegacy;\nmaterial.blendMode = BlendMode.AddLegacy;`,
        after: `// Use modern blend modes\nmaterial.blendMode = BlendMode.Multiply;\nmaterial.blendMode = BlendMode.Add;`
      };
    }

    // Generic fallbacks based on replacement patterns

    // Generic: Animation system
    if (replacement.includes('AnimationPlayer') && !lowerApi.includes('mixer')) {
      return {
        before: `// Deprecated\nvar mixer = script.animationMixer;\nmixer.start("${apiName}", 0, -1);`,
        after: `// Modern\nvar player = script.animationPlayer;\nplayer.start("animation_name");`
      };
    }

    // Generic: Face tracking
    if (replacement.includes('FaceTracking') || replacement.includes('FaceRenderObjectProvider')) {
      return {
        before: `// Deprecated\nvar result = ${apiName}();`,
        after: `// Modern\n// @input Component.FaceTracking faceTracking\nif (script.faceTracking.faceFound) {\n    print("Face detected");\n}`
      };
    }

    // Generic: Scene object methods
    if (replacement.includes('getComponent') || replacement.includes('SceneObject')) {
      return {
        before: `// Deprecated\nvar comp = obj.${apiName}(type);`,
        after: `// Modern\nvar comp = obj.getComponent(type);`
      };
    }

    // Generic: UI/Material components
    if (replacement.includes('MaterialMeshVisual') || replacement.includes('Image')) {
      return {
        before: `// Deprecated\nvar component = obj.getComponent("${apiName}");`,
        after: `// Modern\nvar visual = obj.getComponent("Component.MaterialMeshVisual");`
      };
    }

    return null;
  }

  /**
   * Get total count of tracked deprecated APIs
   */
  private getTotalCount(): number {
    return this.replacementsGroupedData?._metadata.total_entries || 0;
  }
}
