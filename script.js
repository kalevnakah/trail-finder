// Dom Variables
const btnLoad = document.getElementById('load-btn');
const btnIntersects = document.getElementById('intersect-btn');
const trailsEl = document.getElementById('trails');
const totalDistEL = document.getElementById('total-dist');
const totalTimeEl = document.getElementById('total-time');
const avgSpeedEl = document.getElementById('avg-speed');

// Global Variables
let intersectEL = [];
let Trails = [];
let TrailIntersects = {};
const allPossibleRoutes = [];

//Upload variables
const url = 'upload.php';
const form = document.querySelector('form');

// Extract the properties from the json files
async function extractData(file) {
  const res = await fetch(file);
  const data = await res.json();

  return data.features[0].properties;
}

// Get Trails from local storage
async function recallAllTrails() {
  if (localStorage.getItem('Trails')) {
    Trails = await JSON.parse(localStorage.getItem('Trails'));
    for (let i = 0; i < Trails.length; i++) {
      trailsToDom(Trails[i]);
    }
  }
}

// Iterate through all the uploaded files and add to trails.
async function fetchTrails(trailList) {
  for (let i = 0; i < trailList.length; i++) {
    splitFile = trailList[i].split('.');
    file = `trails/${splitFile[0]}.json`;
    const trail = await extractData(file);
    Trails.push(trail);
    localStorage.setItem('Trails', JSON.stringify(Trails));
    trailsToDom(trail);
  }
}

// Upload files to the server
async function upload(e) {
  e.preventDefault();

  // Gather files and begin FormData
  const files = document.querySelector('[type=file]').files;
  const formData = new FormData();
  const fileList = [];

  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    formData.append('files[]', file);
    fileList.push(file['name']);
  }

  await fetch(url, {
    method: 'POST',
    body: formData,
  }).then((response) => {
    //console.log(response);
  });

  await fetchTrails(fileList);
  routeTotal(Trails);
}

function luma(color) {
  // color can be a hx string or an array of RGB values 0-255
  var rgb = typeof color === 'string' ? hexToRGBArray(color) : color;
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; // SMPTE C, Rec. 709 weightings
}

function hexToRGBArray(color) {
  if (color.length === 3)
    color =
      color.charAt(0) +
      color.charAt(0) +
      color.charAt(1) +
      color.charAt(1) +
      color.charAt(2) +
      color.charAt(2);
  else if (color.length !== 6) throw 'Invalid hex color: ' + color;
  var rgb = [];
  for (var i = 0; i <= 2; i++) rgb[i] = parseInt(color.substr(i * 2, 2), 16);
  return rgb;
}

// Update DOM with trails list
function trailsToDom(trail) {
  const newTrail = document.createElement('div');
  newTrail.classList.add('trail-rows', 'trail');
  newTrail.id = trail.id;
  newTrail.style.background = trail.color;
  newTrail.style.color =
    luma(trail.color.substring(1)) >= 165 ? '#000' : '#fff';
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
  if (trails != null) {
    let totalDistance = 0;
    let totalTime = 0;
    let totalSpeed = 0;

    for (let i in trails) {
      totalDistance += trails[i].distance;
      totalTime += trails[i].total_time;
      totalSpeed += trails[i].average_speed;
    }
    let averageSpeed = totalSpeed / trails.length;

    totalDistEL.innerHTML = `${totalDistance.toFixed(2)}`;
    totalTimeEl.innerHTML = `${Math.floor(totalTime / 60)}:${totalTime % 60}`;
    avgSpeedEl.innerHTML = `${(averageSpeed * (18 / 5)).toFixed(2)}`;
  }
}

// Update DOM with trails to the routes
function trailsToRouteDom(trail) {
  const newTrail = document.createElement('div');
  newTrail.classList.add('trail-rows', 'trail');
  newTrail.id = trail.id;
  newTrail.style.background = trail.color;
  newTrail.style.color =
    luma(trail.color.substring(1)) >= 165 ? '#000' : '#fff';
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
    <div><p>${trail.intersections[0]}</p></div>
    <div><p>${trail.intersections[1]}</p></div>
  `;
  return newTrail;
}

function routesToDom(routes) {
  routes.forEach((route, index) => {
    const newHeader = document.createElement('H2');
    newHeader.innerHTML = `Route ${index}`;
    document.body.appendChild(newHeader);
    const newTrailsList = document.createElement('div');
    newTrailsList.classList.add('box');
    newTrailsList.id = index;
    newTrailsList.innerHTML = `
    <div id="trail-list" class="trails-list-head trail-rows">
      <div>Name</div>
      <div>Distance (Meters)</div>
      <div>Time (MM:SS)</div>
      <div>Speed (km/hr)</div>
      <div>Trail Start</div>
      <div>Trail End</div>
    </div>
    <div id="trails"></div>`;
    document.body.appendChild(newTrailsList);

    let totalDistance = 0;
    let totalTime = 0;
    let totalSpeed = 0;
    for (let curTrail in route) {
      let trailObj = Trails.find((trail) => trail.id === route[curTrail]);

      totalDistance += trailObj.distance;
      totalTime += trailObj.total_time;
      totalSpeed += trailObj.average_speed;

      document.body.lastChild.lastChild.appendChild(trailsToRouteDom(trailObj));
    }
    let averageSpeed = totalSpeed / route.length;
    const newTotalEl = document.createElement('div');
    newTotalEl.classList.add('trail-total', 'trail-rows');
    newTotalEl.innerHTML = `
    <div>Total:</div>
        <div id="total-dist">${totalDistance.toFixed(2)}</div>
        <div id="total-time" class="total-time">${Math.floor(totalTime / 60)}:${
      totalTime % 60
    }</div>
        <div id="avg-speed" class="avg-speed">${(
          averageSpeed *
          (18 / 5)
        ).toFixed(2)}</div>
    `;
    document.body.lastChild.lastChild.appendChild(newTotalEl);
  });
}

function recallIntersections() {
  if (localStorage.getItem('TrailsIntersects')) {
    TrailIntersects = JSON.parse(localStorage.getItem('TrailsIntersects'));
    const intersectEL = document.querySelectorAll('.intersect');
    let two = 0;
    for (let i = 0; i < intersectEL.length; i++) {
      let trailInt = Trails.find(
        (trail) => trail.id === intersectEL[i].dataset.id
      );
      intersectEL[i].value = trailInt.intersections[two];
      if (two < 1) {
        two++;
      } else {
        two = 0;
      }
    }
  }
}

// Initialize the program and fetch the js
(async function () {
  trailsEl.innerHTML = '';
  await recallAllTrails();
  routeTotal(Trails);
  recallIntersections();
  // giveRoutesTestingIntersections(parallelWithLoop);
  // collectIntersects();
  // startEveryWhere();
  // if (allPossibleRoutes.length !== 0) {
  //   const shortestRoutes = whichRoutesAreShortest(allPossibleRoutes);
  //   const filtered = filterIdenticalRoutes(shortestRoutes);
  //   routesToDom(filtered);
  // }
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
  localStorage.setItem('TrailsIntersects', JSON.stringify(TrailIntersects));
  localStorage.setItem('Trails', JSON.stringify(Trails));
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
      // Round to two decimal to catch float errors and trails that are pretty much equal.
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
      if (arrRoutes[i].length === arrRoutes[j].length) {
        // Create and compare a flipped version of the route being compared
        const flippedRoute = [...arrRoutes[j]].reverse();
        //flippedRoute = flippedRoute.reverse();
        if (
          arrRoutes[i].every(
            (element, index) => element === flippedRoute[index]
          )
        ) {
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
  return [...arrRoutes];
}

function startAndEndAreEqual(route) {
  const trail1 = Trails.find((trail) => trail.id === route[0]);
  const trail2 = Trails.find((trail) => trail.id === route[1]);
  const trail3 = Trails.find((trail) => trail.id === route[route.length - 2]);
  const trail4 = Trails.find((trail) => trail.id === route[route.length - 1]);
  const trailInt1 = [...trail1.intersections];
  const trailInt2 = [...trail2.intersections];
  const trailInt3 = [...trail3.intersections];
  const trailInt4 = [...trail4.intersections];
  let startInt = [];
  let endInt = [];
  // find start of trail
  if (arraysAreEqual(trailInt1, trailInt2)) {
    startInt = [...trailInt1];
  } else {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (trailInt1[i] === trailInt2[j]) {
          startInt = [findNextIntersection(trailInt1[i], trail1.id)];
          break;
        }
      }
    }
  }
  // find end of trail
  if (arraysAreEqual(trailInt3, trailInt4)) {
    endInt = [...trailInt4];
  } else {
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        if (trailInt3[j] === trailInt4[i]) {
          endInt = [findNextIntersection(trailInt4[i], trail4.id)];
          break;
        }
      }
    }
  }
  if (commonNumberInArray(startInt, endInt)) {
    return true;
  }
  return false;
}

function commonNumberInArray(arr1, arr2) {
  let L1 = arr1.length;
  let L2 = arr2.length;

  arr1.sort();
  arr2.sort();

  for (i = 0; i < L1; i++) {
    for (j = 0; j < L2; j++) {
      if (arr1[i] == arr2[j]) {
        return true;
      }
    }
  }
  return false;
}

function arraysAreEqual(arr1, arr2) {
  let L1 = arr1.length;
  let L2 = arr2.length;
  if (L1 != L2) {
    return false;
  }
  arr1.sort();
  arr2.sort();
  for (i = 0; i < L1; i++) {
    if (arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
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
form.addEventListener('submit', upload);

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
const StickFigure = [
  '1',
  '1',
  '1',
  '2',
  '1',
  '3',
  '1',
  '4',
  '4',
  '5',
  '4',
  '6',
];
