## webgl-quake

![webgl-quake in action](https://raw.githubusercontent.com/erlandranvinge/webgl-quake/master/screenshots/1.png)

A quake engine renderer built ground-up in javascript. Relying on browserify and gulp for dependency-mgmt and packaging. 

###Demo
I use GitHub pages to host a demo of the current progress. The test application will download the shareware version of quake automatically into your browser and unpack its data files in order to play the game. Use the link below to experience Quake in your browser:

[Quake WebGL demo](http://erlandranvinge.github.io/webgl-quake/)

Tested in FF, Chrome, Safari, Mobile Safari.

### Getting started with the code
1. Make sure you have node/npm readily available. 
2. Clone the repository.  
3. Place the PAK data files (e.g. PAK0.pak or similar depending on quake version)  in the data folder.  
4. Start the game using node/gulp with the commands listed below:  

```
npm install
node ./node_modules/gulp/bin/gulp.js
```
The game is now running on http://localhost:8080.
