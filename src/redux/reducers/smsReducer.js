
const SET_SMS_CONTENT = 'SET_SMS_CONTENT';

export const setSmsContent = (content) => ({
    type: SET_SMS_CONTENT,
    payload: content,
});

const initialSmsState = {
    smsContent: '',
};

const smsReducer = (state = initialSmsState, action) => {
    switch (action.type) {
        case SET_SMS_CONTENT:
            return {
                ...state,
                smsContent: action.payload,
            };
        default:
            return state;
    }
};

export default smsReducer;
