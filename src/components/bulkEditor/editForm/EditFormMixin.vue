<script>
    export default {
        name: 'EditFormMixin',
        props: {
            value: [String, Boolean, Object, Array, Number],
            quickForm: { // If false then form uses as a bulk form, otherwise as a quick form per product
                type: Boolean,
                default: false
            },
            selectedCount: {
                type: Number,
                default: 0
            },
            errors: {
                type: [Array, Object],
                default: function () {
                    return [];
                }
            },
            config: Object,
            // unique key from the product list
            index: String
        },
        computed: {
            isValid: function () {
                const errorsExists = Array.isArray(this.errors) ? this.errors.length > 0 : Object.keys(this.errors).length > 0;

                return errorsExists ? false : null;
            },
            isBulkUpdateDisabled: function () {
                return this.selectedCount === 0;
            }
        }
    };
</script>

<style scoped>

</style>