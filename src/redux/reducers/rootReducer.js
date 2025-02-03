import { combineReducers } from 'redux';
import smsReducer from './smsReducer';
import timeReducer from './timeReducer';
import limitsmsReducer from './limitsmsReducer';
import { RESET_STORE } from './resetActions';

const appReducer = combineReducers({
    sms: smsReducer,
    time: timeReducer,
    limitsms: limitsmsReducer,
});

const rootReducer = (state, action) => {
    if (action.type === RESET_STORE) {
        // Reset state về undefined để các reducers trả về state mặc định
        state = undefined;
    }
    return appReducer(state, action);
};

export default rootReducer;
