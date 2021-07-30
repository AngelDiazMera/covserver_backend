import { IGroupObserver, IGroupSubject } from "./notifiers";

/**
 * The Subject interface declares a set of methods for managing subscribers.
 */
export interface Subject {
    // Attach an observer to the subject.
    attach(observer: Observer): void;

    // Detach an observer from the subject.
    detach(observer: Observer): void;

    // Notify all observers about an event.
    notify(message: any): void;

    toJson(): IGroupSubject;
}

/**
 * The Observer interface declares the update method, used by subjects.
 */
export interface Observer {
    id: string;
    mobileToken: string;
    visitDate?: Date;
    // Receive update from subject.
    update(subject: Subject): void;
    toJson(): IGroupObserver;
}
