import React from 'react';
import merchantIcon from '../../../assets/location-merchant.png';

const BeMarchant = () => {
    return (
        <div data-aos="fade-up" data-aos-anchor-placement="center-center" data-aos-duration="1000" className='flex flex-col lg:flex-row justify-center items-center  w-15/16 mx-auto my-12 p-4 rounded-3xl bg-base-200 text-primary bg-[url(assets/be-a-merchant-bg.png)] bg-no-repeat'>
            < div className="w-full lg:w-1/2 p-8 pl-10" >
                <h1 className='text-4xl font-bold'>Merchant and Customer Satisfaction is Our First Priority</h1>
                <p className='text-accent mt-4'>
                    We offer the lowest delivery charge with the highest value along with 100% safety of your product. Pathao courier delivers your parcels in every corner of Bangladesh right on time.
                </p>
                <div className="buttons flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 mt-6">
                    <button className="btn btn-secondary mr-4 text-base-200 rounded-3xl hover:scale-103">Become a Merchant</button>
                    <button className="btn btn-base-200 border-1 border-secondary mr-4 text-primary rounded-3xl hover:scale-103">Earn with GO Parcel Courier</button>
                </div>
            </div >

            {/* Right Section (Image) */}
            < div className="w-full lg:w-1/2 p-8 flex justify-center lg:justify-start" >
                <img src={merchantIcon} alt="Merchant Icon" className="max-w-full h-auto" />
            </div >
        </div >
    );
};

export default BeMarchant;
