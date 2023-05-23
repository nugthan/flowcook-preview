import React, {createContext, useEffect, useReducer} from 'react';
import AppReducer from './AppReducer';

const initialState = {
    shoppingList : [],
    user : []
}

export const GlobalContext = createContext(initialState);
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);
    // Actions for changing state
    function setList(list) {
        dispatch({
            type: 'SET_LIST',
            payload: list
        });
    }
    function addItemToList(item) {
        dispatch({
            type: 'ADD_ITEM',
            payload: item
        });
    }
    function removeItemFromList(item) {
        dispatch({
            type: 'REMOVE_ITEM',
            payload: item
        });
    }
    function setUser(user) {
        dispatch({
            type: 'SET_USER',
            payload: user
        });
    }

    return(
        <GlobalContext.Provider value = {
            {shoppingList : state.shoppingList, addItemToList, removeItemFromList, setList, setUser, user: state.user}
        }>
            {children}
        </GlobalContext.Provider>
    )
}

