const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("Post", () => {

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
        it("should create a post object with a title body, assigned topic and user", (done) => {
            Post.create({
                title: "Alternate chess rules when you forget all other games",
                body: "Checkers.",
                topicId: this.topic.id,
                userId: this.user.id
            })
            .then((post) => {
                expect(post.title).toBe("Alternate chess rules when you forget all other games");
                expect(post.body).toBe("Checkers.");
                expect(post.userId).toBe(this.user.id);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should not create a post with missing title, body, assigned topic, or user", (done) => {
            Post.create({
                title: "Some title"
            })
            .then((post) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Post.body cannot be null");
                expect(err.message).toContain("Post.topicId cannot be null");
                expect(err.message).toContain("Post.userId cannot be null");
                done();
            });
        });
    });

    describe("#setTopic()", () => {
        it("should associate a topic and a post together", (done) => {
            Topic.create({
                title: "When hyperdrive fails",
                description: "how to repair things"
            })
            .then((newTopic) => {
                expect(this.post.topicId).toBe(this.topic.id);
                this.post.setTopic(newTopic)
                .then((post) => {
                    expect(post.topicId).toBe(newTopic.id);
                    done();
                });
            });
        });
    });

    describe("#getTopic()", () => {
        it("should return the associated topic", (done) => {
            this.post.getTopic()
            .then((associatedTopic) => {
                expect(associatedTopic.title).toBe("My first V0");
                done();
            });
        });
    });

    describe("#setUser()", () => {
        it("should associate a post and a user together", (done) => {
            User.create({
                email: "user@email.com",
                password: "password"
            })
            .then((newUser) => {
                expect(this.post.userId).toBe(this.user.id);
                this.post.setUser(newUser)
                .then((post) => {
                    expect(this.post.userId).toBe(newUser.id);
                    done();
                });
            });
        });
    });

    describe("#getUser()", () => {
        it("should return the associated user", (done) => {
            this.post.getUser()
            .then((associatedUser) => {
                expect(associatedUser.email).toBe("rock@climber.com");
                done();
            });
        });
    });

});