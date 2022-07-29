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

  addTrailsToDom() {
    this.total();
    const trailBox = UI.createTable();
    const trailBody = UI.createBody();
    this.trails.forEach((trail) => {
      trailBody.appendChild(UI.createATrail(trail));
    });
    trailBox.appendChild(UI.createHeader());
    trailBox.appendChild(trailBody);
    trailBox.appendChild(UI.createFooter(this));
    return trailBox;
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

  static createATrail(trail) {
    const newTrail = document.createElement('tr');
    newTrail.classList.add('trail-rows', 'trail');
    newTrail.id = trail.id;
    newTrail.style.background = trail.color;
    newTrail.style.color =
      UI.luma(trail.color.substring(1)) >= 165 ? '#000' : '#fff';
    newTrail.innerHTML = `
      <td class="trail-title"><a class='delete'>X</a><p>${trail.title}</p></td>
      <td><p>${UI.distanceFormat(trail.distance)}</p></td>
      <td><p>${UI.timeFormat(trail.time)}</p></td>
      <td><p>${UI.speedFormat(trail.speed)}</p></td>
      <td><input data-id=${trail.id} class="intersect start" value=${
      trail.start
    }></input></td>
      <td><input data-id=${trail.id} class="intersect end" value="${
      trail.end
    }"></input></td>
    `;
    return newTrail;
  }

  static addTrailToList(trail) {
    const trailBox = document.querySelector('#trailsList table');
    const trailBody = trailBox.querySelector('.trails');
    trailBody.appendChild(UI.createATrail(trail));
  }

  static createTable() {
    let table = document.createElement('table');
    table.classList.add('box');
    return table;
  }

  static createHeader() {
    let head = document.createElement('thead');
    head.classList.add('trails-list-head', 'trail-rows');
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
    body.classList.add('trails', 'trail-rows');
    return body;
  }

  static createFooter(
    trailList = { trails: [], distance: 0, time: 0, speed: 0 }
  ) {
    let foot = document.createElement('tfoot');
    foot.classList.add('trail-total', 'trail-rows');
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
    const trailsObj = new Trails(Store.getTrails());
    trailsObj.total();
    trailBox.replaceChild(this.createFooter(trailsObj), trailFooter);
  }

  static deleteTrail(el) {
    if (el.classList.contains('delete')) {
      el.parentElement.parentElement.remove();
    }
  }

  static createARoute() {}
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
      const file = `../trails/${i}.json`;
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
  };

  static trails = [];
  static intersectionList = [];

  // Get demo files and display them
  static async fetchDemo() {
    let trailsLength = this.intersectionList.length / 2;
    for (let i = 1; i <= trailsLength; i++) {
      const file = `../trails/${i}.json`;
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
    console.log(intersections in this.testIntersections);
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
  document.querySelector('#trailsList').appendChild(trailsTable);
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
document.getElementById('load-sample-btn').addEventListener('click', () => {
  Demo.addDemoTrails();
});
