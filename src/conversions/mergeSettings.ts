/**
 * Deeply overrides a target object with a source.
 *
 * @type T   Type of the objects.
 * @param target   Target object to receive properties.
 * @param source   Donor object of properties.
 */
const override = <T>(target: T, source: T): void => {
    for (const i in source) {
        if (!target[i]) {
            target[i] = source[i];
            continue;
        }

        const setting = source[i];
        if (typeof setting === "object") { // tslint:disable-line:strict-type-predicates
            override(target[i], setting);
        } else {
            target[i] = setting;
        }
    }
};

/**
 * Merges a source settings object onto a target.
 *
 * @type T   Type of the settings.
 * @param target   Target settings to receive properties.
 * @param source   Donor settings.
 * @returns Deeply merged settings.
 */
export const mergeSettings = <T>(target: Partial<T>, source: Partial<T>): T => {
    const output: Partial<T> = {};

    override(output, target);
    override(output, source);

    return output as T;
};
