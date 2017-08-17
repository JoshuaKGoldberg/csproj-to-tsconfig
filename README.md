# csproj-to-tsconfig
[![Build Status](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig.svg?branch=master)](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig)
[![NPM version](https://badge.fury.io/js/csproj-to-tsconfig.svg)](http://badge.fury.io/js/csproj-to-tsconfig)


Converts .csproj files with TypeScript includes to their `tsconfig.json` equivalents.

It will read the `TypeScriptCompile` include strings from the source `.csproj` and put them into a destination `tsconfig.json` as `files`.

## Usage

`csproj-to-tsconfig` provides a CLI and an importable `Converter` clas.

*Both require Node >=7.6!*

### CLI

```cmd
npm install -g csproj-to-tsconfig
```

At a minimum, the CLI requires:
* `--csproj`: a file path to a `.csproj` file path to read `TypeScriptCompile` directives from
* `--target`: a file path to where to output the generated `tsconfig.json`-like file

Converting `./framework.csproj` to `./tsconfig.json` *(merging onto any existing `./tsconfig.json`)*:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json
```

You can also specify a `--template` file path to a separate `tsconfig.json`-like file to serve as a template for the generated output file.

Converting `./framework.csproj` to `./tsconfig.json` with `tsconfig.base.json` as a template for settings:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --template ../tsconfig.base.json
```

Add `--timestamp` to include a timestamp comment at the top of generated files.

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --timestamp
```

Since many MSBuild files use `@(Items)` and `$(Properties)` to dynamically generate paths, you can provide any number of key-value `--replacement` pairs to replace them.
* `@(ItemKey)=value` works on ItemGroup values
* `$(PropertyKey)=value` works on PropertyGroup values
* `GeneralKey=value` will be applied to all files after MSBuild pre-processing

Converting `./framework.csproj` to `./tsconfig.json` and replacing `$(OutputDirectory)` with `../lib`:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --replacement $(OutputDirectory)=../lib
```

Lastly, to support projects that use a large file consisting of `///` references to enable direct-to-source Intellisense across projects (instead of `.d.ts` files), you may provide a `--references` file path to a file that will contain a plain list of `///` references to the source files.
It will respect the same replacements as tsconfig generation logic.

```
csproj-to-tsconfig --csproj ./framework.csproj --references ./_AllReferences.ts
```

You may provide one or both of `--references` and `--target`.
At least one is required.

#### All Options

<table>
    <thead>
        <tr>
            <td>Option</td>
            <td>Type</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>csproj</code></th>
            <td><code>string</code></td>
            <td>File path to the source .csproj file.</td>
        </tr>
        <tr>
            <th><code>references</code></th>
            <td><code>string</code></td>
            <td>File path to the target references file <em>(optional if <code>target</code> is provided)</em>.</td>
        </tr>
        <tr>
            <th><code>replacements</code></th>
            <td><code>string[]</code></td>
            <td>MSBuild values to replace in raw source file paths, as <code>key=value</code> <em>(optional)</em>.</td>
        </tr>
        <tr>
            <th><code>target</code></th>
            <td><code>string</code></td>
            <td>File path to the target tsconfig.json file <em>(optional if <code>references</code> is provided)</em>.</td>
        </tr>
        <tr>
            <th><code>template</code></th>
            <td><code>string</code></td>
            <td>File path to the template tsconfig.json file <em>(optional; by default, <code>target</code>)</em>.</td>
        </tr>
        <tr>
            <th><code>timestamp</code></th>
            <td><code>boolean</code></td>
            <td>Whether to add a timestamp comment at the top of generated files <em>(optional; by default, <code>false</code>)</em>.</td>
        </tr>
    </tbody>
</table>

### `Converter`

`npm install --save csproj-to-tsconfig`

The importable `Converter` class behaves a little differently from the CLI.
It has a single `async` method `convert` that takes in a `csproj` path for an input project with `targetReferences` and/or `targetTsconfig` output descriptors.

```javascript
import { Converter } from "csproj-to-tsconfig";

// Use with the following code samples
const converter = new Converter();
```

#### `targetTsconfig`

Equivalent to the `--target` CLI flag.

```javascript
await converter.convert({
    csproj: "path/to/project.csproj",
    targetTsconfig: {
        fileName: "path/to/tsconfig.json",
        overrides: {
            noResolve: true
        },
        templateTsconfig: "path/to/tsconfig.template.json",
    }
});
```

<table>
    <thead>
        <tr>
            <td>Option</td>
            <td>Type</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>fileName</code></th>
            <td><code>string</code></td>
            <td>File path to the target references file.</td>
        </tr>
        <tr>
            <th><code>includeTimestamp</code></th>
            <td><code>boolean</code></td>
            <td>Whether to add a timestamp comment at the top of generated files <em>(optional; by default, <code>false</code>)</em>.</td>
        </tr>
        <tr>
            <th><code>locale</code></th>
            <td><code>string</code></td>
            <td>A value to override the default system `Date` formatting locale <em>(optional)</em>.</td>
        </tr>
        <tr>
            <th><code>overrides</code></th>
            <td><code>object</code></td>
            <td>Custom settings to override the template tsconfig file with <em>(optional)</em>.</td>
        </tr>
    </tbody>
</table>

#### `targetReferences`

Equivalent to the `--references` CLI flag.

```javascript
await converter.convert({
    csproj: "path/to/project.csproj",
    targetReferences: {
        fileName: "path/to/_AllReferences.ts",
        includeTimestamp: true,
        locale: "en-GB"
    }
});
```

<table>
    <thead>
        <tr>
            <td>Option</td>
            <td>Type</td>
            <td>Description</td>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th><code>fileName</code></th>
            <td><code>string</code></td>
            <td>File path to the target references file.</td>
        </tr>
        <tr>
            <th><code>includeTimestamp</code></th>
            <td><code>boolean</code></td>
            <td>Whether to add a timestamp comment at the top of generated files <em>(optional; by default, <code>false</code>)</em>.</td>
        </tr>
        <tr>
            <th><code>locale</code></th>
            <td><code>string</code></td>
            <td>A value to override the default system `Date` formatting locale <em>(optional)</em>.</td>
        </tr>
    </tbody>
</table>

#### `.references`

Unlike the CLI, `targetTsconfig` and `targetReferences` each take in their own `replacements` objects.
The `replacements` objects are taken in as mapping functions to transform file, ItemGroup, and PropertyGroup names, instead of direct key/value pairs.

```javascript
await converter.convert({
    csproj: "path/to/project.csproj",
    targetTsconfig: {
        fileName: "path/to/tsconfig.json",
        replacements: {
            properties: (propertyName) => {
                if (propertyName === "MyProperty") {
                    return "Replaced";
                }

                return propertyName;
            },
        },
        templateTsconfig: "path/to/tsconfig.template.json",
    }
});
```

A `generateKeyValueReplacements` function is provided that can create a set of replacers for CLI-like inputs.

```javascript
import { generateKeyValueReplacements } from "csproj-to-tsconfig";

const replacements = generateKeyValueReplacements([
    "foo=bar",
    "@(baz)=qux",
    "$(quux)=corge"
])
```

See `lib/converter.d.ts` in the package for a full description of the API options.


## Development

Set the project up locally to be run via Gulp:

```cmd
npm install -g gulp
npm install
gulp
```
