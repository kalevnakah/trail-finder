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
    if (this.trails.length > 0) {
      this.distance = 0;
      this.time = 0;
      this.avgSpeed = 0;
      let totalSpeed = 0;
      for (let i in this.trails) {
        this.distance += this.trails[i].distance;
        this.time += this.trails[i].time;
        totalSpeed += this.trails[i].avgSpeed;
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

// Upload Class
class Upload {
  constructor(element) {
    this.element = element;
    this.formData = new FormData();
    this.fileList = [];
    this.trails = [];
  }

  async collectFiles() {
    const files = document.querySelector('[type=file]').files;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      this.formData.append('files[]', file);
      this.fileList.push(file['name']);
    }
  }

  async fetchData() {
    await fetch('../upload.php', {
      method: 'POST',
      body: this.formData,
    });
  }

  async fetchTrails() {
    for (let i = 0; i < this.fileList.length; i++) {
      const splitFile = this.fileList[i].split('.');
      const file = `../trails/${splitFile[0]}.json`;
      const res = await fetch(file);
      const data = await res.json();
      const trail = new Trail(data.features[0].properties);
      this.trails.push(trail);
    }
    return this.trails;
  }

  async deleteFiles() {
    await fetch('../delete.php', {
      method: 'POST',
      body: this.formData,
    });
  }
}

// Event Listeners

// Upload JSON or geoJSON Files
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const upload = new Upload(e);

  await upload.collectFiles();
  await upload.fetchData();
  const trails = await upload.fetchTrails();
  trails.forEach((trail) => Store.addTrails(trail));
  //trailsToDom(trail);
  //Trails.total

  document.getElementsByName('files[]')[0].value = '';

  await upload.deleteFiles();
});
