import { Subject } from 'rxjs/Subject';

export const rxSubject = new Subject();

export const sendDataWithRx = data => rxSubject.next(data);
export const listenToRx = callback => rxSubject.subscribe(callback);
