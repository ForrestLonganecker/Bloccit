const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Flair = require("../../src/db/models").Flair;

describe("routes : flairs", () => {

    beforeEach((done) => {
        this.topic;
        this.flair;

        sequelize.sync({force: true}).then((res) => {

            Topic.create({
                title: "Bears",
                description: "Stories and facts"
            })
            .then((topic) => {
                this.topic = topic;

                Flair.create({
                    name: "Nature",
                    color: "brown",
                    topicId: this.topic.id
                })
                .then((flair) => {
                    this.flair = flair;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });

    describe("GET /topics/:topicId/flairs/new", () => {
        it("should render a new flair form", (done) => {
            request.get(`${base}/${this.topic.id}/flairs/new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("New Flair");
                done();
            });
        });
    });

    describe("GET /topics/:topicId/flairs/:id", () => {

        it("should render a view with the selected flair", (done) => {
            request.get(`${base}/${this.topic.id}/flairs/${this.flair.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Nature");
                done();
            });
        });
    });

    describe("GET /topics/:topicId/flairs/:id/edit", () => {
        it("should render a view with an edit flair form", (done) => {
            request.get(`${base}/${this.topic.id}/flairs/${this.flair.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Edit Flair");
                expect(body).toContain("Nature");
                done();
            });
        });
    });

    describe("POST /topics/:topicId/flairs/create", () => {
        it("should create a new flair and redirect", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/flairs/create`,
                form: {
                    name: "Flume",
                    color: "green" 
                }
            };
            request.post(options, (err, res, body) => {
                Flair.findOne({where: {name: "Flume"}})
                .then((flair) => {
                    expect(flair).not.toBeNull();
                    expect(flair.name).toBe("Flume");
                    expect(flair.color).toBe("green");
                    expect(flair.topicId).not.toBeNull();
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                })
            });
        });
    });

    describe("POST /topics/:topicId/flairs/:id/destroy", () => {
        it("should delete the flair with the associated ID", (done) => {
            Flair.all()
            .then((flairs) => {
                expect(flairs[0].id).toBe(1);
                request.post(`${base}/${this.topic.id}/flairs/${this.flair.id}/destroy`, (err, res, body) => {
                    Flair.findById(1)
                    .then((flair) => {
                        expect(err).toBeNull();
                        expect(flair).toBeNull();
                        done();
                    })
                });
            });
        });
    });

    describe("POST /topics/:topicId/flairs/:id/update", () => {
        it("should update the flair with the given values", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/flairs/${this.flair.id}/update`,
                form: {
                    name: "Scary!",
                    color: "red"
                }
            };
            request.post(options, (err, res, body) => {
                expect(err).toBeNull();
                Flair.findOne({
                    where: {id: this.flair.id}
                })
                .then((flair) => {
                    expect(flair.name).toBe("Scary!");
                    expect(flair.color).toBe("red");
                    done();
                });
            });
        });
    });

});