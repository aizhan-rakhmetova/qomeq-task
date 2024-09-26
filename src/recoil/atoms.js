import { atom } from 'recoil';

export const schedulesState = atom({
    key: 'schedulesState',
    default: {
        10: [],
        20: [],
        30: [],
        40: [],
        50: [],
        60: [],
        90: [],
    },
});

export const appointmentDurationState = atom({
    key: 'appointmentDurationState',
    default: 30,
});



