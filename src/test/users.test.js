const axios = require("axios");
const request = require("supertest");

const postConfig = {
  method: "POST",
  url: "http://localhost:5000/user/signup",
  body: {
    "name": "Test",
    "lastName":"Testing",
    "gender": "male",
    "mobileToken": "z8X3Tp8UT8u8ePhqhy1-Lv:APA91bGdo8LcuPa79kPbwJD8D_r71EUHZhN7j9hGRJP48dQcNcyvDTI4MzLBeBJhW05hPVJUXMfTVykheYfBwMbKJyW_eG_ZFV_ZcOjTY_yqHut50_CFT06CUK6k09D-A_nTest-z6M1",
    "access": {
        "email": "testing@test.com",
        "password": "test123"
    }
  }
};

describe("POST /user/signup", () => {
  it("should create a new mobile user and respond with a json", async (done) => {
    await axios
      .request(postConfig)
      .expect(200, done())
      .then(function (response) {
        console.log(response.data);
      });
  });
});