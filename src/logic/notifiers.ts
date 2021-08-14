import { Subject, Observer } from './observer';
import { addDays, concatDates, formatDateToSpanish, formatDateToTopic } from '../lib/dateModifiers';
import { PushNotification, sendPushToTopic } from '../middlewares/fcmNotifications';

export interface IGroupObserver{
    id: string;
    mobileToken: string;
    visitDate?: Date;
};
export interface IGroupSubject {
    id?: string;
    members: IGroupObserver[];
    visits: IGroupObserver[];
};

/**
 * Subject from an Observer pattern.
 * It has a list for visit observers and another to 
 * member observers.
*/
export class GroupSubject implements Subject{
    private _lastInfected!: VisitorObserver;

    private _id: string;
    private _members: MemberObserver[] = [];
    private _visits: VisitorObserver[] = [];

    constructor (id:string, members: MemberObserver[] = [], visits: VisitorObserver[] = []) {
        this._id = id;
        this._members = members;
        this._visits = visits;
    }
    
    public get id(): string {
        return this._id;
    }
    public get members(): MemberObserver[] {
        return this._members;
    }
    public get visits(): VisitorObserver[] {
        return this._visits;
    }
    /**
     * Push an observer into `members` or `visits` lists.
    */
    public attach(observer: Observer): void {
        // Add member if it is unique
        if (observer instanceof MemberObserver) {
            const isExist = this._members.includes(observer);
            if (!isExist) this._members.push(observer);
        }
        // Add visitor observer from last 14 days
        if (observer instanceof VisitorObserver) {
            const isValid = observer.visitDate > addDays(new Date(), -14);
            if (isValid) 
                this._visits.push(observer);
        }
    }

    public attachManyMembers (observers: Observer[]): void {
        if (observers.length == 0) return;
        this._members = [...this._members, ...observers];
    }
    /**
     * Pops the element of a member out of the Members list
    */
    public detach(observer: Observer): void {
        const observerIndex = this._members.findIndex( member => member.id == observer.id);
        if (observerIndex !== -1) 
            this._members.splice(observerIndex, 1);
    }
    /**
     * Send the notification to the selected groups of 
     * visitors and members.
    */
    public async notify(message: PushNotification): Promise<void> {
        const memberTokens = this._makeTokenArray(this._members);
        const visitorsTokens = this._makeTokenArray(this._visits);

        message.data.groupRef = this._id;

        const visitorsMessage: PushNotification = {
            data: { ...message.data, ...{ type: 'visit_infection' }},
            notification: {
                title: '🚌 Alerta de infección 🦠',
                body: 'Pudiste haber tenido contacto con un infectado por Covid-19.'
            }
        }

        const membersMessage: PushNotification = {
            data: { ...message.data, ...{ type: 'member_infection' }},
            notification: {
                title: '💼 Alerta de infección 🦠',
                body: 'Alguno de tus grupos reportó un infectado con Covid-19.'
            }
        }

        // FCM notification
        const topicName = `${this._lastInfected.id}_${formatDateToTopic(this._lastInfected.visitDate)}`;
        
        if (memberTokens.length > 0){
            await sendPushToTopic(`members_${topicName}`, memberTokens, membersMessage);
        }
        if (visitorsTokens.length > 0){
            await sendPushToTopic(`visits_${topicName}`, visitorsTokens, visitorsMessage);
        }
    }
    /**
     * @returns a list of tokens
    */
    private _makeTokenArray(observers: Observer[]): string[] {
        const observerTokens = []
        // Foreach observer in array, push the token to observerTokens
        for (const observer of observers) 
            observerTokens.push(observer.mobileToken);
        // Splice the token of the current infected
        // const observerIndex = observerTokens.indexOf(this._lastInfected.mobileToken);
        // if (observerIndex === -1) observerTokens.splice(observerIndex, 1);

        return observerTokens;
    }
    /**
     * @returns a list of tokens
    */
    public static makeTokenArrayByDate(observers: VisitorObserver[]): Map<string, Date[]> {
        if (observers.length == 0) return new Map();

        const onlyUnique = (date: Date, index: number, self: Date[]) => {
            return self.indexOf(date) === index;
        };

        var groupBy = function(xs: VisitorObserver[], key: string) {
            return xs.reduce(function(acc:Map<string, Date[]>, curr: VisitorObserver, idx:number, src: VisitorObserver[]) {
                if (!acc.get(curr.mobileToken))
                    acc.set(curr.mobileToken, []);
                acc.get(curr.mobileToken)?.push(curr.sharedDate!);
                acc.set(curr.mobileToken, acc.get(curr.mobileToken)!.filter(onlyUnique));
                return acc;
            }, new Map());
        }; 
        
        return groupBy(observers, 'mobileToken');
    }
    /**
     * Register the infected user and notifies.
    */
    public async registerInfected(visitor: VisitorObserver, message: PushNotification): Promise<void> {
        this._lastInfected = visitor;
        await this.notify(message);
    }

    public toJson(): IGroupSubject {
        return {
            id: this._id,
            members: this._members.map(member => member.toJson()),
            visits: this._visits.map(visit => visit.toJson()),
        };
    }
}

export class MemberObserver implements Observer{
    public id: string;
    public mobileToken: string;
    
    constructor( id: string,mobileToken: string ) {
        this.id = id;
        this.mobileToken = mobileToken;
    }

    update(subject: Subject): void {
        throw new Error('Method not implemented.');
    }

    public toJson(): IGroupObserver {
        return {
            id: this.id,
            mobileToken: this.mobileToken
        };
    }
}
export class VisitorObserver implements Observer{
    public id: string;
    public mobileToken: string;
    public visitDate: Date;
    public sharedDate: Date | undefined = undefined;

    constructor( id: string, mobileToken: string, visitDate: Date ) {
        this.id = id;
        this.mobileToken = mobileToken;
        this.visitDate = visitDate;
    }

    update(subject: Subject): void {
        throw new Error('Method not implemented.');
    }

    public toJson(): IGroupObserver {
        return {
            id: this.id,
            mobileToken: this.mobileToken,
            visitDate: this.visitDate
        };
    }
}

