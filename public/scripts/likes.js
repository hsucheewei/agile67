const likeButton = document.getElementById("likeButton");
const likesCount = document.getElementById("likesCount");
const heartEmpty = document.getElementById("heartEmpty");
const heartFilled = document.getElementById("heartFilled");
const recipeId = likeButton.getAttribute("data-recipe-id");
const hasLiked = likeButton.getAttribute("data-has-liked") === "true"; // Convert the string to a boolean

// Initialize the heart icons based on user's like status
if (hasLiked) {
  heartEmpty.style.display = "none";
  heartFilled.style.display = "inline-block";
} else {
  heartEmpty.style.display = "inline-block";
  heartFilled.style.display = "none";
}

likeButton.addEventListener("click", () => {
  // Send a POST request to the server to handle the like action
  fetch(`/recipe/${recipeId}/like`, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      // Update the likes count on the page
      likesCount.textContent = data.likes;

      // Toggle the heart icons
      if (!data.hasLiked) {
        heartEmpty.style.display = "none";
        heartFilled.style.display = "inline-block";
      } else {
        heartEmpty.style.display = "inline-block";
        heartFilled.style.display = "none";
      }
    })
    .catch((error) => {
      console.error("Error updating likes:", error);
    });
});
