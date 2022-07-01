const trails = [
  {
    id: '5d76d4591adc264fe561d9c4e0b0162c09e162a5',
    updated_date: '2022-05-28T19:43:35Z',
    time_created: '2022-05-28T17:29:16Z',
    last_updated_on_server: '2022-05-28T21:07:12.199',
    db_insert_date: '2022-05-28T19:10:59Z',
    deleted: false,
    title: '10.1 CSP 5/28/22 12:29:16 PM',
    public: false,
    color: '#5E7A8C',
    hexcolor: '#5E7A8C',
    is_active: true,
    revision: 1653772032,
    notes: '',
    track_type: '',
    routing_mode: '',
    uploaded_gpx_to_osm: null,
    flag: null,
    source: 'Android google Pixel 6 Pro',
    cover_photo_id: null,
    distance: 78.62647282270385,
    total_ascent: 0,
    total_descent: 0,
    stopped_time: 0,
    total_time: 65,
    average_speed: 1.209638043426213,
    moving_time: 65,
    moving_speed: 1.209638043426213,
    activities: ['hiking'],
    imported: false,
    folder: '030fbd9f91f5bb56da533cd4b357ba9cd02fce75',
    preferred_link: '/public/PwcrBJWGWEdXb3uQF0r6Z1IB',
    favorite_count: 0,
    comment_count: 0,
    comments: [],
    user_photo_count: 0,
    latitude: 44.371794079508895,
    longitude: -95.92511070068775,
    writable: false,
  },
];

// var Trail = function () {
//   if (!(this instanceof Node)) return new Node(name, isOkay, rotation);
//   else {
//     this.title = '';
//     this.distance = 0.0;
//     this.total_time = 0;
//     this.average_speed = 0.0;
//     this.notes = '';
//   }
// };

async function extractData(file) {
  //const trail = {};
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = await function () {
    if (this.readyState == 4 && this.status == 200) {
      //parse the JSON
      var response = JSON.parse(xhttp.responseText);
      //Drill down to the trails properties
      addTrail(response.features[0].properties);
    }
  };
  xhttp.open('GET', file, true);
  xhttp.send();
}

// Add trail to array
function addTrail(trail) {
  trails.push(trail);
}

//iterate through all the files and build the new trails list
function compileTrails(numOfFiles) {
  for (let i = 1; i <= numOfFiles; i++) {
    let file = `trails/${i}.json`;
    const trail = extractData(file);
  }
}

compileTrails(43);

//find the total distance and time of route
function routeTotal(route) {
  let totalDistance = 0;
  let totalTime = 0;
  let totalSpeed = 0;
  console.log(route);
  for (let i in route) {
    console.log(route[i]);
    totalDistance += route[i].distance;
    totalTime += route[i].total_time;
    totalSpeed += route[i].average_speed;
  }
  let averageSpeed = totalSpeed / route.length;
  return [totalDistance, totalTime, averageSpeed];
}

console.log(trails);
console.log(routeTotal(trails));
//routeTotal(trails);
//const trailTotals = routeTotal(trailsDir);
//let distance = trails[0].title;
//console.log(trails);

//console.log(JSON.stringify(trails[0]));
//let trailString = ;
//console.log(trails[0]);

//document.getElementById('container').innerHTML = JSON.stringify(trails);

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
