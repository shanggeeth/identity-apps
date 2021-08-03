/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import { TestableComponentInterface } from "@wso2is/core/models";
import { Field, FormValue, Forms, Validation } from "@wso2is/forms";
import { GenericIcon, Hint, InlineEditInput } from "@wso2is/react-components";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Grid, Label, Message, Popup } from "semantic-ui-react";
import { attributeConfig } from "../../../../../extensions";
import { getTechnologyLogos } from "../../../../core";

/**
 * Prop types of `BasicDetailsLocalClaims` component
 */
interface BasicDetailsLocalClaimsPropsInterface extends TestableComponentInterface {
    /**
     * Triggers submit
     */
    submitState: boolean;
    /**
     * Called to initiate update
     */
    onSubmit: (data: any, values: Map<string, FormValue>) => void;
    /**
     * Form Values to be saved
     */
    values: Map<string, FormValue>;
    /**
     * The base claim URI string
     */
    claimURIBase: string;
}

/**
 * This component renders the basic details step of the add local claim wizard
 *
 * @param {BasicDetailsLocalClaimsPropsInterface} props - Props injected to the component.
 *
 * @return {React.ReactElement}
 */
export const BasicDetailsLocalClaims = (props: BasicDetailsLocalClaimsPropsInterface): ReactElement => {

    const {
        submitState,
        onSubmit,
        values,
        claimURIBase,
        [ "data-testid" ]: testId
    } = props;

    const [ claimID, setClaimID ] = useState<string>("");
    const [ isShow, setIsShow ] = useState(false);
    const [ isShowNameHint, setIsShowNameHint ] = useState(false);
    const [ isShowClaimIDHint, setIsShowClaimIDHint ] = useState(false);
    const [ isShowRegExHint, setIsShowRegExHint ] = useState(false);
    const [ isShowDisplayOrderHint, setIsShowDisplayOrderHint ] = useState(false);

    const [ noUniqueOIDCAttrib, setNoUniqueOIDCAttrib ] = useState<boolean>(true);
    const [ noUniqueSCIMAttrib, setNoUniqueSCIMAttrib ] = useState<boolean>(true);
    const [ oidcMapping, setOidcMapping ] = useState<string>(values?.get("oidc").toString());
    const [ scimMapping, setScimMapping ] = useState<string>(values?.get("scim").toString());

    const nameField = useRef<HTMLElement>(null);
    const claimField = useRef<HTMLElement>(null);
    const regExField = useRef<HTMLElement>(null);
    const displayOrderField = useRef<HTMLElement>(null);

    const nameTimer = useRef(null);
    const claimTimer = useRef(null);
    const regExTimer = useRef(null);
    const displayTimer = useRef(null);

    const { t } = useTranslation();

    /**
     * Set the if show on profile is selected or not
     * and the claim ID from the received `values` prop
     */
    useEffect(() => {
        setIsShow(values?.get("supportedByDefault").length > 0);
        setClaimID(values?.get("claimURI").toString());
    }, [ values ]);


    /**
     * This shows a popup with a delay of 500 ms.
     *
     * @param {React.Dispatch<React.SetStateAction<boolean>>} callback The state dispatch method.
     * @param {React.MutableRefObject<any>} ref The ref object carrying the `setTimeout` ID.
     */
    const delayPopup = (
        callback: React.Dispatch<React.SetStateAction<boolean>>,
        ref: React.MutableRefObject<any>
    ): void => {
        ref.current = setTimeout(() => callback(true), 500);
    };

    /**
     * This closes the popup.
     *
     * @param {React.Dispatch<React.SetStateAction<boolean>>} callback The state dispatch method.
     * @param {React.MutableRefObject<any>} ref The ref object carrying the `setTimeout` ID.
     */
    const closePopup = (
        callback: React.Dispatch<React.SetStateAction<boolean>>,
        ref: React.MutableRefObject<any>
    ): void => {
        clearTimeout(ref.current);
        callback(false);
    };

    return (
        <Forms
            onSubmit={ (values) => {
                const data = {
                    claimURI: claimURIBase + "/" + values.get("claimURI").toString(),
                    description: values.get("description").toString(),
                    displayName: values.get("name").toString(),
                    displayOrder: values.get("displayOrder") ? parseInt(values.get("displayOrder")?.toString()) : "0",
                    readOnly: values.get("readOnly")?.length > 0,
                    regEx: values.get("regularExpression")?.toString(),
                    required: values.get("required").length > 0,
                    supportedByDefault: values.get("supportedByDefault").length > 0
                };

                if (attributeConfig.localAttributes.createWizard.customWIzard) {
                    values.set("oidc", oidcMapping);
                    values.set("scim", scimMapping);
                }

                if (noUniqueOIDCAttrib && noUniqueSCIMAttrib) {
                    onSubmit(data, values);
                }

            } }
            submitState={ submitState }
        >
            <Grid>
                { attributeConfig.localAttributes.createWizard.customWIzard &&
                    // TODO: Move custom wizard to extensions
                    <>
                        <Grid.Row columns={ 1 } >
                            <Grid.Column width={ 8 } >
                                <Field
                                    type="text"
                                    name="claimURI"
                                    label={ t("console:manage.features.claims.local.forms.attributeID.label") }
                                    className="mb-1"
                                    required={ true }
                                    requiredErrorMessage={ t("console:manage.features.claims.local.forms." +
                                        "attributeID.requiredErrorMessage") }
                                    placeholder={ t("console:manage.features.claims.local." +
                                        "forms.attributeID.placeholder") }
                                    value={ values?.get("claimURI")?.toString() }
                                    listen={ (values: Map<string, FormValue>) => {
                                        setClaimID(values.get("claimURI").toString());
                                        setOidcMapping(values.get("claimURI").toString());
                                        setScimMapping(values.get("claimURI").toString());
                                    } }
                                    onMouseOver={ () => {
                                        delayPopup(setIsShowClaimIDHint, claimTimer);
                                    } }
                                    onMouseOut={ () => {
                                        closePopup(setIsShowClaimIDHint, claimTimer);
                                    } }
                                    validation={ (value: string, validation: Validation)=> {
                                        if (value === "") {
                                            setNoUniqueOIDCAttrib(true);
                                            setNoUniqueSCIMAttrib(true);
                                            return;
                                        }
                                        let isAttributeValid: boolean = true;

                                        // TODO : Discuss on max characters for attribute name
                                        if (!value.match(/^\w+$/) || value.length > 30) {
                                            isAttributeValid = false;
                                        }

                                        if (!isAttributeValid) {
                                            validation.isValid = false;
                                            validation.errorMessages.push(t("console:manage.features.claims."
                                                +"dialects.forms.fields.attributeName.validation.invalid"));
                                        }

                                        // TODO: Move constants to constants file
                                        if (attributeConfig.localAttributes.createWizard.checkOIDCAvailability) {
                                            attributeConfig.localAttributes.checkAttributeNameAvailability(
                                                value,
                                                "BOTH"
                                            ).then(response => {
                                                if (response.has("SCIM")) {
                                                    setNoUniqueSCIMAttrib(response.get("SCIM"));
                                                }

                                                if (response.has("OIDC")) {
                                                    setNoUniqueOIDCAttrib(response.get("OIDC"));
                                                }
                                            });
                                        }
                                    } }
                                    ref={ claimField }
                                    data-testid={ `${ testId }-form-claim-uri-input` }
                                />
                                <Popup
                                    content={ t("console:manage.features.claims.local.forms.attributeHint") }
                                    inverted
                                    open={ isShowClaimIDHint }
                                    onClose={ () => {
                                        closePopup(setIsShowClaimIDHint, claimTimer);
                                    } }
                                    position="bottom left"
                                    context={ claimField }
                                />
                                <Label className="mb-3 ml-0">
                                    <em>Attribute URI</em>:&nbsp;
                                        { `${claimURIBase}/${ claimID ? claimID : "" }` }
                                </Label>
                            </Grid.Column>
                            <Grid.Column width={ 16 }>
                                <Card fluid >
                                    <Card.Content>
                                        <Card.Header className="mb-2">
                                            { t("extensions:manage.attributes.generatedAttributeMapping.title") }
                                        </Card.Header>
                                        <Card.Meta className="mb-5">
                                            { t("extensions:manage.attributes.generatedAttributeMapping.description") }
                                        </Card.Meta>
                                        <Card.Description className="mt-1 mb-1">
                                            <Grid verticalAlign="middle">
                                                { !noUniqueOIDCAttrib || !noUniqueSCIMAttrib ?
                                                    <Grid.Row columns={ 1 } >
                                                        <Grid.Column>
                                                            <Message color="orange" >
                                                                { (() => {
                                                                    // TODO: Add to translations file
                                                                    if (!noUniqueOIDCAttrib
                                                                        && !noUniqueSCIMAttrib) {
                                                                        return (
                                                                            <>The mapping names generated for
                                                                                <b> OpenID Connect & SCIM </b>
                                                                                protocol(s) is already available.</>
                                                                        );
                                                                    } else if ( noUniqueOIDCAttrib
                                                                        && !noUniqueSCIMAttrib ) {
                                                                        return (
                                                                            <>The mapping names generated for
                                                                                <b> SCIM </b>
                                                                                protocol(s) is already available.</>
                                                                        );
                                                                    } else if ( !noUniqueOIDCAttrib
                                                                        && noUniqueSCIMAttrib) {
                                                                        return (
                                                                            <>The mapping names generated for
                                                                                <b> OpenID Connect </b>
                                                                                protocol(s) is already available.</>
                                                                        );

                                                                    }
                                                                })() }
                                                            </Message>
                                                        </Grid.Column>
                                                    </Grid.Row> : <></>
                                                }
                                                <Grid.Row columns={ 2 } >
                                                    <Grid.Column width={ 5 }>
                                                        <GenericIcon
                                                            transparent
                                                            verticalAlign="middle"
                                                            rounded
                                                            icon={ getTechnologyLogos().oidc }
                                                            spaced="right"
                                                            size="micro"
                                                            floated="left"
                                                        />
                                                        <span>
                                                            { t("extensions:manage.attributes."
                                                                +"generatedAttributeMapping.OIDCProtocol") }
                                                        </span>
                                                    </Grid.Column>
                                                    <Grid.Column width={ 11 }>
                                                        <InlineEditInput
                                                            text={ oidcMapping }
                                                            onChangesSaved={ (value: string) => {
                                                                attributeConfig.localAttributes
                                                                    .checkAttributeNameAvailability(
                                                                        oidcMapping, "OIDC").then(response => {
                                                                        setNoUniqueOIDCAttrib(response.get("OIDC"));
                                                                });
                                                                setOidcMapping(value);
                                                            } }
                                                        />
                                                    </Grid.Column>
                                                </Grid.Row>
                                                <Grid.Row columns={ 2 } >
                                                    <Grid.Column width={ 5 }>
                                                        <GenericIcon
                                                            transparent
                                                            verticalAlign="middle"
                                                            rounded
                                                            icon={ getTechnologyLogos().scim }
                                                            spaced="right"
                                                            size="micro"
                                                            floated="left"
                                                        />
                                                        <span>
                                                            { t("extensions:manage.attributes."
                                                                +"generatedAttributeMapping.SCIMProtocol") }
                                                        </span>
                                                    </Grid.Column>
                                                    <Grid.Column width={ 11 }>
                                                        <InlineEditInput
                                                            textPrefix="urn:scim:wso2:schema:"
                                                            onChangesSaved={ (value: string) => {
                                                                attributeConfig.localAttributes
                                                                    .checkAttributeNameAvailability(
                                                                        scimMapping, "SCIM").then(response => {
                                                                        setNoUniqueSCIMAttrib(response.get("SCIM"));
                                                                });
                                                                setScimMapping(value);
                                                            } }
                                                            text={ scimMapping }
                                                        />
                                                    </Grid.Column>
                                                </Grid.Row>

                                            </Grid>
                                        </Card.Description>
                                    </Card.Content>
                                </Card>
                            </Grid.Column>
                        </Grid.Row>
                    </>
                }
                <Grid.Row columns={ attributeConfig.localAttributes.createWizard.customWIzard ? 1 : 2 }>
                    <Grid.Column width={ 8 }>
                        <Field
                            onMouseOver={ () => {
                                delayPopup(setIsShowNameHint, nameTimer);
                            } }
                            onMouseOut={ () => {
                                closePopup(setIsShowNameHint, nameTimer);
                            } }
                            type="text"
                            name="name"
                            label={ t("console:manage.features.claims.local.forms.name.label") }
                            required={ true }
                            requiredErrorMessage={ t("console:manage.features.claims.local.forms." +
                                "name.requiredErrorMessage") }
                            placeholder={ t("console:manage.features.claims.local.forms.name.placeholder") }
                            value={ values?.get("name")?.toString() }
                            ref={ nameField }
                            data-testid={ `${ testId }-form-name-input` }
                        />
                        <Popup
                            content={ t("console:manage.features.claims.local.forms.nameHint") }
                            inverted
                            open={ isShowNameHint }
                            trigger={ <span></span> }
                            onClose={ () => {
                                closePopup(setIsShowNameHint, nameTimer);
                            } }
                            position="bottom left"
                            context={ nameField }
                        />
                        {
                            attributeConfig.localAttributes.createWizard.customWIzard &&
                            <Hint>
                                { t("extensions:manage.attributes.displayNameHint") }
                            </Hint>
                        }
                    </Grid.Column>
                    { !attributeConfig.localAttributes.createWizard.customWIzard &&
                        <Grid.Column width={ 8 }>
                            <Field
                                type="text"
                                name="claimURI"
                                label={ t("console:manage.features.claims.local.forms.attributeID.label") }
                                required={ true }
                                requiredErrorMessage={ t("console:manage.features.claims.local.forms." +
                                    "attributeID.requiredErrorMessage") }
                                placeholder={ t("console:manage.features.claims.local.forms.attributeID.placeholder") }
                                value={ values?.get("claimURI")?.toString() }
                                listen={ (values: Map<string, FormValue>) => {
                                    setClaimID(values.get("claimURI").toString());
                                } }
                                onMouseOver={ () => {
                                    delayPopup(setIsShowClaimIDHint, claimTimer);
                                } }
                                onMouseOut={ () => {
                                    closePopup(setIsShowClaimIDHint, claimTimer);
                                } }
                                ref={ claimField }
                                data-testid={ `${ testId }-form-claim-uri-input` }
                            />
                            <Popup
                                content={ t("console:manage.features.claims.local.forms.attributeHint") }
                                inverted
                                open={ isShowClaimIDHint }
                                trigger={ <p></p> }
                                onClose={ () => {
                                    closePopup(setIsShowClaimIDHint, claimTimer);
                                } }
                                position="bottom left"
                                context={ claimField }
                            />
                            {
                                claimID
                                    ? <Label>
                                        <em>Attribute URI</em>:&nbsp;
                                            { claimURIBase + "/" + claimID }
                                    </Label>
                                    : null
                            }
                        </Grid.Column>
                    }
                </Grid.Row>
                <Grid.Row columns={ 2 }>
                    <Grid.Column width={ 8 }>
                        <Field
                            type="textarea"
                            name="description"
                            label={ t("console:manage.features.claims.local.forms.description.label") }
                            required={ false }
                            requiredErrorMessage=""
                            placeholder={ t("console:manage.features.claims.local.forms.description.placeholder") }
                            value={ values?.get("description")?.toString() }
                            data-testid={ `${ testId }-form-description-input` }
                        />
                    </Grid.Column>
                    { attributeConfig.localAttributes.createWizard.showRegularExpression &&
                        <Grid.Column width={ 8 }>
                            <Field
                                type="text"
                                name="regularExpression"
                                label={ t("console:manage.features.claims.local.forms.regEx.label") }
                                required={ false }
                                requiredErrorMessage=""
                                placeholder={ t("console:manage.features.claims.local.forms.regEx.placeholder") }
                                value={ values?.get("regularExpression")?.toString() }
                                onMouseOver={ () => {
                                    delayPopup(setIsShowRegExHint, regExTimer);
                                } }
                                onMouseOut={ () => {
                                    closePopup(setIsShowRegExHint, regExTimer);
                                } }
                                ref={ regExField }
                                data-testid={ `${ testId }-form-regex-input` }
                            />
                            <Popup
                                content={ t("console:manage.features.claims.local.forms.regExHint") }
                                inverted
                                open={ isShowRegExHint }
                                trigger={ <span></span> }
                                onClose={ () => {
                                    closePopup(setIsShowRegExHint, regExTimer);
                                } }
                                position="bottom left"
                                context={ regExField }
                            />
                        </Grid.Column>
                    }
                </Grid.Row>
                <Grid.Row columns={ 1 }>
                    <Grid.Column width={ 16 }>
                        <Field
                            type="checkbox"
                            name="supportedByDefault"
                            required={ false }
                            requiredErrorMessage=""
                            children={ [
                                {
                                    label: t("console:manage.features.claims.local.forms.supportedByDefault.label"),
                                    value: "Support"
                                } ] }
                            value={ values?.get("supportedByDefault") as string[] }
                            listen={ (values: Map<string, FormValue>) => {
                                setIsShow(values?.get("supportedByDefault").length > 0);
                            } }
                            data-testid={ `${ testId }-form-supported-by-default-checkbox` }
                        />
                    </Grid.Column>
                </Grid.Row>
                {
                    isShow && attributeConfig.localAttributes.createWizard.showDisplayOrder && (
                        <Grid.Row columns={ 16 }>
                            <Grid.Column width={ 8 }>
                                <Field
                                    type="number"
                                    min="0"
                                    name="displayOrder"
                                    label={ t("console:manage.features.claims.local.forms.displayOrder.label") }
                                    required={ false }
                                    requiredErrorMessage=""
                                    placeholder={ t("console:manage.features.claims.local.forms." +
                                        "displayOrder.placeholder") }
                                    value={ values?.get("displayOrder")?.toString() ?? "0" }
                                    onMouseOver={ () => {
                                        delayPopup(setIsShowDisplayOrderHint, displayTimer);
                                    } }
                                    onMouseOut={ () => {
                                        closePopup(setIsShowDisplayOrderHint, displayTimer);
                                    } }
                                    ref={ displayOrderField }
                                    data-testid={ `${ testId }-form-display-order-input` }
                                />
                                <Popup
                                    content={
                                        t("console:manage.features.claims.local.forms.displayOrderHint")
                                    }
                                    inverted
                                    open={ isShowDisplayOrderHint }
                                    trigger={ <span></span> }
                                    onClose={ () => {
                                        closePopup(setIsShowDisplayOrderHint, displayTimer);
                                    } }
                                    position="bottom left"
                                    context={ displayOrderField }
                                />
                            </Grid.Column>
                        </Grid.Row>
                    )
                }
                <Grid.Row columns={ 1 }>
                    <Grid.Column width={ 16 }>
                        <Field
                            type="checkbox"
                            name="required"
                            required={ false }
                            requiredErrorMessage=""
                            children={ [ {
                                label: t("console:manage.features.claims.local.forms.required.label"),
                                value: "Required"
                            } ] }
                            value={ values?.get("required") as string[] }
                            data-testid={ `${ testId }-form-required-checkbox` }
                        />
                    </Grid.Column>
                </Grid.Row>
                { attributeConfig.localAttributes.createWizard.showReadOnlyAttribute &&
                    // TODO: Track this as an issue for future implementations
                    <Grid.Row column={ 1 }>
                        <Grid.Column>
                            <Field
                                type="checkbox"
                                name="readOnly"
                                required={ false }
                                requiredErrorMessage=""
                                children={ [ {
                                    label: t("console:manage.features.claims.local.forms.readOnly.label"),
                                    value: "ReadOnly"
                                } ] }
                                value={ values?.get("readOnly") as string[] }
                                data-testid={ `${ testId }-form-readonly-checkbox` }
                            />
                        </Grid.Column>
                    </Grid.Row>
                }
            </Grid >
        </Forms >
    );
};

/**
 * Default props for the application creation wizard.
 */
BasicDetailsLocalClaims.defaultProps = {
    currentStep: 0,
    "data-testid": "local-claim-basic-details-form"
};
