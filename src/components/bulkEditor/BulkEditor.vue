<template>
    <b-container id="productBulkEditor">
        <b-row>
            <b-col sm="4" md="3" class="attribute-list-wrapper">
                <bulk-editor-attribute-list @change="activeAttribute = $event" :app-data="appData" :site="siteId" :product-errors="productValuesErrors" class="mb-3"/>
            </b-col>
            <b-col class="border border-black mr-sm-3 bg-dark text-white rounded-2">
                <bulk-editor-product-list
                    v-if="activeAttribute"
                    :active-attribute="activeAttribute"
                    :product-values="productValuesForUpdate"
                    :product-errors="productValuesErrors"
                    :initial-filter="initialFilterValues"
                    @change-value="productValueChange"
                    @reset-product-list-selection="resetProductValuesForUpdate"
                    ref="productListRef"
                />
            </b-col>
        </b-row>

        <div v-if="editingProductsCount > 0" class="fixed-bottom d-inline-block bg-dark p-2 save-cancel-block slight-rounded">
            <button :disabled="isSavingBulk || editingProductsCount === 0" class="new-style-btn green-solid slight-rounded px-5 py-2 me-2" @click="saveValidProductAttributes">
                <b-spinner v-if="isSavingBulk" small></b-spinner>
                {{ isSavingBulk ? 'Saving...' : 'Save all' }}
            </button>
            <button :disabled="isSavingBulk || editingProductsCount === 0" class="new-style-btn red-solid slight-rounded px-5 py-2" @click="resetChanges"> Cancel </button>
        </div>
    </b-container>
</template>

<script>
import BulkEditorAttributeList from './BulkEditorAttributeList';
import BulkEditorProductList from './BulkEditorProductList';
import {validationMixin} from 'vuelidate';

export default {
  name: 'BulkEditor',
  components: {
    BulkEditorAttributeList,
    BulkEditorProductList
  },
  mixins: [validationMixin],
  validations() {
    const validationSchema = {
      productValuesForUpdate: {}
    };

    // for each product change we should set validation rules
    for (let productId in this.productValuesForUpdate) {
      if (this.productValuesForUpdate[productId].hasOwn(this.activeAttribute.key)) {
        let attributeValidators = {...this.attributeValidators(this.productValuesForUpdate[productId][this.activeAttribute.key], this.productInitialValues[productId][this.activeAttribute.key])};

        validationSchema['productValuesForUpdate'][productId] = {
          [this.activeAttribute.key]: attributeValidators
        }
      }
    }

    return validationSchema;
  },
  props: {
    appData: Object
  },
  data() {
    return {
      activeAttribute: null,
      productValuesForUpdate: {}, // Product IDs as keys with list of attributes and related values
      productValuesErrors: {}, // Product IDs as keys with list of attribute's with errors
      productInitialValues: {}, // Product IDs as keys with list of attribute's with errors
      isSavingBulk: false,
      siteId: '1'
    };
  },
  computed: {
    editingProductsCount: function () {
      return Object.keys(this.productValuesForUpdate).length;
    },
    initialFilterValues: function () {
      return {
        siteId: this.appData.defaultSiteId
      }
    }
  },
  methods: {
    resetProductValuesForUpdate() {
      this.productValuesForUpdate = {};
    },
    productValueChange(productData) {
      if (this.isSavingBulk) {
        return;
      }

      if (!this.productValuesForUpdate[productData.id]) {
        this.$set(this.productValuesForUpdate, productData.id, {});
        this.productInitialValues[productData.id] = {};
      }

      this.productInitialValues[productData.id][this.activeAttribute.key] = productData.initialValue;
      this.$set(this.productValuesForUpdate[productData.id], this.activeAttribute.key, productData.value);
      this.validateProductValues(productData.id);
    },
    validateProductValues(productId) {
      if (this.$v && this.$v.productValuesForUpdate) {
        if (this.productValuesErrors[productId] && this.productValuesErrors[productId][this.activeAttribute.key]) {
          this.$delete(this.productValuesErrors[productId], this.activeAttribute.key);

          if (Object.keys(this.productValuesErrors[productId]).length === 0) {
            this.$delete(this.productValuesErrors, productId);
          }
        }

        const errors = this.lookForValidationResult(this.$v.productValuesForUpdate[productId]);

        if (!errors) {
          return;
        }

        if (Object.keys(errors).length > 0) {
          if (!this.productValuesErrors[productId]) {
            this.$set(this.productValuesErrors, productId, {});
          }

          this.$set(this.productValuesErrors[productId], this.activeAttribute.key, errors[this.activeAttribute.key]);
        }
      }
    },
    lookForValidationResult($validatorObj) {
      if ($validatorObj.$invalid === false) {
        return null;
      }

      let result = {};

      for (let param in $validatorObj.$params) {
        if (typeof $validatorObj[param] === 'boolean') {
          result = Array.isArray(result) ? result : [];
          if (!$validatorObj[param]) {
            result.push({
              key: param,
              message: this.generateErrorMessages(param, $validatorObj.$params[param]),
              model: $validatorObj.$model // we need model to find exact relation of the error message
            });
          }
        } else {
          let res = this.lookForValidationResult($validatorObj[param]);

          if (null !== res) {
            if (param === '$each') {
              Object.keys(res).forEach(k => {
                res[k].model = $validatorObj[param][k].$model;
              });
            }
            result[param] = res;
          }
        }
      }

      return result;
    },
    generateErrorMessages(valName, valParams) {
      return valName + valParams.join(', ');
      // return getErrorMessage(
      //     valName,
      //     valParams,
      //     this.activeAttribute.customErrors && this.activeAttribute.customErrors[valName]
      // );
    },
    saveValidProductAttributes() {
      if (this.isSavingBulk) {
        return;
      }

      const productRequestData = [];

      for (let productId in this.productValuesForUpdate) {
        const errors = this.productValuesErrors[productId];
        const productData = this.filterProductData({...this.productValuesForUpdate[productId]}, errors);

        if (Object.keys(productData).length === 0) {
          continue;
        }

        productData.id = productId;
        productRequestData.push(productData);
      }

      this.postDataToServer(productRequestData);
    },
    postDataToServer(productRequestData) {
      if (productRequestData.length === 0) {
        return;
      }

      this.isSavingBulk = true;

      // function to bind correct key-values to root product value
      const processKeyMapValues = product => {
        let processedProduct = {...product};

        switch (true) {
          case processedProduct.hasOwn('priceCorp'):
            processedProduct.price = product.priceCorp.price;
            processedProduct.corp = product.priceCorp.corp;
            delete processedProduct.priceCorp;
            break;
          case processedProduct.hasOwn('addOnsAndCorp'):
            processedProduct.addOns = product.addOnsAndCorp.addOns;
            delete processedProduct.addOnsAndCorp;
            break;
          default:
            break;
        }

        return processedProduct;
      };

      // before sending post data we should convert key-values
      return Promise.resolve(productRequestData.map(processKeyMapValues)).then(response => {
        switch (response.status) {
          case 200:
            productRequestData.forEach(singleProductData => {
              Object.keys(singleProductData).forEach(attribute => {
                if (attribute === 'id') return;
                this.$delete(this.productValuesForUpdate[singleProductData.id], attribute);
              });

              if (Object.keys(this.productValuesForUpdate[singleProductData.id]).length === 0) {
                this.$delete(this.productValuesForUpdate, singleProductData.id);
              }
            });
            this.makeToast('success', 'Changes have been saved');
            this.refreshSelectedBulkProducts(productRequestData);
            this.$refs.productListRef.currentFailedProducts = null;
            this.$root.$emit('bv::refresh::table', 'productListTable');
            break;
          case 207: // we have validation errors from backend
            this.makeToast('danger', 'Please, fix errors');
            break;
          default:
            this.makeToast('danger', 'Error occurred');
        }
      }).catch(reason => {
        this.makeToast('danger', reason.response.data.join(''));
      }).finally(() => {
        this.isSavingBulk = false;
      })
    },
    filterProductData(productData, productErrors) {
      if (!productErrors) {
        return productData
      }

      const validData = {};

      for (let attribute in productData) {
        if (!productErrors.hasOwn(attribute)) {
          validData[attribute] = productData[attribute];
        }
      }

      return validData;
    },
    resetChanges() {
      this.productValuesForUpdate = {};
      this.productValuesErrors = {};
      this.$refs.productListRef.currentFailedProducts = null;
    },
    refreshSelectedBulkProducts(sentData) {
      // Update each selected product data if it was saved
      sentData.forEach(productData => {
        if (this.$refs.productListRef.productListSelectionValues.hasOwn(productData.id)) {
          const updatedProduct = {...this.$refs.productListRef.productListSelectionValues[productData.id], ...productData};
          this.$set(this.$refs.productListRef.productListSelectionValues, productData.id, updatedProduct);
        }
      });
    },
    makeToast(type, message) {
      const spanIcon = this.$createElement(
        'span',
        {class: ['noty-icon']},
        [
          this.$createElement('i', {
            class: ['fa', type === 'success' ? 'fa-check' : 'fa-times-circle'],
            props: {'aria-hidden': 'true'}
          })
        ]
      );
      const spanText = this.$createElement(
        'span',
        {class: ['noty-txt']},
        message
      );

      this.$bvToast.toast([spanIcon, spanText], {
        noCloseButton: true,
        variant: type,
        solid: true,
        autoHideDelay: 3000,
        toaster: 'b-toaster-top-right bootstrap-4',
        toastClass: 'noty_message mx-auto toast-type toast-type__' + type,
        bodyClass: 'noty_text'
      })
    },
    attributeValidators: function (attributeData, productInitialData) {
      return typeof this.activeAttribute.validators === 'function'
        ? this.activeAttribute.validators(attributeData, productInitialData)
        : this.activeAttribute.validators;
    }
  },
  mounted: function () {
    this.$root.$on('save-all-products', data => {
      this.$set(this.activeAttribute.options[0], 'isSaveAllProducts', true);

      Promise.resolve(data).then(response => {
        switch (response.status) {
          case 200:
            this.makeToast('success', 'changes have been saved');
            break;
          case 207: // we have validation errors from backend
            // todo: show validation error in toast
            this.makeToast('danger', 'please_fix_errors');
            break;
          default:
            this.makeToast('danger', 'error occurred');
        }
      }).catch(reason => {
        if (reason.response && reason.response.status < 500 && reason.response.hasOwn('data') && reason.response.data.hasOwn('error')) {
          const errorObj = reason.response.data.error;

          if (errorObj.hasOwn('errors') && Array.isArray(errorObj.errors) && errorObj.errors.length > 0) {
            this.makeToast('danger', errorObj.errors.join("\n"));

            return;
          }
        }

        this.makeToast('danger', 'error occurred');
      }).finally(() => {
        this.$set(this.activeAttribute.options[0], 'isSaveAllProducts', false);
        this.$root.$emit('bv::refresh::table', 'productListTable');
      });
    });
  }
};
</script>
