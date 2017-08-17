export const stubCsprojContents = (filePaths: string[]): string => {
    const includes = filePaths
        .map((filePath: string) => `<TypeScriptCompile Include="${filePath}" />`)
        .join("\n        ");

    return `
    <xml/?>
    <irrelevant />
    <PropertyGroup>
    </PropertyGroup>
    <ItemGroup>
        ${includes}
    </ItemGroup>
`;
};

export const stubDate = new Date(1234, 5, 6, 7, 8, 9); // tslint:disable-line no-magic-numbers

export const stubTime = stubDate.toLocaleString("en-US");

export const stubTemplateContents = () => `{
    "compilerOptions": {}
}`;
