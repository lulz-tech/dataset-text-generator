const argv = require('minimist')(process.argv.slice(2));
const easyvk = require('easyvk');
const fs = require('fs');

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
            console.info(`Getting ${currentOffset} of ${wallPostsCount} posts`);
            let posts = (await this.getWallPosts(currentOffset)).map(i => i.text);
            wallPosts.push(...posts);
            currentOffset += 100;
        }
        return wallPosts.filter(i => !!i).map(i => i.replace(new RegExp(/[\r|\n]+/, 'gi'), ''));
    }

}


(async function () {
    const grabberInstance = new vkPostsDownloader(argv.login, argv.password, argv.groupId);
    const posts = await grabberInstance.getAllWallPosts();
    fs.writeFileSync(argv.out, 'title\r\n' + posts.join('\r\n'), { encoding: 'utf8' });
})();
