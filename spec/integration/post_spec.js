const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

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
                    title: "Red rocks",
                    description: "stories from beyond!",
                    posts: [{
                        title: "My first highball",
                        body: "It was scary, but the view was great!",
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

    describe("guest user performing CRUD actions for Post", () => {

        describe("GET /topics/:topicId/posts/new", () => {
            it("should redirect to posts view", (done) => {
                request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Posts");
                    done();
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/:id", () => {
            it("should render a view with the selected post", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("My first highball");
                    expect(body).toContain("It was scary, but the view was great!");
                    done();
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/:id/edit", () => {
            it("should redirect to selected post view", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).notToContain("Edit Topic");
                    expect(body).toContain("My first highball");
                    done();
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/create", () => {
            it("should not create a new post", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "classic traverse",
                        body: "Any classic traverses here?"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "classic traverse"}})
                    .then((post) => {
                        expect(post).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        
        describe("POST /topics/:topicId/posts/:id/destroy", () => {
            it("should not delete the post with the associated ID", (done) => {
                Post.all()
                .then((posts) => {
                    const postCountBeforeDelete = posts.length;
                    expect(postCountBeforeDelete).toBe(1);
                    request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                        Post.all()
                        .then((posts) => {
                            expect(posts.length).toBe(postCountBeforeDelete);
                            done();
                        });
                    });
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/:id/update", () => {
            it("should not update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Rock climbing",
                        body: "Everywhere you can think of"
                    }
                };
                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Post.findOne({where: {id: this.post.id}})
                    .then((post) => {
                        expect(post.title).toBe("My first highball");
                        done();
                    })
                });
            });
        });

    });







    describe("member user performing CRUD actions for a post", () => {
        beforeEach((done) => {
            this.user2;
            this.post2;
            User.create({
                email: "another@example.com",
                password: "123456",
                role: "member"
            })
            .then((user) => {
                this.user2 = user;
                Post.create({
                    title: "Non-red rocks",
                    body: "the rocks that aren't red",
                    topicId: this.topic.id,
                    userId: this.user2.id,
                    id: 2
                })
                .then((post) => {
                this.post2 = post;
                request.get({
                    url: "http://localhost:3000/auth/fake",
                    form: {
                        role: user.rol,
                        userId: user.id,
                        email: user.email
                    }
                },
                    (err, res, body) => {
                        done();
                    });
                });
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
                    expect(body).toContain("It was scary, but the view was great!");
                    done();
                });
            });
        });
    
        describe("GET /topics/:topicId/posts/:id/edit", () => {
            it("if owner, should render a view with an edit post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Edit post");
                    expect(body).toContain("It was scary, but the view was great!");
                    done();
                });
            });

            it("if not owner, should redirect to post view", (done) => {
                request.get(`${base}${this.topic.id}/posts/${this.post.id}edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).not.toContain("Edit Topic");
                    expect(body).toContain("My first highball");
                    done();
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/create", () => {
            it("should create a new post and redirect", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "classic traverse",
                        body: "Any classic traverses here?"
                    }
                };
                request.post(options, (err, res, body) => {
                    Post.findOne({where: {title: "classic traverse"}})
                    .then((post) => {
                        expect(post).not.toBeNull();
                        expect(post.title).toBe("classic traverse");
                        expect(post.body).toBe("Any classic traverses here?");
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
            it("if owner, should delete the post with the associated ID", (done) => {
                Post.all()
                .then((posts) => {
                    expect(posts[1].id).toBe(2);
                    request.post(`${base}/${this.topic.id}/posts/${this.post2.id}/destroy`, (err, res, body) => {
                        Post.findById(2)
                        .then((post) => {
                            expect(err).toBeNull();
                            expect(post).toBeNull();
                            done();
                        });
                    });
                });
            });

            it("if not owner, should not delete the post with associated ID", (done) => {
                Post.all()
                .then((posts) => {
                    const postCountBeforeDelete = posts.length;
                    expect(postCountBeforeDelete).toBe(1);
                    request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {
                        Post.all()
                        .then((posts) => {
                            expect(posts.length).toBe(postCountBeforeDelete);
                            done();
                        });
                    });
                });
            });
        });
    
        describe("POST /topics/:topicId/posts/:id/update", () => {        
            it("if owner, should update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post2.id}/update`,
                    form: {
                        title: "Rock climbing",
                        body: "Everywhere you can think of"
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

            it("if not owner, should not update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Rock climbing",
                        body: "Everywhere you can think of"
                    }
                };
                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    Post.findOne({
                        where: {id: this.post.id}
                    })
                    .then((post) => {
                        expect(post.title).toBe("Red rocks")
                        done();
                    });
                });
            });
        });
    });






    describe("admin user performing CRUD actions for Post", () => {
        beforeEach((done) => {
            User.create({
                email: "admin@example.com",
                password: "123456",
                role: "admin"
            })
            .then((user) => {
                request.get({
                    url: "http://localhost:3000/auth/fake",
                    form: {
                        role: user.role,
                        userId: user.id,
                        email: user.email
                    }
                },
                    (err, res, body) => {
                        done();
                    }
                );
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
});