import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../shared/Navbar/Navbar';
import Footer from '../shared/Footer/Footer';

const RootLayout = () => {
    return (
        <div className='pt-1'>
            <Navbar></Navbar>
            <Outlet></Outlet>


            <Footer></Footer>


        </div>
    );
};

export default RootLayout;