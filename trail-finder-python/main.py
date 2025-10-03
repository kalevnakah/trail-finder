import os
import json

class Trail:
    """A class to represent a single trail."""
    def __init__(self, trail_id, name, distance, time):
        self.id = trail_id
        self.name = name
        self.distance = distance
        self.time = time
        self.walked = 0

    def __repr__(self):
        return f"Trail(id={self.id}, name='{self.name}', distance={self.distance:.2f}, time={self.time:.2f})"

def load_trails_from_directory(directory):
    """Loads all trail data from geojson files in a given directory."""
    trails = {}
    trail_files = [f for f in os.listdir(directory) if f.endswith('.geojson')]

    for filename in trail_files:
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r') as f:
            data = json.load(f)

        # Extract relevant properties from the geojson file
        properties = data['features'][0]['properties']
        trail_id = os.path.splitext(filename)[0]
        name = properties.get('title', f"Trail {trail_id}")
        distance = properties.get('distance', 0)
        time = properties.get('total_time', 0)

        trails[trail_id] = Trail(trail_id, name, distance, time)

    return trails

def load_intersections(filepath):
    """Loads trail intersections from a JSON file."""
    with open(filepath, 'r') as f:
        intersections = json.load(f)
    return intersections

def find_routes_recursive(current_trail_id, current_route, all_trails, intersections, found_routes, trails_to_visit):
    """Recursively finds all possible routes that visit every trail."""

    # Check if all required trails have been visited
    if set(trails_to_visit.keys()).issubset(set(t.id for t in current_route)):
        found_routes.append(list(current_route)) # Add a copy of the route
        return

    # Performance constraint: Stop if the route becomes excessively long
    if len(current_route) > len(trails_to_visit) * 2:
        return

    # Get potential next trails from the current intersection
    next_possible_trails = intersections.get(current_trail_id, [])

    for next_trail_id in next_possible_trails:
        if next_trail_id in all_trails:
            # Constraint: Don't walk the same trail more than twice
            if all_trails[next_trail_id].walked < 2:

                # Update trail state for the next recursive call
                all_trails[next_trail_id].walked += 1
                current_route.append(all_trails[next_trail_id])

                find_routes_recursive(next_trail_id, current_route, all_trails, intersections, found_routes, trails_to_visit)

                # Backtrack: Revert the changes for exploring other paths
                current_route.pop()
                all_trails[next_trail_id].walked -= 1

def calculate_route_stats(route):
    """Calculates the total distance and time for a given route."""
    total_distance = sum(trail.distance for trail in route)
    total_time = sum(trail.time for trail in route)
    return total_distance, total_time

if __name__ == "__main__":
    print("Trail Finder Python script is running.")

    trails_directory = 'trails/'
    all_trails = load_trails_from_directory(trails_directory)

    intersections_filepath = 'trail-finder-python/intersections.json'
    intersections = load_intersections(intersections_filepath)

    # For this demonstration, we'll only work with the trails defined in intersections.json
    trails_to_visit = {tid: all_trails[tid] for tid in intersections.keys() if tid in all_trails}

    print(f"Loaded {len(all_trails)} trails and {len(intersections)} intersections.")
    print(f"Starting route finding for {len(trails_to_visit)} trails...")

    found_routes = []
    # Start the search from the first trail in our list
    start_trail_id = list(trails_to_visit.keys())[0]
    start_trail = trails_to_visit[start_trail_id]

    start_trail.walked = 1
    initial_route = [start_trail]

    find_routes_recursive(start_trail_id, initial_route, trails_to_visit, intersections, found_routes, trails_to_visit)

    print(f"\nFound {len(found_routes)} possible routes.")

    if not found_routes:
        print("No routes were found that visit all trails.")
    else:
        # Calculate stats for all routes and find the shortest one
        shortest_route = None
        shortest_distance = float('inf')

        for route in found_routes:
            distance, time = calculate_route_stats(route)
            if distance < shortest_distance:
                shortest_distance = distance
                shortest_route = route

        # Display the shortest route
        shortest_time = calculate_route_stats(shortest_route)[1]
        print("\n--- Shortest Route Found ---")
        print(f"Total Distance: {shortest_distance:.2f} meters")
        print(f"Total Time: {shortest_time / 60:.2f} minutes")
        print(f"Number of trails in route: {len(shortest_route)}")
        print("Trail sequence:")
        for trail in shortest_route:
            print(f"  - {trail.name} (ID: {trail.id})")