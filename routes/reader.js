const express = require("express");
const router = express.Router();
const assert = require("assert");

//reader homepage
router.get("/home", (req, res) => {
  // Retrieve the current banner settings from the database
  global.db.get(
    "SELECT * FROM bannerSettings WHERE id = 1",
    function (err, bannerSettingsData) {
      if (err) {
        console.error(err);
      }
      // Retrieve the published articles from the database
      global.db.all(
        "SELECT * FROM publishedArticles",
        function (err, publishedArticles) {
          if (err) {
            console.error(err);
            next(err);
          } else {
            // Render the reader-home.ejs template and pass the bannerSettingsData and publishedArticles to it
            res.render("reader-home", {
              bannerSettingsData,
              publishedArticles,
            });
          }
        }
      );
    }
  );
});

// Get request for article page template
router.get("/article", (req, res) => {
  const articleId = req.query.id; // Extract the articleId from query parameters

  global.db.get(
    // Retrieve the current banner settings from the database
    "SELECT * FROM bannerSettings WHERE id = 1",
    function (err, bannerSettingsData) {
      if (err) {
        console.error(err);
      }
      global.db.get(
        //Retrieve the article data from the publishedArticles table based on the articleId
        "SELECT * FROM publishedArticles WHERE id = ?",
        [articleId],
        function (err, articleData) {
          if (err) {
            console.error(err);
          }
          global.db.all(
            //Retrieve the comments for the published Article based on the articleId
            "SELECT * FROM comments WHERE articleId = ?",
            [articleId],
            function (err, commentsData) {
              if (err) {
                console.error(err);
              } else {
                res.render("article", {
                  bannerSettingsData,
                  articleData,
                  commentsData,
                });
              }
            }
          );
        }
      );
    }
  );
});

//post requeset for the like button
router.post("/article/likes/:id", (req, res) => {
  const articleId = req.params.id; // Extract the articleId from route parameters

  // Update the likes for the article in the publishedArticles table
  global.db.run(
    "UPDATE publishedArticles SET likes = likes + 1 WHERE id = ?",
    [articleId],
    function (err) {
      if (err) {
        console.error(err);
      } else {
        res.redirect(`/reader/article?id=${articleId}`); //inject value of article id + redirect to update the page likes
      }
    }
  );
});

//comment for post submit button req
router.post("/article/comment/:id", (req, res) => {
  const articleId = req.params.id; // Extract the articleId from route parameters
  const commentBody = req.body.commentForm; // Extract the comment body from the request body

  // Insert the comment into the comments table
  global.db.run(
    "INSERT INTO comments (commentBody, articleId) VALUES (?, ?)",
    [commentBody, articleId],
    function (err) {
      if (err) {
        console.error(err);
      } else {
        // Redirect back to the article page after successful comment submission
        res.redirect(`/reader/article?id=${articleId}`);
      }
    }
  );
});

module.exports = router;
