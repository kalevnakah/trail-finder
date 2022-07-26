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
  constructor() {
    this.trails = [];
    this.distance = 0;
    this.time = 0;
    this.avgSpeed = 0;
  }

  addTrail(trailObj) {
    this.push(trailObj);
  }

  removeTrail(trailObj) {
    if (this.hasTrail(trailObj)) {
      this.trails.splice(this.findTrailIndex(trailObj), 1);
    }
  }

  hasTrail(trailObj) {
    return trailObj in this.trails;
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
}

// Save data to local storage
class Store {
  static getTrails() {
    let storedTrails;
    if (localStorage.getItem('trails') === null) {
      storedTrails = new Trails();
    } else {
      storedTrails = JSON.parse(localStorage.getItem('trails'));
    }
    return storedTrails;
  }

  static removeTrail(trailObj) {
    const newTrails = Store.getTrails();
    newTrails.forEach((trail, index) => {
      if (trail.id === trailObj.id) {
        newTrails.splice(index, 1);
      }
    });
    localStorage.setItem('trails', JSON.stringify(newTrails));
  }

  static addTrails(trailObj) {
    const newTrails = Store.getTrails();
    newTrails.trails.push(trailObj);
    localStorage.setItem('trails', JSON.stringify(newTrails));
  }
}

// UI Class
class UI {
  static timeFormat(time) {
    return `<p>${Math.floor(time / 60)}:${
      time % 60 > 9 ? time % 60 : 0(time % 60)
    }<\p>
    `;
  }
  static speedFormat(speed) {
    return `<p>${(speed * (18 / 5)).toFixed(2)}<\p>`;
  }
  static distanceFormat(distance) {
    return `<p>${distance.toFixed(2)}<\p>`;
  }
  static luma(color) {
    // color can be a hx string or an array of RGB values 0-255
    var rgb = typeof color === 'string' ? hexToRGBArray(color) : color;
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

  static addTrails() {}

  static createATrail(trail) {
    const newTrail = document.createElement('tr');
    newTrail.classList.add('trail-rows', 'trail');
    newTrail.id = trail.id;
    newTrail.style.background = trail.color;
    newTrail.style.color =
      UI.luma(trail.color.substring(1)) >= 165 ? '#000' : '#fff';
    newTrail.innerHTML = `
      <td class="trail-title"><a class='delete'>X</a>
      <p>${trail.title}</p></td>
      <td>${UI.distanceFormat(trail.distance)}</td>
      <td>${UI.timeFormat(trail.time)}</td>
      <td>${UI.speedFormat(trail.speed)}</td>
      <td><input data-id=${trail.id} class="intersect"></input></td>
      <td><input data-id=${trail.id} class="intersect"></input></td>
    `;
    return newTrail;
  }

  static createTable() {
    let table = document.createElement('table');
    table.classList.add('box');
    return head;
  }

  static createHeader() {
    let head = document.createElement('thead');
    head.classList.add('trails-list-head trail-rows');
    head.innerHTML = `
      <th>Name</th>
      <th>Distance (Meters)</th>
      <th>Time (MM:SS)</th>
      <th>Speed (km/hr)</th>
      <th>Trail Start</th>
      <th>Trail End</th>
    `;
    return head;
  }

  static createFooter(trailList) {
    let foot = document.createElement('tfoot');
    foot.classList.add('trail-total trail-row');
    foot.innerHTML = `
      <td class= "total-trails>Total: Number of Trails ${trailList.trails.length}</td>
      <td class="total-dist">${trailList.distance}</td>
      <td class="total-time">${trailList.time}</td>
      <td class="avg-speed">${trail.speed}</td>
    `;
    return foot;
  }

  static createATrailsList() {}

  static createARoute() {}
}

// Upload Class
class Upload {
  #trails = [];
  #fileList = [];
  #formData = new FormData();

  async #collectFiles() {
    const files = document.querySelector('[type=file]').files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      this.#formData.append('files[]', file);
      this.#fileList.push(file['name']);
    }
  }

  async #fetchData() {
    await fetch('../upload.php', {
      method: 'POST',
      body: this.#formData,
    });
  }

  async #fetchTrails() {
    for (let i = 0; i < this.#fileList.length; i++) {
      const splitFile = this.#fileList[i].split('.');
      const file = `../trails/${splitFile[0]}.json`;
      const res = await fetch(file);
      const data = await res.json();
      const trail = new Trail(data.features[0].properties);
      this.#trails.push(trail);
    }
    return this.#trails;
  }

  async #deleteFiles() {
    await fetch('../delete.php', {
      method: 'POST',
      body: this.#formData,
    });
  }

  async process() {
    await this.#collectFiles();
    await this.#fetchData();
    const trails = await this.#fetchTrails();
    trails.forEach((trail) => Store.addTrails(trail));
    //trailsToDom(trail);
    document.getElementsByName('files[]')[0].value = '';
    await this.#deleteFiles();
  }
}

// Event Listeners

// Upload JSON or geoJSON Files Event Listener
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const upload = new Upload();
  await upload.process();
});
