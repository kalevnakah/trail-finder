var fs = require('file-system');
var files = fs.readdirSync('./trails/');
console.log(files);

function extractData(file) {
  var xhttp = new XMLHttpRequest();
  //define the new trail
  let trail = {};
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //parse the JSON
      var response = JSON.parse(xhttp.responseText);
      //Drill down to the trails properites
      var properties = response.features[0].properties;

      document.getElementById('container').innerHTML = properties;

      trail.title = properties.title;
      trail.distance = properties.distance;
      trail.total_time = properties.total_time;
      trail.average_speed = properties.average_speed;
      trail.notes = properties.notes;

      console.log(trail);
    }
  };
  xhttp.open('GET', file, true);
  xhttp.send();
  return trail;
}

let trails = [];

function addTrail(file) {
  const trail = extractData(file);
  trails = [...trails, trail];
  return trails;
}

//iterate through all the files and build the new trails list
function compileTrails(fileNames) {
  //  for each file in fileNames {
  //    extractData(file);
  //    append new trail to array
  //  }
  //  return trails;
}

addTrail('trails/1a-ch-52822-120413-pm.json');
addTrail('trails/1b1-ch-52822-120301-pm.json');

console.log(trails[0]);

// //Sudo Code

// // extract useful data from JSON
// function extractData(file)
//   fetch the json
//   parse the json
//   create a new object
//   populate new object with only the properties that I want
//   return the new object

// //create an array of all the json file names
// function getFileNames{
//   ???
//   return array of file names
// }

// routeList = []
// //recursively find all route patterns
// function findRoutes(start) {
//   route = []
//   if filter start.trails(walked=false) does not equal null {
//     for each trail not walked {
//       add trail to route
//       get newStart point
//       findRoutes(newStart)
//     }
//   } else if allTrailsWalked() = false
//     for each trail {
//       add trail to route
//       get newStart point
//       findRoutes(newStart)
//     }
//   } else
//   add route to routeList
// }

// //check if all trails have been walked
// functions allTrailWalked {
//   return trails.reduced(walked = true)
// }

// //find the total time/distance of route
// for each route in routes
//   totalDist = '';
//   for each trail in route
//     totalDist += trail distance
//   add totalDist to route

// //find shortest route
// reduce.routes by total distance or time

// //display shortest route
// for each trail in shortest route
//   update dom div
//     trail.name
//     trail.dist
//     trail.tim
// update dom div
//   route.totalDist
//   route.totalTime
