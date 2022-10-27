<template>
    <b-row>
        <b-col cols="12" xl="9">
            <b-input-group v-if="config.attributeName === 'youtube'" prepend="https://www.youtube.com/watch?v=" :class="[{'my-2': !quickForm}]">
                <b-form-input :state="isValid" :value="currentValue" @input="onChange" class="text-input" />
            </b-input-group>
            <b-form-input v-else :state="isValid" :value="currentValue" @input="onChange" class="text-input" />
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key" v-html="error.message"></div>
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
        name: 'TextEditForm',
        mixins: [EditFormMixin],
        data () {
            return {
                newValue: null
            }
        },
        computed: {
            currentValue: function () {
                return (this.quickForm ? this.value : this.newValue) || '';
            }
        },
        methods: {
            onChange (newValue) {
                this.newValue = newValue;
                this.$emit('change', newValue);
            }
        }
    };
</script>

<style scoped lang="scss">
    .text-input {
        height: 45px;
        min-width: 80px;
    }

    .input-group {
        &::v-deep {
            .input-group-text {
                font-size: .75rem;
            }
        }
    }
</style>