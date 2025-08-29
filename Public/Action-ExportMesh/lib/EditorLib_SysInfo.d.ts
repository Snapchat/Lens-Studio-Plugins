/**
 * Provides information about the system running Lens Studio.
 */
declare module "LensStudio:SysInfo" {
    /** Operating System */
    var productType: "osx" | "windows" | (string & {})
}
