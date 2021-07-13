import mongoose from 'mongoose';

import { mongodb } from './keys'

mongoose.connect(mongodb.URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(db => console.log('\x1b[32m%s\x1b[0m','Database is connected'))
    .catch(err => console.log(err));

