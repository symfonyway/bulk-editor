<template>
    <b-row>
        <b-col cols="12" :xl="!quickForm ? 8 : 12">
            <b-form-group>
                <b-form-checkbox-group
                    :checked="currentValue"
                    @input="onChange"
                    :options="options"
                    :state="isValid"
                    class="checkbox-group no-select default-style"
                ></b-form-checkbox-group>
            </b-form-group>
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key">{{ error.message }}</div>
            </b-form-invalid-feedback>
        </b-col>
        <b-col v-if="!quickForm">
<!--            <button v-if="quickForm" class="new-style-btn green-solid slight-rounded admin-btn" @click="$emit('save')" :disabled="isValid === false || !hasChanges">Save</button>-->
            <button class="new-style-btn green-solid slight-rounded admin-btn" @click="$emit('apply', newValue)" :disabled="isBulkUpdateDisabled">
                update products {{ selectedCount }}
            </button>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';

    export default {
        name: 'CheckboxGroupEditForm',
        mixins: [EditFormMixin],
        data () {
            return {
                newValue: null
            }
        },
        computed: {
            currentValue: function () {
                return this.quickForm ? this.value || [] : this.newValue;
            },
            options: function () {
                const formOptions = [];

                for (let i in this.config.options) {
                    formOptions.push({text: this.config.options[i], value: i});
                }

                return formOptions;
            }
        },
        methods: {
            onChange (newValue) {
                if (Object.is(newValue, this.value)) {
                    return;
                }

                const value = Array.isArray(newValue) ? newValue : [newValue];
                this.newValue = value;
                this.$emit('change', value);
            }
        }
    };
</script>

<style scoped lang="scss">
    .checkbox-group {
        &::v-deep {
            .custom-checkbox {
                padding-left: 0;
                margin-bottom: .35rem;
                margin-right: .35rem;

                .custom-control-input:checked {
                    ~ .custom-control-label {
                        background-color: #1c9cd2;
                        color: #ffffff;
                        &::before {
                            border-color: #1c9cd2!important;
                        }
                    }
                }

                .custom-control-label {
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    padding: 5px 5px 5px 30px;
                    cursor: pointer;

                    &::before,
                    &::after {
                        top: .35rem;
                        left: .5rem;
                        border-radius: 2px!important;
                    }
                }
            }
        }
    }
</style>