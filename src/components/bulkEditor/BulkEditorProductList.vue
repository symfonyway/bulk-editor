<template>
    <div>
        <bulk-editor-product-filter @change="productListFilterChanged"/>
        <b-row class="bg-dark text-white rounded" ref="tableWrapper">
            <b-col cols="12">
                <div class="py-2 d-flex justify-content-between align-items-center">
                    <div v-html="editingMessage"></div>
                    <b-alert v-if="errorsCount > 0" show variant="danger" class="mb-0 py-1 px-2">
                        Product with errors detected
                        <b-button v-if="errorsCount > 0 && !currentFailedProducts" size="sm" variant="danger" class="ml-2 align-baseline" @click="switchFailedProducts">Show products</b-button>
                    </b-alert>
                    <b-button v-if="errorsCount === 0 && currentFailedProducts" size="sm" variant="success" class="ml-3" @click="switchFailedProducts">Refresh product list</b-button>
                </div>
            </b-col>
            <b-col cols="12" v-if="activeAttribute.bulkFormComponent">
                <b-row class="py-3">
                    <b-col cols="12" class="pb-3">
                        <b-row class="px-1">
                            <b-col cols="2" class="mx-2 d-flex justify-content-between align-items-center border border-white rounded px-1" v-for="(productId) in productListSelection" :key="productId">
                                <span>{{productListSelectionValues[productId].name}}</span>
                                <b-icon icon="x" role="button" @click="removeSelectedProductData(productId)"></b-icon>
                            </b-col>
                        </b-row>
                    </b-col>
                    <b-col cols="12">
                        <b-row class="mx-0 border rounded">
                            <b-col cols="12" sm="auto">
                                <div class="h-100 d-flex justify-content-center align-items-center">
                                    <div>Edit selected products</div>
                                </div>
                            </b-col>
                            <b-col class="py-2">
                                <component :is="activeAttribute.bulkFormComponent" @apply="bulkValueChange" :config="formConfig" :key="attributeName" :selected-count="productListSelection.length" class="h-100 align-items-center" />
                            </b-col>
                        </b-row>
                    </b-col>

                    <b-col cols="12" class="d-flex flex-sm-row-reverse flex-sm-row flex-column">
                        <button type="button" class="btn btn-outline-success bulk-edit-row__btn slight-rounded ml-sm-4 mt-3" @click="selectAllCurrentProducts">
                            Select all products
                        </button>
                        <button type="button" class="btn btn-outline-danger bulk-edit-row__btn slight-rounded ml-0 mt-3 me-2" @click="deselectBulkProducts" v-if="productListSelection.length > 0">
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
                        :override-total-rows="overrideItems.length"
                        :hover="false"
                        :filter="tableFilter"
                        :tbody-tr-class="rowClass"
                        :paginator-config="tablePaginatorConfig"
                        class="mb-5"
                        ref="productsTable"
                        @page-changed="pageChanged"
                    >
                        <template #cell(image)="data">
                            <b-img rounded fluid :src="data.value" :alt="data.item.name"></b-img>
                        </template>
                        <template #cell(name)="data">
                            <b-row class="d-none d-sm-flex">
                                <b-col>
                                    <span>{{ data.value }}</span>
                                    <i v-if="data.item.publishingDate" v-b-tooltip.hover="'Not published product'" class="fa fa-hourglass-half"></i>
                                </b-col>
                            </b-row>
                            <b-row class="mt-sm-3">
                                <b-col v-if="activeAttribute.isAbleEditProduct(data.item, formConfig)">
                                    <component
                                        :is="activeAttribute.quickFormComponent"
                                        :value="getProductDataFromTableItem(data.item)"
                                        :key="attributeName + data.item.id"
                                        :index="attributeName + data.item.id"
                                        :errors="(productErrors[data.item.id] && productErrors[data.item.id][attributeName]) || []"
                                        :config="formConfig"
                                        :hasChanges="productValues[data.item.id] && Object.hasOwn(productValues[data.item.id], attributeName)"
                                        quickForm
                                        @change="singleValueChange(data.item.id, $event, data.item)"
                                    />
                                </b-col>
                                <b-col v-else>
                                    <div>Can't edit this product</div>
                                </b-col>
                            </b-row>
                        </template>
                        <template #cell(checkbox)="data">
                            <div class="input-group">
                                <div class="input-group-text bg-white">
                                    <b-form-checkbox
                                        v-if="activeAttribute.bulkFormComponent && activeAttribute.isAbleEditProduct(data.item, formConfig)"
                                        name="productListSelection"
                                        v-model="productListSelectionModel"
                                        :value="data.item.id"
                                        @change="addRemoveSelectedProductData($event, data.item)"
                                    />
                                </div>
                            </div>
                        </template>
                        <template #table-busy>
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
                        tdClass: 'text-white w-25'
                    },
                    {
                        key: 'name',
                        label: 'Name',
                        thClass: 'd-none',
                        tdClass: 'text-white text-left'
                    },
                    {
                        key: 'checkbox',
                        thClass: 'd-none',
                        tdClass: 'text-white align-middle'
                    }
                ],
                overrideItems: [
                    {
                        type: "favorite",
                        date: "2022-08-01 08:31:36",
                        timeago: "3 months ago",
                        description: "1 person has favorited Webfont testtt.",
                        category: "Dota 2",
                        id: 1,
                        name: "Bristle Back",
                        image: 'https://i.ytimg.com/vi/93YrB74b3Xo/maxresdefault.jpg',
                        url: 'https://i.ytimg.com/vi/93YrB74b3Xo/maxresdefault.jpg',
                        viewed: true,
                        price: "15",
                        corp: "88",
                        tags: "dota,lol,bristle",
                        themes: []
                    },
                    {
                        type: "favorite",
                        date: "2022-08-01 08:31:36",
                        timeago: "3 months ago",
                        description: "1 person has favorited Webfont testtt.",
                        category: "Dota 2",
                        id: 2,
                        name: "Rubick",
                        image: 'https://wallpapercave.com/wp/wp9566806.jpg',
                        url: 'https://wallpapercave.com/wp/wp9566806.jpg',
                        viewed: true,
                        price: "15",
                        corp: "88",
                        tags: "dota,lol,rubick",
                        themes: []
                    },
                    {
                        type: "favorite",
                        date: "2022-08-01 08:31:36",
                        timeago: "3 months ago",
                        description: "1 person has favorited Webfont testtt.",
                        category: "Dota 2",
                        id: 3,
                        name: "Dark Seer",
                        image: "https://i.pinimg.com/736x/8b/71/bf/8b71bf30f06165e5d6ab835984b8a6ab.jpg",
                        url: "https://i.pinimg.com/736x/8b/71/bf/8b71bf30f06165e5d6ab835984b8a6ab.jpg",
                        viewed: true,
                        price: "15",
                        corp: "88",
                        tags: "dota,lol,dark",
                        themes: []
                    },                    
                    {
                        type: "favorite",
                        date: "2022-08-01 08:31:36",
                        timeago: "3 months ago",
                        description: "1 person has favorited Webfont testtt.",
                        category: "Dota 2",
                        id: 4,
                        name: "Shadow Fiend",
                        image: "https://kibersport.net/wp-content/uploads/2020/07/ikhsan-oktrian-shadow-fiend.jpg",
                        url: "https://kibersport.net/wp-content/uploads/2020/07/ikhsan-oktrian-shadow-fiend.jpg",
                        viewed: true,
                        price: "15",
                        corp: "88",
                        tags: "dota,lol,sf",
                        themes: []
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
                    pills: false,
                    limit: 4,
                    showJumper: false,
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

                return {
                    attributeName: this.attributeName,
                    options: this.activeAttribute.options && this.activeAttribute.options[0] || {}
                }
            },
            attributeName: function () {
                return this.activeAttribute.key;
            },
            changedProductsCount: function () {
                return Object.keys(this.productValues).length;
            },
            errorsCount: function () {
                return Object.values(this.productErrors).filter(value => Object.hasOwn(value, this.attributeName)).length;
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
                const currentValue = (this.productValues[productId] && Object.hasOwn(this.productValues[productId], this.attributeName))
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
            },
            rowClass (item, type) {
                if (!item || type !== 'row') return;

                return this.productValues[item.id] && Object.hasOwn(this.productValues[item.id], this.attributeName) ? 'changed-product-attribute' : '';
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
                const item = this.productValues[dataItem.id] && Object.hasOwn(this.productValues[dataItem.id], this.attributeName)
                    ? this.productValues[dataItem.id]
                    : dataItem;

                // return deep copy of value to avoid changing of source
                return JSON.parse(JSON.stringify(this.getAttrValueFromObject(item)));
            },
            getAttrValueFromObject (item) {
                if (Object.hasOwn(this.activeAttribute, 'keyMap') && !Object.hasOwn(item, this.attributeName)) {
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
                    return Object.hasOwn(value, this.attributeName) ? key : null;
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
