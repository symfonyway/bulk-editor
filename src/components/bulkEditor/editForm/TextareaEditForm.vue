<template>
    <b-row>
        <b-col cols="12" class="mb-2">
            <vue-editor class="html-editor" :value="sanitizedValue" :editorToolbar="customToolbar" @input="onChange" ref="inputField"></vue-editor>
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key" v-html="error.message"></div>
            </b-form-invalid-feedback>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';
    import { VueEditor, Quill } from "vue2-editor";

    const italic = Quill.import('formats/italic');
    italic.tagName = 'i';
    Quill.register(italic, true);

    export default {
        name: 'TextareaEditForm',
        mixins: [EditFormMixin],
        components: {
            VueEditor
        },
        data () {
            return {
                initialLoad: true,
                customToolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ list: "bullet" }, { list: "ordered"  }, { indent: "-1" }, { indent: "+1" }],
                ]
            }
        },
        computed: {
            sanitizedValue: function () {
                // to prevent some unexpected issues from old editor, we have to replace all DIV with P tag
                return this.value ? this.value.replace(/<div/g, '<p').replace(/<\/div/g, '</p') : '';
            }
        },
        methods: {
            onChange (newValue) {
                // VueEditor emits change text event on first render, we do not need this.
                if (this.initialLoad) {
                    this.initialLoad = false;
                    return;
                }

                let comparableValue = newValue;

                // we check if initial value does not have P tag, then it's from old wysiwyg and we have to handle value to be compared correctly
                if (!this.sanitizedValue.match(/<p/)) {
                    comparableValue = comparableValue.replace(/<(?!br\s*\/?)[^>]+>/g, '');
                }

                if (Object.is(this.sanitizedValue, comparableValue)) {
                    return;
                }

                this.$emit('change', newValue.replace(/(<p[^>]*><br><\/p>)+/gi, '<p><br></p>'));
            }
        }
    };
</script>

<style scoped lang="scss">
    .html-editor {
        ::v-deep {
            .ql-editor {
                max-height: 200px;
                font-size: 14px;
            }

            .ql-toolbar.ql-snow {
                background-color: #eee;
                padding-top: 5px;
                padding-bottom: 0;

                .ql-formats {
                    margin-bottom: 5px;
                }

                button {
                    svg {
                        width: 18px;
                        height: 18px;
                    }
                }
            }
        }
    }
</style>
