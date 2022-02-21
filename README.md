# CovServer API

<div>
   <img alt="TypeScript" src="https://img.shields.io/badge/-TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
   <img alt="NodeJs" src="https://img.shields.io/badge/NodeJs-43853d?style=for-the-badge&logo=node.js&logoColor=white" />
   <img alt="ExpressJs" src="https://img.shields.io/badge/ExpressJs-2e2e2e?style=for-the-badge&logo=express&logoColor=white" />
   <img alt="MongoDb" src="https://img.shields.io/badge/MongoDb-13aa52?style=for-the-badge&logo=mongodb&logoColor=white" />
   <img alt="Firebase FCM" src="https://img.shields.io/badge/-Firebase FCM-ffc70f?style=for-the-badge&logo=Firebase&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/-Docker-46a2f1?style=for-the-badge&logo=docker&logoColor=white" />
</div>

Covserver backend api based on ExpressJs.

Important features:
- FCM notifications per time and dynamic areas management
- Authentication by JWT 
- Storage and cache recover onto cloud no SQL databases.
- Roles management

## Installation

Use ```git clone url``` to clone the project into your own repository
if you have not installed typescript yet, use ```npm install -g typescript```
Then, use ```npm install``` to install all production and dev dependencies
Finally, to run the api on dev mode, use ```npm run dev```

## Directory

```js
src/
// Defines all the app route behaviors
|--controllers/
   |--exampleController.ts
   |--...
// Set of middlewares used into the api, such as auth
|--middlewares/
   |--auth.ts
   |--...
// Mongoose Schemas and interface definitions
|--models/
   |--Example.ts
   |--...
// Routes defined to the api
|--routes/
   |--example.routes.ts
   |--...
// Everything the browser can access
|--public/
   |--example_image.jpg
   |--...
...
```


## Contributing
Want to contribute? Great!
Pull requests are allowed ;)

<div align="center"> 
  
![](http://ForTheBadge.com/images/badges/built-with-love.svg)

  Angel Díaz | Antonio Rosas | Rodrigo Cruz | Shaden Narvaez | Johan Maye
  :-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:|:-------------------------:
  [![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AngelDiazMera/) | [![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Antonio152/) | [![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rodrigocrz/) | [![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shadenn/) | [![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Johan07032000/)
</div>

## License
[MIT](https://choosealicense.com/licenses/mit/)
