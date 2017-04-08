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

Converting `./framework.csproj` to `./tsconfig.json` with the default settings:
*(this will override any existing `./tsconfig.json` while respecting its initial settings)*

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json

```

Converting `./framework.csproj` to `./tsconfig.json` using a `tsconfig.base.json` as a base for settings:

```
csproj-to-tsconfig --csproj ./framework.csproj --target ./tsconfig.json --template ../tsconfig.base.json
```


## Development

Set the project up locally to be run via Gulp:

```cmd
npm install -g gulp
npm install
gulp
```
