# csproj-to-tsconfig
[![Build Status](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig.svg?branch=master)](https://travis-ci.org/JoshuaKGoldberg/csproj-to-tsconfig)
[![NPM version](https://badge.fury.io/js/csproj-to-tsconfig.svg)](http://badge.fury.io/js/csproj-to-tsconfig)


Converts .csproj files with TypeScript includes to their `tsconfig.json` equivalents.

It will read the `TypeScriptCompile` include strings from the source `.csproj` and put them into a destination `tsconfig.json` as `files`.

## Usage

*Requires Node 7.6!*

```cmd
npm install -g csproj-to-tsconfig
```

Converting `./framework.csproj` to `./tsconfig.json`:

*(this will override any existing `./tsconfig.json` while respecting its initial settings)*

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json
```

Converting `./framework.csproj` to `./tsconfig.json` using a `tsconfig.base.json` as a base for settings:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --template ../tsconfig.base.json
```

Converting `./framework.csproj` to `./tsconfig.json` and replacing `$(OutputDirectory)` with `../lib`:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --replacement OutputDirectory=../lib
```

### Options

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
            <td><string>string</string></td>
            <td>File path to the source .csproj file.</td>
        </tr>
        <tr>
            <th><code>replacements</code></th>
            <td><string>string[]</string></td>
            <td>MSBuild values to replace in raw source file paths, as<code>key=value</code> <em>(optional)</em>.</td>
        </tr>
        <tr>
            <th><code>target</code></th>
            <td><string>string</string></td>
            <td>File path to the target tsconfig.json file.</td>
        </tr>
        <tr>
            <th><code>template</code></th>
            <td><string>string</string></td>
            <td>File path to the template tsconfig.json file <em>(optional; by default, <code>target</code>)</em>.</td>
        </tr>
    </tbody>
</table>


## Development

Set the project up locally to be run via Gulp:

```cmd
npm install -g gulp
npm install
gulp
```
