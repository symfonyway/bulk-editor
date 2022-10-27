<template>
    <b-list-group flush class="mb-2">
        <b-list-group-item disabled class="d-none d-sm-block bg-secondary text-white text-center rounded-top px-1 attribute-list-title">Select what you want to edit</b-list-group-item>
        <b-list-group-item disabled class="d-block d-sm-none font-weight-bold text-dark rounded-top py-3">Select what you want to edit</b-list-group-item>
        <b-list-group-item v-for="(attr, index) in attributes" :key="attr.key" :active="attr.isActive" action @click="changeAttribute(attr)" :class="[{'rounded-bottom': index + 1 === attributes.length}, 'd-flex justify-content-between align-items-center']">
            {{ attr.label }}
            <b-badge v-if="attributeErrorCount(attr.key) > 0" variant="danger" pill>{{ attributeErrorCount(attr.key) }}</b-badge>
        </b-list-group-item>
    </b-list-group>
</template>

<script>
    import { maxLength, minLength, maxValue, required, helpers } from 'vuelidate/lib/validators';
    import tagsCount from './validator/tagValidator';
    import minPrice from './validator/minPriceValidator';
    import minCorpPrice from './validator/minCorpPriceValidator';
    import stopWords from './validator/tagStopWordsValidator';
    import descriptionStopWords from './validator/descriptionStopWordsValidator'

    // TODO: move to separate js
    const abstractAttribute = {
        isAbleEditProduct: () => true
    };

    export default {
        name: 'BulkEditorAttributeList',
        props: {
            appData: Object,
            productErrors: {},
            site: String
        },
        data () {
            return {
                attributes: [
                    {
                        key: 'name',
                        label: 'Name',
                        isActive: false,
                        bulkFormComponent: null,
                        quickFormComponent: 'TextEditForm',
                        validators: {
                            required,
                            minLength: minLength(3),
                            maxLength: maxLength(60),
                            alphaNum: helpers.regex('alphaNum', /^[a-zA-Z0-9àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞ&,_@#!?$'".\s\-/|\\:’“‘]*$/),
                            stopWords
                        }
                    },
                    {
                        key: 'description',
                        label: 'Description',
                        isActive: false,
                        bulkFormComponent: null,
                        quickFormComponent: 'TextareaEditForm',
                        validators: {
                            required,
                            minLength: minLength(1),
                            maxLength: maxLength(10000),
                            descriptionStopWords,
                            notEmail: (value) => {
                                return !value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
                            }
                        },
                        customErrors: {
                            notEmail: 'Please, do not include emails'
                        }
                    },
                    {
                        key: 'category',
                        label: 'Categories',
                        isActive: false,
                        bulkFormComponent: 'CategoryEditForm',
                        quickFormComponent: 'CategoryEditForm',
                        validators: {
                            required
                        }
                    },
                    {
                        key: 'priceCorp',
                        keyMap: ['price', 'corp'],
                        label: 'Prices',
                        isActive: false,
                        bulkFormComponent: 'PriceEditForm',
                        quickFormComponent: 'PriceEditForm',
                        validators: () => {
                            return {
                                price: {
                                    minValue: minPrice(this.minPriceValue),
                                    maxValue: maxValue(this.maxPriceValue)
                                },
                                corp: {
                                    minCorpPrice: minCorpPrice('price'),
                                    maxCorpPrice: maxValue(this.maxCorpPriceValue)
                                }
                            }
                        },
                        customErrors: {
                            minValue: 'Minimal price is $2',
                            maxValue: 'Maximum price is $1000',
                            minCorpPrice: 'Minimal corporate price is $4',
                            maxCorpPrice: 'Maximum corporate price is $10000'
                        }
                    },
                    {
                        key: 'tags',
                        label: 'Tags',
                        isActive: false,
                        bulkFormComponent: 'TagBulkEditForm',
                        quickFormComponent: 'TagEditForm',
                        validators: (currentValue, initialValue) => {
                            return {
                                required,
                                tagsCount: tagsCount(initialValue),
                                stopWords
                            }
                        },
                        changeValue: (currentValue, value, shouldAdd = true) => {
                            let cv = currentValue.split(',');

                            if (shouldAdd) {
                                cv = [ ...cv, ...value];
                            } else {
                                for (let i in value) {
                                    const index = cv.indexOf(value[i]);

                                    if (index !== -1) {
                                        delete cv[index];
                                    }
                                }
                            }

                            return cv.join(',');
                        },
                        customErrors: {
                            tagsCount: 'You must enter at least 3 tags'
                        }
                    },
                    {
                        key: 'themes',
                        label: 'Themes',
                        isActive: false,
                        bulkFormComponent: 'MultiSelectEditForm',
                        quickFormComponent: 'MultiSelectEditForm',
                        validators: {
                            maxLength: maxLength(3)
                        },
                        options: this.appData['themes'],
                        customErrors: {
                            maxLength: 'Maximum themes allowed'
                        }
                    },
                ]
            };
        },
        computed: {
            minPriceValue: function () {
                return this.appData.productMinPrice[this.site];
            },
            maxPriceValue: function () {
                return this.appData.productMaxPrice[this.site];
            },
            maxCorpPriceValue: function () {
                return this.appData.productMaxCorpPrice[this.site];
            }
        },
        methods: {
            changeAttribute (clickedAttr) {
                this.attributes.forEach(attr => { attr.isActive = false });
                clickedAttr.isActive = true;
                this.$emit('change', { ...abstractAttribute, ...clickedAttr});
            },
            attributeErrorCount (attrKey) {
                return Object.values(this.productErrors).filter(value => value.hasOwn(attrKey)).length;
            }
        },
        created () {
            // initiate attribute sidebar with attribute from query string. If not set the name is used as default
        }
    };
</script>

<style scoped lang="scss">
    .list-group {
        &::v-deep {
            .list-group-item {
                &.active {
                    background-color: #1c9cd2;
                    border-color: #1c9cd2;
                }
                > .badge {
                    float: none;
                    font-size: 75%!important;
                    height: auto;
                }
            }
            .list-group-item-action {
                cursor: pointer;
            }
        }
    }

    .attribute-list-title {
        padding-top: 20px;
        padding-bottom: 20px;
    }
</style>
