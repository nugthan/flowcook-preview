import React from 'react';
import Navigation from '../navigation';
import PropTypes from 'prop-types';
import {useUserContext} from "@/context/user";



export default function Layout({ children }) {
    return (
        <>
                <Navigation/>
                <main>{children}</main>
        </>
    );
}

Layout.propTypes = {
    children: PropTypes.any,
};
