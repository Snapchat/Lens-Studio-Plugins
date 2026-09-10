import { CoreService, Descriptor } from "LensStudio:CoreService";
import {
  LensStudioOutputFileStore,
  LensStudioStateRepository,
} from "../persistence/lensStudioStores.js";
import {
  SpecsAssetJobCoordinator,
  type CoordinatorSummary,
} from "./specsAssetJobCoordinator.js";
import { SpecsAssetRemoteAdapter } from "./specsAssetRemoteAdapter.js";

let activeService: SpecsAssetJobService | null = null;

export function getSpecsAssetJobService(): SpecsAssetJobService {
  if (activeService === null) {
    throw new Error("SPECS Asset Jobs service is not running for an open Lens project");
  }
  return activeService;
}

export class SpecsAssetJobService extends CoreService {
  private readonly connections: Editor.ScopedConnection[] = [];
  private readonly remote = new SpecsAssetRemoteAdapter();
  private coordinator: SpecsAssetJobCoordinator | null = null;
  private bindError: Error | null = null;
  private model: Editor.Model.IModel | null = null;

  static descriptor(): Descriptor {
    const descriptor = new Descriptor();
    descriptor.id = "com.snap.specs-asset-jobs.service";
    descriptor.name = "SPECS Asset Jobs Service";
    descriptor.description = "Owns project-scoped SPECS text-to-3D and image-to-3D job lifecycle.";
    descriptor.dependencies = [Editor.Model.IModel];
    return descriptor;
  }

  start(): void {
    activeService = this;
    this.model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
    this.connections.push(
      this.model.onProjectAboutToBeChanged.connect(() => this.unbindProject()),
      this.model.onProjectChanged.connect(() => this.bindProject()),
      this.model.onProjectLocationChanged.connect(() => this.bindProject()),
    );
    this.bindProject();
  }

  stop(): void {
    this.unbindProject();
    this.connections.forEach((connection) => connection.disconnect());
    this.connections.length = 0;
    this.model = null;
    if (activeService === this) activeService = null;
  }

  submit(input: unknown): Promise<CoordinatorSummary> {
    return this.requireCoordinator().submit(input);
  }

  barrier(): Promise<CoordinatorSummary> {
    return this.requireCoordinator().barrier();
  }

  private bindProject(): void {
    this.unbindProject();
    try {
      if (this.model === null) return;
      const project = this.model.project;
      if (Editor.isNull(project) || Editor.isNull(project.projectFile)) return;
      this.coordinator = new SpecsAssetJobCoordinator(
        new LensStudioStateRepository(project.projectFile),
        this.remote,
        new LensStudioOutputFileStore(project.assetManager.assetsDirectory),
        { nowMs: () => Date.now() },
      );
    } catch (error) {
      this.bindError = error instanceof Error ? error : new Error(String(error));
      console.error(
        "[SpecsAssetJobs] Failed to bind project:",
        this.bindError.message,
        console.None,
      );
    }
  }

  private unbindProject(): void {
    this.coordinator?.invalidate();
    this.coordinator = null;
    this.bindError = null;
    this.remote.dispose();
  }

  private requireCoordinator(): SpecsAssetJobCoordinator {
    if (this.bindError !== null) throw this.bindError;
    if (this.coordinator === null) {
      throw new Error("No Lens project is bound to the SPECS Asset Jobs service");
    }
    return this.coordinator;
  }
}
