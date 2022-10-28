<template>
    <b-row>
        <b-col cols="auto">
            <div class="checkbox-icon-group">
                <label class="checkbox-icon-group__label my-2 default-style" @click="onChange(0)">
                    <input type="radio" value="0" :checked="currentValue == 0" />
                    <div class="checkbox-icon-group__content">
                        <i class="fal fa-cube checkbox-icon-group__icon"></i>
                        <span class="checkbox-icon-group__text"> Single product </span>
                    </div>
                </label>
                <label class="checkbox-icon-group__label my-2 default-style" @click="onChange(1)">
                    <input type="radio" value="1" :checked="currentValue == 1" />
                    <div class="checkbox-icon-group__content">
                        <i class="fal fa-shapes checkbox-icon-group__icon"></i>
                        <span class="checkbox-icon-group__text"> Bundle product </span>
                    </div>
                </label>
            </div>
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key">{{ error.message }}</div>
            </b-form-invalid-feedback>
        </b-col>
        <b-col v-if="!quickForm">
            <b-button variant="dark" class="border-white"  @click="$emit('apply', newValue)" :disabled="isBulkUpdateDisabled || newValue === null">
                update products {{ selectedCount }}
            </b-button>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';

    export default {
        name: 'TypeEditForm',
        mixins: [EditFormMixin],
        data () {
            return {
                newValue: null
            }
        },
        computed: {
            currentValue: function () {
                return this.quickForm ? this.value : this.newValue;
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