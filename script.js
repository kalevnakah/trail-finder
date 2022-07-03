const btnCalc = document.getElementById('calc');

const trails = [];

async function extractData(file) {
  const res = await fetch(file);
  const data = await res.json();

  return data.features[0].properties;
}

//iterate through all the files and build the new trails list
async function compileTrails(numOfFiles) {
  for (let i = 1; i <= numOfFiles; i++) {
    let file = `trails/${i}.json`;
    const trail = await extractData(file);
    trails.push(trail);
  }
}
compileTrails(43);

//find the total distance and time of route
function routeTotal() {
  let totalDistance = 0;
  let totalTime = 0;
  let totalSpeed = 0;
  for (let i in trails) {
    totalDistance += trails[i].distance;
    totalTime += trails[i].total_time;
    totalSpeed += trails[i].average_speed;
  }
  let averageSpeed = totalSpeed / trails.length;
  console.log(totalDistance, totalTime, averageSpeed);
}

routeTotal();
btnCalc.addEventListener('click', routeTotal);

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
