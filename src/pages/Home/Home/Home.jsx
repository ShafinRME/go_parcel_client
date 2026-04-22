import React from 'react';
import Banner from '../Banner/Banner';
import HowWorks from '../HowWorks/HowWorks';
import Services from '../Services/Services';
import CompanyLogos from '../CompanyLogos/CompanyLogos';
import Features from '../Features/Features';
import FAQ from '../FAQ/FAQ';
import Reviews from '../Reviews/Reviews';
import BeMerchant from '../BeMarchant/BeMerchant';

const Home = () => {
    return (
        <div className='my-2'>
            <Banner></Banner>
            <HowWorks></HowWorks>
            <Services></Services>
            <CompanyLogos></CompanyLogos>
            <Features></Features>
            <BeMerchant></BeMerchant>
            <Reviews></Reviews>
            <FAQ></FAQ>
        </div>
    );
};

export default Home;