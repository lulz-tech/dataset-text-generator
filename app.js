const argv = require('minimist')(process.argv.slice(2));
const easyvk = require('easyvk');
const fs = require('fs');
const express = require('express');

const app = express();

if( !argv.mode ||
    ['instance', 'microservice'].indexOf(argv.mode)===-1 ||
    (argv.mode === 'instance' && (!argv.login || !argv.password || !argv.out || !argv.groupId)) ||
    (argv.mode === 'microservice' && (!argv.port)))
    {
        console.log(`
Usage: node app.js [options]
        
Options:
--mode: 'instance' for offline mode or 'microservice' for server mode (required)
--port Port number for microservice (required if --mode=microservice)
--login VK Login (required if --mode=instance)
--password VK Password (required if --mode=instance)
--out Output filename (required if --mode=instance)
--groupId ID of group or user to parse (required if --mode=instance)

Example:
node app.js --mode=instance --login=+79123456789 --password=MyPass --out=dataset.txt
node app.js --mode=microservice --port=8080
`)
        process.exit(0);
    }
class vkPostsDownloader {
    constructor(login, password, groupId) {
        this._vkInstance = null;
        this.login = login;
        this.password = password;
        this.groupId = groupId;

    }
    async getVkInstance() {
        if (this._vkInstance) {
            return this._vkInstance;
        }

        this._vkInstance = await easyvk({
            username: this.login,
            password: this.password,
            save_session: false
        });

        return this._vkInstance;
    }


    async getWallPostsCount() {
        const vk = await this.getVkInstance();
        const fakeWallPost = await vk.call('wall.get',
            {
                owner_id: this.groupId,
                offset: 0,
                count: 1,
                filter: 'all',
            });
        return fakeWallPost.vkr.count;
    }

    async getWallPosts(offset) {
        const vk = await this.getVkInstance();
        const wallPosts = await vk.call('wall.get',
            {
                owner_id: this.groupId,
                offset: offset || 0,
                count: 100
            });
        return wallPosts.vkr.items;
    }

    async getAllWallPosts() {
        const wallPosts = [];
        const wallPostsCount = await this.getWallPostsCount();
        let currentOffset = 0;
        while (currentOffset <= wallPostsCount) {
            console.info(`📝 Getting ${currentOffset} of ${wallPostsCount} posts`);
            let posts = (await this.getWallPosts(currentOffset)).map(i => i.text);
            wallPosts.push(...posts);
            currentOffset += 100;
        }
        return wallPosts.filter(i => !!i).map(i => i.replace(new RegExp(/[\r|\n]+/, 'gi'), ''));
    }

}

if(argv.mode==='instance'){
    (async function () {
        console.log("🚦 Launching");
        const grabberInstance = new vkPostsDownloader(argv.login, argv.password, argv.groupId);
        const posts = await grabberInstance.getAllWallPosts();
        fs.writeFileSync(argv.out, 'title\r\n' + posts.join('\r\n'), { encoding: 'utf8' });
        console.log("✨ Dataset was written at:", argv.out);
    })();
}

if(argv.mode==='microservice'){
    app.get('/getDataset', async function (req, res) {
        if(!req.query.login || !req.query.password || !req.query.groupId){
            res.end('Please provide all of login, password and gorupId params');
            return false;
        }
        const grabberInstance = new vkPostsDownloader(req.query.login, req.query.password, req.query.groupId);
        const posts = await grabberInstance.getAllWallPosts();
        res.end(JSON.stringify(posts));
    });

    app.listen(argv.port, function () {

    });
}

