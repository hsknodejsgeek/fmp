//During the test the env variable is set to test
process.env.NODE_ENV = "test";

//Require the dev-dependencies
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../bin/www");
const { expect } = require("chai");
let should = chai.should();


chai.use(chaiHttp);

//User block
describe("User", () => {

    // before(function(done) {
    //     chai
    //         .request(server)
    //         .delete("/v0/user/delete")
    //         .end((err, res) => {
    //             // res.should.have.status(200);
    //             // res.body.should.be.a("object");
    //             done();
    //         });
    // });

    describe("/POST signup user", () => {
        it("it should POST signup a user", (done) => {
            let user = {
                email: "user_283_test@mailinator.com",
                password: "Testing@123",
            };

            chai
                .request(server)
                .post("/v0/user/signup")
                .send(user)
                .end((err, res) => {
                    if(err) {
                        return done();
                    }

                    res.should.have.status(200);
                    res.body.should.be.a("object");
                    done();
                });
        });

        // it("it should not POST a user and give email already present", (done) => {
        //         let user = {
        //             email: "user_281_test@mailinator.com",
        //             password: "Testing@123",
        //         };
    
        //         //Email is already present
        //         chai
        //             .request(server)
        //             .post("/v0/user/signup")
        //             .send(user)
        //             .end((err, res) => {
        //                 res.should.have.status(409);
        //                 res.body.should.be.a("object");
        //                 done();
        //             });
        // });
    });

//   describe("/GET user", () => {
//     it("It should GET a user", (done) => {
//       chai.request(server).get(`/user/${"5fb25f757e819531cf6d220b"}`).end((err, res) => {
//         console.log(res.body);
//         res.should.not.have.nested.property("body.data")
//         res.should.have.status(200);
//         res.should.be.a("object");
//         done();
//       })
//     })
//   });

//   describe("Check not functionality", () => {
//     it("It should not in object", (done) => {
//       var temp = { a: 1 };
//       expect(temp).does.not.have.property("b");
//       done();
//     })
//   })
});

