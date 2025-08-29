import * as App from "LensStudio:App";
import {
    compareWith, compositeOrder, LocaleCompareAsc, nullsFirst, NumberAsc, Ord, orderBy, reverse,
} from "./order.js";

export class StudioVersion {
    constructor(versionString) {
        const items = versionString.split(/\D/, 4);
        this.major = parseInt(items[0]);
        this.minor = parseInt(items[1]);
        this.patch = parseInt(items[2]);
        this.build = items[3];
    }

    compareTo(other) {
        return compareWith(this, other, StudioVersion.Comparator);
    }

    toString() {
        return `${this.major}.${this.minor}.${this.patch}.${this.build}`;
    }
}

StudioVersion.tryParse = function (versionString) {
    const result = new StudioVersion(versionString);
    const items = versionString.split(/\D/, 4);
    if (isNaN(result.major))
        throw new TypeError(`Major version was not a number: "${items[0]}"`);
    if (isNaN(result.minor))
        throw new TypeError(`Minor version was not a number: "${items[1]}"`);
    if (isNaN(result.patch))
        throw new TypeError(`Patch version was not a number: "${items[2]}"`);
    return result;
};

StudioVersion.Comparator = compositeOrder(
    orderBy(v => v.major, NumberAsc),
    orderBy(v => v.minor, NumberAsc),
    orderBy(v => v.patch, NumberAsc),
    orderBy(v => v.build, nullsFirst(LocaleCompareAsc)),
);
export const appVersion = new StudioVersion(App.version);

/**
 * @template T
 * @param {T[]} list
 * @param {(entry: T) => StudioVersion} getKey
 * @returns {T | undefined} - item with the highest version not greater than the running studio version
 */
export function findBestMatchingStudioVersion(list, getKey) {
    return list
        .filter(entry => getKey(entry).compareTo(appVersion) != Ord.Gt) // find supported
        .sort(orderBy(getKey, reverse(StudioVersion.Comparator))) // order by descending version
        [0]; // take first, so it's the highest version not greater than the running studio version
}
