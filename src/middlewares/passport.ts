import {Strategy, ExtractJwt, StrategyOptions} from 'passport-jwt';

import config from '../config/config'
import EnterpriseModel, { Enterprise } from '../models/Enterprise';

const opts: StrategyOptions = {
    // Authorization: Bearer <token>
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret // In which key is based our token
}

// The payload is the data object inside our jwt
export const enterpriseAuth = new Strategy(opts, async (payload, done) => {
    try {
        const enterprise:Enterprise | null = await EnterpriseModel.findById(payload.id);
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