const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Topic", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        sequelize.sync({force: true}).then((res) => {
            Topic.create({
                title: "Away to Mars",
                description: "Suspense, will there be green men?"
            })
            .then((topic) => {
                this.topic = topic;
                Post.create({
                    title: "Endless dessert",
                    body: "There are Martians, and they love sweets!",
                    topicId: this.topic.id
                })
                .then((post) => {
                    this.post = post;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
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
                topicId: this.topic.id
            });
            this.topic.getPosts()
            .then((posts) => {
                expect(posts[0].title).toBe("Endless dessert");
                expect(posts[1].title).toBe("Martian architecture");
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });
});