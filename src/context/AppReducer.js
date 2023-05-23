import React from 'react';

export default (state, action) => {
    switch(action.type) {
        case 'SET_LIST':
            return {
                shoppingList: action.payload
            }
        case 'ADD_ITEM':
            return {
                shoppingList: [action.payload, ...state.shoppingList]
            }
        case 'REMOVE_ITEM':
            return {
                // remove item from list based on id and parent_id
                shoppingList: state.shoppingList.filter(item => item.id !== action.payload.id && item.parent_id !== action.payload.parent_id)
            }
        case 'SET_USER':
            return {
                user: action.payload
            }
        default:
            return state;
    }
}


