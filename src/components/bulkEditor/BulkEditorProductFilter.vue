<template>
    <b-row class="bg-white rounded mb-3" v-click-outside="hideForm" ref="filterBlock">
        <b-col cols="auto" class="bg-secondary text-white text-center rounded-left d-none d-sm-flex align-items-center product-selection">
            <span>Product selection</span>
        </b-col>
        <b-col cols="12" class="border-bottom font-weight-bold py-3 d-block d-sm-none">
            Product selection
        </b-col>

        <b-col class="d-flex align-items-center flex-wrap py-3 py-sm-0">
            <div v-for="item in filterLabels" :key="item.name" :class="['border-'+item.variant,'filter-label border rounded px-2 py-1 m-1 d-flex align-items-center']">
                <span v-html="item.title"></span>
                <button v-if="item.removable" @click="resetFilter(item.name)" type="button" class="close ml-2" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </b-col>

        <b-col cols="12" sm="auto" class="text-center d-sm-flex justify-content-center flex-sm-column edit-btn-block" ref="editBtnBlock" @click="toggleForm">
            <i class="far fa-edit edit-btn-block__icon"></i>
            <div class="d-none d-sm-block edit-btn-block__label-sm"><small>edit selection</small></div>
            <span class="d-inline-block d-sm-none my-3">edit selection</span>
        </b-col>

        <div class="popover b-popover bs-popover-bottom" :style="popoverStyle">
            <div class="arrow" :style="popoverArrowStyle"></div>
            <div class="popover-body">
                <div class="border-bottom pb-3 mb-2">
                    <label for="productName">Search product</label>
                    <b-form-input id="productName" v-model="queryFilter.value" :data-placeholder="productNamePlaceholder" size="lg" class="products-search-input" debounce="700" @update="applyFilter"/>
                </div>
                <div class="border-bottom pb-3 mb-2 site-selector-wrapper">
                    <label>select site</label>
                    <div class="site-selector">
                        <div :class="['site-selector-box', {'active': this.siteFilter.value === '1'}]" @click="changeSiteFilter('1')">
                            <span> </span>
                            <img src="https://fbcd.co/images/logos/_font-bundles-logo/redblack.svg" alt="Font Bundles" class="fb-logo d-block mx-auto">
                        </div>
                        <div :class="['site-selector-box', {'active': this.siteFilter.value === '2'}]" @click="changeSiteFilter('2')">
                            <span> </span>
                            <img src="https://fbcd.co/images/logos/_design-bundles-logo/blueblack.svg" alt="Design Bundles" class="db-logo d-block mx-auto">
                        </div>
                    </div>
                </div>
                <div class="form-group border-bottom pb-3">
                    <label for="productGroup">Select product group</label>
                    <b-form-select
                        id="productGroup"
                        v-model="productGroupFilter.value"
                        :options="productGroupFilter.options"
                        size="lg"
                        :disabled="productGroupFilter.disabled"
                        plain
                        @change="applyFilter"
                    ></b-form-select>
                </div>
                <div class="form-group">
                    <label for="resultCount">Result count</label>
                    <b-form-select v-model="resultCount.value" :options="resultCount.options" id="resultCount" plain size="lg" @change="applyFilter"></b-form-select>
                </div>
            </div>
        </div>
    </b-row>
</template>

<script>
    import ClickOutside from 'vue-click-outside';

    export default {
        name: 'BulkEditorProductFilter',
        directives: {
            ClickOutside
        },
        props: {
            initialValues: Object
        },
        data () {
            return {
                productNamePlaceholder: 'Product name',
                siteFilter: {
                    value: '1',
                    initialValue: '1'
                },
                productGroupFilter: {
                    value: null,
                    initialValue: null,
                    disabled: false,
                    options: [
                        {text: 'All products', value: null}
                    ]
                },
                queryFilter: {
                    value: '',
                    initialValue: ''
                },
                resultCount: {
                    value: 30,
                    options: [
                        {text: '10', value: 10},
                        {text: '20', value: 20},
                        {text: '30', value: 30}
                    ]
                },
                popoverStyle: {
                    display: 'none',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 'auto'
                },
                popoverArrowStyle: {
                    right: '3rem'
                },
                filterLabels: []
            }
        },
        computed: {
            showResetButton: function () {
                return this.siteFilter.value !== this.siteFilter.initialValue
                    || this.productGroupFilter.value !== this.productGroupFilter.initialValue
                    || this.queryFilter.value !== this.queryFilter.initialValue;
            }
        },
        created () {
            this.siteFilter.initialValue = this.initialValues && this.initialValues.siteId || '1';
        },
        mounted () {
            this.changeSiteFilter(this.siteFilter.initialValue);
            this.applyFilter();
        },
        updated () {
            // make correct position of popover and his arrow
            this.popoverStyle.top = this.$refs.filterBlock && this.$refs.filterBlock.clientHeight + 'px' || 0;
            this.popoverArrowStyle.right = (this.$refs.editBtnBlock && this.$refs.editBtnBlock.clientWidth/2 - 12) + 'px' || this.popoverArrowStyle.right;
        },
        methods: {
            applyFilter () {
                this.displayFilterLabels();
                this.$emit('change', [
                    {
                        key: 'sites',
                        value: [this.siteFilter.value]
                    },
                    {
                        key: 'group',
                        value: this.productGroupFilter.value
                    },
                    {
                        key: 'search',
                        value: this.queryFilter.value
                    },
                    {
                        key: 'perPage',
                        value: this.resultCount.value
                    },
                ])
            },
            resetFilter (name = null) {
                if (name && this.hasOwn(name)) {
                    this[name].value = this[name].initialValue;
                } else {
                    this.siteFilter.value = this.siteFilter.initialValue;
                    this.productGroupFilter.value = this.productGroupFilter.initialValue;
                    this.queryFilter.value = this.queryFilter.initialValue;
                }

                this.applyFilter();
            },
            changeSiteFilter (siteValue) {
                this.siteFilter.value = siteValue;
                this.productGroupFilter.disabled = true;

                Promise.resolve([{id: siteValue, name: 'Custom'}]).then(groupList => {
                    this.productGroupFilter.options = [
                        {text: 'All products', value: null},
                        ...groupList.map(group => {
                            return {text: group.name, value: group.id}
                        })
                    ];
                    this.productGroupFilter.value = this.productGroupFilter.initialValue;
                }).finally(() => {
                    this.productGroupFilter.disabled = false;
                    // apply filter right on change site filter value
                    this.applyFilter();
                });
            },
            toggleForm () {
                this.popoverStyle.display = this.popoverStyle.display === 'block' ? 'none' : 'block';
            },
            hideForm() {
                this.popoverStyle.display = 'none';
            },
            displayFilterLabels () {
                this.filterLabels = [];

                this.filterLabels.push({
                    name: 'siteFilter',
                    removable: false,
                    variant: this.siteFilter.value === '1' ? 'danger' : 'primary',
                    title: this.siteFilter.value === '1' ? 'fontbundles_products' : 'designbundles_products'
                });

                if (this.productGroupFilter.value) {
                    this.filterLabels.push({
                        name: 'productGroupFilter',
                        removable: true,
                        variant: 'warning',
                        title: this.productGroupFilter.options.find(option => option.value === this.productGroupFilter.value).text
                    });
                }

                if (this.queryFilter.value && this.queryFilter.value !== '') {
                    this.filterLabels.push({
                        name: 'queryFilter',
                        removable: true,
                        variant: 'success',
                        title: this.queryFilter.value
                    });
                }

                return this.filterLabels;
            }
        }
    };
</script>

<style scoped lang="scss">
    .popover {
        z-index: 10;
        max-width: 100%;
        .arrow {
            border: none;
        }

        .popover-body {
            width: 350px;
        }

        .site-selector {
            margin-top: 0;
            display: flex;
            justify-content: space-evenly;

            .site-selector-box {
                height: 45px;
                margin: 0 3px;
                flex: 0 0 48%;

                &:first-child {
                    margin-left: 0;
                }
                &:last-child {
                    margin-right: 0;
                }
                img {
                    margin: 13px 10px 0 10px;
                }
            }
        }

        .form-control-lg,
        .custom-select {
            height: 45px!important;
            font-size: 14px;
        }

        .products-search-input {
            text-indent: 1rem;
            background-position: 10px 50%;
        }

        .new-style-btn {
            flex: 0 0 49%;
        }
    }

    .edit-btn-block {
        cursor: pointer;
        border-left: 1px solid #dee2e6;

        &__icon {
            line-height: 18px;
        }
        &__label-sm {
            line-height: normal;
        }

        @media (max-width: 575px) {
            border-left: 0;
            border-top: 1px solid #dee2e6;
        }
    }

    .filter-label {
        &.border-primary {
            border-color: #41B8FA!important;
        }
        &.border-danger {
            border-color: #E60132!important;
        }
    }

    .product-selection {
        padding-top: 20px;
        padding-bottom: 20px;
    }
</style>
