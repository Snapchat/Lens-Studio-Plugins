/**
 * LensCore provides an environment where `import.meta` is available.
 * This declaration file is needed because it is not a standard part
 * of ES2019. It is included in the `dom` lib, which plugins don't use.
 */
interface ImportMeta {
    resolve(path: string): string
    url: string
}
