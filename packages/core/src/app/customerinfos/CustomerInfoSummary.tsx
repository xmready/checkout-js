import React, { FunctionComponent } from 'react';

export interface CustomerInfoValues {
    label: string;
    value: string;
}

export interface CustomerInfoProps {
    budgeting: CustomerInfoValues;
    program_id: CustomerInfoValues;
    bottler: CustomerInfoValues;
    po_number: string;
}

const CustomerInfoSummary: FunctionComponent<CustomerInfoProps> = ({
    budgeting,
    program_id,
    bottler,
    po_number,
}) => {
    
    return (
        <div className="customerView" data-test="checkout-customer-info">
            <div
                className="customerView-body optimizedCheckout-contentPrimary"
                data-test="customer-info"
            >
                {budgeting.value && <div className='customerInfoView'>budgeting: {budgeting.value}</div>}
                {program_id.value && <div className='customerInfoView'>program_id: {program_id.value}</div>}
                {bottler.value && <div className='customerInfoView'>bottler: {bottler.value}</div>}
                {po_number && <div className='customerInfoView'>po_number: {po_number}</div>}
            </div>
        </div>
    );
};

export default CustomerInfoSummary;
