import {isAfter, isBefore} from 'date-fns';

export function slotIsBusy(appJob: { start: Date, end: Date }, userJob: { start: Date, end: Date }) {

    const slotIsFree = isAfter(appJob.start, userJob.end) || isBefore(appJob.end, userJob.start);
    return !slotIsFree;
}