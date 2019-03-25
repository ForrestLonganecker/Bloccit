const request = require("request");
const server = require("../../src/server");
const sequelize = require("../../src/db.models/index").sequelize;
const Advertisement = require("../../src/db/models").Advertisement;
const base = "http://localhost:3000/advertisements/";

describe("routes: advertisements", () => {

    beforeEach((done) => {
        this.advertisement;
        sequelize.sync({force: true}).then((res) => {
            Advertisement.create({
                title: "Buy Stuff!",
                description: "New gear!"
            })
            .then((advertisement) => {
                this.advertisement = advertisement;
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe("GET /advertisments", () => {

        it("should return a status code 200 and all advertisements", (done) => {
            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(err).toBeNull();
                expect(body).toContain("Buy stuff!");
                expect(body).toContain("New gear!");
                done();
            });
        });

    });

});