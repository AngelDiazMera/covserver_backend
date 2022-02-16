# CovServer API

Monolithic covserver api based on ExpressJs.

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
