const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("routes : posts", () => {

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

    describe("GET /topics/:topicId/posts/new", () => {
        it("should render a new post form", (done) => {
            request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("New Post");
                done();
            });
        });
    });

    describe("GET /topics/:topicId/posts/:id", () => {
        it("should render a view with the selected post", (done) => {
            request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("The Hulk");
                done();
            });
        });
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {
        it("should render a view with an edit post form", (done) => {
            request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Edit post");
                expect(body).toContain("The Hulk");
                done();
            });
        });
    });

    describe("POST /topics/:topicId/posts/create", () => {
        it("should create a new post and redirect", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/posts/create`,
                form: {
                    title: "Night of the living dead",
                    body: "What a classic!"
                }
            };
            request.post(options, (err, res, body) => {
                Post.findOne({where: {title: "Night of the living dead"}})
                .then((post) => {
                    expect(post).not.toBeNull();
                    expect(post.title).toBe("Night of the living dead");
                    expect(post.body).toBe("What a classic!");
                    expect(post.topicId).not.toBeNull();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });

        it("should not create a new post that fails validations", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/posts/create`,
                form: {
                    title: "a",
                    body: "b"
                }
            };
            request.post(options, (err, res, body) => {
                Post.findOne({where: {title: "a"}})
                .then((post) => {
                    expect(post).toBeNull();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                })
            });
        });
    });
    
    describe("POST /topics/:topicId/posts/:id/destroy", () => {
        it("should delete the post with the associated ID", (done) => {
            Post.all()
            .then((posts) => {
                expect(posts[0].id).toBe(1);
                request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                    Post.findById(1)
                    .then((post) => {
                        expect(err).toBeNull();
                        expect(post).toBeNull();
                        done();
                    });
                });
            });
        });
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {
        it("should return a status code 302", (done) => {
            request.post({
                url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                form: {
                    title: "Spiderman!",
                    body: "Enter the spiderverse"
                }
            }, (err, res, body) => {
                expect(res.statusCode).toBe(302);
                done();
            });
        });

        it("should update the post with the given values", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                form: {
                    title: "Spiderman!",
                    body: "not sure which one..."
                }
            };
            request.post(options, (err, res, body) => {
                expect(err).toBeNull();
                Post.findOne({
                    where: {id: this.post.id}
                })
                .then((post) => {
                    expect(post.title).toBe("Spiderman!")
                    done();
                });
            });
        });
    });

});