<template>
    <b-row class="mt-4">
        <b-col cols="12" class="mb-2">
            <b-form-tags
                :tag-validator="validateSingleTag"
                invalid-tag-text=""
                :state="isValid"
                tagClass="text-white bg-dark"
                :value="valueArray"
                @input="onChange"
                @tag-state="tagState"
                ref="inputField"
                class="form-input-tags"
            />
            <b-form-invalid-feedback :state="getErrors.length > 0 ? false : null">
                <div v-for="(error, key) in getErrors" :key="key">{{ error.message }}</div>
            </b-form-invalid-feedback>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';
    import stopWords from '../validator/tagStopWordsValidator';

    export default {
        name: 'TagEditForm',
        mixins: [EditFormMixin],
        computed: {
            valueArray: function () {
                return this.value && this.value !== '' ? this.value.split(',') : []
            },
            emitValue: function () {
                return this.newValue.join(',');
            },
            getErrors: function () {
                return [...this.errors, ...this.localErrors]
            }
        },
        mounted () {
            this.setNewValue(this.value);
        },
        data () {
            return {
                newValue: '',
                localErrors: []
            }
        },
        methods: {
            setNewValue (value) {
                this.newValue = value;
            },
            onChange (newValue) {
                this.setNewValue(newValue);
                this.$emit('change', this.emitValue);
            },
            isTagCharactersValid (tag) {
                return !tag.match(/[^a-z0-9àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿß&'\s-]/gi);
            },
            isTagLengthValid (tag) {
                return tag.length <= 50;
            },
            isTagTextAllowed (tag) {
                return stopWords(tag);
            },
            validateSingleTag (tag) {
                return this.isTagCharactersValid(tag) && this.isTagLengthValid(tag) && this.isTagTextAllowed(tag);
            },
            tagState (validTags, invalidTags) {
                this.localErrors = [];

                invalidTags.forEach(tag => {
                    if (!this.isTagCharactersValid(tag)) {
                        this.localErrors.push({message: 'alphaNum'});
                    }

                    if (!this.isTagLengthValid(tag)) {
                        this.localErrors.push({message: 'maxLength'})
                    }

                    if (!this.isTagTextAllowed(tag)) {
                        this.localErrors.push({message: 'stopWords'})
                    }
                });
            }
        }
    };
</script>


<style lang="scss" scoped>
.b-form-tags {
    &::v-deep {
        .close.b-form-tag-remove {
            background-color: rgba(var(--bs-dark-rgb), var(--bs-bg-opacity));
            border: none;
        }
    }
}
</style>