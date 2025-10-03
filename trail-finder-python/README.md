# Trail Finder (Python Version)

This script is a Python-based implementation of the Trail Finder application, designed to find the most efficient route that covers a set of hiking trails. It loads trail data from `.geojson` files and uses a predefined set of trail intersections to calculate all possible routes, ultimately identifying the one with the shortest total distance.

## How to Run the Script

To run the trail finder, execute the `main.py` script from the root directory of the project:

```bash
python3 trail-finder-python/main.py
```

The script will load the trail data from the `trails/` directory and the intersection data from `trail-finder-python/intersections.json`. It will then perform the route-finding calculation and print the shortest route to the console.

## `intersections.json` Format

The `intersections.json` file defines how the trails are connected. It is a JSON object where each key represents a trail ID, and the value is an array of IDs of the trails it connects to.

**Example:**

```json
{
    "1": ["2", "5"],
    "2": ["1", "3", "6"],
    "3": ["2", "4", "7"]
}
```

In this example:
- Trail `1` connects to trails `2` and `5`.
- Trail `2` connects to trails `1`, `3`, and `6`.

The route-finding algorithm uses these connections to determine the possible paths from one trail to the next. For the purpose of this demonstration, only a small subset of trails has been included in the `intersections.json` file.