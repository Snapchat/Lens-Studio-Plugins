/**
 * Utils for custom sorting order.
 * @module
 */
export var Ord;
(function (Ord) {
    Ord[Ord["Gt"] = 1] = "Gt";
    Ord[Ord["Eq"] = 0] = "Eq";
    Ord[Ord["Lt"] = -1] = "Lt";
})(Ord || (Ord = {}));
export function reverse(comparator) {
    return (a, b) => -comparator(a, b);
}
export function orderBy(getValue, comparator) {
    return (a, b) => comparator(getValue(a), getValue(b));
}
export function compositeOrder(...byPriority) {
    return (a, b) => {
        for (const comparator of byPriority) {
            const order = comparator(a, b);
            if (order !== 0) {
                return order;
            }
        }
        return Ord.Eq;
    };
}
export function nullsFirst(comparator) {
    return (a, b) => {
        if (a == null) {
            return b == null ? Ord.Eq : Ord.Lt;
        }
        else if (b == null) {
            return Ord.Gt;
        }
        else {
            return comparator(a, b);
        }
    };
}
export function compareWith(a, b, comparator) {
    return Math.sign(comparator(a, b));
}
export const LocaleCompareAsc = (a, b) => a.localeCompare(b);
export const NumberAsc = (a, b) => a - b;
