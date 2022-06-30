var trails = [
  {
    title: '10.1 CSP 5/28/22 12:29:16 PM',
    distance: 78.62647282270385,
    total_time: 65,
    average_speed: 1.209638043426213,
    notes: '',
  },
];

var Trail = function () {
  if (!(this instanceof Node)) return new Node(name, isOkay, rotation);
  else {
    this.title = '';
    this.distance = 0.0;
    this.total_time = 0;
    this.average_speed = 0.0;
    this.notes = '';
  }
};

function extractData(file) {
  const trail = {};
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      //parse the JSON
      var response = JSON.parse(xhttp.responseText);
      //Drill down to the trails properties
      return response.features[0].properties;
      //var properties = response.features[0].properties;

      // trail.title = properties.title;
      // trail.distance = properties.distance;
      // trail.total_time = properties.total_time;
      // trail.average_speed = properties.average_speed;
      // trail.notes = properties.notes;

      // trails.push(trail);
    }
  };
  xhttp.open('GET', file, true);
  xhttp.send();
}

//iterate through all the files and build the new trails list
function compileTrails(numOfFiles) {
  for (let i = 1; i <= numOfFiles; i++) {
    let file = `trails/${i}.json`;
    const trail = extractData(file);
  }
}

compileTrails(3);

console.log(trails);

//find the total distance and time of route
function routeTotal(route) {
  console.log(trails);
  console.log(route);
  //let totalDistance = route[0].distance;
  //let totalTime = route[0].total_time;
  //let averageSpeed = route[0].average_speed;
  // let totalDistance = 0;
  // let totalTime = 0;
  // let totalSpeed = 0;
  // for (let i in route) {
  //   totalDistance += route[i].distance;
  //   totalTime += route[i].total_time;
  //   totalSpeed += route[i].average_speed;
  // }
  //let averageSpeed = totalSpeed / route.length;
  //return [totalDistance, totalTime, averageSpeed];
}

//routeTotal(trails);
//const trailTotals = routeTotal(trailsDir);
//let distance = trails[0].title;
//console.log(trails);

//console.log(JSON.stringify(trails[0]));
//let trailString = ;
//console.log(trails[0]);

//document.getElementById('container').innerHTML = JSON.stringify(trails);

// //Sudo Code

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
