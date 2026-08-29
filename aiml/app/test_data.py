import csv
from pathlib import Path


DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "destinations.csv"


with open(DATA_FILE, "r", encoding="utf-8") as file:
    destinations = list(csv.DictReader(file))


print(f"Number of destinations: {len(destinations)}")

for destination in destinations[:3]:
    print(destination)