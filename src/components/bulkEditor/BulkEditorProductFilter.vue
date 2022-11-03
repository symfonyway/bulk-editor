<template>
    <b-row class="bg-dark border-bottom border-white text-white mb-3 py-2 px-4 rounded-top" v-click-outside="hideForm" ref="filterBlock">
        <b-col cols="10" class="text-center rounded-left d-none d-sm-flex align-items-center product-selection">
            <span>Product selection</span>
        </b-col>

        <b-col cols="3" id="popover-target-1" sm="auto" class="bg-dark text-white text-center d-sm-flex justify-content-center flex-sm-column edit-btn-block" ref="editBtnBlock" @click="toggleForm">
            <i class="far fa-edit edit-btn-block__icon"></i>
            <b-button variant="dark" class="d-none border-white d-sm-block edit-btn-block__label-sm"><small>edit selection</small></b-button>
        </b-col>

        <b-popover target="popover-target-1" triggers="hover" placement="top">
            <div class="border-bottom pb-3 mb-2">
                <label for="productName">Search product</label>
                <b-form-input id="productName" v-model="queryFilter.value" :data-placeholder="productNamePlaceholder" size="lg" class="products-search-input" debounce="700" @update="applyFilter"/>
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
        </b-popover>
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
                if (name && Object.hasOwn(this, name)) {
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

