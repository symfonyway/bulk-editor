<template>
    <b-row>
        <b-col cols="12" :xl="!quickForm ? 8 : 12">
            <b-form-group>
                <div class="input-group-append">
                    <div class="input-group-text">
                        <b-form-checkbox-group
                            :checked="currentValue"
                            @input="onChange"
                            :options="options"
                            :state="isValid"
                            class="checkbox-group no-select default-style"
                        ></b-form-checkbox-group>
                    </div>
                </div>
            </b-form-group>
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key">{{ error.message }}</div>
            </b-form-invalid-feedback>
        </b-col>
        <b-col v-if="!quickForm">
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

<style lang="scss" scoped>
.input-group-append {
    .input-group-text {
        border-radius: 0 0.375rem 0.375rem 0;
    }
}
</style>