<template>
    <b-row>
        <b-col class="my-2">
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