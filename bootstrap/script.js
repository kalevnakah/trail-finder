// Trail Object

class Trail {
  constructor(trail) {
    this.id = trail.id;
    this.title = trail.title;
    this.color = trail.color;
    this.distance = trail.distance;
    this.time = trail.total_time;
    this.speed = trail.average_speed;
    this.activities = trail.activities[0];
    this.start = '';
    this.end = '';
  }

  addStart(intersection) {
    this.start = intersection;
  }

  addEnd(intersection) {
    this.end = intersection;
  }

  removeIntersections() {
    this.start = '';
    this.end = '';
  }
}

// Trails List Object
class Trails {
  constructor(trails = []) {
    this.trails = trails;
    this.distance = 0;
    this.time = 0;
    this.avgSpeed = 0;
  }

  addTrail(trailObj) {
    this.push(trailObj);
  }

  removeTrail(trailObj) {
    if (trailObj in this.trails) {
      this.trails.splice(this.findTrailIndex(trailObj), 1);
    }
  }

  findTrailIndex(trailObj) {
    return this.trails.findIndex((trail) => trail === trailObj) || null;
  }

  total() {
    this.avgSpeed = 0;
    if (this.trails.length > 0) {
      this.distance = 0;
      this.time = 0;
      this.avgSpeed = 0;
      let totalSpeed = 0;
      for (let i in this.trails) {
        this.distance += this.trails[i].distance;
        this.time += this.trails[i].time;
        totalSpeed += this.trails[i].speed;
      }
      this.avgSpeed = totalSpeed / this.trails.length;
    }
  }

  addTrailsToDom(isARoute = false) {
    this.total();
    const trailBox = UI.createTable();
    const trailBody = UI.createBody();
    this.trails.forEach((trail) => {
      trailBody.appendChild(UI.createATrail(trail, isARoute));
    });
    trailBox.appendChild(UI.createHeader());
    trailBox.appendChild(trailBody);
    trailBox.appendChild(UI.createFooter(this));
    return trailBox;
  }

  addCSVBtn(title) {
    const routeExport = [
      [
        'Order',
        'Title',
        'Distance(Meters)',
        'Time(Secs)',
        'Speed(km/hr)',
        'Trail Start',
        'Trail End',
      ],
    ];
    let trailNum = 1;
    this.trails.forEach((trail) => {
      routeExport.push([
        trailNum,
        trail.title,
        trail.distance,
        trail.time,
        trail.speed,
        trail.start,
        trail.end,
      ]);
      trailNum++;
    });
    return UI.csvExportBtn(title, routeExport);
  }
}

// Routes List. Similar to the trails list but it also has trail start and end information.
class Routes extends Trails {
  constructor(trails = [], intersections = []) {
    super(trails);
    this.start = '';
    this.end = '';
    this.intersections = intersections;
  }

  // Set the start and end intersections.
  setStartAndEnd() {
    this.start = this.intersections[0];
    this.end = this.intersections[this.intersections.length - 1];
  }

  addRouteToDom(routeNumber) {
    routeNumber = parseInt(routeNumber) + 1;
    const routeDiv = document.querySelector('#routes');
    let newHeader = document.createElement('h2');
    newHeader.innerHTML = `Route ${routeNumber}`;
    newHeader.classList.add('text-center', 'text-light');
    routeDiv.appendChild(newHeader);
    routeDiv.appendChild(this.addTrailsToDom(true));
    routeDiv.appendChild(this.addCSVBtn(`Save Route ${routeNumber} To CSV`));
  }
}

// Save data to local storage
class Store {
  static getTrails() {
    let storedTrails;
    if (localStorage.getItem('trails') === null) {
      storedTrails = [];
    } else {
      storedTrails = JSON.parse(localStorage.getItem('trails'));
    }
    return storedTrails;
  }

  static removeTrail(trailID) {
    const newTrails = Store.getTrails();
    newTrails.forEach((trail, index) => {
      if (trail.id === trailID) {
        newTrails.splice(index, 1);
      }
    });
    localStorage.setItem('trails', JSON.stringify(newTrails));
  }

  static addTrails(trailObj) {
    const newTrails = Store.getTrails();
    newTrails.push(trailObj);
    localStorage.setItem('trails', JSON.stringify(newTrails));
  }

  static clearStorage() {
    localStorage.removeItem('trails');
  }

  static saveIntersections() {
    const intersectEL = document.querySelectorAll('.intersect');
    const updateTrails = new Trails(Store.getTrails());
    let index = 0;
    intersectEL.forEach((intersect) => {
      // Step through the trails in storage.
      let trailObj = updateTrails.trails[index];
      // Check for empty intersections and give a default;
      if (intersect.value === '') {
        intersect.value = 'none';
      }
      // Check to make sure the ID's are the same
      if (trailObj.id === intersect.dataset.id) {
        // Check if it is a starting Intersection
        if (intersect.classList.contains('start')) {
          trailObj.start = intersect.value;
          // Check if it is an ending Intersection and move to next trail.
        } else if (intersect.classList.contains('end')) {
          trailObj.end = intersect.value;
          index++;
        }
      }
    });
    localStorage.setItem('trails', JSON.stringify(updateTrails.trails));
    let toastOpt = { animation: true, delay: 5000 };
    let toast = document.getElementById('save-toast');
    let toastEl = new bootstrap.Toast(toast, toastOpt);
    toastEl.show();
  }
}

// UI Class
class UI {
  static timeFormat(time) {
    return `${Math.floor(time / 60)}:${
      time % 60 > 9 ? `${time % 60}` : `0${time % 60}`
    }
    `;
  }
  static speedFormat(speed) {
    return `${(speed * (18 / 5)).toFixed(2)}`;
  }
  static distanceFormat(distance) {
    return `${distance.toFixed(2)}`;
  }
  static luma(color) {
    // color can be a hx string or an array of RGB values 0-255
    var rgb = typeof color === 'string' ? UI.hexToRGBArray(color) : color;
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; // SMPTE C, Rec. 709 weightings
  }

  static hexToRGBArray(color) {
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

  static createATrail(trail, isARoute = false) {
    const newTrail = document.createElement('tr');
    newTrail.id = trail.id;
    newTrail.style.background = trail.color;
    newTrail.style.color =
      UI.luma(trail.color.substring(1)) >= 165 ? '#000' : '#fff';
    if (isARoute) {
      newTrail.innerHTML = `
      <td><p class="text-nowrap">${trail.title}</p></td>
      <td><p>${UI.distanceFormat(trail.distance)}</p></td>
      <td><p>${UI.timeFormat(trail.time)}</p></td>
      <td><p>${UI.speedFormat(trail.speed)}</p></td>
      <td><p>${trail.start}</p></td>
      <td><p>${trail.end}</p></td>
    `;
    } else {
      newTrail.innerHTML = `
      <td class="position-relative ps-5"><button type="button" class="btn-close position-absolute top-50 start-0 translate-middle-y ms-1 delete" aria-label="Close"  tabindex="-1"></button><p class="text-nowrap">${
        trail.title
      }</p></td>
      <td><p>${UI.distanceFormat(trail.distance)}</p></td>
      <td><p>${UI.timeFormat(trail.time)}</p></td>
      <td><p>${UI.speedFormat(trail.speed)}</p></td>
      <td class="bg-white p-0"><input data-id=${
        trail.id
      } class="form-control border-0 p-1 mw-100 m-auto text-center fs-4 intersect start intersect" value=${
        trail.start
      }></input></td>
      <td class="bg-white p-0"><input data-id=${
        trail.id
      } class="form-control border-0 p-1 mw-100 m-auto text-center fs-4 intersect end intersect" value="${
        trail.end
      }"></input></td>
    `;
    }
    return newTrail;
  }

  static addTrailToList(trail) {
    const trailBox = document.querySelector('#trailsList table');
    const trailBody = trailBox.querySelector('.trails');
    trailBody.appendChild(UI.createATrail(trail));
  }

  static createTable() {
    let table = document.createElement('table');
    table.classList.add(
      'table',
      'table-bordered',
      'border-dark',
      'align-middle',
      'text-center'
    );
    return table;
  }

  static createHeader() {
    let head = document.createElement('thead');
    head.classList.add('table-primary', 'border-dark');
    head.innerHTML = `
      <th><p></p>Name</p></th>
      <th><p>Distance (Meters)</p></th>
      <th><p>Time (MM:SS)</p></th>
      <th><p>Speed (km/hr)</p></th>
      <th><p>Trail Start</p></th>
      <th><p>Trail End</p></th>
    `;
    return head;
  }

  static createBody() {
    let body = document.createElement('tbody');
    body.classList.add('trails');
    return body;
  }

  static createFooter(
    trailList = { trails: [], distance: 0, time: 0, speed: 0 }
  ) {
    let foot = document.createElement('tfoot');
    foot.classList.add('h5', 'bg-light');
    foot.innerHTML = `
      <td><p>Total: Number of Trails ${trailList.trails.length}</p></td>
      <td><p>${this.distanceFormat(trailList.distance)}</p></td>
      <td><p>${this.timeFormat(trailList.time)}</p></td>
      <td><p>${this.speedFormat(trailList.avgSpeed)}</p></td>
      <td></td>
      <td></td>
    `;
    return foot;
  }

  static updateFooterTotals() {
    const trailBox = document.querySelector('#trailsList table');
    const trailFooter = trailBox.querySelector('tfoot');
    const trailCSVBtn = document.querySelector('#trailsList .csv');
    const trailsObj = new Trails(Store.getTrails());
    trailsObj.total();
    const newCSVBtn = trailsObj.addCSVBtn('Save Trails To CSV');
    trailBox.replaceChild(this.createFooter(trailsObj), trailFooter);
    trailCSVBtn.parentNode.replaceChild(newCSVBtn, trailCSVBtn);
  }

  static deleteTrail(el) {
    if (el.classList.contains('delete')) {
      el.parentElement.parentElement.remove();
    }
  }

  static csvExportBtn(title, routeExport) {
    const newDownloadBtn = document.createElement('button');
    newDownloadBtn.classList.add('btn', 'btn-success', 'csv');
    newDownloadBtn.innerHTML = title;
    newDownloadBtn.onclick = function () {
      RouteUtilities.exportToCsv(title, routeExport);
    };
    return newDownloadBtn;
  }

  static routeSpinner(state) {
    const spinner = document.getElementById('route-spinner');
    spinner.style.display = state;
  }
}

// Upload files, extract object data, save data to local storage, process data, and delete files.
class Upload {
  #trails = [];
  #fileList = [];
  #formData = new FormData();

  // Get the files from the upload input form.
  async #collectFiles() {
    const files = document.querySelector('[type=file]').files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      this.#formData.append('files[]', file);
      this.#fileList.push(file['name']);
    }
  }

  // Save json or geojson files as json files to server.
  async #fetchData() {
    await fetch('../upload.php', {
      method: 'POST',
      body: this.#formData,
    });
  }

  // Get the json files and extract the properties to a trail object.
  async #fetchTrails() {
    for (let i = 0; i < this.#fileList.length; i++) {
      const splitFile = this.#fileList[i].split('.');
      const file = `../trails/${splitFile[0]}.json`;
      const res = await fetch(file);
      const data = await res.json();
      const trail = new Trail(data.features[0].properties);
      this.#trails.push(trail);
    }
  }

  // Get demo files and display them
  async fetchDemo(num) {
    for (let i = 0; i < num.length; i++) {
      const file = `../trails/${i}.geojson`;
      const res = await fetch(file);
      const data = await res.json();
      const trail = new Trail(data.features[0].properties);
      this.#trails.push(trail);
      this.#trails.forEach((trail) => Store.addTrails(trail));
      this.#updateDomWithNewTrails();
    }
  }

  // Delete the files from the server
  async #deleteFiles() {
    await fetch('../delete.php', {
      method: 'POST',
      body: this.#formData,
    });
  }

  // Perform all the functions above and more.
  async process() {
    await this.#collectFiles();
    await this.#fetchData();
    await this.#fetchTrails();
    this.#trails.forEach((trail) => Store.addTrails(trail));
    this.#updateDomWithNewTrails();
    document.getElementsByName('files[]')[0].value = '';
    await this.#deleteFiles();
  }

  // Add the uploaded trails to the dom.
  #updateDomWithNewTrails() {
    this.#trails.forEach((trail) => {
      UI.addTrailToList(trail);
    });
    UI.updateFooterTotals();
  }
}

// A state object that keeps track of whether or not all the required trails have been added to router.
class RouteUtilities {
  static buildWalkedList(trails) {
    const walked = {};
    for (let trail in trails) {
      walked[trails[trail].id] = {
        walked: 0,
        activities: trails[trail].activities,
      };
    }
    return walked;
  }

  // Creates an index of the intersections for determining what the next trail will be.
  static buildIntersectionList(trails) {
    const intersections = {};
    trails.forEach((trail) => {
      // Build a index for trail intersections
      [trail.start, trail.end].forEach((intersect) => {
        if (intersections.hasOwnProperty(intersect)) {
          // Check for trails that are loops
          if (!intersections[intersect].includes(trail)) {
            intersections[intersect].push(trail);
          }
        } else {
          intersections[intersect] = [trail];
        }
      });
    });
    localStorage.setItem('IntersectionIndex', JSON.stringify(intersections));
    return intersections;
  }

  static compareShifted(route1, route2) {
    for (let i = 0; i < route1.length; i++) {
      route2.unshift(route2.pop());
      if (route1.every((trail, index) => trail === route2[index])) {
        return true;
      }
    }
    return false;
  }

  static exportToCsv(filename, rows) {
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
}

// Calculate the shortest routes
class CalculateShortestRoute {
  constructor() {
    this.intersectionIndex;
    this.allPossibleRoutes = [];
    this.shortestRoutes = [];
    this.trails = [];
    this.counter = 0;
  }

  filterIdenticalRoutes(arrRoutes) {
    // Loop through and set route 1
    for (let i = 0; i < arrRoutes.length - 1; i++) {
      // Loop through and set route 2
      for (let j = 1; j < arrRoutes.length; j++) {
        // Routes that have the same number of trails.
        if (arrRoutes[i].trails.length === arrRoutes[j].trails.length) {
          // Create and compare a flipped version of the route being compared
          const flippedRoute = [...arrRoutes[j].trails].reverse();
          // Check if route1 is equal to route2 flipped.
          if (
            arrRoutes[i].trails.every(
              (element, index) => element === flippedRoute[index]
            )
          ) {
            arrRoutes.splice(j, 1);
            j--;
            // Check if the routes is a circle. If yes then it could be shifted
          } else if (
            arrRoutes[i].start === arrRoutes[i].end &&
            arrRoutes[j].start === arrRoutes[j].end
          ) {
            // Compare routes with one route being shifted for every trail in the route
            if (
              RouteUtilities.compareShifted(
                arrRoutes[i].trails,
                arrRoutes[j].trails
              )
            ) {
              arrRoutes.splice(j, 1);
              j--;
              // Compare routes after flipping and being shifted for every trail in the route
            } else if (
              RouteUtilities.compareShifted(arrRoutes[i].trails, flippedRoute)
            ) {
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

  whichRoutesAreShortest() {
    const shortestRoutes = this.allPossibleRoutes.reduce(
      (smallestRoutes, route) => {
        // Add route to the accumulator and reset it if the route is shorter.
        if (smallestRoutes.length === 0) {
          smallestRoutes.push(route.distance);
          smallestRoutes.push(route);
        } else if (smallestRoutes[0] === route.distance) {
          smallestRoutes.push(route);
        } else if (smallestRoutes[0] > route.distance) {
          smallestRoutes = [];
          smallestRoutes.push(route.distance);
          smallestRoutes.push(route);
        }
        // Returns: Array of shortest routes
        return smallestRoutes;
      },
      []
    );
    shortestRoutes.shift();
    this.shortestRoutes = shortestRoutes;
  }

  // Determine if all the trails have been walked
  trailsWalked(walkedTrails) {
    const trailsOnly = [];
    for (let trail in walkedTrails) {
      if (walkedTrails[trail].activities === 'hiking') {
        if (walkedTrails[trail].walked === 0) {
          trailsOnly.push(trail);
        }
      }
    }
    return trailsOnly.length === 0;
  }

  traverseTrails(route, walkedTrails, intersection) {
    // Stop recursive function if all trails have been walked
    if (this.trailsWalked(walkedTrails)) {
      const finaleRoute = new Routes(
        [...route.trails],
        [...route.intersections]
      );
      finaleRoute.setStartAndEnd();
      finaleRoute.total();
      this.allPossibleRoutes.push(finaleRoute);
    } else {
      //loop through every trail at current intersection
      if (route.trails.length < 1.2 * this.trails.length) {
        let futureTrails = this.intersectionIndex[intersection];
        futureTrails.forEach((newTrail) => {
          // Stop infinite loop. Cannot walk same trail more than twice.
          if (walkedTrails[newTrail.id].walked < 2) {
            // Find the other end of the trail.
            if (
              route.trails.length < 3 ||
              newTrail.id !== route.trails[route.trails.length - 3].id
            ) {
              if (
                newTrail.end === intersection &&
                newTrail.start !== newTrail.end
              ) {
                newTrail.end = newTrail.start;
                newTrail.start = intersection;
              }
              // add trail to route
              route.trails.push(newTrail);
              // Mark the trail as walked
              walkedTrails[newTrail.id].walked += 1;
              // Call the recursive function
              this.traverseTrails(route, walkedTrails, newTrail.end);
              // Undo stuff so the for loop will work on next iteration
              walkedTrails[newTrail.id].walked -= 1;
              route.trails.pop();
              route.intersections.pop();
            }
          }
        });
      }
    }
  }

  startEveryWhere() {
    this.allPossibleRoutes = [];
    for (let intersect in this.intersectionIndex) {
      if (this.intersectionIndex.hasOwnProperty(intersect)) {
        let walked = RouteUtilities.buildWalkedList(this.trails);
        let routes = new Routes();
        this.traverseTrails(routes, walked, intersect);
      }
    }
  }

  start() {
    this.counter = 0;
    this.trails = Store.getTrails();
    this.intersectionIndex = RouteUtilities.buildIntersectionList(this.trails);
    this.startEveryWhere();
    this.whichRoutesAreShortest();
    this.shortestRoutes = this.filterIdenticalRoutes(this.shortestRoutes);
    document.querySelector('#routes').innerHTML = '';
    this.shortestRoutes.forEach((route, index) => {
      route.addRouteToDom(index);
    });
  }

  startFrom() {
    this.counter = 0;
    this.trails = Store.getTrails();
    this.intersectionIndex = RouteUtilities.buildIntersectionList(this.trails);
    let walked = RouteUtilities.buildWalkedList(this.trails);
    let routes = new Routes();
    let intersect = document.getElementById('startingPoint').value;
    this.traverseTrails(routes, walked, intersect);
    this.whichRoutesAreShortest();
    this.shortestRoutes = this.filterIdenticalRoutes(this.shortestRoutes);
    document.querySelector('#routes').innerHTML = '';
    this.shortestRoutes.forEach((route, index) => {
      route.addRouteToDom(index);
    });
  }
}

// Add sample trails and intersections for testing and demo purposes
class Demo {
  static testIntersections = {
    straightLoop: ['1', '2', '2', '3', '3', '1'],
    triangle: ['1', '2', '1', '3', '1', '4', '4', '3'],
    parallel: ['1', '2', '2', '3', '1', '2', '1', '2'],
    parallelWithLoop: ['1', '2', '2', '3', '1', '2', '1', '1'],
    twoTrailsParallel: ['1', '2', '1', '2'],
    twoLoops: ['1', '1', '1', '1'],
    oneTrail: ['1', '1'],
    missingData: ['1', '2', '', '3', '3', '1'],
    incomplete: ['1', '2', '3', '4', '5', '1'],
    stickFigure: ['1', '1', '1', '2', '1', '3', '1', '4', '4', '5', '4', '6'],
    camden: [
      '1Q',
      '1A',
      '1A',
      '1B',
      '1A',
      '1B',
      '1B',
      '1C',
      '1C',
      '1D',
      '1D',
      '1E',
      '1E',
      '1F',
      '1F',
      '1G',
      '1F',
      '1H',
      '1H',
      '1I',
      '1I',
      '1J',
      '1J',
      '1K',
      '1K',
      '1L',
      '1L',
      '1M',
      '1L',
      '1N',
      '1N',
      '2A',
      '2A',
      '2C',
      '2C',
      '2D',
      '2D',
      '2E',
      '2E',
      '1D',
      '2F',
      '2H',
      '2D',
      '2H',
      '2D',
      '2I',
      '2H',
      '2I',
    ],
  };

  static trails = [];
  static intersectionList = [];

  // Get demo files and display them
  static async fetchDemo() {
    let trailsLength = this.intersectionList.length / 2;
    for (let i = 1; i <= trailsLength; i++) {
      const file = `../trails/${i}.geojson`;
      const res = await fetch(file);
      const data = await res.json();
      const trail = new Trail(data.features[0].properties);
      Demo.trails.push(trail);
      Store.addTrails(trail);
      UI.addTrailToList(trail);
    }
  }

  static giveRoutesTestingIntersections() {
    const intersectEL = document.querySelectorAll('.intersect');
    let index = 0;
    intersectEL.forEach((intersect) => {
      if (index < this.intersectionList.length) {
        intersect.value = this.intersectionList[index];
        index++;
      }
    });
  }

  // takes a parameter of either an array, key from testIntersections, or defaults to sickFigure.
  static async addDemoTrails(intersections) {
    if (Array.isArray(intersections)) {
      this.intersectionList = intersections;
    } else if (intersections in this.testIntersections) {
      this.intersectionList = this.testIntersections[intersections];
    } else {
      this.intersectionList = this.testIntersections['stickFigure'];
    }
    await this.fetchDemo();
    UI.updateFooterTotals();
    this.giveRoutesTestingIntersections();
    Store.saveIntersections();
  }
}

// Event Listener

// Load trails from storage and display trails table.
document.addEventListener('DOMContentLoaded', function () {
  const savedTrails = new Trails(Store.getTrails());
  const trailsTable = savedTrails.addTrailsToDom();
  trailsList = document.querySelector('#trailsList');
  trailsList.appendChild(trailsTable);
  trailsList.appendChild(savedTrails.addCSVBtn(`Save Trails To CSV`));
});

// Upload JSON or geoJSON Files Event Listener
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const upload = new Upload();
  await upload.process();
});

// Clear all the trails
document.querySelector('#delete-all-btn').addEventListener('click', () => {
  Store.clearStorage();
  location.reload();
});

// Delete individual trail
document.querySelector('#trailsList').addEventListener('click', (e) => {
  if (e.target.classList.contains('delete')) {
    // Remove book from UI
    UI.deleteTrail(e.target);
    // Remove trail from storage
    Store.removeTrail(e.target.parentElement.parentElement.id);
    // Replace the footer with updated totals
    UI.updateFooterTotals();
  }
});

// Save intersections
document
  .getElementById('intersect-btn')
  .addEventListener('click', Store.saveIntersections);

// Load Demo trails.
// Params for "addDemoTrails": straightLoop triangle parallel parallelWithLoop twoTrailsParallel twoLoops oneTrail missingData incomplete stickFigure
document.getElementById('load-sample-btn').addEventListener('click', () => {
  Demo.addDemoTrails('camden');
});
//     straightLoop triangle parallel parallelWithLoop twoTrailsParallel twoLoops oneTrail missingData incomplete stickFigure

// Calculate the shortest route
document
  .getElementById('calculate-shortest-btn')
  .addEventListener('click', () => {
    //UI.routeSpinner('.flex');
    document.getElementById('route-spinner').classList.remove('d-none');
    document.getElementById('route-spinner').classList.add('d-flex');
    requestAnimationFrame(() => {
      // fires before next repaint
      requestAnimationFrame(() => {
        // fires before the _next_ next repaint
        // ...which is effectively _after_ the next repaint
        const shortestRoutes = new CalculateShortestRoute();
        shortestRoutes.start();
        document.getElementById('route-spinner').classList.remove('d-flex');
        document.getElementById('route-spinner').classList.add('d-none');
      });
    });
  });

// Calculate the shortest route starting from a given point
document
  .getElementById('calculate-shortest-start-btn')
  .addEventListener('click', () => {
    const shortestRoutes = new CalculateShortestRoute();
    shortestRoutes.startFrom();
  });
