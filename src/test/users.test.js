const axios = require("axios"); //It is not installed but is required 
const request = require("supertest") 
const options = {
    method: 'GET',
    url: 'http://localhost:5000/enterprise/groups',
    headers: {
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMTZiNzg3NDQ0YmMwM2NlNGZlNmJlZSIsImVtYWlsIjoiYW50b25pbzE1MkBtaWNvcnJlb3VwcC5lZHUubXgiLCJ0eXBlIjoiZW50ZXJwcmlzZSIsImlhdCI6MTYyODkwODE0OSwiZXhwIjoxNjMwMTE3NzQ5fQ.iQp9-B389OCrcCY9WMkm8W65ypuoSIelRGj_-KzeFmg'
    }
  };
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYxMTZiNzg3NDQ0YmMwM2NlNGZlNmJlZSIsImVtYWlsIjoiYW50b25pbzE1MkBtaWNvcnJlb3VwcC5lZHUubXgiLCJ0eXBlIjoiZW50ZXJwcmlzZSIsImlhdCI6MTYyODkwODE0OSwiZXhwIjoxNjMwMTE3NzQ5fQ.iQp9-B389OCrcCY9WMkm8W65ypuoSIelRGj_-KzeFmg"
it('respond with json containing the data of GROUPS', async done  => {
     
      await axios.request(options).expect(200,done()).then(function (response) {
        console.log(response.data)  
     }) 
    
})
  
