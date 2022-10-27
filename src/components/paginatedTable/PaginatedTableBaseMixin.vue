<script>
    import Url from 'url-parse'

    /**
     * Make your own Mixin for your table to use correct request and response data
     */
    export default {
        name: 'PaginatedTableBaseMixin',
        data: () => {
            return {
                // Values of this object are actual response keys
                responseMapping: {
                    totalRows: 'totalRows',
                    items: 'items',
                    additionalData: 'additionalData',
                }
            }
        },
        methods: {
            // Return object with data for axios request
            prepareApiRequest: function (ctx) {
                const urlParsed = new Url(this.apiUrl, true);

                if (typeof urlParsed.query !== 'object') {
                    urlParsed.query = {};
                }

                urlParsed.query['page'] = ctx.currentPage;
                urlParsed.query['limit'] = ctx.perPage;
                if (this.filter != null) {
                    this.filter.forEach(function(value) {
                        urlParsed.query['filter[' + value.key + '][value]'] = value.value;
                        urlParsed.query['filter[' + value.key + '][cond]'] =  value.cond;
                    });
                }
                
                if (this.sortBy) {
                    urlParsed.query['sortBy'] = this.sortBy;
                    urlParsed.query['sortDir'] = this.sortDesc ? 'desc' : 'asc';
                }

                return {
                    method: 'get',
                    url: urlParsed.toString(),
                    data: {}
                };
            }
        }
    };
</script>
