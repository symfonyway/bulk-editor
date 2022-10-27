import { helpers } from 'vuelidate/lib/validators';

const tagsCount = () => {
    // we have decreased tags limit for products
    // but if old product has more than 10 tags we should set limit to 30
    const tagLimit = 10;

    return helpers.withParams(
        {
            type: 'tagsCount',
            max: tagLimit
        },
        value => {
            const arrayValue = value.split(',');

            return arrayValue.length >= 3 && arrayValue.length <= tagLimit;
        });
};

export default tagsCount;
