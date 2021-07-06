# CovServer back office

Backend of CovServer services.

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
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](https://choosealicense.com/licenses/mit/)