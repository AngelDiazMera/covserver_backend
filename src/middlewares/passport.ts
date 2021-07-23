import {Strategy, ExtractJwt, StrategyOptions} from 'passport-jwt';

import config from '../config/config'
import authorization from './roles';
import { Enterprise } from '../models/Enterprise'
import { User  } from '../models/User'

const opts: StrategyOptions = {
    // Authorization: Bearer <token>
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret // In which key is based our token
}

// The payload is the data object inside our jwt
const enterpriseAuth = new Strategy(opts, async (payload, done) => {
    try {
        const payloadModel = authorization[payload.type];
        const enterprise:Enterprise | User | null = await payloadModel.findById(payload.id);
        // If user is matched, return the enterprise. Else, return a false
        // Null is for the error
        if (enterprise) {
            return done(null, enterprise);
        }
        return done(null, false)
    } catch (error) {
        console.log(error)
    }
});

export default enterpriseAuth;