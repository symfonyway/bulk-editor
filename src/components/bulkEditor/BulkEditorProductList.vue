<template>
    <div>
        <bulk-editor-product-filter @change="productListFilterChanged" :initial-values="initialFilter"/>
        <b-row class="bg-dark text-white rounded" ref="tableWrapper">
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

                    <b-col cols="12" class="d-flex flex-sm-row-reverse flex-sm-row flex-column" v-if="productListSelection.length > 0">
                        <button type="button" class="btn btn-outline-success bulk-edit-row__btn slight-rounded ml-sm-4 mt-3" @click="selectAllCurrentProducts">
                            Select all products
                        </button>
                        <button type="button" class="btn btn-outline-danger bulk-edit-row__btn slight-rounded ml-0 mt-3" @click="deselectBulkProducts">
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
                        api-url=""
                        :override-items="overrideItems"
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
                                <div class="text-white">Hello</div>
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
                        tdClass: 'text-white'
                    },
                    {
                        key: 'name',
                        label: 'Name',
                        thClass: 'd-none',
                        tdClass: 'text-white'
                    },
                    {
                        key: 'checkbox',
                        thClass: 'd-none',
                        tdClass: 'text-white'
                    }
                ],
                overrideItems: [                
                    {
                        "type": "favorite",
                        "date": "2022-08-01 08:31:36",
                        "timeago": "3 months ago",
                        "message": "1 person has favorited Webfont testtt.",
                        "product_id": 399148,
                        "name": "Webfont testtt",
                        "image": "https://cyber.pressball.by/wp-content/uploads/2021/03/npn9pnege2b31-scaled.jpg",
                        "url": "https://cyber.pressball.by/wp-content/uploads/2021/03/npn9pnege2b31-scaled.jpg",
                        "viewed": true
                    },
                    {
                        "type": "comment",
                        "date": "2022-04-18 15:55:58",
                        "timeago": "6 months ago",
                        "message": "1 person has commented on .",
                        "product_id": 59,
                        "name": "",
                        "image": "https://cybersport.metaratings.ru/upload/iblock/1e7/1e75882bee94870e29318f7a272e100b.jpg",
                        "url": "https://cybersport.metaratings.ru/upload/iblock/1e7/1e75882bee94870e29318f7a272e100b.jpg",
                        "viewed": true
                    },
                    {
                        "type": "favorite",
                        "date": "2022-04-12 01:09:04",
                        "timeago": "7 months ago",
                        "message": "1 person has favorited night city.",
                        "product_id": 401000,
                        "name": "night city",
                        "image": "http://www.gamedeus.ru/images/games/D/dota-2/dota-2-art-08.JPG",
                        "url": "http://www.gamedeus.ru/images/games/D/dota-2/dota-2-art-08.JPG",
                        "viewed": true
                    },
                    {
                        "type": "sale",
                        "date": "2022-04-04 13:03:40",
                        "timeago": "7 months ago",
                        "message": "1 person bought $11 product",
                        "product_id": 400718,
                        "name": "$11 product",
                        "image": "https://yandex.by/images/search?from=tabbar&text=Dota%202%20%D0%B0%D1%80%D1%82%D1%8B&pos=6&img_url=http%3A%2F%2Fggdt.ru%2Ffile%2F2021%2F03%2F015310_.jpg&rpt=simage&lr=157",
                        "url": "https://yandex.by/images/search?from=tabbar&text=Dota%202%20%D0%B0%D1%80%D1%82%D1%8B&pos=6&img_url=http%3A%2F%2Fggdt.ru%2Ffile%2F2021%2F03%2F015310_.jpg&rpt=simage&lr=157",
                        "viewed": true
                    },
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
        }
    };
</script>
