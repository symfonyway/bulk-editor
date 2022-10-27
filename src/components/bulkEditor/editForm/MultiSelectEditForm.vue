<template>
    <b-row>
        <b-col cols="12" xl="8">
            <b-form-tags :value="initialValue" @input="onChange" no-outer-focus class="multi-select-form my-2">
                <template v-slot="{ tags, addTag, disabled, removeTag }">
                    <b-dropdown size="sm" variant="outline" no-flip lazy block menu-class="w-100">
                        <template v-slot:button-content>
                            <ul v-if="tags.length > 0" class="list-unstyled d-flex flex-wrap align-items-center m-0">
                                <li v-for="tag in tags" :key="tag" class="d-inline-flex align-items-baseline m-1">
                                    <b-form-tag
                                        @remove="removeTag(tag)"
                                        @click.prevent
                                        :title="tag"
                                        :disabled="disabled"
                                        variant="info"
                                    >{{ tag }}</b-form-tag>
                                </li>
                            </ul>
                            <div v-else class="multi-select-form__empty">
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
                            {{ option }}
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
<!--            <button v-if="quickForm" class="new-style-btn green-solid slight-rounded admin-btn" @click="$emit('save')" :disabled="isValid === false || !hasChanges">Save</button>-->
            <button class="new-style-btn green-solid slight-rounded admin-btn" @click="onApply" :disabled="isBulkUpdateDisabled">
                update products {{ selectedCount }}
            </button>
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
    .multi-select-form {
        &::v-deep {
            padding: 0;

            .dropdown-toggle {
                min-height: 45px;
                padding: 4px 2.5rem 4px 4px;
                background-size: 20px 10px;
                background-position: calc(100% - 15px) 50%;
                background-repeat: no-repeat;
                background-image: url(https://fbcd.co/images/icons/down-arrow-black.svg) !important;

                &::after {
                    display: none;
                }
            }

            .dropdown-menu {
                max-height: 350px;
                overflow-y: scroll;
            }

            .list-unstyled {
                height: 100%;
                min-height: 33px;

                .badge {
                    top: 0;
                    background-color: #eee;
                    padding: 0.25em 0.7em;
                    /*border: 1px solid #ddd;*/
                    color: #555555;
                    font-family: "Open Sans", sans-serif;
                    font-weight: normal;
                    display: flex!important;
                    align-items: center!important;
                    border-radius: 3px !important;
                    height: 100%;

                    .b-form-tag-content {
                        line-height: 18px;
                        font-size: .8rem;
                        color: #000;
                    }

                    .b-form-tag-remove {
                        margin-left: 6px!important;
                    }
                }
            }
        }

        &__empty {
            text-align: left;
            padding: 3px 13px;
            color: #999;
        }
    }
</style>