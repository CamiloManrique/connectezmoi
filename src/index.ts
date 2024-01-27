import express from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';
import {slotIsBusy, userIsFree} from './utils';
import authConsts from "./constants";


const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function getJob(env: string, jobId: string) {

    // @ts-ignore
    let baseUrl = authConsts.baseUrl[env];
    // @ts-ignore
    const token = authConsts.token[env];

    const resp = await axios.get(baseUrl + '/job/' + jobId, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return resp.data.response;
}

app.get('/', async (req, res) => {
    res.send('Hello World');
})

app.get('/application-valid', async (req, res) => {

    console.log(req.headers);
    // @ts-ignore
    const env: string = req.headers.environment;

    // @ts-ignore
    let baseUrl = authConsts.baseUrl[env];
    // @ts-ignore
    const token = authConsts.token[env];

    const { applicationId } = req.query;

    console.log('req app id', applicationId);

    let resp = await axios.get(baseUrl + '/application/' + applicationId, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    const application = resp.data.response;

    console.log('the application', application);

    const applicationJob = await getJob(env, application.Job);


    const appJob = { start: new Date(applicationJob.StartDate), end: new Date(applicationJob.EndDate) }

    const isValid = await userIsFree(env, application.User, appJob);

    res.send({
        isValid
    });
});

app.listen(3000, () => {
    console.log(`Example app listening on port`)
})