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
  giveRoutesTestingIntersections(Incomplete);
  collectIntersects();
  startEveryWhere();
  const shortestRoutes = whichRoutesAreShortest(allPossibleRoutes);
  console.log(shortestRoutes);
  const filtered = filterIdenticalRoutes(shortestRoutes);
  console.log(filtered);
})();

//Create list of trail intersections
function collectIntersects() {
  TrailIntersects = [];
  intersectEL = document.querySelectorAll('.intersect');
  intersectEL.forEach((intersect) => {
    // Add intersections to the trail's properties

    // Check for empty intersections and give them a random number
    if (intersect.value === '') {
      intersect.value = Math.floor(
        Math.random() * 100 + 2 * intersectEL.length
      ).toString();
    }
    const trailObj = Trails.find((trail) => trail.id === intersect.dataset.id);
    if (trailObj.intersections) {
      trailObj.intersections.push(intersect.value);
    } else {
      trailObj.intersections = [intersect.value];
    }

    // Build a index for trail intersections
    if (TrailIntersects.hasOwnProperty(intersect.value)) {
      // Check for trails that are loops
      if (!TrailIntersects[intersect.value].includes(intersect.dataset.id)) {
        TrailIntersects[intersect.value].push(intersect.dataset.id);
      }
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
  for (let intersect in TrailIntersects) {
    if (TrailIntersects.hasOwnProperty(intersect)) {
      console.log('starte everyware index:' + intersect);
      traverseTrails([], buildWalkedList(Trails), intersect);
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
  const trailObj = Trails.find((trail) => trail.id === curTrail);
  const trailIntersects = [...trailObj.intersections];
  trailIntersects.splice(trailIntersects.indexOf(connector), 1);
  return trailIntersects[0];
}

// Determine if all the trails have been walked
function trailsWalked(walkedTrails) {
  return walkedTrails.map((trail) => trail.walked).every((trail) => trail > 0);
}

// check if trail has been walked more than once
function backtrackCheck(curTrail, walkedTrails) {
  let trailObj = walkedTrails.find((trail) => trail.id === curTrail);
  return trailObj.walked < 2;
}

// Using recursion to find all trail routes
function traverseTrails(route, walkedTrails, intersection) {
  console.log('traverse start int:' + intersection);
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
        console.log('New Int:' + newIntersect);
        // Mark the trail as walked
        let newWalkedTrails = addWalkedTrail(newTrail, walkedTrails);
        // Call the recursive function
        console.log(newRoute);
        traverseTrails(newRoute, newWalkedTrails, newIntersect);
        // Undo stuff so the for loop will work on next iteration
        removeWalkedTrail(newTrail, walkedTrails);
        newRoute.pop();
      }
    });
  }
  return allPossibleRoutes.push([]);
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
  const length = arrLengthRoutes.shift();
  const arrRoutes = arrLengthRoutes;
  // Loop through and set route 1
  for (let i = 0; i < arrRoutes.length - 1; i++) {
    // Loop through and set route 2
    for (let j = 1; j < arrRoutes.length; j++) {
      // Routes that don't have the same number of trails are not equal
      console.log('Routes Being Compared:' + i + ':' + j);
      if (arrRoutes[i].length === arrRoutes[j].length) {
        // Create and compare a flipped version of the route being compared
        const flippedRoute = [...arrRoutes[j]].reverse();
        //flippedRoute = flippedRoute.reverse();
        if (
          arrRoutes[i].every(
            (element, index) => element === flippedRoute[index]
          )
        ) {
          console.log('trails were reversed');
          arrRoutes.splice(j, 1);
          j--;
          // Check if the routes is a circle. If yes then it could be shifted
        } else if (
          startAndEndAreEqual(arrRoutes[i]) &&
          startAndEndAreEqual(arrRoutes[j])
        ) {
          // Compare routes with one route being shifted for every trail in the route
          if (compareShifted(arrRoutes[i], arrRoutes[j])) {
            arrRoutes.splice(j, 1);
            j--;
            console.log('shifted');
            // Compare routes after flipping and being shifted for every trail in the route
          } else if (compareShifted(arrRoutes[i], flippedRoute)) {
            arrRoutes.splice(j, 1);
            j--;
            console.log('reversed and shifted');
          }
        }
      }
    }
  }
  // Return all unique routes
  console.log([length, ...arrRoutes]);
  return [length, ...arrRoutes];
}

function startAndEndAreEqual(route) {
  const trail1 = Trails.find((trail) => trail.id === route[0]);
  const trail2 = Trails.find((trail) => trail.id === route[1]);
  const trail3 = Trails.find((trail) => trail.id === route[route.length - 1]);
  const trail4 = Trails.find((trail) => trail.id === route[route.length - 2]);
  const arr = [
    ...trail1.intersections,
    ...trail2.intersections,
    ...trail3.intersections,
    ...trail4.intersections,
  ];
  // Find the lowest Common Denominator
  let LCD = new Set();
  // loop through first half of array
  for (i = 0; i < 4; i++) {
    // Loop through second half of array
    for (j = 4; j < arr.length; j++) {
      if (arr[i] in LCD) {
        if (arr[i] === arr[j]) {
          LCD[arr[i]] += 1;
          arr.splice(j, 1);
          j--;
        }
      } else {
        if (arr[i] === arr[j]) {
          LCD.add(arr[i]);
          LCD[arr[i]] = 2;
          arr.splice(j, 1);
          j--;
        }
      }
    }
  }
  for (let intersectionCount in LCD) {
    if (LCD[intersectionCount] % 2 != 0) {
      return true;
    }
  }
  return false;
}

function compareShifted(route1, route2) {
  for (let i = 0; i < route1.length; i++) {
    route2.unshift(route2.pop());
    if (route1.every((trail, index) => trail === route2[index])) {
      return true;
    }
  }
  return false;
}

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
const straightLoop = ['1', '2', '2', '3', '3', '1'];
const triangle = ['1', '2', '1', '3', '1', '4', '4', '3'];
const parallel = ['1', '2', '2', '3', '1', '2', '1', '2'];
const parallelWithLoop = ['1', '2', '2', '3', '1', '2', '1', '1'];
const twoTrailsParallel = ['1', '2', '1', '2'];
const twoLoops = ['1', '1', '1', '1'];
const oneTrail = ['1', '1'];
const MissingData = ['1', '2', '', '3', '3', '1'];
const Incomplete = ['1', '2', '3', '4', '5', '1'];
