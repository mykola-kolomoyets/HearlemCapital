import { isLegalEntity, isNaturalPerson, LegalEntityInvestor, NaturalPersonInvestor } from '../../../../../shared/types/investor';
import regex from '../../../../../shared/regex';
import { validateErrorsLabels, Validator } from '../../../utils/validation';
import {
  signUpValidationFields,
  defaultErrors,

  //! === uncomment back later
  //! === (https://ledgerleopard.atlassian.net/browse/HCX-440)
  // maxBSNLength,
  // maxKVKLength
} from './createInvestor.constants';

class SignUpValidate extends Validator<signUpValidationFields, NaturalPersonInvestor | LegalEntityInvestor> {
  validate = (values: NaturalPersonInvestor | LegalEntityInvestor) => {
    this.reset();
    if (isNaturalPerson(values)) {
      this.validateField('firstName', values.firstName);
      this.validateField('lastName', values.lastName);

      this.validateField('bsn', values.bsn);
    }

    if (isLegalEntity(values)) {
      this.validateField('kvk', values.kvk);

      this.validateField('companyName', values.companyName);
    }

    this.validateField('address', values.address);

    this.validateField('postcode', values.postcode);

    this.validateField('city', values.city);

    this.validateField('email', values.email);

    this.validateField('phone', values.phone);

    const invalidFields = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(this.errors).filter(([_, value]) => value !== '')
    );

    return { errors: this.errors, formIsValid: invalidFields.length === 0 };
  };

  validateField = (name: keyof signUpValidationFields, value: string) => {
    this.resetFieldError(name);

    switch (name) {
      case 'firstName':
      case 'lastName': {
        if (!value)
          this.errors[name as keyof signUpValidationFields] = validateErrorsLabels.required;
        else if (!regex.lettersAndNumbers.test(value))
          this.errors[name as keyof signUpValidationFields] = validateErrorsLabels.invalid;
        break;
      }

      case 'city': {
        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-523)
        // if (!value)
        //   this.errors[name as keyof signUpValidationFields] = validateErrorsLabels.required;

        if (value && !regex.alphabetic.test(value))
          this.errors[name as keyof signUpValidationFields] = validateErrorsLabels.invalid;
        
        break;
      }

      case 'bsn': {
        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-523)
        // if (!value) this.errors.bsn = validateErrorsLabels.required;

        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-440)
        // else if (isNaN(Number(value)) || value?.length !== maxBSNLength)
        //   this.errors.bsn = validateErrorsLabels.invalid;
        break;
      }

      case 'kvk': {
        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-523)
        // if (!value) this.errors.kvk = validateErrorsLabels.required;

        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-440)
        // else if (isNaN(Number(value)) || value?.length !== maxKVKLength)
        //   this.errors.kvk = validateErrorsLabels.invalid;
        break;
      }

      case 'postcode': {
        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-523)
        // if (!value) this.errors.postcode = validateErrorsLabels.required;

        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-440)
        // else if (!regex.postcode.test(value))
        //   this.errors.postcode = validateErrorsLabels.invalid;
        break;
      }

      case 'address': {
        break;
      }

      case 'email': {
        if (!value) this.errors.email = validateErrorsLabels.required;
        else if (!regex.email.test(value))
          this.errors.email = validateErrorsLabels.invalid;
        break;
      }

      case 'phone': {
        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-523)
        // if (!value) this.errors.phone = validateErrorsLabels.required;

        //! === uncomment back later
        //! === (https://ledgerleopard.atlassian.net/browse/HCX-440)
        // if (value && !regex.phone.test(value))
        //   this.errors.phone = validateErrorsLabels.invalid;
        break;
      }

      default: {
        if (!value)
          this.errors[name as keyof signUpValidationFields] = validateErrorsLabels.required;
          break;
      }
    }
  };
}

export default new SignUpValidate({ ...defaultErrors });
