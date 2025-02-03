
export const setTime = (timeInSeconds) => ({
  type: 'SET_TIME',
  payload: timeInSeconds, 
});


const initialState = {
  timeInSeconds: 60, 
};

const timeReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TIME':
      return { ...state, timeInSeconds: action.payload }; 
    default:
      return state;
  }
};

export default timeReducer;
