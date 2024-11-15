let allCourses = [];

// Load the JSON data (assuming you have access to fetch it in your extension)
fetch(chrome.runtime.getURL('allCourses.json'))
  .then(response => response.json())
  .then(data => {
    allCourses = data;
  })
  .catch(error => console.error("Error loading JSON:", error));

// Listen for messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getAllCourses") {
    sendResponse(allCourses); // Send the data back to content.js
  }
});