import {describe, expect, test} from '@jest/globals';
import { slotIsBusy } from '../../utils';

describe('utils', () => {
    test('slotIsBusy', () => {

        let app = { start: new Date('2023-12-03'), end: new Date('2023-12-05') };
        let user = { start: new Date('2023-12-01'), end: new Date('2023-12-03') };

        expect(slotIsBusy(app, user)).toBe(true);

        user = { start: new Date('2023-12-05'), end: new Date('2023-12-07') };

        expect(slotIsBusy(app, user)).toBe(true);

        app = { start: new Date('2023-12-03'), end: new Date('2023-12-04') };
        user = { start: new Date('2023-12-01'), end: new Date('2023-12-02') };

        expect(slotIsBusy(app, user)).toBe(false);

        user = { start: new Date('2023-12-06'), end: new Date('2023-12-07') };

        expect(slotIsBusy(app, user)).toBe(false);
    });
});