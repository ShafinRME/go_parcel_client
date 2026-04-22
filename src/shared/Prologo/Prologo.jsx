import React from 'react';

import logo from '../../assets/logo.png';
import { Link } from 'react-router';

const Prologo = () => {
    return (
        <Link to="/">
            <div className='flex items-center justify-start '>
                <img className='rounded-md' src={logo} alt="logo" />
            </div>
        </Link>
    );
};

export default Prologo;