<template>
    <b-row>
        <b-col cols="12" md="10" lg="12" xl="8">
            <input type="hidden" :value="localValue" class="category-dropdown-ui" :data-url="getUrl" ref="inputField">
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key">{{ error.message }}</div>
            </b-form-invalid-feedback>
        </b-col>
        <b-col v-if="!quickForm" class="my-2">
            <b-button variant="dark" class="border-white" @click="$emit('apply', $refs.inputField.value)" :disabled="isBulkUpdateDisabled || !localValue">
                update products {{ selectedCount }}
            </b-button>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';

    export default {
        name: 'CategoryEditForm',
        mixins: [EditFormMixin],
        data() {
            return {
                localValue: null
            }
        },
        computed: {
            getUrl: function () {
                return `/api/site/${this.config.siteId}/categories-with-bonus/1`;
            }
        },
        created () {
            this.localValue = this.value || '';
        },
        mounted () {
            // initiate Category Tree jQuery module and change listener to catch changed values
            // window.CategoryUI.init();
            // $(this.$refs.inputField).on('change', () => {
            //     this.onChange(this.$refs.inputField.value);
            // });
        },
        methods: {
            onChange (newValue) {
                this.localValue = newValue;

                if (this.quickForm) {
                    this.$emit('change', this.localValue);
                }
            }
        },
        watch: {
            value: function () {
                // if quick form then we have to listen value prop changes to update our local value and update select label
                if (this.quickForm) {
                    this.localValue = this.value;
                }
            }
        }
    };
</script>