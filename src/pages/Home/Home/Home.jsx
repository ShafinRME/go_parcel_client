import React from 'react';
import Banner from '../Banner/Banner';
import HowWorks from '../HowWorks/HowWorks';
import Services from '../Services/Services';
import CompanyLogos from '../CompanyLogos/CompanyLogos';
import Features from '../Features/Features';
import BeMarchant from '../BeMarchant/BeMarchant';
import FAQ from '../FAQ/FAQ';
import Reviews from '../Reviews/Reviews';

const Home = () => {
    return (
        <div className='my-4'>
            <Banner></Banner>
            <HowWorks></HowWorks>
            <Services></Services>
            <CompanyLogos></CompanyLogos>
            <Features></Features>
            <BeMarchant></BeMarchant>
            <Reviews></Reviews>
            <FAQ></FAQ>
        </div>
    );
};

export default Home;