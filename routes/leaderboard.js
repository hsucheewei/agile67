const express = require("express");
const router = express.Router();
const assert = require("assert");

const likeCount = 1;

router.get("/leaderboard", (req, res) => {
    res.render("likes-content", { likeCount });
});

router.post("/leaderboard", (req, res) => {
    likeCount++;
    res.json({ likeCount });
});


module.exports = router;