<template>
    <b-row>
        <b-col cols="12" xl="8">
            <b-form-tags :value="initialValue" @input="onChange">
                <template v-slot="{ tags, addTag, disabled, removeTag }">
                    <b-dropdown size="sm" variant="outline">
                        <template v-slot:button-content>
                            <ul v-if="tags.length > 0">
                                <li v-for="tag in tags" :key="tag">
                                    <b-form-tag
                                        @remove="removeTag(tag)"
                                        @click.prevent
                                        :title="tag"
                                        :disabled="disabled"
                                        variant="info"
                                    >{{ tag }}</b-form-tag>
                                </li>
                            </ul>
                            <div v-else>
                                Nothing selected
                            </div>
                        </template>
                        <b-dropdown-form @submit.stop.prevent="() => {}">
                            <b-form-input
                                v-model="search"
                                type="search"
                                size="sm"
                                autocomplete="off"
                            ></b-form-input>
                        </b-dropdown-form>
                        <b-dropdown-divider></b-dropdown-divider>
                        <b-dropdown-item-button
                            v-for="(option, key) in options"
                            :key="key"
                            @click="onOptionClick({ option, addTag })"
                        >
                            <div>{{ option }}</div>
                        </b-dropdown-item-button>
                        <b-dropdown-text v-if="options.length === 0">
                            There are not tags
                        </b-dropdown-text>
                    </b-dropdown>
                </template>
            </b-form-tags>
            <b-form-invalid-feedback :state="isValid">
                <div v-for="(error, key) in errors" :key="key">{{ error.message }}</div>
            </b-form-invalid-feedback>
        </b-col>
        <b-col v-if="!quickForm">
            <b-button variant="dark" @click="onApply" :disabled="isBulkUpdateDisabled">
                update products {{ selectedCount }}
            </b-button>
        </b-col>
    </b-row>
</template>

<script>
    import EditFormMixin from './EditFormMixin';

    export default {
        name: 'MultiSelectEditForm',
        mixins: [EditFormMixin],
        data () {
            return {
                newValue: [],
                search: '',
            }
        },
        computed: {
            initialValue: function () {
                if (this.quickForm) {
                    const initValue = this.value || [];
                    return initValue.map(tagId => {
                        return this.convertValues(1, tagId)
                    });
                }

                return null;
            },
            options: function () {
                const criteria = this.search.trim().toLowerCase();
                const optionsArray = Object.entries(this.config.options);
                const options = optionsArray.filter(opt => this.newValue.indexOf(opt[1]) === -1);

                // Filter options by search value
                if (criteria) {
                    return Object.fromEntries(options.filter(opt => opt[1].toLowerCase().indexOf(criteria) > -1));
                }

                return Object.fromEntries(options);
            }
        },
        methods: {
            onChange (newValue) {
                this.newValue = newValue;
                this.$emit('change', newValue.map(tag => {
                    return this.convertValues(0, tag);
                }));
            },
            convertValues (targetKey, value) {
                const comparisonKey = targetKey === 0 ? 1 : 0;
                const found = Object.entries(this.config.options).find(el => el[comparisonKey] == value);
                return found && found[targetKey];
            },
            onOptionClick ({option, addTag}) {
                addTag(option);
                this.search = '';
            },
            onApply () {
                this.$emit('apply', this.newValue.map(tag => {
                    return this.convertValues(0, tag);
                }));
            }
        }
    };
</script>

<style scoped lang="scss">
  .b-form-tags {
        &::v-deep {
            display: flex !important;

            .b-dropdown.btn-group {
                width: 100%;

                    button.dropdown-toggle {
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }
            }
        }
    }
</style>