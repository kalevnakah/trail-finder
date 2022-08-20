// Dom Variables
const btnLoadSample = document.getElementById('load-sample-btn');
const btnIntersects = document.getElementById('intersect-btn');
const trailsEl = document.getElementById('trails');
const routesEl = document.getElementById('routes');
const totalDistEL = document.getElementById('total-dist');
const totalTimeEl = document.getElementById('total-time');
const avgSpeedEl = document.getElementById('avg-speed');
const btnDeleteAll = document.getElementById('delete-all-btn');
const btnCalculateShortest = document.getElementById('calculate-shortest-btn');
const btnShortestIntersection = document.getElementById(
  'calculate-shortest-start-btn'
);
const inputShortestIntersection = document.getElementById('startingPoint');

// Global Variables
let intersectEL = [];
let Trails = [];
let TrailIntersects = {};
let allPossibleRoutes = [];

//Upload variables
const uploadUrl = 'upload.php';
const deleteUrl = 'delete.php';
const form = document.querySelector('form');
const input = document.getElementsByName('files[]');

// Get Trails from local storage
async function recallAllTrails() {
  if (localStorage.getItem('Trails')) {
    Trails = await JSON.parse(localStorage.getItem('Trails'));
    for (let i = 0; i < Trails.length; i++) {
      trailsToDom(Trails[i]);
    }
  }
}

// Extract the properties from the json files
async function extractData(file) {
  const res = await fetch(file);
  const data = await res.json();

  return data.features[0].properties;
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

  //Upload file to server
  await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  // Get the data from the file
  await fetchTrails(fileList);
  routeTotal(Trails);
  input[0].value = '';

  //Delete the file from the server
  await fetch(deleteUrl, {
    method: 'POST',
    body: formData,
  });
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
  const deleteTrail = document.createElement('button');
  deleteTrail.innerHTML = 'X';
  deleteTrail.classList.add('delete');
  deleteTrail.addEventListener('click', function () {
    deleteTrail(deleteTrail, trail.id);
    trailsEl.removeChild(newTrail);
  });
  const newTrail = document.createElement('div');
  newTrail.classList.add('trail-rows', 'trail');
  newTrail.id = trail.id;
  newTrail.style.background = trail.color;
  newTrail.style.color =
    luma(trail.color.substring(1)) >= 165 ? '#000' : '#fff';
  newTrail.innerHTML = `
    <div class="trail-title"><button class='delete' onclick="deleteTrail(this,'${
      trail.id
    }')">x</button><p>${trail.title}</p></div>
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
    const newRouteContainer = document.createElement('div');
    newRouteContainer.id = index;
    newRouteContainer.classList.add('routeContainer');
    const newHeader = document.createElement('H2');
    newHeader.innerHTML = `Route ${index}`;
    //document.body.appendChild(newHeader);
    newRouteContainer.appendChild(newHeader);
    const newTrailsList = document.createElement('div');
    newTrailsList.classList.add('box');
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
    //document.body.appendChild(newTrailsList);
    newRouteContainer.appendChild(newTrailsList);
    let totalDistance = 0;
    let totalTime = 0;
    let totalSpeed = 0;
    let trailNum = 1;
    const routeExport = [
      [
        'Order',
        'Name',
        'Distance(Meters)',
        'Time(MM:SS)',
        'Speed(km/hr)',
        'Trail Start',
        'Trail End',
      ],
    ];

    for (let curTrail in route) {
      let trailObj = Trails.find((trail) => trail.id === route[curTrail]);

      let trailName = trailObj.title;
      totalDistance += trailObj.distance;
      totalTime += trailObj.total_time;
      totalSpeed += trailObj.average_speed;

      routeExport.push([
        trailNum,
        trailName,
        totalDistance,
        totalTime,
        totalSpeed,
        trailObj.intersections[0],
        trailObj.intersections[1],
      ]);

      trailNum++;

      newRouteContainer.lastChild.lastChild.appendChild(
        trailsToRouteDom(trailObj)
      );
    }
    let averageSpeed = totalSpeed / route.length;
    const newTotalEl = document.createElement('div');
    newTotalEl.classList.add('trail-total', 'trail-rows');
    newTotalEl.innerHTML = `
    <div>Total: Number of trails = ${route.length}</div>
        <div id="total-dist">${totalDistance.toFixed(2)}</div>
        <div id="total-time" class="total-time">${Math.floor(totalTime / 60)}:${
      totalTime % 60
    }</div>
        <div id="avg-speed" class="avg-speed">${(
          averageSpeed *
          (18 / 5)
        ).toFixed(2)}</div>
    `;
    newRouteContainer.lastChild.lastChild.appendChild(newTotalEl);

    //Create Export Button
    const newDownloadBtn = document.createElement('button');
    newDownloadBtn.innerHTML = `Save Route ${index} To CSV`;
    newDownloadBtn.onclick = function () {
      exportToCsv(`route${index}`, routeExport);
    };
    newRouteContainer.appendChild(newDownloadBtn);
    routesEl.appendChild(newRouteContainer);
  });
}

function clearTrails() {
  localStorage.removeItem('Trails');
  localStorage.removeItem('TrailsIntersects');
  trailsEl.innerHTML = '';
  routesEl.innerHTML = '';
  Trails = [];
  TrailIntersects = {};
  routeTotal(Trails);
}

function deleteTrail(trailEl, trailId) {
  trailEl.parentNode.parentNode.remove();
  localStorage.removeItem('Trails');
  localStorage.removeItem('TrailsIntersects');
  const trailIndex = Trails.findIndex((trail) => trail.id === trailId);
  Trails.splice(trailIndex, 1);
  TrailIntersects = {};
  buildIntersectionList();
  routeTotal(Trails);
}

// Load Demo trails.
// Params for "addDemoTrails": straightLoop triangle parallel parallelWithLoop twoTrailsParallel twoLoops oneTrail missingData incomplete stickFigure
async function loadSampleTrails() {
  numberOfFiles = 7;
  files = [];
  for (i = 1; i < numberOfFiles; i++) {
    files.push(`${i}.json`);
  }
  await fetchTrails(files);
  routeTotal(Trails);
  giveRoutesTestingIntersections(stickFigure);
  collectIntersects();
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

//find the shortest route from all intersections.
function calculateShortestRoute() {
  let startTime = new Date();
  console.log(startTime);
  allPossibleRoutes = [];
  routesEl.innerHTML = '';
  collectIntersects();
  startEveryWhere();
  if (allPossibleRoutes.length !== 0) {
    const shortestRoutes = whichRoutesAreShortest(allPossibleRoutes);
    const filtered = filterIdenticalRoutes(shortestRoutes);
    routesToDom(filtered);
  } else {
    routesEl.innerHTML = `<h1>No Possible Routes Found</h1>`;
  }
  let endTime = new Date();
  let timeDiff = endTime - startTime;
  console.log(`time to beat: ${timeDiff}`);
}

//find the shortest route from a single starting point
function calculateShortestRouteFromStart() {
  let startTime = new Date();
  let intersect = inputShortestIntersection.value;
  console.log(startTime);
  allPossibleRoutes = [];
  routesEl.innerHTML = '';
  collectIntersects();
  traverseTrails([], buildWalkedList(Trails), intersect);
  if (allPossibleRoutes.length !== 0) {
    const shortestRoutes = whichRoutesAreShortest(allPossibleRoutes);
    const filtered = filterIdenticalRoutes(shortestRoutes);
    routesToDom(filtered);
  } else {
    routesEl.innerHTML = `<h1>No Possible Routes Found</h1>`;
  }
  let endTime = new Date();
  let timeDiff = endTime - startTime;
  console.log(`time to beat: ${timeDiff}`);
}

// Initialize the program and fetch the js
(async function () {
  trailsEl.innerHTML = '';
  await recallAllTrails();
  routeTotal(Trails);
  recallIntersections();
})();

//Create list of trail intersections
function addIntersectionsToTrails() {
  TrailIntersects = [];
  intersectEL = document.querySelectorAll('.intersect');

  //clear intersections before rebuilding them.
  Trails.forEach((intersect) => {
    intersect.intersections = '';
  });

  // Add intersections to the trail's properties
  intersectEL.forEach((intersect) => {
    // Check for empty intersections and give a default;
    if (intersect.value === '') {
      intersect.value = 'none';
    }
    const trailObj = Trails.find((trail) => trail.id === intersect.dataset.id);
    if (trailObj.intersections) {
      trailObj.intersections.push(intersect.value);
    } else {
      trailObj.intersections = [intersect.value];
    }
  });

  localStorage.setItem('Trails', JSON.stringify(Trails));
}

// Create list of trail Intersections
function buildIntersectionList() {
  TrailIntersects = [];
  intersectEL = document.querySelectorAll('.intersect');
  intersectEL.forEach((intersect) => {
    // Check for empty intersections and give a default;
    if (intersect.value === '') {
      intersect.value = 'none';
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
}

// Add intersections to trails and build an intersectionsList;
function collectIntersects() {
  addIntersectionsToTrails();
  buildIntersectionList();
}

// Save intersections when button is pressed
function saveIntersects() {
  addIntersectionsToTrails();
  buildIntersectionList();
  alert('Routes have been saved to local storage.');
}

// Build a list can keep track of the state of the trails while traversing them.
function buildWalkedList(trails) {
  const walkedTrails = trails.map((trail) => ({
    id: trail.id,
    walked: 0,
    activities: trail.activities[0],
  }));
  return walkedTrails;
}

// Get possible routes from different starting points
function startEveryWhere() {
  for (let intersect in TrailIntersects) {
    //console.log(`starting intersection: ${intersect}`);
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
  const trailsOnly = walkedTrails.filter(
    (track) => track.activities === 'hiking'
  );
  const trailsOnlyMap = trailsOnly.map((trail) => trail.walked);
  const trailsOnlyEvery = trailsOnlyMap.every((trail) => trail > 0);
  return trailsOnlyEvery;
}

// check if trail has been walked more than once
function backtrackCheck(curTrail, walkedTrails) {
  let trailObj = walkedTrails.find((trail) => trail.id === curTrail);
  return trailObj.walked < 2;
}

let traverseCount = 0;
// Using recursion to find all trail routes
function traverseTrails(route, walkedTrails, intersection) {
  const newRoute = route;
  //console.log(traverseCount++);
  // Stop recursive function if all trails have been walked
  if (trailsWalked(walkedTrails)) {
    //console.log(`Found a route!`);
    return allPossibleRoutes.push([...newRoute]);
  } else {
    //Check if the route is longer than we care about.
    if (route.length < 1.5 * Trails.length) {
      //loop through every trail at current intersection
      let futureTrails = TrailIntersects[intersection];
      futureTrails.forEach((newTrail) => {
        // Stop infinite loop. Cannot walk same trail more than twice
        if (backtrackCheck(newTrail, walkedTrails)) {
          console.log('success');
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
            // Compare routes after flipping and being shifted for every trail in the route
          } else if (compareShifted(arrRoutes[i], flippedRoute)) {
            arrRoutes.splice(j, 1);
            j--;
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

function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  var csvFile = '';
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

// Event Listeners
btnLoadSample.addEventListener('click', loadSampleTrails);
btnDeleteAll.addEventListener('click', clearTrails);
btnIntersects.addEventListener('click', saveIntersects);
form.addEventListener('submit', upload);
btnCalculateShortest.addEventListener('click', calculateShortestRoute);
btnShortestIntersection.addEventListener(
  'click',
  calculateShortestRouteFromStart
);

// Test functions and Sample Data
// Fill in the intersections
function giveRoutesTestingIntersections(intersectionList) {
  intersectEL = document.querySelectorAll('.intersect');
  index = 0;
  intersectEL.forEach((intersect) => {
    if (index < intersectionList.length) {
      intersect.value = intersectionList[index];
      index++;
    }
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
const missingData = ['1', '2', '', '3', '3', '1'];
const incomplete = ['1', '2', '3', '4', '5', '1'];
const stickFigure = [
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
