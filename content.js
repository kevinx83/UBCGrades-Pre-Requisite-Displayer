let currentUrl = window.location.href;
let allCourses = [];
let courseCode = null;  // Default to null, no course selected

// Loads allCourses array 
chrome.runtime.sendMessage({ type: "getAllCourses" }, (response) => {
    if (response) {
        allCourses = response; // Now you have access to the data
    } else {
        console.error("Failed to retrieve allCourses");
    }

    // Initial check for the course code when the page loads
    const match = currentUrl.match(/(?:UBC[A-Z]-\d{4}[A-Z]-)?([A-Z]{3,4})-(\d{3})/);
    courseCode = match ? match[1] + " " + match[2] : null;

    // Show info based on the initial course code found
    injectCourseInfo(courseCode);
});

// Checks for URL Changes (dynamic URL)
setInterval(() => {
    if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;

        const match = currentUrl.match(/(?:UBC[A-Z]-\d{4}[A-Z]-)?([A-Z]{3,4})-(\d{3})/);
        courseCode = match ? match[1] + " " + match[2] : null;

        injectCourseInfo(courseCode);
    }
}, 1000); // Check every 1000 milliseconds (1 second)

// Injects course info (prereqs, coreqs, etc.) into text container
function injectCourseInfo(courseCode) {
    let infoContainer = document.getElementById("course-info-container");

    // If the info container doesn't exist, create it
    if (!infoContainer) {
        infoContainer = document.createElement('div');
        infoContainer.id = "course-info-container"; // Set an ID to toggle visibility later
        infoContainer.style.position = 'fixed';
        infoContainer.style.bottom = '50px';
        infoContainer.style.left = '20px';
        infoContainer.style.padding = '15px';
        infoContainer.style.backgroundColor = '#fff';
        infoContainer.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
        infoContainer.style.zIndex = '9999';
        infoContainer.style.display = 'none'; // Initially hidden

        // Add course details (initial placeholders)
        const name = document.createElement('p');
        name.id = 'course-name';
        name.innerHTML = `<strong>Course:</strong> No course selected`;
        infoContainer.appendChild(name);

        const description = document.createElement('p');
        description.id = 'course-description';
        description.innerHTML = `<strong>Description:</strong> N/A`;
        infoContainer.appendChild(description);

        const prereqs = document.createElement('p');
        prereqs.id = 'course-prereqs';
        prereqs.innerHTML = `<strong>Prerequisites:</strong> No prerequisites.`;
        infoContainer.appendChild(prereqs);

        const coreqs = document.createElement('p');
        coreqs.id = 'course-coreqs';
        coreqs.innerHTML = `<strong>Corequisites:</strong> No corequisites.`;
        infoContainer.appendChild(coreqs);

        // Append the info container to the body
        document.body.appendChild(infoContainer);
    }

    if (courseCode && allCourses.length > 0) {
        const course = allCourses.find(course => course.code === courseCode);

        if (course) {
            // Update the info container with course details
            document.getElementById('course-name').innerHTML = `<strong>Course:</strong> ${course.code}: ${course.name}`;
            document.getElementById('course-description').innerHTML = `<strong>Description:</strong> ${course.desc}`;
            document.getElementById('course-prereqs').innerHTML = `<strong>Prerequisites:</strong> ${course.prer || 'No prerequisites.'}`;
            document.getElementById('course-coreqs').innerHTML = `<strong>Corequisites:</strong> ${course.crer || 'No corequisites.'}`;
        }
    } else {
        // No course selected, show default message
        document.getElementById('course-name').innerHTML = `<strong>Course:</strong> No course selected`;
        document.getElementById('course-description').innerHTML = `<strong>Description:</strong> N/A`;
        document.getElementById('course-prereqs').innerHTML = `<strong>Prerequisites:</strong> N/A`;
        document.getElementById('course-coreqs').innerHTML = `<strong>Corequisites:</strong> N/A`;
    }
}

// Create a toggle button if it doesn't exist
let toggleButton = document.getElementById("toggle-course-info");
if (!toggleButton) {
    toggleButton = document.createElement('button');
    toggleButton.id = "toggle-course-info";
    toggleButton.textContent = 'Toggle Prerequisite Info';
    toggleButton.style.position = 'fixed';
    toggleButton.style.bottom = '20px';
    toggleButton.style.left = '20px';
    toggleButton.style.padding = '10px';
    toggleButton.style.backgroundColor = '#f0546c';
    toggleButton.style.color = '#fff';
    toggleButton.style.border = 'none';
    toggleButton.style.borderRadius = '5px';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '10000';

    // Event listener to toggle visibility
    toggleButton.addEventListener('click', () => {
        const infoContainer = document.getElementById("course-info-container");
        if (infoContainer) {
            // Toggle display of the course info container
            infoContainer.style.display = infoContainer.style.display === 'none' ? 'block' : 'none';
        }
    });

    // Append the toggle button to the body
    document.body.appendChild(toggleButton);
}
