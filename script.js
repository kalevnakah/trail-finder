const btnLoad = document.getElementById('load-btn');
const btnIntersects = document.getElementById('intersect-btn');
const box = document.getElementById('box');
const trailsEl = document.getElementById('trails');
const totalDistEL = document.getElementById('total-dist');
const totalTimeEl = document.getElementById('total-time');
const avgSpeedEl = document.getElementById('avg-speed');
let intersectEL = [];

const Trails = [];

let TrailIntersects = {};

async function extractData(file) {
  const res = await fetch(file);
  const data = await res.json();

  return data.features[0].properties;
}

//iterate through all the files and build the new trails list
async function fetchTrails(numOfFiles) {
  for (let i = 1; i <= numOfFiles; i++) {
    let file = `trails/${i}.json`;
    const trail = await extractData(file);
    Trails.push(trail);
  }
}

// Update DOM with trails list
function trailsToDom(trail) {
  const newTrail = document.createElement('div');
  newTrail.classList.add('trail-rows', 'trail');
  newTrail.id = trail.id;
  newTrail.innerHTML = `
    <div><p>${trail.title}</p></div>
    <div><p>${trail.distance.toFixed(2)}</p></div>
    <div><p>${Math.floor(trail.total_time / 60)}:${
    trail.total_time % 60 > 9
      ? trail.total_time % 60
      : '0' + (trail.total_time % 60)
  }
    </p></div>
    <div><p>${(trail.average_speed * (18 / 5)).toFixed(2)}</p></div>
    <div><input data-id=${trail.id} class="intersect"></input></div>
    <div><input data-id=${trail.id} class="intersect"></input></div>
  `;
  trailsEl.appendChild(newTrail);
}

//find the total distance and time of route
function routeTotal(trails) {
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
}

// Initialize the program and fetch the js
(async function () {
  await fetchTrails(3);
  routeTotal(Trails);
})();

//Create list of trail intersections
function collectIntersects() {
  TrailIntersects = [];
  intersectEL = document.querySelectorAll('.intersect');
  intersectEL.forEach((intersect) => {
    const trailObj = Trails.find((trail) => trail.id === intersect.dataset.id);
    if (trailObj.intersections) {
      trailObj.intersections.push(intersect.value);
    } else {
      trailObj.intersections = [intersect.value];
    }

    if (TrailIntersects.hasOwnProperty(intersect.value)) {
      TrailIntersects[intersect.value].push(intersect.dataset.id);
    } else if (intersect.value === '') {
      return;
    } else {
      TrailIntersects[intersect.value] = [intersect.dataset.id];
    }
  });
}

// Build a list can keep track of the state of the trails while traversing them.
function buildWalkedList(trails) {
  const walkedTrails = trails.map((trail) => ({
    id: trail.id,
    walked: 0,
  }));
  return walkedTrails;
}

// Get possible routes from different starting points
function startEveryWhere() {
  for (const intersect in TrailIntersects) {
    if (TrailIntersects.hasOwnProperty(intersect)) {
      console.log(typeof intersect);
      findAllPossibleRoutes(intersect);
    }
  }
}

const allPossibleRoutes = [];

// Using recursion to find all trail routes
function traverseTrails(route, walkedTrails, intersection) {
  const newRoute = route;
  // Stop recursive function if all trails have been walked
  if (trailsWalked(walkedTrails)) {
    console.log(newRoute);
    return allPossibleRoutes.push(newRoute);
  } else {
    //loop through every trail at current intersection
    let futureTrails = TrailIntersects[intersection];
    futureTrails.forEach((newTrail) => {
      // Stop infinite loop. Cannot walk same trail more than twice
      if (backtrackCheck(newTrail, walkedTrails)) {
        // add trail to newRoute
        newRoute.push(newTrail);
        // Grab the intersection on the other end of the trail
        let newIntersect = findNextIntersection(intersection, newTrail);
        // Mark the trail as walked
        let newWalkedTrails = addWalkedTrail(newTrail, walkedTrails);
        // Call the recursive function
        traverseTrails(newRoute, newWalkedTrails, newIntersect);
        // Undo stuff so the for loop will work on next iteration
        removeWalkedTrail(newTrail, walkedTrails);
        newRoute.pop();
      }
    });
  }
}

// Mark a trail as walked
function addWalkedTrail(curTrail, walkedTrails) {
  walkedTrails.find((trail) => trail.id === curTrail).walked += 1;
  return walkedTrails;
}

// UnMark a trail as walked
function removeWalkedTrail(curTrail, walkedTrails) {
  walkedTrails.find((trail) => trail.id === curTrail).walked -= 1;
  return walkedTrails;
}

// Find the intersection at the other end of trail
function findNextIntersection(connector, curTrail) {
  let trailObj = Trails.find((trail) => trail.id === curTrail);
  let oppositeIntersect = trailObj.intersections.filter((i) => i != connector);
  return oppositeIntersect[0];
}

// Determine if all the trails have been walked
function trailsWalked(walkedtrails) {
  return walkedtrails.map((trail) => trail.walked).every((trail) => trail > 0);
}

// check if trail has been walked more than once
function backtrackCheck(curTrail, walkedTrails) {
  let trailObj = walkedTrails.find((trail) => trail.id === curTrail);
  return trailObj.walked < 2;
}

// Event Listeners
btnLoad.addEventListener('click', routeTotal(Trails));
btnIntersects.addEventListener('click', collectIntersects);

// //find the total time/distance of route
// for each route in routes
//   totalDist = '';
//   for each trail in route
//     totalDist += trail distance
//   add totalDist to route

// //find shortest route
// reduce.routes by total distance or time
