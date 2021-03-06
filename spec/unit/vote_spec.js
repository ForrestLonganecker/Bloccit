const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;
const Vote = require("../../src/db/models").Vote;

describe("Vote", () => {

    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.vote;

        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: "rock@climb.com",
                password: "123456"
            })
            .then((user) => {
                this.user = user

                Topic.create({
                    title: "Carver",
                    description: "The best of the best",
                    posts: [{
                        title: "Trask on Columbia",
                        body: "what an incredible highball",
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

                    Comment.create({
                        body: "covered in moss right now",
                        userId: this.user.id,
                        postId: this.post.id
                    })
                    .then((comment) => {
                        this.comment = comment;
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
    });

    describe("#create()", () => {
        it("should create an upvote on a post for a user", (done) => {
            Vote.create({
                value: 1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                expect(vote.value).toBe(1);
                expect(vote.postId).toBe(this.post.id);
                expect(vote.userId).toBe(this.user.id);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should create a downvote on a post for a user", (done) => {
            Vote.create({
                value: -1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                expect(vote.value).toBe(-1);
                expect(vote.postId).toBe(this.post.id);
                expect(vote.userId).toBe(this.user.id);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });

        it("should not create a vote without assigned post or user", (done) => {
            Vote.create({
                value: 1
            })
            .then((vote) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Vote.userId cannot be null");
                expect(err.message).toContain("Vote.postId cannot be null");
                done();
            })
        });

        it("should not create a vote with an invalid value", (done) => {
            Vote.create({
                value: 0,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                done();
            })
            .catch((err) => {
                expect(err.message).toContain("Validation isIn on value failed");
                done();
            })
        });
    });

    describe("#setUser()", () => {
        it("should associate a vote and a user together", (done) => {
            Vote.create({
                value: -1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                this.vote = vote;
                expect(vote.userId).toBe(this.user.id);
                
                User.create({
                    email: "second@email.com",
                    password: "123456"
                })
                .then((newUser) => {
                    this.vote.setUser(newUser)
                    .then((vote) => {
                        expect(vote.userId).toBe(newUser.id);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("#getUser()", () => {
        it("should return the associated user", (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                vote.getUser()
                .then((user) => {
                    expect(user.id).toBe(this.user.id);
                    expect(user.email).toBe(this.user.email);
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe("#setPost()", () => {
        it("should associate a post and a vote together", (done) => {
            Vote.create({
                value: -1,
                postId: this.post.id,
                userId: this.user.id
            })
            .then((vote) => {
                this.vote = vote;
                Post.create({
                    title: "a new post",
                    body: "with a new body",
                    topicId: this.topic.id,
                    userId: this.user.id
                })
                .then((newPost) => {
                    expect(this.vote.postId).toBe(this.post.id);
                    
                    this.vote.setPost(newPost)
                    .then((vote) => {
                        expect(vote.postId).toBe(newPost.id);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("#getPost()", () => {
        it("should return the associated post", (done) => {
            Vote.create({
                value: 1,
                userId: this.user.id,
                postId: this.post.id
            })
            .then((vote) => {
                this.comment.getPost()
                .then((associatedPost) => {
                    expect(associatedPost.title).toBe("Trask on Columbia");
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

});