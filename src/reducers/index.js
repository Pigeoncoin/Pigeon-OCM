import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
    state: (state = {}) => state
});

const store = createStore(rootReducer, {}, applyMiddleware(thunk));

export default store;