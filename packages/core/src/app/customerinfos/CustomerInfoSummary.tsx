import React, { FunctionComponent } from 'react';

export interface CustomerInfoValues {
    label: string;
    value: string;
}

export interface CustomerInfoProps {
    budgeting: CustomerInfoValues;
    program_id: CustomerInfoValues;
    bottler: CustomerInfoValues;
    team_name: CustomerInfoValues;
    assigned_program_id: string;
    po_number: string;
}

const CustomerInfoSummary: FunctionComponent<CustomerInfoProps> = ({
    budgeting,
    program_id,
    bottler,
    team_name,
    assigned_program_id,
    po_number,
}) => {
    
    return (
        <div className="customerView" data-test="checkout-customer-info">
            <div
                className="customerView-body optimizedCheckout-contentPrimary"
                data-test="customer-info"
            >
                {budgeting.value && <div className='customerInfoView'>Budgeting: {budgeting.value}</div>}
                {program_id.value && <div className='customerInfoView'>Program ID: {program_id.value}</div>}
                {bottler.value && <div className='customerInfoView'>Bottler: {bottler.value}</div>}
                {po_number && <div className='customerInfoView'>Po Number: {po_number}</div>}
                {(assigned_program_id && assigned_program_id != "") && <div className='customerInfoView'>Assigned Program ID: {assigned_program_id}</div>}
                {team_name.value && <div className='customerInfoView'>Team Name: {team_name.value}</div>}
            </div>
        </div>
    );
};

export default CustomerInfoSummary;
