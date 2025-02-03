
export const setlimit = (limitsms) => ({
    type: 'SET_LIMIT_SMS',
    payload: limitsms, 
  });
  
  
  const initialState = {
    limitsms: 50, 
  };
  
  const limitsmsReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_LIMIT_SMS':
        return { ...state, limitsms: action.payload }; 
      default:
        return state;
    }
  };
  
  export default limitsmsReducer;
  