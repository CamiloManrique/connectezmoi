import {isAfter, isBefore} from 'date-fns';
import axios from "axios";
import authConsts from "./constants";

export function slotIsBusy(appJob: { start: Date, end: Date }, userJob: { start: Date, end: Date }) {

    const slotIsFree = isAfter(appJob.start, userJob.end) || isBefore(appJob.end, userJob.start);
    return !slotIsFree;
}

export async function userIsFree(env: string, user: any, slot: { start: Date, end: Date }) {

    // @ts-ignore
    let baseUrl = authConsts.baseUrl[env];
    // @ts-ignore
    const token = authConsts.token[env];

    const resp = await axios.get(baseUrl + '/application', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            constraints: JSON.stringify([
                { "key": "User", "constraint_type": "equals", "value": user },
                { "key": "Status", "constraint_type": "equals", "value": "accepted" }
            ])
        }
    });

    const applications = resp.data.response.results;

    console.log('apps ids', JSON.stringify(applications.map((a: any) => a['_id']), null, 2));

    let isValid = true;

    for (const userApplication of applications) {
        if (userApplication.User === user) {
            console.log('user ap', userApplication);

            let resp = await axios.get(baseUrl + '/job/' + userApplication.Job, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const job = resp.data.response;

            // Pair of dates for the current job we are evaluating
            const userStartDate = new Date(job.StartDate);
            const userEndDate = new Date(job.EndDate);

            const appJob = { start: new Date(slot.start), end: new Date(slot.end) };
            const userJob = { start: userStartDate, end: userEndDate };

            if (slotIsBusy(appJob, userJob)) {
                console.log('slot is busy');
                isValid = false;
                break;
            }
        }
    }

    return isValid;
}