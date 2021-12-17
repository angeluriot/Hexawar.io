# [Hexawar.io](https://hexawar.io)

![Release](https://img.shields.io/badge/Release-v1.0-blueviolet)
![Language](https://img.shields.io/badge/Language-JavaScript-ffcc14)
![Frameworks](https://img.shields.io/badge/Frameworks-NodeJS_Socket.io-00cf2c)
![Size](https://img.shields.io/badge/Size-2Mo-f12222)
![Open Source](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)

This repository contains the source code of a multiplayer browser game of land capture.

The game is online on [**Hexawar.io**](https://hexawar.io).

<br/>

<p align="center">
	<img src="https://www.angeluriot.com/storage/shapes/hexawar_logo.svg" width="500">
</p>

<br/>

# Summary

* **[Summary](#summary)**
* **[How to play?](#how-to-play)**
* **[Install](#install)**
	* [Dependecies](#dependecies)
	* [Setup](#setup)
* **[Credits](#credits)**

<br/>

# How to play?

...

<br/>

# Install

## 1/ Dependecies

* **[NodeJS](https://nodejs.org/en/)**
* **[npm](https://www.npmjs.com)**
* **[MongoDB](https://www.npmjs.com)**

**Windows :**

* NodeJS and npm : **[install here](https://nodejs.org/en/download/)**.
* MongoDB : **[install here](https://www.mongodb.com/try/download/community)**.

**Unix :**
```shell
$ sudo apt install nodejs
$ sudo apt install npm
$ sudo apt install mongodb
```

## 2/ Setup

* Add a file named `.env` in the root of the project whith `TOKEN_SECRET=<random long string>` in it

* Install the dependencies with `npm install`

* Compile typescript files with `tsc` *(or `tsc -w` for real time compilation)*

## 3/ Run

**Default :**

```shell
$ npm run start
```

**Dev :**

```shell
$ npm run dev
```

**Server :**

```shell
$ npm install forever
$ npm run fstart
```
(Stop the server with : `npm run fstop`).

<br/>

# Credits

* [**Angel Uriot**](https://github.com/angeluriot) : Co-creator of the project.
* [**Arthur Azambre**](https://github.com/arthurazambre) : Co-creator of the project.
* [**Gaétan Renard**](https://github.com/G-rnd) : Co-creator of the project.
* [**Pierre Surer**](https://github.com/PignoulMarcel) : Co-creator of the project.
* [**Thomas Mostowfi**](https://github.com/nuuye) : Co-creator of the project.
