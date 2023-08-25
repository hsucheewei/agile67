const likeButton = document.getElementById("likeButton");
const likesCount = document.getElementById("likesCount");
const recipeId = likeButton.getAttribute("data-recipe-id");

likeButton.addEventListener("click", () => {
  // Send a POST request to the server to handle the like action
  fetch(`/recipe/${recipeId}/like`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      // Update the likes count on the page
      likesCount.textContent = data.likes;
    })
    .catch((error) => {
      console.error("Error updating likes:", error);
    });
});
