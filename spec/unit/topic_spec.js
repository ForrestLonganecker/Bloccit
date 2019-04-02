const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("Topic", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        this.user;
        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: "rock@climber.com",
                password: "boulderfields"
            })
            .then((user) => {
                this.user = user;
                Topic.create({
                    title: "My first V0",
                    description: "Stories from that first V0 send",
                    posts: [{
                        title: "Trask at Carver",
                        body: "It was mossy but I loved every second of it",
                        userId: this.user.id
                    }]
                }, {
                    include: {
                        model: Post,
                        as: "posts"
                    }
                })
                .then((topic) => {
                    this.topic = topic;
                    this.post = topic.posts[0];
                    done();
                })
            })
        });
    });

    describe("#create()", () => {
        it("should create a topic object with title and description", (done) => {
            Topic.create({
                title: "Favorite Martian treats",
                description: "A collection of our favorites"
            })
            .then((topic) => {
                expect(topic.title).toBe("Favorite Martian treats");
                expect(topic.description).toBe("A collection of our favorites");
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should not create a topic with missing title, or description", (done) => {
            Topic.create({
                // topic created with no values
            })
            .then((topic) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Topic.title cannot be null");
                expect(err.message).toContain("Topic.description cannot be null");
                done();
            });
        });
    });

    describe("#getPosts()", () => {
        it("should return an array of post objects associated with the topic", (done) => {
            Post.create({
                title: "Martian architecture",
                body: "Amazing structures",
                topicId: this.topic.id,
                userId: this.user.id
            })
            .then(() => {
                this.topic.getPosts()
                .then((posts) => {
                    expect(posts[0].title).toBe("Trask at Carver");
                    expect(posts[1].title).toBe("Martian architecture");
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            })
        });
    });
});