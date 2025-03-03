document.addEventListener("DOMContentLoaded", function () {
  const discoverProjectsWrapper = document.getElementById("discover-projects");
  const projectCards = discoverProjectsWrapper.querySelectorAll(".g_projects_item_wrap");

  // Get the current project path (e.g. "/projects/siren-x1")
  const currentProjectPath = window.location.pathname;

  // Filter out the current project
  const availableProjects = discoverMoreProjects.filter((project) => project.link !== currentProjectPath);

  // Helper function to get random projects
  function getRandomProjects(projects, count) {
    // Shuffle the projects array using sort and Math.random
    const shuffled = projects.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Get two random projects from the filtered list
  const randomProjects = getRandomProjects(availableProjects, 2);

  // Update each card with project details
  projectCards.forEach((card, index) => {
    const project = randomProjects[index];
    if (!project) return; // Skip adding card if no project

    const titleElement = card.querySelector("h3");
    const imgElement = card.querySelector("img");
    const linkElement = card.querySelector("a");

    if (titleElement) titleElement.textContent = project.name;
    if (imgElement) imgElement.src = project.thumbnail;
    if (linkElement) linkElement.href = project.link;
  });
});
