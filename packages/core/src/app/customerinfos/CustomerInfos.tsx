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
    po_number: CustomerInfoData;
}

export interface CustomerInfosProps {
    infoData: CustomerInfoItems[];
    infoUpdated?: CustomerInfoMetaFields;
    budgeting: CustomerInfoValues;
    program_id: CustomerInfoValues;
    bottler: CustomerInfoValues;
    po_number: string;
    handleInfoChange?: any;
    handleCustomerInfoUpdate?: any;
    customer?: Customer;
    cart?: Cart;
    isFloatingLabelEnabled?: boolean;
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
            customerInfoError: false,
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
                                                    { customId == customerGrpId &&
                                                        <div
                                                            key={index}
                                                            className={`dynamic-form-field ${isFloatingLabelEnabled && 'floating-form-field'}`}
                                                        >
                                                            <div className='form-field' key={cusIndex}>
                                                                <Label
                                                                    htmlFor={infoField.label}
                                                                >
                                                                    {infoField.label}
                                                                </Label>
                                                                <Select
                                                                    aria-label={infoField.label}
                                                                    name={infoField.label}
                                                                    options={infoField.options}
                                                                    value={infoField.metafieldKey == "budgeting" ? budgeting : (infoField.metafieldKey == "program_id" ? program_id : bottler)}
                                                                    onChange={(value) => (handleInfoChange(infoField.metafieldKey , value))}
                                                                />
                                                            </div>
                                                        </div>
                                                    }
                                                </>
                                            })}
                                        </>
                                    :
                                    <div
                                        key={index}
                                        className={`dynamic-form-field ${isFloatingLabelEnabled && 'floating-form-field'}`}
                                    >
                                        <div className='form-field' key={index + "1"}>
                                            <TextInput
                                                id={infoField.metafieldKey}
                                                name={infoField.label}
                                                onChange={(event) => (handleInfoChange(infoField.metafieldKey , event.target.value))}
                                                placeholder={infoField.label}
                                                testId={`${infoField.metafieldKey}-${'text'}`}
                                                type={'text'}
                                                value={po_number}
                                                isFloatingLabelEnabled={isFloatingLabelEnabled}
                                            />
                                            <Label
                                                htmlFor={infoField.label}
                                                isFloatingLabelEnabled={isFloatingLabelEnabled}
                                            >
                                                {infoField.label}
                                            </Label>
                                        </div>
                                    </div>
                                }
                            </>
                        )
                    }
                </div>
            </Fieldset>

            <div className="form-actions">
                <Button
                    disabled={po_number == "" || budgeting.label == "" || program_id.label == "" || bottler.label == ""}
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
            infoUpdated,
            cart,
            handleCustomerInfoUpdate
        } = this.props;

        if(po_number != "" && budgeting.label != "" && program_id.label != "" && bottler.label != "") {
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

                    if(budgetData != 0 && program_idData != 0 && bottlerData != 0 && po_numberData != 0) {
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

    private createMetaFieldsGraphQL: (cartId: string, key: string, value: any, bearerToken:any ) => void = async (cartId, key, value, bearerToken) => {
        let keyValue;
        if(key == "po_number") {
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
        if(key == "po_number") {
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
