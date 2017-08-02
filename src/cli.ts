import * as yargs from "yargs";

import { Runner } from "./runner";
import { IRawConversionSettings, SettingsParser } from "./settingsParser";
import { StatusCode } from "./statusCode";

const rawConversionSettings: IRawConversionSettings = yargs
    .usage("Usage: $0 --csproj <csproj> --target <target>")
    .command("csproj", "File path to the source .csproj file.")
    .command("replacement", "key=value MSBuild pairs to replace in raw source file paths.")
    .command("target", "File path to the target tsconfig.json file.")
    .command("template", "File path to the template tsconfig.json file, if not <target>.")
    .demandOption(["csproj", "target"])
    .argv as {} as IRawConversionSettings;

const main = async (): Promise<number> => {
    const runner = new Runner({
        onError: console.error.bind(console),
        onLog: console.log.bind(console),
    });

    const conversionSettings = new SettingsParser().parse(rawConversionSettings);

    return await runner.run(conversionSettings);
};

main()
    .then((exitCode: StatusCode) => {
        process.exitCode = exitCode;
    })
    .catch((error) => {
        // tslint:disable-next-line:no-console
        console.error(error.stack || error.message);
        process.exitCode = StatusCode.UnknownError;
    });
