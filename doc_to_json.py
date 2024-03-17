from docx import Document

# Replace 'your_document.docx' with the path to your actual DOCX file
doc_path = "assets/repollinate.docx"

# Load the DOCX file
doc = Document(doc_path)

projects = []  # List to store projects data

# Assuming the document contains at least one table with the required data
for table in doc.tables:
    for row in table.rows[1:]:  # Skipping the header row
        project_data = {
            "value": row.cells[0].text,
            "text": row.cells[1].text,
            "lat/long": row.cells[2].text,
            "area": row.cells[3].text,
            "description": row.cells[4].text,
            "what_was_planted": row.cells[5].text,
        }
        if len(table.columns) == 7:
            project_data["funder"] = row.cells[6].text
        projects.append(project_data)


# Initialize an empty list for the formatted projects
formatted_projects = []
default_funder = "The Scottish Bee Company"

for project in projects:
    # Ensure 'funder' is set to "The Scottish Bee Company" if empty or contains non-funder text
    project_funder = project.get("funder", default_funder)

    project_photos = [
        "assets/project_images/project_name/1.png",
        "assets/project_images/project_name/2.png",
    ]
    project_coords = project.get("lat/long", "55.9533, 3.1883").split(",")
    project["lat"] = float(project_coords[0])
    project["lng"] = float(project_coords[1])

    # Format the project data
    formatted_project = {
        "value": project["value"],
        "text": project["text"],
        "lat": project["lat"],
        "lng": project["lng"],
        "description": project["description"],
        "area": project["area"],
        "funder": project_funder,
        "photos": project_photos,  # Ensure this is a list
        "what_was_planted": project["what_was_planted"],
    }
    formatted_projects.append(formatted_project)

# Display the first 2 formatted projects for brevity
formatted_projects[:2]


import json

# Convert the formatted projects list to JSON
json_data = json.dumps(formatted_projects, indent=4)

# Print the JSON data
print(json_data)

# Optionally, save the JSON data to a file
with open("assets/projects.json", "w") as f:
    f.write(json_data)
