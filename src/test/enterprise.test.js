const axios = require("axios");
const request = require("supertest");

const postConfig = {
  method: "POST",
  url: "http://localhost:5000/enterprise/signup",
  body: {
    name: "Universidad Politécnica de Test",
    acronym: "UTO",
    access: {
      email: "upt@upt.edu.mx",
      password: "upt123",
    },
  },
};

const getConfig = {
  method: "GET",
  url: "http://localhost:5000/enterprise/groups",
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMTZiNzg3NDQ0YmMwM2NlNGZlNmJlZSIsImVtYWlsIjoiYW50b25pbzE1MkBtaWNvcnJlb3VwcC5lZHUubXgiLCJ0eXBlIjoiZW50ZXJwcmlzZSIsImlhdCI6MTYyODkwODE0OSwiZXhwIjoxNjMwMTE3NzQ5fQ.iQp9-B389OCrcCY9WMkm8W65ypuoSIelRGj_-KzeFmg",
  },
};

describe("POST /enterprise/signup", () => {
  it("should create a new enterprise and respond with a json", async (done) => {
    await axios
      .request(postConfig)
      .expect(200, done())
      .then(function (response) {
        console.log(response.data);
      });
  });
});

describe("GET /enterprise/groups", () => {
  it("respond with json containing the data of GROUPS", async (done) => {
    await axios
      .request(getConfig)
      .expect(200, done())
      .then(function (response) {
        console.log(response.data);
      });
  });
});
