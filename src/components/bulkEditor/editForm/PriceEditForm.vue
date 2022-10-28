<template>
    <b-row>
        <b-col cols="12" xl="8">
            <b-row>
                <div class="form-group col-auto">
                    <label>Product price</label>
                    <b-form-input :state="isPriceValid" :value="currentPriceValue" @input="onChangePrice" ref="inputField" :formatter="formatPrice" class="text-input" placeholder="$" />
                </div>
                <div class="form-group col-auto">
                    <label>Product corporate price</label>
                    <div class="input-group">
                        <b-form-input :state="isCorpPriceValid" :value="corpDisplayValue" @input="onChangeCorp" ref="inputField" :formatter="formatPrice" :disabled="isDisabled" class="text-input" placeholder="$" />
                        <div class="input-group-append">
                            <b-form-checkbox class="input-group-text default-style" :checked="!isDisabled" @change="changeInputState" />
                        </div>
                    </div>
                </div>
            </b-row>
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in getErrorsArr" :key="key">{{ error }}</div>
            </b-form-invalid-feedback>
        </b-col>
        <b-col v-if="!quickForm">
            <b-button variant="dark" class="border-white"  @click="$emit('apply', {...bulkValue})" :disabled="isBulkUpdateDisabled || currentPriceValue === ''">
                update products {{ selectedCount }}
            </b-button>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';

    export default {
        name: 'PriceEditForm',
        mixins: [EditFormMixin],
        data () {
            return {
                previousCorpValue: '',
                bulkValue: {
                    price: '',
                    corp: 0
                }
            }
        },
        mounted () {
            if (!this.isDisabled) {
                this.previousCorpValue = this.value.corp;
            }
        },
        computed: {
            isDisabled: function () {
                return this.currentCorpValue === 0;
            },
            currentPriceValue: function () {
                return this.quickForm ? (this.value.price === false ? '' : this.value.price) : this.bulkValue.price;
            },
            currentCorpValue: function () {
                return this.quickForm ? (this.value.corp === false ? 0 : this.value.corp) : this.bulkValue.corp;
            },
            corpDisplayValue () {
                return this.isDisabled ? '' : this.currentCorpValue;
            },
            isPriceValid: function () {
                return this.errors.hasOwn('price') ? false : null;
            },
            isCorpPriceValid: function () {
                return this.errors.hasOwn('corp') ? false : null;
            },
            getErrorsArr: function () {
                let errors = [];
                for (let i in this.errors) {
                    const foundErrors = this.errors[i].map(s => s.message);
                    errors = [ ...errors, ...foundErrors];
                }

                return errors;
            }
        },
        methods: {
            onChangePrice (newValue) {
                if (!this.quickForm) {
                    this.bulkValue.price = newValue;
                    return
                }
                this.$emit('change', {
                    price: newValue,
                    corp: this.value.corp
                });
            },
            onChangeCorp (newValue) {
                if (newValue !== 0 && newValue !== false) {
                    this.previousCorpValue = newValue;
                }
                if (!this.quickForm) {
                    this.bulkValue.corp = newValue !== false ? newValue : 0;
                    return;
                }
                this.$emit('change', {
                    price: this.value.price,
                    corp: newValue
                });
            },
            formatPrice (value) {
                const formatted = value.match(/^\d+\.?\d{0,2}/);
                return formatted && formatted[0] || '';
            },
            changeInputState (newState) {
                this.onChangeCorp(newState ? this.previousCorpValue : false);
            }
        }
    };
</script>