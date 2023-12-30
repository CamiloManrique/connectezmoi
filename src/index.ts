import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import { isAfter, isBefore }  from "date-fns";
import { slotIsBusy } from './utils';

const baseUrl = 'https://connectez-moi.ca/version-test/api/1.1/obj';
const token = '697d794009cfca19fff1a40ad3e4f6f1';

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function getJob(jobId: string) {

    const resp = await axios.get(baseUrl + '/job/' + jobId, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return resp.data.response;
}

app.get('/application-valid', async (req, res) => {

    const { applicationId } = req.query;

    let resp = await axios.get(baseUrl + '/application/' + applicationId, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const application = resp.data.response;

    console.log('the application', application);

    const applicationJob = await getJob(application.Job);


    resp = await axios.get(baseUrl + '/application', {
        headers: {
            Authorization: `Bearer ${token}`
        },
        params: {
            constraints: JSON.stringify([
                { "key": "User", "constraint_type": "equals", "value": application.User }
            ])
        }
    });

    const applications = resp.data.response;

    console.log('apps', JSON.stringify(applications, null, 2));

    let isValid = true;

    for (const userApplication of applications.results) {
        if (userApplication.User === application.User) {
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

            const appJob = { start: new Date(applicationJob.StartDate), end: new Date(applicationJob.EndDate) };
            const userJob = { start: userStartDate, end: userEndDate };

            if (slotIsBusy(appJob, userJob)) {
                isValid = false;
                break;
            }
        }
    }


    res.send({
        isValid
    })
});

app.listen(3000, () => {
    console.log(`Example app listening on port`)
})