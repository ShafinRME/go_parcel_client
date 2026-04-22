import React, { useEffect, useState } from 'react';
import { FaBuilding, FaMoneyBillAlt, FaRegCalendarAlt, FaShippingFast } from 'react-icons/fa';

import HowItWorksData from '../../../assets/json/howitworks.json';

const iconMapping = {
    FaRegCalendarAlt: FaRegCalendarAlt,
    FaMoneyBillAlt: FaMoneyBillAlt,
    FaShippingFast: FaShippingFast,
    FaBuilding: FaBuilding
};

const HowWorks = () => {

    const [data, setData] = useState([]);

    useEffect(() => {
        // Load the data from JSON file
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData(HowItWorksData);
    }, []);
    return (
        <div data-aos="zoom-in-up" data-aos-duration="1500" className='w-15/16 mx-auto'>
            <h1 className='ml-10 text-3xl font-semibold'>How it Works</h1>
            <div className="grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                {data.map((item, index) => {
                    const IconComponent = iconMapping[item.icon]; // Get the correct icon component
                    return (

                        <div key={index} className="card bg-[#f9f9fa91] shadow-xl p-6 rounded-3xl ">

                            <div className="card-body text-center rounded-full">
                                <div className="text-5xl mb-4">{IconComponent && <IconComponent />}</div>
                                <h2 className="card-title">{item.title}</h2>
                                <p>{item.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HowWorks;