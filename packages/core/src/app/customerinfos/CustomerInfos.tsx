import React, { Component, ReactNode } from 'react';
import { Customer, Cart } from '@bigcommerce/checkout-sdk';
import { Fieldset } from '../ui/form';
import { Button, ButtonVariant } from '../ui/button';
import { TranslatedString } from '@bigcommerce/checkout/locale';
import Select from "react-select";
import TextInput from '../ui/form/TextInput';
import { CheckoutContextProps } from '@bigcommerce/checkout/payment-integration-api';
import { withCheckout } from '../checkout';
import { Alert, AlertType } from '../ui/alert';
import { isFloatingLabelEnabled } from '../common/utility';
import Label from '../ui/form/Label';

export interface CustomerInfoItems {
    group_ids: [];
    label: string;
    metafieldKey: string;
    options: [];
    type: string;
}

export interface CustomerInfoValues {
    label: string;
    value: string;
}

export interface CustomerInfoData {
    valid: boolean;
    entityID: Number;
}

export interface CustomerInfoMetaFields {
    budgeting: CustomerInfoData;
    program_id: CustomerInfoData;
    bottler: CustomerInfoData;
    team_name: CustomerInfoData;
    assigned_program_id: CustomerInfoData;
    po_number: CustomerInfoData;
}

export interface CustomerInfosProps {
    infoData: CustomerInfoItems[];
    infoUpdated?: CustomerInfoMetaFields;
    budgeting: CustomerInfoValues;
    program_id: CustomerInfoValues;
    assigned_program_id: string;
    bottler: CustomerInfoValues;
    team_name: CustomerInfoValues;
    po_number: string;
    handleInfoChange?: any;
    handleCustomerInfoUpdate?: any;
    customer?: Customer;
    cart?: Cart;
    isFloatingLabelEnabled?: boolean;
    assigned_field_display: boolean
}

export interface CustomerInfosState {
    customerGrpId: Number;
    isLoading: boolean;
    customerInfoError: boolean;
}

class CustomerInfos extends Component<CustomerInfosProps, CustomerInfosState> {
    constructor(props: CustomerInfosProps) {
        super(props);

        this.state = {
            customerGrpId: 0,
            isLoading: false,
            customerInfoError: false
        };
    }

    componentDidMount(): void {
        const {
            customer
        } = this.props;

        if(customer && customer.customerGroup && customer.customerGroup.id) {
            this.setState({customerGrpId: customer.customerGroup.id});
        }
    }

    render(): ReactNode {
        const {
            infoData,
            handleInfoChange,
            po_number,
            budgeting,
            program_id,
            bottler,
            assigned_program_id,
            assigned_field_display,
            team_name,
            isFloatingLabelEnabled
        } = this.props;

        const {
            customerGrpId,
            isLoading,
            customerInfoError
        } = this.state;

        return (
            <form
            className="checkout-form"
            id="checkout-customerInfo-returning" onSubmit={this.handlesubmit}
        >
            <Fieldset>
                <div className="customerInfo-form">
                    {customerInfoError && (
                        <Alert type={AlertType.Error}><TranslatedString id="customerInfo.error_message" /></Alert>
                    )}
                    {
                        infoData.map((infoField, index) => 
                            <>
                                {
                                    infoField && infoField.type == "dropdown" ?
                                        <> 
                                            { infoField.group_ids.map((customId, cusIndex) => {
                                               return  <>
                                                    { (customId == customerGrpId) &&
                                                        <div
                                                            key={index}
                                                            className={`dynamic-form-field ${isFloatingLabelEnabled && 'floating-form-field'}`}
                                                        >
                                                            <div className='form-field' key={cusIndex}>
                                                                <Label
                                                                    htmlFor={infoField.metafieldKey}
                                                                >
                                                                    {infoField.label}
                                                                </Label>
                                                                <Select
                                                                    className='custom-select-box'
                                                                    classNamePrefix="react-select"
                                                                    id={infoField.metafieldKey}
                                                                    aria-label={infoField.label}
                                                                    name={infoField.label}
                                                                    options={infoField.options}
                                                                    value={infoField.metafieldKey == "budgeting" ? budgeting : (infoField.metafieldKey == "program_id" ? program_id : infoField.metafieldKey == "bottler" ? bottler : infoField.metafieldKey == "assigned_program_id" ? assigned_program_id : team_name)}
                                                                    onChange={(value) => (handleInfoChange(infoField.metafieldKey , value))}
                                                                />
                                                            </div>
                                                        </div>
                                                    }
                                                </>
                                            })}
                                        </>
                                    :
                                    <> 
                                        { infoField.group_ids.map((customId) => {
                                            return  <>
                                                { (customId == customerGrpId) && ((infoField.metafieldKey != "assigned_program_id") || (infoField.metafieldKey == "assigned_program_id" && assigned_field_display == true)) &&
                                                    <div
                                                        key={index}
                                                        className={`dynamic-form-field`}
                                                    >
                                                        <div className='form-field' key={index + "1"}>
                                                            <Label
                                                                htmlFor={infoField.metafieldKey}
                                                            > 
                                                                {infoField.label}
                                                            </Label>
                                                            <TextInput
                                                                id={infoField.metafieldKey}
                                                                name={infoField.label}
                                                                onChange={(event) => (handleInfoChange(infoField.metafieldKey , event.target.value))}
                                                                placeholder={infoField.label}
                                                                testId={`${infoField.metafieldKey}-${'text'}`}
                                                                type={'text'}
                                                                value={infoField.metafieldKey == "po_number" ? po_number : assigned_program_id}
                                                                additionalClassName={infoField.metafieldKey == "po_number" && (budgeting && budgeting.value == '100% BODYARMOR') ? "input_disabled" : ""}
                                                                isFloatingLabelEnabled={isFloatingLabelEnabled}
                                                            />
                                                        </div>
                                                    </div>
                                                }
                                            </>
                                        })}
                                    </>
                                }
                            </>
                        )
                    }
                </div>
            </Fieldset>

            <div className="form-actions">
                <Button
                    disabled={customerGrpId == 11 ? team_name.label == "" : (po_number == "" || budgeting.label == "" || program_id.label == "" || bottler.label == "" || (assigned_field_display == true && assigned_program_id == ""))}
                    id="checkout-customerInfo-create"
                    isLoading={isLoading}
                    testId="customer-customerInfo-create"
                    type="submit"
                    variant={ButtonVariant.Primary}
                >
                    <TranslatedString id="customerInfo.continue" />
                </Button>
            </div>
        </form>
        )
    }

    private handlesubmit: (event:any) => void = async (event) => {
        event.preventDefault();
        const {
            po_number,
            budgeting,
            program_id,
            bottler,
            assigned_program_id,
            assigned_field_display,
            infoUpdated,
            team_name,
            cart,
            handleCustomerInfoUpdate
        } = this.props;

        const { customerGrpId } = this.state;

        if(customerGrpId == 11) {
            if(team_name.label != "") {
                this.setState({isLoading: true});

                if(document.getElementById("dealerScript")) {
                    let scriptElem:any = document.getElementById("dealerScript");
                    const bearerToken:any = scriptElem.attributes.store_api.nodeValue;
                    let cartID = cart?.id || "";

                    if(bearerToken && cartID != "") {
                        let budgetData:any = 1;
                        let program_idData:any = 1;
                        let bottlerData:any = 1;
                        let po_numberData:any = 1; 
                        let assigned_program_idData:any = 1;
                        let team_nameData:any;

                        if(infoUpdated?.team_name.valid == false && team_name) {
                            team_nameData = await this.createMetaFieldsGraphQL(cartID, "team_name", team_name, bearerToken);
                        } else {
                            team_nameData = await this.updateMetaFieldsGraphQL(cartID, infoUpdated?.budgeting.entityID, "team_name", team_name, bearerToken);
                        }

                        if(infoUpdated?.assigned_program_id.entityID != 0) {
                            budgetData = await this.deleteMetaFieldsGraphQL(cartID, infoUpdated?.assigned_program_id.entityID, bearerToken);
                        }

                        if(infoUpdated?.program_id.entityID != 0) {
                            program_idData = await this.deleteMetaFieldsGraphQL(cartID, infoUpdated?.program_id.entityID, bearerToken);
                        }

                        if(infoUpdated?.bottler.entityID != 0) {
                            bottlerData = await this.deleteMetaFieldsGraphQL(cartID, infoUpdated?.bottler.entityID, bearerToken);
                        }

                        if(infoUpdated?.assigned_program_id.entityID != 0) {
                            assigned_program_idData = await this.deleteMetaFieldsGraphQL(cartID, infoUpdated?.assigned_program_id.entityID, bearerToken);
                        }

                        if(infoUpdated?.po_number.entityID != 0) {
                            po_numberData = await this.deleteMetaFieldsGraphQL(cartID, infoUpdated?.po_number.entityID, bearerToken);
                        }

                        if(budgetData != 0 && program_idData != 0 && bottlerData != 0 && po_numberData != 0 && assigned_program_idData != 0 && team_nameData != 0) {
                            this.setState({customerInfoError: false});
                            handleCustomerInfoUpdate(cartID, bearerToken);
                        } else {
                            this.setState({customerInfoError: true});
                            this.setState({isLoading: false});
                        }
                    }
                }
            }
        } else {
            if(po_number != "" && budgeting.label != "" && program_id.label != "" && bottler.label != "" && (assigned_field_display == false || (assigned_field_display == true && assigned_program_id != ""))) {
                this.setState({isLoading: true});

                if(document.getElementById("dealerScript")) {
                    let scriptElem:any = document.getElementById("dealerScript");
                    const bearerToken:any = scriptElem.attributes.store_api.nodeValue;
                    let cartID = cart?.id || "";

                    if(bearerToken && cartID != "") {
                        let budgetData:any;
                        let program_idData:any;
                        let bottlerData:any;
                        let po_numberData:any;
                        let assigned_program_idData:any;

                        if(infoUpdated?.budgeting.valid == false && budgeting) {
                            budgetData = await this.createMetaFieldsGraphQL(cartID, "budgeting", budgeting, bearerToken);
                        } else {
                            budgetData = await this.updateMetaFieldsGraphQL(cartID, infoUpdated?.budgeting.entityID, "budgeting", budgeting, bearerToken);
                        }
                        if(infoUpdated?.program_id.valid == false && program_id) {
                            program_idData = await this.createMetaFieldsGraphQL(cartID, "program_id", program_id, bearerToken);
                        } else {
                            program_idData = await this.updateMetaFieldsGraphQL(cartID, infoUpdated?.program_id.entityID, "program_id", program_id, bearerToken);
                        }
                        if(infoUpdated?.bottler.valid == false && bottler) {
                            bottlerData = await this.createMetaFieldsGraphQL(cartID, "bottler", bottler, bearerToken);
                        } else {
                            bottlerData = await this.updateMetaFieldsGraphQL(cartID, infoUpdated?.bottler.entityID, "bottler", bottler, bearerToken);
                        }
                        if(infoUpdated?.po_number.valid == false && po_number) {
                            po_numberData = await this.createMetaFieldsGraphQL(cartID, "po_number", po_number, bearerToken);
                        } else {
                            po_numberData = await this.updateMetaFieldsGraphQL(cartID, infoUpdated?.po_number.entityID, "po_number", po_number, bearerToken);
                        }

                        if(assigned_field_display == true) {
                            if(infoUpdated?.assigned_program_id.entityID == 0 && assigned_program_id) {
                                assigned_program_idData = await this.createMetaFieldsGraphQL(cartID, "assigned_program_id", assigned_program_id, bearerToken);
                            } else {
                                assigned_program_idData = await this.updateMetaFieldsGraphQL(cartID, infoUpdated?.assigned_program_id.entityID, "assigned_program_id", assigned_program_id, bearerToken);
                            }
                        } else {
                            if(infoUpdated?.assigned_program_id.entityID != 0) {
                                assigned_program_idData = await this.deleteMetaFieldsGraphQL(cartID, infoUpdated?.assigned_program_id.entityID, bearerToken);
                            }
                        }

                        if(budgetData != 0 && program_idData != 0 && bottlerData != 0 && po_numberData != 0 && assigned_program_idData != 0) {
                            this.setState({customerInfoError: false});
                            handleCustomerInfoUpdate(cartID, bearerToken);
                        } else {
                            this.setState({customerInfoError: true});
                            this.setState({isLoading: false});
                        }
                    }
                }
            }
        }
    }

    private deleteMetaFieldsGraphQL: (cartId: string, entityId:any, bearerToken:any ) => void = async (cartId, entityId, bearerToken) => {
        let getOptionsQuery = `
            mutation MyMutation {
                cart {
                    deleteCartMetafield(input: {cartEntityId: "${cartId}", metafieldEntityId: ${entityId}}) {
                        deletedMetafieldEntityId
                    }
                }
            }
        `;          
        await fetch('/graphql', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearerToken}`
            },
            body: JSON.stringify({
                query: getOptionsQuery
            })
        }).then(res => res.json()).then(res => {
            if(res && res.data && res.data.cart && res.data.cart.deleteCartMetafield) {
                return 1;
            }
        });
    }
    private createMetaFieldsGraphQL: (cartId: string, key: string, value: any, bearerToken:any ) => void = async (cartId, key, value, bearerToken) => {
        let keyValue;
        if(key == "po_number" || key == "assigned_program_id") {
            keyValue = value;
        } else {
            keyValue = value.label;
        }
        let getOptionsQuery = `
            mutation createCartMetafield {
                cart {
                    createCartMetafield(
                    input: {cartEntityId: "${cartId}", data: {key: "${key}", value: "${keyValue}"}}
                    ) {
                        metafield {
                            id
                            entityId
                            key
                            value
                        }
                        errors {
                            ... on Error {
                            message
                            }
                        }
                    }
                }
            }
        `;          
        await fetch('/graphql', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearerToken}`
            },
            body: JSON.stringify({
                query: getOptionsQuery
            })
        }).then(res => res.json()).then(res => {
            if(res && res.data && res.data.cart && res.data.cart.createCartMetafield.metafield && res.data.cart.createCartMetafield.metafield.entityId) {
                return res.data.cart.createCartMetafield.metafield.entityId;
            } else {
                return 0;
            }
        });
    }

    private updateMetaFieldsGraphQL: (cartId: string, entityID: any, key: string, value: any, bearerToken:any ) => void = async (cartId, entityID, key, value, bearerToken) => {
        let keyValue;
        if(key == "po_number" || key == "assigned_program_id") {
            keyValue = value;
        } else {
            keyValue = value.label;
        }
        let getOptionsQuery = `
            mutation updateCartMetafield {
                cart {
                    updateCartMetafield(
                    input: {cartEntityId: "${cartId}", data: {key: "${key}", value: "${keyValue}"}, metafieldEntityId: ${entityID}}
                    ) {
                        metafield {
                            id
                            entityId
                            key
                            value
                        }
                        errors {
                            ... on Error {
                            message
                            }
                        }
                    }
                }
            }
        `;          
        await fetch('/graphql', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${bearerToken}`
            },
            body: JSON.stringify({
                query: getOptionsQuery
            })
        }).then(res => res.json()).then(res => {
            if(res && res.data && res.data.cart && res.data.cart.updateCartMetafield.metafield && res.data.cart.updateCartMetafield.metafield.entityId) {
                return res.data.cart.updateCartMetafield.metafield.entityId;
            } else {
                return 0;
            }
        });
    }
}

export function mapToShippingProps({
    checkoutState,
}: CheckoutContextProps) {
    const {
        data: {
            getCustomer,
            getCart,
            getConfig,
        },
    } = checkoutState;

    const customer = getCustomer();
    const cart = getCart();
    const config = getConfig();

    if (!customer || !config || !cart) {
        return null;
    }

    return {
        customer,
        cart,
        isFloatingLabelEnabled: isFloatingLabelEnabled(config.checkoutSettings)
    };
}

export default withCheckout(mapToShippingProps)(CustomerInfos);
