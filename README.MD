Problem.

One day while hiking at one of my favorite start parks I asked my self simple but crazy question. Can I hike all the trails in the park in one day? Sure it could probably be done if you stick to all the major trails and drive on the road between major sections of the Trail. But what if you took all the side trails, and connecting trails and didn't use a car on the roads? Well, one could simply attempt hike all the trails in one day and see if they succeed, but with out a good route one could find himself inefficiently back tracking causing lost time and end up not being able to complete all the trails.

Activity.

To solve this problem I needed to come up with the most efficient route. To know the most efficient route it helps to also know the distance and time of every single trail, connecting trail, and road. The state park maps are not detailed enough to get this information, so I needed to measure it. Using an app on my phone I could walk the trails and measure them. Picking the right app is crucial. The first app that I tried only gave the distance in one tenth of mile increment, which some connecting trails are much shorter than this and this app did not give me a way to export the data. The second app I tried was accurate and had the ability to export, but unfortunately was very unreliable as far as stopping and starting the GPS. The third app, Gaia GPS, met all the requirements and even had a geoJson export ability.

The next trick was to link the trails together. I gave every trail a unique number and color on the trail map. As I recorded the trails I labeled them accordingly. For each trail I can now create an array ID of the connecting trails for each end of the trail.

After collecting all the data I had the challenge of getting it from the map and the geoJson files to a combine table that could be accessed and processed by JavaScript. After doing some research I found that a geoJson and JSON file are essentially the same thing. By renaming all the files to JSON I could the use JavaScript to combine all data into one file. Alternative I could use a spreed sheet program to manipulate the data. Considering the scope of the project I am going to stick with JavaScript to do all the heavy lifting.

Using AJAX I parse all the JSON files and extract the relevant data to a consolidated array of objects. When trying to iterate through the object to run calculations I ran into null error when accessing the object. I suspected this was due to the fact the object was created in a different scope that was closed and deleted from memory before accessing the array. After switching my testing environment from VS Code live server to XAMPP the issue was resolved.

Sudo Code

// extract useful data from JSON
function extractData(file)
fetch the json
parse the json
create a new object
populate new object with only the properties that I want
return the new object

//create an array of all the json file names
function getFileNames{
???
return array of file names
}

//iterate through all the files and build the new trails list
function compileTrails(fileNames) {
trails = [];
for each file in fileNames {
extractData(file);
append new trail to array
}
return trails;
}

routeList = []
//recursively find all route patterns
function findRoutes(start) {
route = []
if filter start.trails(walked=false) does not equal null {
for each trail not walked {
add trail to route
get newStart point
findRoutes(newStart)
}
} else if allTrailsWalked() = false
for each trail {
add trail to route
get newStart point
findRoutes(newStart)
}
} else
add route to routeList
}

//check if all trails have been walked
functions allTrailWalked {
return trails.reduced(walked = true)
}

//find the total time/distance of route
for each route in routes
totalDist = '';
for each trail in route
totalDist += trail distance
add totalDist to route

//find shortest route
reduce.routes by total distance or time

//display shortest route
for each trail in shortest route
update dom div
trail.name
trail.dist
trail.tim
update dom div
route.totalDist
route.totalTime
