import { helpers } from 'vuelidate/lib/validators';

const minCorpPrice = (priceKey) => {
    return helpers.withParams(
        {
            type: 'minValue',
            min: priceKey
        },
        (value, $model) => {
            if (value === false) {
                return true;
            }

            if (value === '') {
                return false;
            }
            
            return value !== 0 && value >= $model[priceKey]*2;
        }
    )
};

export default minCorpPrice;