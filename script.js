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
const allPossibleRoutes = [];

// Extract the properties from the json files
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
  giveRoutesTestingIntersections(testIntersections);
  collectIntersects();
  traverseTrails([], buildWalkedList(Trails), '1');
  whichRoutesAreShortest(allPossibleRoutes);
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

// Using recursion to find all trail routes
function traverseTrails(route, walkedTrails, intersection) {
  const newRoute = route;
  // Stop recursive function if all trails have been walked
  if (trailsWalked(walkedTrails)) {
    return allPossibleRoutes.push([...newRoute]);
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

// Determine which routes are the shortest
function whichRoutesAreShortest(routesList) {
  return routesList.reduce((smallestRoute, route) => {
    //Add up the total length of the route
    const routeLength = route.reduce((routeTotalDistance, curTrail) => {
      let trailObj = Trails.find((trail) => trail.id === curTrail);
      // Round to two decimal to catch float errors and trails that pretty much equal.
      return routeTotalDistance + parseFloat(trailObj.distance.toFixed(2));
    }, 0);
    // Add route to the accumulator and reset it if the route is shorter.
    if (smallestRoute.length === 0) {
      smallestRoute.push(routeLength);
      smallestRoute.push(route);
    } else if (smallestRoute[0] == routeLength) {
      smallestRoute.push(route);
    } else if (smallestRoute[0] > routeLength) {
      smallestRoute = [];
      smallestRoute.push(routeLength);
      smallestRoute.push(route);
    }
    // Returns: [ Trail Length as double, [route1], [route2], ...]
    return smallestRoute;
  }, []);
}

function filterIdenticalRoutes(arrLengthRoutes) {
  const arrRoutes = arrLengthRoutes.shift();
  // Loop
  for (let i = 0; i < arrRoutes.length - 1; i++) {
    // If Same length
    for (let j = 0; j < arrRoutes.length; j++) {
      if (arrRoutes[i] === arrRoutes[j].length) {
        if (startAndEndAreEqual(arrRoutes[i], arrRoutes[j])) {
          const flippedRoute = routeFlipper(arrRoutes[j]);
          if (compareTwoRoutes(arrRoutes[i], flippedRoute)) {
            arrRoutes.splice(j, 1);
          } else if (compareShifted(arrRoutes[i], arrRoutes[j])) {
            arrRoutes.splice(j, 1);
          } else if (compareShifted(arrRoutes[i], flippedRoute)) {
            arrRoutes.splice(j, 1);
          }
        }
      }
    }
  }
  return [...arrRoutes];
}

function startAndEndAreEqual(route1, route2) {
  const trail1 = Trails.find((trail) => trail.id === route1[0]);
  const trail2 = Trails.find((trail) => trail.id === route1[1]);
  const trail3 = Trails.find((trail) => trail.id === route2[route2.length - 1]);
  const trail4 = Trails.find((trail) => trail.id === route2[route2.length - 2]);
  trail1.push(...trail2);
  trail3.push(...trail4);
  let commonDenominators = new Set();
  for (let i = 0; 1 < trail1.length; i++) {
    if (intersection == trail3[i]) {
      if (commonDenominators.find(intersection)) {
        commonDenominators.intersection += 1;
      } else {
        commonDenominators.add((intersection += 1));
      }
    }
  }
  return commonDenominators.reduce((acc, intersection) => {
    if (Math.floor(intersection / 2) === 0) {
      acc = acc === true ? true : false;
    } else {
      acc = true;
    }
  });
}

function compareShifted(route1, route2) {
  letShiftedRoute = route2;
  for (let i = 0; i < route1.length; i++) {
    shiftedRoute = shiftedRoute.unshift(shiftedRoute.pop());
    if (compareTwoRoutes(route1, shiftedRoute)) {
      return true;
    }
  }
}

function compareTwoRoutes(route1, route2) {
  for (let trail1 of route1) {
    if (trail1 !== route2[index]) {
      return false;
    }
    return true;
  }
}

function compareOneRouteWithTheRemaining(route, routes) {}

// Event Listeners
btnLoad.addEventListener('click', routeTotal(Trails));
btnIntersects.addEventListener('click', collectIntersects);

// Test functions
// Fill in the intersections
function giveRoutesTestingIntersections(intersectionList) {
  intersectEL = document.querySelectorAll('.intersect');
  intersectEL.forEach((intersect, index) => {
    intersect.value = intersectionList[index];
  });
}
// Controlled test data
const testIntersections = ['1', '2', '2', '3', '3', '1'];

// //find the total time/distance of route
// for each route in routes
//   totalDist = '';
//   for each trail in route
//     totalDist += trail distance
//   add totalDist to route

// //find shortest route
// reduce.routes by total distance or time
