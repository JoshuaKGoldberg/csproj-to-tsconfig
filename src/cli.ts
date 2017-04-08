import * as yargs from "yargs";

import { IRawConversionSettings, SettingsParser } from "./settingsParser";
import { StatusCode } from "./statusCode";
import { Runner } from "./runner";

const rawConversionSettings: IRawConversionSettings = yargs
    .usage(`Usage: $0 --csproj <csproj> --target <target>`)
    .command("csproj", "File path to the source .csproj file.")
    .command("replacement", "key=value MSBuild pairs to replace in raw source file paths.")
    .command("target", "File path to the target tsconfig.json file.")
    .command("template", "File path to the template tsconfig.json file, if not <target>.")
    .demandOption(["csproj", "target"])
    .argv;

const conversionSettings = new SettingsParser().parse(rawConversionSettings);

(async (): Promise<void> => {
    const runner = new Runner({
        onError: console.error.bind(console),
        onLog: console.log.bind(console)
    });

    try {
        process.exitCode = await runner.run(conversionSettings);
    } catch (error) {
        console.error(error.stack || error.message);
        process.exitCode = StatusCode.UnknownError;
    }
})();
