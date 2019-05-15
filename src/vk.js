const easyvk = require("easyvk");

/**
 * @typedef  {Object}   WallPost
 * 
 * @property {Object}   activity - Activity around post
 * @property {Object}   activity.likes - Likes of post
 * @property {Number}   activity.likes.count - Number of likes
 * @property {String}   activity.likes.text - Text of 'likes' line
 * @property {Number[]} activity.likes.user_ids - First 3 users that liked post
 * @property {String}   activity.type - Type of activity
 * @property {Boolean}  can_archive - Can current user archive the post
 * @property {Boolean}  can_delete - Can current user delete the post
 * @property {Boolean}  can_pin - Can current user pin the post
 * @property {Number}   date - Timestamp of posting date
 * @property {Number}   from_id - Original author of post
 * @property {Number}   id - ID of post
 * @property {Boolean}  is_archived - Is the post archived
 * @property {Number}   owner_id - ID of post owner
 * @property {String}   text - Text of post
 *
 */
class VkPostsDownloader {

    /**
     * @constructor
     * @description Class constructor
     *
     * @param {String} login    - VK username or login
     * @param {String} password - VK password
     * @param {Number} groupId  - Number identifier of group (negative number, starts with '-') or user (positive number)
     * @this VkPostsDownloader
     */

    constructor(login, password, groupId) {
        this._vkInstance = null;
        this.login = login;
        this.password = password;
        this.groupId = groupId;
    }

    /**
     * @description Get EasyVK Instance as a singleton
     * @returns {Promise<EasyVK>}
     */
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

    /**
     * @description Get posts count on user's wall
     * 
     * @returns {Promise<Number>}
     */
    async getWallPostsCount() {
        const vk = await this.getVkInstance();
        const fakeWallPost = await vk.call("wall.get",
            {
                owner_id: this.groupId,
                offset: 0,
                count: 1,
                filter: "all",
            });
        return fakeWallPost.vkr.count;
    }

    /**
     * @description Get 100 posts of user or group starting form 'offset'
     * 
     * @param {Number} offset - offset of posts
     * 
     * @returns {Promise<WallPost[]>}
     */
    async getWallPosts(offset) {
        const vk = await this.getVkInstance();
        const wallPosts = await vk.call("wall.get",
            {
                owner_id: this.groupId,
                offset: offset || 0,
                count: 100
            });
        return wallPosts.vkr.items;
    }

    /**
     * @description Get all wall posts.
     * 
     * @returns {Promise<String[]>}
     */
    async getAllWallPosts() {
        const wallPosts = [];
        const wallPostsCount = await this.getWallPostsCount();
        let currentOffset = 0;
        while (currentOffset <= wallPostsCount) {
            console.info(`📝 Getting ${currentOffset} of ${wallPostsCount} posts`);
            let posts = (await this.getWallPosts(currentOffset)).map(i => {
                const text = i.text.trim();
                return text.charAt(0).toUpperCase() + text.slice(1);
            });

            wallPosts.push(...posts);
            currentOffset += 100;
        }
        return wallPosts.filter(i => !!i).map(i => i.replace(new RegExp(/[\r|\n]+/, "gi"), ""));
    }

}

module.exports = VkPostsDownloader;
