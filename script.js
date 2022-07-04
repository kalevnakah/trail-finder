const btnLoad = document.getElementById('load-btn');
const btnIntersects = document.getElementById('intersect-btn');
const box = document.getElementById('box');
const trailsEl = document.getElementById('trails');
const totalDistEL = document.getElementById('total-dist');
const totalTimeEl = document.getElementById('total-time');
const avgSpeedEl = document.getElementById('avg-speed');
let intersectEL = [];

const trails = [];

let trailIntersects = {};

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

compileTrails(5);

// Update DOM with trails list
function trailsToDom(trail) {
  const newTrail = document.createElement('div');
  newTrail.classList.add('trail-rows', 'trail');
  newTrail.id = trail.id;
  newTrail.innerHTML = `
    <div><p>${trail.title}</p></div>
    <div><p>${trail.distance.toFixed(2)}</p></div>
    <div><p>${Math.floor(trail.total_time / 60)}:${
    trail.total_time % 60
  }</p></div>
    <div><p>${(trail.average_speed * (18 / 5)).toFixed(2)}</p></div>
    <div><input data-id=${trail.id} class="intersect"></input></div>
    <div><input data-id=${trail.id} class="intersect"></input></div>
  `;
  trailsEl.appendChild(newTrail);
}

//find the total distance and time of route
function routeTotal() {
  let totalDistance = 0;
  let totalTime = 0;
  let totalSpeed = 0;

  for (let i in trails) {
    totalDistance += trails[i].distance;
    totalTime += trails[i].total_time;
    totalSpeed += trails[i].average_speed;
    trailsToDom(trails[i]);
  }
  let averageSpeed = totalSpeed / trails.length;

  totalDistEL.innerHTML = `${totalDistance.toFixed(2)}`;
  totalTimeEl.innerHTML = `${Math.floor(totalTime / 60)}:${totalTime % 60}`;
  avgSpeedEl.innerHTML = `${(averageSpeed * (18 / 5)).toFixed(2)}`;

  console.log(totalDistance, totalTime, averageSpeed);
}

//Create list of trail intersections
function collectIntersects() {
  intersectEL = document.querySelectorAll('.intersect');
  intersectEL.forEach((intersect) => {
    const trailObj = trails.find((trail) => trail.id === intersect.dataset.id);
    if (trailObj.intersections) {
      trailObj.intersections.push(intersect.value);
    } else {
      trailObj.intersections = [intersect.value];
    }

    if (trailIntersects.hasOwnProperty(intersect.value)) {
      trailIntersects[intersect.value].push(intersect.dataset.id);
    } else if (intersect.value === '') {
      return;
    } else {
      trailIntersects[intersect.value] = [intersect.dataset.id];
    }
  });
}

routeTotal();
btnLoad.addEventListener('click', routeTotal);
btnIntersects.addEventListener('click', collectIntersects);

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
