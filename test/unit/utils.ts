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

export const stubTemplateContents = () => `{
    "compilerOptions": {}
}`;
