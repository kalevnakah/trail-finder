Problem.

One day while hiking at one of my favorite start parks I asked my self simple but crazy question. Can I hike all the trails in the park in one day? Sure it could probably be done if you stick to all the major trails and drive on the road between major sections of the Trail. But what if you took all the side trails, and connecting trails and didn't use a car on the roads? Well, one could simply attempt hike all the trails in one day and see if they succeed, but with out a good route one could find himself inefficiently back tracking causing lost time and end up not being able to complete all the trails.

Activity.

To solve this problem I needed to come up with the most efficient route. To know the most efficient route it helps to also know the distance and time of every single trail, connecting trail, and road. The state park maps are not detailed enough to get this information, so I needed to measure it. Using an app on my phone I could walk the trails and measure them. Picking the right app is crucial. The first app that I tried only gave the distance in one tenth of mile increment, which some connecting trails are much shorter than this and this app did not give me a way to export the data. The second app I tried was accurate and had the ability to export, but unfortunately was very unreliable as far as stopping and starting the GPS. The third app, Gaia GPS, met all the requirements and even had a geoJson export ability.

The next trick was to link the trails together. I gave every trail a unique number and color on the trail map. As I recorded the trails I labeled them accordingly. For each trail I can now create an array ID of the connecting trails for each end of the trail.

After collecting all the data I had the challenge of getting it from the map and the geoJson files to a combine table that could be accessed and processed by JavaScript. After doing some research I found that a geoJson and JSON file are essentially the same thing. By renaming all the files to JSON I could the use JavaScript to combine all data into one file. Alternative I could use a spreed sheet program to manipulate the data. Considering the scope of the project I am going to stick with JavaScript to do all the heavy lifting.

Using AJAX I parse all the JSON files and extract the relevant data to a consolidated array of objects. When trying to iterate through the object to run calculations I ran into null error when accessing the object. Thinking it was an aysnc issue, I update my ajax to fetch. But still had issues. I suspected this was due to the fact the object was created in a different scope that was closed and deleted from memory before accessing the array. After consulting with a friend, it turned out that array was still empty because the function that iterated through the objects was being called without an "await" and was running before the array was filled. The fix was to create IEFE with async and await to call the function. I ignorantly assumed that the next functions in the stack would not be called until after async function at the top of the stack was called. This wrong belief was enforced when I step through the debugger, but the debugger runs synchronously and not asynchronously.

After collecting the trails, the next step was to collect the intersections. I created a user interface that would allow users to fill in the intersection of the trails and save them. These than got saved as an array to trail object with the property of intersections.

With both the trails and the intersection I had to come up with clever algorithm to find all the possible routes that included every single trail. A recursive function seemed to be the best solution for this problem. In order to prevent infinite loops I came up with two requirements. First that that it stop building the trail once every trail had been added. The second was never to walk down the same trail more than two times. When looking a trail map and following this rule seemed to work out pretty good. Sample testing will be need in order to determine if there are scenarios where a trail would need to be walk three or more times in order to complete all the trails.

I ran into a few issue creating a recursive function. First it was only returning the first route and ending without looking for more routes. This turned out to be from the fact that after the calling the function inside of it's self I was not removing the added trail from the array and decreasing the number of times the trail had been walked. I learned this from a tutorial on how to build graphical trees using recursive functions. Once that was fixed, my return was giving back an empty array of routes. After some debugging, I realized that the recursive function was deconstructing it's self on the return, because I told it to remove the trails and the array object is a reference variable. The fix was to spread the array into a new array and return that array.

Now armed with a list of all possible routes, it is only matter of finding the shortest one. One would think you could just compare the sum of the lengths, but unfortunately there can be a lot of duplicates of the same route. For instance doing the same route in reverse and circular routes where starting at different intersection give you the same route. So, filtering out the longest routes, the routes still need be further filtered.

I figured that circular routes would make the most noise in the data, so that would be a good place to start. To filter a circular route one could pop and unshift one array, compare, and repeat. But before doing this it seem to be good to first check if the route was even in a circle. My array of trails in each route did not contain intersections, so I thought I could easily find the intersection by using the intersections from the first and last two trails. This resulted in a list of 4 intersections to compare and find a common denominator. After creating lots of different scenarios where routes would start and end in the same spot, I was to identify a a pattern that could be used to return true or false. As much fun as this was to solve using functions, I'm thinking the code would be a lot more efficient if objects were used to keep track of route properties, like the start and end, to be recalled later.
Will look at refactoring with OOP.

The final filtering process that I settled on was:

1. There are no exact copies to check for.
2. Check if the routes have the same number of trails.
3. If Yes....
4. Flip the route and compare.
5. Check if route starts and ends in the same place.
6. If Yes...
7. Shift the order of the route until a match is found.
8. Use the flipped route and shift through until a match is found.

If route duplicate route was found it was spliced from the list and the next trail in the list would be compared. This would repeat until every trail had been compared with every remaining trail.

I reused a lot of the code from the building the trails table to build and display the shortest routes.
I also added a button for exporting the routes to csv, so one could permanently save the route and use it later. The export CSV uses pure vanilla Javascript. The functions was borrowed from a kind contributor to the forums on the web.

The app was pretty user unfriendly. Add delete buttons on trails. A clear all button to reset the app. A Load Sample Button, so someone could test the app with pre loaded json files. And added button to save intersections and calculate the shortest routes.

The final app is about 700 lines of pure functional programming. There are a lot of haters out there for OOP and claim that OOP takes more lines of code than pure functional. My next challenge is to refactor the app with OOP and see if I get less or more than 700 lines.

OOP Refactoring.

Started out with basic list of Objects: Trail, Trails, UI, Store, and Upload.

I was able to recreate the basic functions of uploading, displaying and deleting trails with OOP. So, far I have noticed that I really like organizing code into classes. It makes it easy to see were there are redundancies. The code feels like it is a little more readable. I do see where things can feel a bit inefficient. There are times were I need to run simple function on some data, but first have to instantiate an object and then run the function on the object. It seems that if function was inline, the code would run quicker and use less memory.

After testing the program with some real world trails. IE: 100-150 trails and roads. I found that my recursive function was looping through thousands of times and it was crashing. There is a problem with the logic or there is not enough power to actual calculate the route. To complete 14 trails, recursive function ran 55,433 times. This seems a bit access, but when you look at two parallel trails can have 8 different routes for a total of 32 recursions. These numbers grow exponentially as the number trails increases and especially when intersections have more than two trails in common.

One potential solution is change the program so you have to pick a starting intersection instead of the program checking every route from every intersection. Another solution would be to change the rules to how a route is found, but I have not been able to come up with a simpler or smarter set of rules. One rule might be to abort any route that contains more than 1.5 times the original set of trails.

I created an option to start at one intersection and put a limiter of 1.1 times the number of trails. On a sample size of 14 trails this drastically reduced the calculation time and cut down on the number of recursions. But after more trails to the route I ran into the same problem of the program crashing around a million recursions. Either their needs to be yet a more efficient way or more computing power.

Preliminary Sudo Code

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
