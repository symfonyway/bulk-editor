<template>
    <b-row>
        <b-col cols="12" xl="8" class="d-flex my-2">
            <b-form-select v-model="actionType" class="mr-2 form-input-lg action-selector" plain>
                <b-form-select-option value="add">Add</b-form-select-option>
                <b-form-select-option value="remove">Remove</b-form-select-option>
            </b-form-select>
            <div class="w-100">
                <b-input v-model.trim="newValue" class="form-input-lg" @keyup.enter="onApply" :state="this.$v.newValue.$invalid === true ? false : null"/>
                <b-form-invalid-feedback :state="!this.$v.newValue.$invalid">
                    <div v-for="(error, key) in getErrors" :key="key">{{ error }}</div>
                </b-form-invalid-feedback>
            </div>
        </b-col>
        <b-col>
            <button class="new-style-btn green-solid slight-rounded admin-btn" @click="onApply" :disabled="isApplyDisabled">
                update products {{ selectedCount }}
            </button>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';
    import { validationMixin } from 'vuelidate';
    import { helpers } from 'vuelidate/lib/validators';
    import stopWords from '../validator/tagStopWordsValidator';

    export default {
        name: 'TagBulkEditForm',
        mixins: [EditFormMixin, validationMixin],
        data () {
            return {
                newValue: '',
                actionType: 'add'
            }
        },
        validations: {
            newValue: {
                maxLength: helpers.withParams(
                    {
                        type: 'maxLength',
                        max: 50
                    }, value => {
                        const array = value.split(',');

                        return !array.find(item => item.length > 50);
                    }),
                alphaNum: helpers.regex('alphaNum', /^[a-z0-9àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿß&'\s\-,]*$/),
                stopWords
            }
        },
        computed: {
            isApplyDisabled: function () {
                return (!this.newValue || this.newValue === '') || this.isBulkUpdateDisabled || this.$v.newValue.$invalid;
            },
            getErrors: function () {
                const errors = [];

                for (let validator in this.$v.newValue.$params) {
                    if (!this.$v.newValue[validator]) {
                        errors.push('');
                    }
                }

                return errors
            }
        },
        methods: {
            onApply () {
                if (this.isApplyDisabled) {
                    return false;
                }

                let eventValue = this.newValue.split(',').map(v => v.trim());
                this.$emit('apply', eventValue, this.actionType);
                this.newValue = '';
            }
        }
    };
</script>

<style scoped lang="scss">
    .form-input-lg {
        height: 45px;
        font-size: 14px;
    }

    .action-selector {
        width: 165px;
        max-height: 45px;
    }
</style>