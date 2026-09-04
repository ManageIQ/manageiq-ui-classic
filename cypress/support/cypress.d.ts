/// <reference types="cypress" />

import type {
  Interception,
  HttpRequestInterceptor,
} from 'cypress/types/net-stubbing';
import type {
  DataType,
  GenericDataType,
} from '../../app/javascript/types/common';

/**
 * Custom Cypress command type declarations.
 * These augment the Cypress namespace so TypeScript knows about all
 * custom commands registered in cypress/support/commands/*.js
 */
declare global {
  namespace Cypress {
    interface Chainable {
      // ── login ──────────────────────────────────────────────────────────────
      login(user?: string, password?: string): Chainable<void>;

      // ── menu / navigation ──────────────────────────────────────────────────
      menu(...items: string[]): Chainable<JQuery>;
      menuItems(): Chainable<void>;
      accordion(title: string): Chainable<void>;
      accordionItem(name: string): Chainable<void>;
      selectAccordionItem(
        accordionPath: Array<string | RegExp>,
        options?: { onTreeSelectResponse?: (response: Interception) => void }
      ): Chainable<void>;

      // ── toolbar ────────────────────────────────────────────────────────────
      toolbar(
        toolbarButton: string,
        toolbarOption?: string,
        otherOptions?: { matchedButtonIndex?: number }
      ): Chainable<JQuery>;
      toolbarItems(toolbarButton: string): Chainable<void>;

      // ── element selectors ──────────────────────────────────────────────────
      getFormButtonByTypeWithText(options: {
        buttonText: string;
        buttonType?: string;
      }): Chainable<JQuery>;

      getFormInputFieldByIdAndType(options: {
        inputId: string;
        inputType?: string;
      }): Chainable<JQuery>;

      getFormLabelByForAttribute(options: {
        forValue: string;
      }): Chainable<JQuery>;

      getFormLegendByText(options: { legendText: string }): Chainable<JQuery>;

      getFormSelectFieldById(options: { selectId: string }): Chainable<JQuery>;

      getFormTextareaById(options: { textareaId: string }): Chainable<JQuery>;

      getFormToggleButtonById(options: { toggleId: string }): Chainable<JQuery>;

      // ── form validation helpers ────────────────────────────────────────────
      validateFormLabels(
        labelConfigs: Array<Record<string, string>>
      ): Chainable<void>;
      validateFormFields(fieldConfigs: GenericDataType[]): Chainable<void>;
      validateFormButtons(buttonConfigs: GenericDataType[]): Chainable<void>;

      // ── select ────────────────────────────────────────────────────────────
      changeSelect(selectId: string, optionToSelect: string): Chainable<void>;

      // ── assertions ────────────────────────────────────────────────────────
      expect_flash(
        flashType?: string,
        containsText?: string
      ): Chainable<JQuery>;

      expect_browser_confirm_with_text<T = void>(options: {
        confirmTriggerFn: () => Chainable<T>;
        containsText?: string;
        proceed?: boolean;
      }): Chainable<void>;

      expect_modal(options: {
        modalHeaderText?: string;
        modalContentExpectedTexts?: string[];
        targetFooterButtonText: string;
      }): Chainable<JQuery>;

      expect_inline_field_errors(options: {
        containsText: string;
      }): Chainable<JQuery>;

      // ── API interception ──────────────────────────────────────────────────
      interceptApi<T = void>(options: {
        alias: string;
        method?: string;
        urlPattern: string | RegExp;
        waitOnlyIfRequestIntercepted?: boolean;
        triggerFn: () => Chainable<T>;
        responseInterceptor?: HttpRequestInterceptor;
        onApiResponse?: (interception: Interception) => void;
      }): Chainable<void>;

      getInterceptedApiAliases(): Chainable<Record<string, string>>;
      setInterceptedApiAlias(
        aliasKey: string,
        aliasValue?: string
      ): Chainable<void>;
      resetInterceptedApiAliases(): Chainable<void>;

      // ── logging ───────────────────────────────────────────────────────────
      logAndThrowError(messageToLog: string, messageToThrow?: string): never;

      // ── cypress-on-rails ──────────────────────────────────────────────────
      appCommands(body: GenericDataType): Chainable<GenericDataType>;
      app(name: string, commandOptions?: DataType): Chainable<GenericDataType>;
      appEval(code: string): Chainable<GenericDataType>;
      appFactories(options: DataType[]): Chainable<GenericDataType[]>;
      appFixtures(options: DataType): Chainable<void>;
      appScenario(
        name: string,
        options?: GenericDataType
      ): Chainable<GenericDataType>;
      appDbState(options: string): Chainable<GenericDataType>;
    }
  }
}
