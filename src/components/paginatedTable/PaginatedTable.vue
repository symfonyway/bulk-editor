<template>
    <div id="vue-app-wrapper" class="vue-app-styles">
        <b-table
            :id="tableId"
            :items="overrideItems || tableDataProvider"
            :fields="tableFields"
            :class="tableClass"
            :current-page="overrideItems ? null : currentPage"
            :per-page="overrideItems ? null : perPage"
            :filter="filter"
            :busy="isDataLoading"
            :hover="hover"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            :selectable="selectable"
            caption-top
            show-empty
            v-bind="$attrs"
            :striped="striped"
            :borderless="borderless"
            :bordered="bordered"
            ref="paginatedTable"
            @refreshed="$emit('refreshed', {totalRows: overrideTotalRows || totalRows})"
            @sort-changed="onSortChange"
            stacked="md"
        >
            <template v-for="(_, scopedSlotName) in $slots" v-slot:[scopedSlotName]="slotData">
                <slot :name="scopedSlotName" v-bind="slotData"></slot>
            </template>
            <template v-slot:table-busy v-if="!$slots.hasOwnProperty('table-busy')">
                <div class="text-center text-primary my-5">
                    <b-spinner class="align-middle"></b-spinner>
                    <strong>Loading...</strong>
                </div>
            </template>
        </b-table>
        <div v-if="isBusy" class="table-loading d-flex justify-content-center align-items-center">
            <b-spinner variant="primary" key="primary"></b-spinner>
        </div>
        <div class="table-pagination-wrapper overflow-auto mt-4 pt-4 d-flex flex-column flex-md-row align-items-center justify-content-md-end" v-if="overrideTotalRows || totalRows > perPage">
            <b-pagination
                    v-model="currentPage"
                    :total-rows="overrideTotalRows || totalRows"
                    :per-page="perPage"
                    :aria-controls="tableId"
                    align="right"
                    v-bind="paginatorConfig"
                    v-on:click="scrollToTop"
                    @change="$emit('page-changed', $event)"
            >
                <template v-slot:first-text><i class="fa fa-angle-double-left"></i></template>
                <template v-slot:prev-text><i class="fa fa-angle-left"></i></template>
                <template v-slot:next-text><i class="fa fa-angle-right"></i></template>
                <template v-slot:last-text><i class="fa fa-angle-double-right"></i></template>
            </b-pagination>

            <div class="page-jump-block" v-if="paginatorConfig.showJumper">
                <div>
                    <span class="page-jump-text">Go to page: </span>
                    <input type="number" min="1" step="1" class="page-jump-input" v-model="pageJumpNumber">
                    <button class="page-jump-btn new-style-btn admin-btn small-btn" @click="_ => changePage()">GO</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'paginated-table',
        props: {
            striped: {
                type: Boolean,
                default: false
            },
            bordered: {
                type: Boolean,
                default: false
            },
            tableId: {
                type: String,
                default: 'vue-app-table'
            },
            // custom set of items, only for specific use!
            overrideItems: Array,
            overrideTotalRows: {
                type: Number || null,
                default: null
            },
            // Attention: this property should be set only once to avoid double-request
            perPage: {
                type: Number,
                default: 30
            },
            page: {
                type: Number,
                default: 1
            },
            tableClass: {
                type: String,
                default: ''
            },
            borderless: {
                type: Boolean,
                default: false
            },
            isBusy: {
                type: Boolean,
                default: false
            },
            paginationData: {
                type: Object,
                default: null
            },
            tableFields: {
                type: Array,
                default: () => {
                    return []
                }
            },
            apiUrl: {
                type: String,
                required: true
            },
            hover: {
                type: Boolean,
                default: true
            },
            selectable: {
              type: Boolean,
              default: false,
            },
            scrollable: {
              type: Boolean,
              default: false,
            },
            // table filter to get filtered data
            // Attention: this property should be set only once to avoid double-request
            filter: {
                type: Array,
                default: null
            },
            sortDataBy: {
                type: String,
                default: '',
                required: false
            },
            sortDataDesc: {
                type: Boolean,
                default: false
            },
            apiV2: { // TODO: should be true, now it is false for backward compatibility
                type: Boolean,
                default: false
            },
            paginatorConfig: {
                type: Object,
                default: () => {
                    return {
                        pills: false,
                        showJumper: false
                    }
                }
            }
        },
        data: () => {
            return {
                currentPage: 1,
                totalRows: 0,
                sortBy: '',
                sortDesc: true,
                isDataLoading: false,
                pageJumpNumber: null
            }
        },
        mounted () {
            this.currentPage = this.page;
            this.sortBy = this.sortDataBy;
            this.sortDesc = this.sortDataDesc;
        },
        methods: {
            onSortChange (ctx) {
                this.$emit('sort-changed', ctx);
            },
            tableDataProvider: async function (ctx) {
                this.currentPage = ctx.currentPage;
                this.isDataLoading = true;

                const promise = new Promise((resolve) => {
                    resolve();
                });

                return promise.then(() => {
                    // this.totalRows = responseData.data[this.responseMapping.totalRows];
                    //
                    // if (typeof(responseData.data[this.responseMapping.additionalData]) != 'undefined') {
                    //     this.$emit('sendAdditionalData', responseData.data[this.responseMapping.additionalData])
                    // }
                    //
                    // let items = responseData.data[this.responseMapping.items];
                    //
                    // if (typeof this.onDataLoaded === 'function') {
                    //     this.onDataLoaded(items);
                    // }

                    return [];
                }).catch(error => {
                    console.log(error);
                    this.totalRows = 0;

                    return [];
                }).finally(() => {
                      this.isDataLoading = false;
                });
            },
            changePage: function (pageNum = null) {
                pageNum = pageNum || parseInt(this.pageJumpNumber);

                if (pageNum && this.currentPage !== pageNum) {
                    this.currentPage = pageNum;
                    this.$emit('page-changed', this.currentPage)
                }
            },
            scrollToTop() {
                if (this.scrollable) document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
            }
        },
        watch: {
            filter: {
                deep: true,
                handler: function () {
                    this.changePage(1);
                }
            }
        }
    };
</script>