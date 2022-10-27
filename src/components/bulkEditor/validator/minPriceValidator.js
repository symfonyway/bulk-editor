import { helpers } from 'vuelidate/lib/validators';

const minPrice = (minParam) => {
    return helpers.withParams(
        {
            type: 'minValue',
            min: minParam
        },
        (value) => {
            if (value === false) {
                return true;
            }
            
            return value !== 0 && value >= minParam;
        }
    )
};

export default minPrice;