let currentUrl = window.location.href;
let allCourses = [];
let courseCode = null;
let dataLoaded = false;

// Create and set up the info container
let infoContainer = document.createElement('div');
infoContainer.id = "course-info-container";
infoContainer.style.position = 'fixed';
infoContainer.style.bottom = '50px';
infoContainer.style.left = '20px';
infoContainer.style.padding = '15px';
infoContainer.style.backgroundColor = '#fff';
infoContainer.style.boxShadow = '0px 4px 6px rgba(0, 0, 0, 0.1)';
infoContainer.style.zIndex = '9999';
infoContainer.style.display = 'none'; // Hidden by default
document.body.appendChild(infoContainer);

// Load allCourses array and update course info when ready
chrome.runtime.sendMessage({ type: "getAllCourses" }, (response) => {
    if (response) {
        allCourses = response;
        dataLoaded = true;
        checkAndInjectCourseInfo(); // Try to inject course info once data is loaded
    } else {
        console.error("Failed to retrieve allCourses");
    }
});

// Use MutationObserver to detect URL changes
const observer = new MutationObserver(() => {
    if (currentUrl !== window.location.href) {
        currentUrl = window.location.href;
        if (dataLoaded) {
            checkAndInjectCourseInfo();
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// Function to check and inject course info
function checkAndInjectCourseInfo() {
    const match = currentUrl.match(/(?:UBC[A-Z]-\d{4}[A-Z]-)?([A-Z]{3,4})-(\d{3})/);
    courseCode = match ? match[1] + " " + match[2] : null;
    injectCourseInfo(courseCode);
}

// Inject course info (prereqs, coreqs, etc.) into the container
function injectCourseInfo(courseCode) {
    if (courseCode && allCourses.length > 0) {
        const course = allCourses.find(course => course.code === courseCode);

        if (course) {
            infoContainer.innerHTML = `
                <p><strong>Course:</strong> ${course.code}: ${course.name}</p>
                <p><strong>Description:</strong> ${course.desc}</p>
                <p><strong>Prerequisites:</strong> ${course.prer || 'No prerequisites.'}</p>
                <p><strong>Corequisites:</strong> ${course.crer || 'No corequisites.'}</p>
            `;
        } else {
            // Custom message for missing course data
            infoContainer.innerHTML = `
                <p><strong>Course:</strong> ${courseCode}</p>
                <p>No data available for ${courseCode}.</p>
            `;
        }
    } else {
        // Default message when no course code or data is not loaded
        infoContainer.innerHTML = `
            <p><strong>Course:</strong> <em>No course selected</em></p>
            <p><strong>Note:</strong> Please refresh the page if course info is not displaying</p>
        `;
    }
}

// Create the toggle button and event listener (untoggled by default)
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

    // Initially, the button should toggle the course info visibility OFF (hidden)
    toggleButton.addEventListener('click', () => {
        const currentDisplay = infoContainer.style.display;
        // Toggle the info container visibility
        infoContainer.style.display = currentDisplay === 'none' ? 'block' : 'none';
    });

    document.body.appendChild(toggleButton);
}
