<template>
    <div>
        <bulk-editor-product-filter @change="productListFilterChanged" :initial-values="initialFilter"/>
        <b-row class="bg-white rounded" ref="tableWrapper">
            <b-col cols="12">
                <div class="editing-notice py-2 d-flex justify-content-between align-items-center">
                    <div v-html="editingMessage"></div>
                    <b-alert v-if="errorsCount > 0" show variant="danger" class="mb-0 py-1 px-2">
                        Product with errors detected
                        <b-button v-if="errorsCount > 0 && !currentFailedProducts" size="sm" variant="danger" class="ml-2 align-baseline" @click="switchFailedProducts">Show products</b-button>
                    </b-alert>
                    <b-button v-if="errorsCount === 0 && currentFailedProducts" size="sm" variant="success" class="ml-3" @click="switchFailedProducts">Refresh product list</b-button>
                </div>
            </b-col>
            <b-col cols="12" v-if="activeAttribute.bulkFormComponent">
                <b-row class="bulk-edit-row py-3">
                    <b-col cols="12" class="selection-list pb-3">
                        <div class="selection-list__product" v-for="(productId) in productListSelection" :key="productId">
                            <span>{{productListSelectionValues[productId].name}}</span>
                            <i class="fa fa-times selection-list__product-remove" @click="removeSelectedProductData(productId)"></i>
                        </div>
                    </b-col>
                    <b-col cols="12">
                        <b-row class="mx-0 border rounded">
                            <b-col cols="12" sm="auto" class="">
                                <div class="bulk-edit-row__image h-100">
                                    <div class="bulk-edit-row__image-placeholder">Edit selected products</div>
                                </div>
                            </b-col>
                            <b-col class="py-2 bulk-edit-row__form">
                                <component :is="activeAttribute.bulkFormComponent" @apply="bulkValueChange" :config="formConfig" :key="attributeName+bulkFormKey" :selected-count="productListSelection.length" class="h-100 align-items-center" />
                            </b-col>
                        </b-row>
                    </b-col>

                    <b-col cols="12" class="d-flex flex-sm-row-reverse flex-sm-row flex-column">
                        <button type="button" class="btn btn-outline-success bulk-edit-row__btn slight-rounded ml-sm-4 mt-3" @click="selectAllCurrentProducts">
                            Select all products
                        </button>
                        <button type="button" class="btn btn-outline-danger bulk-edit-row__btn slight-rounded ml-0 mt-3" @click="deselectBulkProducts" v-if="productListSelection.length > 0">
                            Reset selection
                        </button>
                    </b-col>
                </b-row>
            </b-col>
            <b-col cols="12" v-if="tableFilter">
                <b-row class="bg-gray-table">
                    <paginated-table
                        v-if="tableFilterReady"
                        :table-id="tableId"
                        :table-fields="filteredTableFields"
                        :per-page="resultCount"
                        :page="tablePage"
                        api-url="/api/admin/products/find"
                        :override-items="currentFailedProducts"
                        :hover="false"
                        :filter="tableFilter"
                        :tbody-tr-class="rowClass"
                        :paginator-config="tablePaginatorConfig"
                        class="product-list mb-5"
                        ref="productsTable"
                        @page-changed="pageChanged"
                    >
                        <template v-slot:cell(image)="data">
                            <div class="image-column__block">
                                <b-img rounded fluid :src="data.value" :alt="data.item.name"></b-img>
                            </div>
                            <div class="d-sm-none pt-2 pt-sm-0 pl-sm-2 image-column__name">
                                <span class="font-weight-bold rounded p-1 px-2 product-name">{{ data.item.name }}</span>
                                <i v-if="data.item.publishingDate" v-b-tooltip.hover="'Not published product'" class="fa fa-hourglass-half"></i>
                            </div>
                        </template>
                        <template v-slot:cell(name)="data">
                            <b-row class="d-none d-sm-flex">
                                <b-col>
                                    <span class="font-weight-bold rounded p-1 px-2 product-name">{{ data.value }}</span>
                                    <i v-if="data.item.publishingDate" v-b-tooltip.hover="'Not published product'" class="fa fa-hourglass-half"></i>
                                </b-col>
                            </b-row>
                            <b-row class="mt-sm-3">
                                <b-col>
                                    <component
                                        v-if="activeAttribute.isAbleEditProduct(data.item, formConfig)"
                                        :is="activeAttribute.quickFormComponent"
                                        :value="getProductDataFromTableItem(data.item)"
                                        :key="attributeName + data.item.id"
                                        :index="attributeName + data.item.id"
                                        :errors="(productErrors[data.item.id] && productErrors[data.item.id][attributeName]) || []"
                                        :config="formConfig"
                                        :hasChanges="productValues[data.item.id] && productValues[data.item.id].hasOwn(attributeName)"
                                        quickForm
                                        @change="singleValueChange(data.item.id, $event, data.item)"
                                    />
                                    <div v-else>Can't edit this product</div>
                                </b-col>
                            </b-row>
                        </template>
                        <template v-slot:cell(checkbox)="data">
                            <b-form-checkbox
                                v-if="activeAttribute.bulkFormComponent && activeAttribute.isAbleEditProduct(data.item, formConfig)"
                                name="productListSelection"
                                size="lg"
                                v-model="productListSelectionModel"
                                :value="data.item.id"
                                @change="addRemoveSelectedProductData($event, data.item)"
                            />
                        </template>
                        <template v-slot:table-busy>
                            <i class="fas fa-spinner fa-pulse fa-stack fa-3x"></i>
                        </template>
                    </paginated-table>
                </b-row>
            </b-col>
        </b-row>
    </div>
</template>

<script>
    import PaginatedTable from '../paginatedTable/PaginatedTable.vue';
    import TextEditForm from './editForm/TextEditForm';
    import PriceEditForm from './editForm/PriceEditForm';
    import TextareaEditForm from './editForm/TextareaEditForm';
    import CategoryEditForm from './editForm/CategoryEditForm';
    import TagEditForm from './editForm/TagEditForm';
    import CheckboxGroupEditForm from './editForm/CheckboxGroupEditForm';
    import MultiSelectEditForm from './editForm/MultiSelectEditForm';
    import TypeEditForm from './editForm/TypeEditForm';
    import TagBulkEditForm from './editForm/TagBulkEditForm'
    import BulkEditorProductFilter from './BulkEditorProductFilter';

    export default {
        name: 'BulkEditorProductList',
        components: {
            BulkEditorProductFilter,
            PaginatedTable,
            TextEditForm,
            PriceEditForm,
            TextareaEditForm,
            CategoryEditForm,
            TagEditForm,
            CheckboxGroupEditForm,
            MultiSelectEditForm,
            TypeEditForm,
            TagBulkEditForm
        },
        props: {
            activeAttribute: Object,
            productValues: Object,
            productErrors: Object,
            initialFilter: Object
        },
        data () {
            return {
                editingMessage: this.generateEditText(),
                tableId: 'productListTable',
                tableFields: [
                    {
                        key: 'image',
                        label: 'Image',
                        thClass: 'd-none',
                        tdClass: 'image-column'
                    },
                    {
                        key: 'name',
                        label: 'Name',
                        thClass: 'd-none',
                        tdClass: 'property-column'
                    },
                    {
                        key: 'checkbox',
                        thClass: 'd-none',
                        tdClass: 'bulk-check'
                    }
                ],
                tableFilter: [],
                tableFilterReady: false,
                tablePage: 1,
                productListSelectionModel: [],
                productListSelection: [], // Product IDs selected by checkbox
                productListSelectionValues: {}, // Product data of selected items
                currentFailedProducts: null,
                tablePaginatorConfig: {
                    pills: true,
                    limit: 7,
                    showJumper: true,
                    'hide-ellipsis': true,
                    'last-class': 'hidden',
                    'first-class': 'hidden',
                    'next-class': 'page-np',
                    'prev-class': 'page-np',
                }
            }
        },
        computed: {
            filteredTableFields: function () {
                return this.activeAttribute.bulkFormComponent === null ? this.tableFields.filter(f => f.key !== 'checkbox') : this.tableFields;
            },
            formConfig: function () {
                let siteId = this.initialFilter.siteId;

                if (this.tableFilter.length > 0) {
                    siteId = this.tableFilter && this.tableFilter.find(item => item.key === 'sites')['value'][0] || '1';
                }

                return {
                    siteId,
                    attributeName: this.attributeName,
                    options: this.activeAttribute.options && (this.activeAttribute.options[siteId] || this.activeAttribute.options[0]) || {}
                }
            },
            bulkFormKey: function () {
                return this.formConfig.siteId;
            },
            attributeName: function () {
                return this.activeAttribute.key;
            },
            changedProductsCount: function () {
                return Object.keys(this.productValues).length;
            },
            errorsCount: function () {
                return Object.values(this.productErrors).filter(value => value.hasOwn(this.attributeName)).length;
            },
            resultCount: function () {
                // get products per page number from filter component
                return this.tableFilter.length > 0 ? this.tableFilter.find(item => item.key === 'perPage').value : 20;
            }
        },
        methods: {
            singleValueChange (productId, value, productObject) {
                if (productObject) {
                    this.addRemoveSingleSelectedProductData(productId, productObject);
                }

                this.$emit('change-value', {
                    id: productId,
                    value,
                    initialValue: this.getAttrValueFromObject(this.productListSelectionValues[productId])
                });
            },
            /**
             * Bulk update of selected products. Default behaviour is to replace existing value with new one. Can be changed with add/remove by setting actionType
             * @param value
             * @param {null|string} actionType
             */
            bulkValueChange (value, actionType = null) {
                this.productListSelection.forEach(productId => {
                    if (this.activeAttribute.isAbleEditProduct(this.productListSelectionValues[productId], this.formConfig)) {
                        const changedValue = actionType ? this.customBulkValueChange({value, actionType}, productId) : value;
                        this.singleValueChange(productId, changedValue);
                    }
                });
            },
            /**
             * On checkbox click initial Product Data saved or removed from temporary variable
             */
            addRemoveSelectedProductData (productIds, productData) {
                const productId = productData.id;
                const tmpData = this.productListSelectionValues[productId] || {};
                this.productListSelectionValues[productId] = {...tmpData, ...productData};

                this.productListSelection = Array.from(productIds);

                this.productListSelectionModel = Array.from(this.productListSelection);
            },
            addRemoveSingleSelectedProductData (productId, productData) {
                const tmpData = this.productListSelectionValues[productId] || {};
                this.productListSelectionValues[productId] = {...tmpData, ...productData};

                if (this.productListSelection.indexOf(productId) === -1) {
                    this.productListSelection.push(productId);
                }

                this.productListSelectionModel = Array.from(this.productListSelection);
            },
            removeSelectedProductData (productId) {
                this.productListSelection.splice(this.productListSelection.indexOf(productId), 1);
                this.productListSelectionModel = Array.from(this.productListSelection);
            },
            /**
             * Custom value change on bulk product update
             * @param {Object} data
             * @param {string} productId
             * @return {*}
             */
            customBulkValueChange (data, productId) {
                const currentValue = (this.productValues[productId] && this.productValues[productId].hasOwn(this.attributeName))
                    ? this.productValues[productId][this.attributeName]
                    : this.getAttrValueFromObject(this.productListSelectionValues[productId]);

                // Add or Remove value according to attribute specification
                return this.activeAttribute.changeValue(currentValue, data.value, data.actionType === 'add');
            },
            productListFilterChanged (filterData) {
                this.tableFilter = filterData;
                // Reset selected products to avoid incorrect value changing
                this.deselectBulkProducts();
                // reset show errors mode
                this.currentFailedProducts = null;
                this.tableFilterReady = true;
                this.$emit('change-site', this.formConfig.siteId);
            },
            rowClass (item, type) {
                if (!item || type !== 'row') return;

                return this.productValues[item.id] && this.productValues[item.id].hasOwn(this.attributeName) ? 'changed-product-attribute' : '';
            },
            selectAllCurrentProducts () {
                // Get local Items from paginatedTable via the $refs
                const localItems = this.$refs.productsTable.$refs.paginatedTable.localItems;

                for (let i in localItems) {
                    if (this.productListSelection.indexOf(localItems[i].id) === -1 && this.activeAttribute.isAbleEditProduct(localItems[i], this.formConfig)) {
                        this.productListSelection.push(localItems[i].id);
                        this.addRemoveSingleSelectedProductData(localItems[i].id, localItems[i]);
                    }
                }

                this.productListSelectionModel = Array.from(this.productListSelection);
            },
            deselectBulkProducts () {
                this.productListSelection = [];
                this.productListSelectionModel = [];
                // this.productListSelectionValues = {};
            },
            // get actual active attribute value for quickForm component
            getProductDataFromTableItem (dataItem) {
                const item = this.productValues[dataItem.id] && this.productValues[dataItem.id].hasOwn(this.attributeName)
                    ? this.productValues[dataItem.id]
                    : dataItem;

                // return deep copy of value to avoid changing of source
                return JSON.parse(JSON.stringify(this.getAttrValueFromObject(item)));
            },
            getAttrValueFromObject (item) {
                if (this.activeAttribute.hasOwn('keyMap') && !item.hasOwn(this.attributeName)) {
                    const dataObject = {};

                    this.activeAttribute.keyMap.forEach(key => {
                        dataObject[key] = item[key];
                    });

                    return dataObject;
                }

                return item[this.attributeName];
            },
            switchFailedProducts () {
                if (this.currentFailedProducts) {
                    this.currentFailedProducts = null;
                    return;
                }

                this.currentFailedProducts = Object.entries(this.productErrors).map(item => {
                    const [key, value] = item;
                    return value.hasOwn(this.attributeName) ? key : null;
                }).filter(value => null !== value)
                .map(value => this.productListSelectionValues[value]);
            },
            pageChanged () {
                window.scrollTo({
                    top: this.$refs.tableWrapper.offsetTop,
                    behavior: "smooth"
                });
            },
            generateEditText(){
                //generate the title for tab
                return 'You\'re editing %s'.replace('%s', this.activeAttribute.label);
            },
        },
        watch: {
            productListSelection: {
                handler: function (newValue) {
                    if (newValue.length === 0) {
                        this.$emit('reset-product-list-selection');
                    }
                },
                deep: true,
            },
            activeAttribute: function () {
                this.editingMessage = this.generateEditText();
                this.currentFailedProducts = null;
            }
        },
        created () {
            // control initial page number by query string parameter
        }
    };
</script>

<style scoped lang="scss">
    .product-list {
        padding: 0;
        width: 100%;

        &::v-deep {
            [data-label] {
                @media (max-width: 540px) {
                    &:before {
                        width: 25% !important;
                    }
                    > div {
                        width: calc(75%) !important;
                    }
                }
            }
            .image-column {
                width: 195px;
                padding-left: 15px;
                padding-right: 0;
                vertical-align: top!important;
                &__block {
                    max-width: 180px;
                    > img {
                        max-width: 180px;
                    }
                }
            }

            .property-column {
                vertical-align: top!important;
                text-align: left;
                padding: 16px 15px 12px;
            }

            .bulk-check {
                width: 90px;
            }

            .changed-product-attribute {
                background-color: rgb(240, 248, 255);
            }

            .product-name {
                font-size: 0.9em;
                background-color: #F5F5F5;
                word-break: break-word;
            }

            // custom styles for pagination
            .table-pagination-wrapper {
                background-color: #F1F3FA;
                padding-bottom: 3rem;
                padding-right: 1rem;

                .b-pagination-pills {
                    margin-bottom: 0 !important;
                    .page-item {
                        .page-link {
                            border-radius: 3px!important;
                            border-color: #F1F3FA;
                            padding: .75rem .95rem;
                            font-weight: bold;
                            color: #999;

                            &:hover {
                                background-color: #1c9cd2;
                                color: #fff;
                            }
                        }

                        &.active {
                            .page-link {
                                background-color: #1c9cd2;
                                color: #fff;
                            }
                        }

                        &.page-np {
                            .page-link {
                                padding: .75rem .65rem;
                            }
                        }

                        &.disabled {
                            .page-link {
                                background-color: #ddd;
                            }
                        }
                    }
                }
            }

            @media (max-width: 540px) {
                tbody {
                    display: block;

                    tr {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;

                        &.b-table-busy-slot {
                            > td {
                                width: 100%;
                            }
                        }

                        .image-column {
                            //flex: 0 0 85%;
                            width: 100%;
                            text-align: left;
                            display: flex;
                            &__block {
                                max-width: 150px;
                                flex: 0 0 40%;
                                > img {
                                    max-width: 150px;
                                }
                            }
                            &__name {
                                flex: 0 0 60%;
                                display: flex;
                                align-items: center;
                            }
                        }

                        .property-column {
                            order: 3;
                            width: 100%;
                            border-top: 0;
                            padding: 0 20px 0.75rem;
                        }
                        .bulk-check {
                            order: 2;
                            //flex: 0 0 15%;
                            width: 100%;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                        }
                    }
                }
            }
        }
    }

    .hover-state {
        min-width: 180px;
        &:hover {
            span:first-child {
                display: none !important;
            }
            span:last-child {
                display: block !important;
            }
        }
    }

    .editing-notice {
        font-size: 1rem;
        padding-left: 5px;
        height: 60px;

        .alert {
            line-height: 33px;
            font-size: .9rem;
        }
    }

    .bulk-edit-row {
        border-bottom: 2px solid #dee2e6;
        border-top: 1px solid #dee2e6;

        &__image {
            width: 150px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 90px;

            &-placeholder {
                text-align: center;
                font-size: 1rem;
                font-weight: bold;
            }

            @media (max-width: 540px) {
                width: 100%;
            }
        }

        &__check {
            width: 60px;
        }

        &__form {
            border-top: 1px solid #dee2e6 !important;

            @media (min-width: 540px) {
                border-top: 0 !important;
                border-left: 1px solid #dee2e6 !important;
                padding-right: 90px;
            }
        }

        &__btn {
            font-size: .9em;
            font-weight: 700;
            padding: .85rem 1.5rem;

            &.btn-outline-success {
                border-color: #5ac651;
                &:hover {
                    background-color: #5ac651;
                }
            }
        }

        .selection-list {
            &__product {
                background: #efefef;
                display: inline-block;
                margin: 3px;
                padding: 3px;
                span {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    max-width: 170px;
                    white-space: nowrap;
                    font-size: .8em;
                    vertical-align: middle;
                    display: inline-block;
                    padding: 0 3px;
                }
                &-remove {
                    padding: 3px 5px;
                    border-left: 1px solid #ddd;
                    cursor: pointer;
                    color: #999;
                    font-weight: normal;
                }
            }
        }
    }

    .bg-gray-table {
        background-color: #F1F3FA;
    }

    .tooltip.b-tooltip.bs-tooltip-top {
        margin-bottom: 5px;
    }
</style>
