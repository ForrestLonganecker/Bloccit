const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics/";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Comment = require("../../src/db/models").Comment;

describe("routes : comments", () => {
    beforeEach((done) => {
        this.user;
        this.topic;
        this.post;
        this.comment;

        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: "rock@climb.com",
                password: "123456"
            })
            .then((user) => {
                this.user = user;

                Topic.create({
                    title: "Favorite Carver climbs",
                    description: "A collection of favorites from beneath the moss",
                    posts: [{
                        title: "Triangle face",
                        body: "can't get the first move!",
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
                        body: "right there with ya!",
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
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("guest attempting to perform CRUD actions for Comment", () => {
        beforeEach((done) => {
            request.get({
                url: "http://localhost:3000/auth/fake",
                form: {
                    userId: 0
                }
            }, 
                (err, res, body) => {
                    done();
                } 
            );
        });

        describe("POST /topics/:topicId/posts/:postId/comments/create", () => {
            it("should not create a new comment", (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: "I am a guest trying to make a comment!"
                    }
                };
                request.post(options, (err, res, body) => {
                    Comment.findOne({ where: {body: "I am a guest trying to make a comment!"}})
                    .then((comment) => {
                        expect(comment).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });

        describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
            it("should not delete the comment with the associated ID", (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    expect(commentCountBeforeDelete).toBe(1);
                    request.post(
                        `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            Comment.all()
                            .then((comments) => {
                                expect(err).toBeNull();
                                expect(comments.length).toBe(commentCountBeforeDelete);
                                done();
                            })
                        }
                    );
                });
            });
        });


    });


    describe("signed in user performing CRUD actions for Comment", () => {
        beforeEach((done) => {
            request.get({
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "member",
                    userId: this.user.id
                }
            }, 
                (err, res, body) => {
                    done();
                }
            );
        });

        describe("POST /topics/:topicId/posts/:postId/comments/create", () => {
            it("should create a new comment and redirect", (done) => {
                const options = {
                    url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
                    form: {
                        body: "This is a comment from a user"
                    }
                };
                request.post(options, (err, res, body) => {
                    Comment.findOne({where: {body: "This is a comment from a user"}})
                    .then((comment) => {
                        expect(comment).not.toBeNull();
                        expect(comment.body).toBe("This is a comment from a user");
                        expect(comment.id).not.toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });

        describe("POST /topics/:topicId/posts/:postId/comments/:id/destroy", () => {
            it("should delete the comment with the associated ID", (done) => {
                Comment.all()
                .then((comments) => {
                    const commentCountBeforeDelete = comments.length;
                    expect(commentCountBeforeDelete).toBe(1);
                    request.post(
                        `${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`,
                        (err, res, body) => {
                            expect(res.statusCode).toBe(302);
                            Comment.all()
                            .then((comments) => {
                                expect(comments.length).toBe(commentCountBeforeDelete - 1);
                                done();
                            })
                        }
                    );
                });
            });
        });




    });





});