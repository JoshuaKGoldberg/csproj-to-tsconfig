export interface ITimestampSettings {
    /**
     * Whether to include a timestamp before files.
     */
    includeTimestamp?: boolean;

    /**
     * Timestamp locale, if not en-US.
     */
    locale?: string;
}

export const createFriendlyTimestamp = (date: Date, settings: ITimestampSettings) => {
    const dateFormatted = date.toLocaleString(
        settings.locale === undefined
            ? "en-US"
            : settings.locale);

    return `Generated ${dateFormatted}`;
};
