<template>
    <b-button-group vertical class="border border-black bg-dark text-white rounded px-3 pb-3">
        <div class="px-4 py-3 outline border-bottom border-white mb-3">Select what you want to edit</div>
        <hr class="dropdown-divider">
        <b-button variant="dark" v-for="(attr) in attributes" :key="attr.key" :active="attr.isActive" action @click="changeAttribute(attr)">
            {{ attr.label }}
            <b-badge v-if="attributeErrorCount(attr.key) > 0" variant="danger" pill>{{ attributeErrorCount(attr.key) }}</b-badge>
        </b-button>
    </b-button-group>
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
        },
        mounted () {
            this.attributes[0].isActive = true;
            this.$emit('change', { ...abstractAttribute, ...this.attributes[0]});
        }
    };
</script>
