const fs = require("fs");

const VkPostsDownloader = require("./vk");

const launchInstanceMode = async (argv) => {
    console.log("🚦 Launching instance mode");
    const vk = new VkPostsDownloader(argv.login, argv.password, argv.groupId);
    const posts = await vk.getAllWallPosts();

    fs.writeFileSync(argv.out, "title\r\n" + posts.join("\r\n"), { encoding: "utf8" });

    console.log("✨ Dataset was written at:", argv.out);
};

module.exports = launchInstanceMode;