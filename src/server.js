
const express = require("express");
const app = express();

const VkPostsDownloader = require("./vk");

const launchServerMode = async (argv) => {
    app.get("/getDataset", async function (req, res) {
        if (!req.query.login || !req.query.password || !req.query.groupId) {
            res.end("Please provide all of login, password and gorupId params");
            return false;
        }
        const grabberInstance = new VkPostsDownloader(req.query.login, req.query.password, req.query.groupId);
        const posts = await grabberInstance.getAllWallPosts();
        res.end(JSON.stringify(posts));
    });

    app.listen(argv.port, () => {
        console.log("✨ Generator listening on port", argv.port);
    });
};

module.exports = launchServerMode;