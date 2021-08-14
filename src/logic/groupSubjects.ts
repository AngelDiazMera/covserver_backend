import { Observer, Subject } from "./observer";
import GroupsModel, {Groups} from "../models/Groups";
import { GroupSubject, MemberObserver, VisitorObserver } from "./notifiers";

import mongoose from "mongoose";
import { addDays, addMinutes } from "../lib/dateModifiers";
const { ObjectId } = mongoose.Types;

/**
 * Singleton which has a list of `groups: Subject[]` and allows to
 * retrieve the existent groups from database and stablish all needed
 * instances to notification purposes.
*/
export default class GroupSubjects {
    private static instance: GroupSubjects;
    private static _groups: Map<string, Subject>;
    
    /**
     * Private to ensure that a new Instance will never be created
    */
    private constructor() { }

    /**
     * Set the preferences of the class. This means that it will get 
     * all Group Subjects (of observer design pattern) from database. 
     * @returns `Promise<Map<string, Subject>>` this means that it will return a 
     * Map<id, Subject> of Group Subjects (as defined in the observer pattern).
    */
    private static async _setPrefs():Promise<Map<string, Subject>> {
        try {
            const groups = await GroupsModel.find({}, 
                {
                    'name'               : 1,
                    'members.userRef'    : 1, 
                    'members.mobileToken': 1, 
                    'visits.userRef'     : 1, 
                    'visits.visitDate'   : 1, 
                    'visits.mobileToken' : 1
                });
            // TODO: Validate when data is void
            return this._queryToMap(groups);
        } catch (error) {
            console.log(error)
            return new Map<string, Subject>();
        }
    }

    // private static 

    private static _queryToMap(groups:Groups[]): Map<string, Subject> {
        const newGroups:Map<string, Subject> = new Map();
        for (const group of groups){
            const groupSbj = new GroupSubject(group._id.toString());
            // Assign the tokens to the member's list
            if (group.members != null && group.members.length > 0)
                for (const member of group.members) 
                    groupSbj.attach(new MemberObserver(
                        member.userRef.toString(), 
                        member.mobileToken.toString()));
            // Assign the tokens and visit dates to the visitor's list
            if (group.visits != null && group.visits.length > 0)
                for (const visit of group.visits) 
                    groupSbj.attach(new VisitorObserver(
                        visit.userRef.toString(), 
                        visit.mobileToken.toString(), 
                        visit.visitDate));

            if (groupSbj != new GroupSubject(group._id.toString())) newGroups.set(group._id.toString(), groupSbj);
        }
        return newGroups;
    }
    /**
     * Initialices the instance of the class.
    */
    public static initialize(): void {
        if (GroupSubjects.instance != null) return ;
        GroupSubjects.instance = new GroupSubjects();
        this._setPrefs()
            .then((newGroups) => {
                this._groups = newGroups;
                console.log('\x1b[36m%s\x1b[0m','Group notifiers loaded');
            })
            .catch(error => console.log('\x1b[31m','Error at init group subjects', error));
        
    }

    /**
     * This method will get an instance of `GroupSubject`s from 
     * a global scope.
     * @returns `Subject[]` this means that it will return a 
     * list of Group Subjects (as defined in the observer pattern).
     */
    public static getInstance(): Map<string, Subject> {
        this.initialize();
        return GroupSubjects._groups;
    }
    /**
     * Adds a subject to the instance.
     * @param id is the identifier of the group from database.
     * @param subject is the subject to add.
     * @returns the added map
     */
    public static addToSet(id: string, subject: Subject):Map<string, Subject> {
        return GroupSubjects._groups.set(id, subject);
    }

    /**
     * Get a subject by the index on database.
     * @param id is the identifier of the group from database.
     * @returns a subject.
    */
    public static getSubject(id: string): Subject | undefined {
        return GroupSubjects._groups.get(id);
    }

    /**
     * Find all the groups in which a user is registered as a member or a 
     * visit in the last 14 days
     * @returns The map of groups of the user as a promise.
     */
    public static async searchWhereId(id: string):Promise<Map<string, Subject>> {
        try {
            const groups: Groups[] = await GroupsModel.aggregate([
                { $project : {   // Projection: filter visits and members array
                    name:1,
                    visits: {
                        $filter: {
                            input: '$visits',
                            as: "visit",
                            cond: { $eq: [ "$$visit.userRef", ObjectId(id) ]}
                        }},
                    members: {
                        $filter: {
                            input: '$members',
                            as: "member",
                            cond: { $eq: [ "$$member.userRef", ObjectId(id) ]}
                        }}
                }}
            ]);
            return this._queryToMap(groups);
        } catch (error) {
            console.log(error)
            return new Map<string, Subject>();
        }
    }
    /**
     * Join the `global` users in a group according the groups of the `infected` user, excluiding that user.
     * Match the visitors who may have had contact with the infected in last 14 days
     * Match the members of every group the infected is registered.
     * @param infected The map of groups of the infected user.
     * @param global The global query of the groups.
    */
    public static joinInfectedAndGlobal(infected:Map<string, Subject>, global:Map<string, Subject> ):Map<string, Subject> {
        var matchedSubjects:Map<string, Subject> = new Map();
        for (const [idGroup, subject] of infected) {
            // Group of the infected user
            const visitorSbj = subject as GroupSubject;
            // Complete group
            const globalSbj = global.get(idGroup) as GroupSubject;

            // Sort dates and reverse them. This way we take the last visits only
            globalSbj.visits.sort((first: VisitorObserver, second: VisitorObserver) =>
                first.visitDate.getTime() - second.visitDate.getTime());
            const reversedVisits = globalSbj.visits.reverse(); 

            const newSubject = new GroupSubject(globalSbj.id.toString())
            // Adding visits
            visitorSbj.visits.forEach((visitor) => {
                // For each global visitor
                // Uses reversed visits due to the 14 days validation
                // So, it starts from the last regiser found 
                reversedVisits
                    .filter(visit => visitorSbj.visits[0].id != visit.id)
                    .some((visitorGlb) => {
                        // If the date of visit is on the last 14 days
                        const isValidDate = visitorGlb.visitDate > addDays(new Date, -14);
                        var isDateBetween:boolean = false;
                        // Check if the visit and the infected were in the same place on a 2 hours period
                        if (visitor.visitDate > visitorGlb.visitDate)
                            isDateBetween = addMinutes(visitorGlb.visitDate, 120) > visitor.visitDate;
                        else isDateBetween = addMinutes(visitor.visitDate, 120) > visitorGlb.visitDate;
                        
                        if (isValidDate && isDateBetween) {
                            visitorGlb.sharedDate = visitor.visitDate;
                            newSubject.attach(visitorGlb);
                        }
                        // If the date is before 14 days since now, stops searching
                        return !isValidDate
                });
            });
            // Adding members
            if (visitorSbj.members.length > 0) 
                newSubject.attachManyMembers(
                    globalSbj.members.filter(member => visitorSbj.members[0].id != member.id));
            // Set the new group to the subjects
            if (newSubject.members.length > 0 || newSubject.visits.length > 0) 
                matchedSubjects.set(idGroup, newSubject);
        }
        return matchedSubjects;
    }
}