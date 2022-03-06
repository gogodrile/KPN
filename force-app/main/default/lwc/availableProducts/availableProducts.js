import {LightningElement, wire, track, api} from 'lwc';
import getPriceBooks from '@salesforce/apex/AvailableProducts_Controller.getPriceBooks';
import ORDER_PRODUCT from '@salesforce/schema/OrderItem';
import submitOrderProduct from '@salesforce/apex/AvailableProducts_Controller.submitOrderProduct';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Order.Status';

const fields = [STATUS_FIELD];

// datatable columns with row actions. Set sortable = true
const columns = [ { label: 'Name', fieldName : 'Product_Name__c',  sortable: "true"}, 
                  { label: 'List Price', fieldName: 'UnitPrice', sortable: "true"},];
export default class DataTableSortingLWC extends NavigationMixin(LightningElement)  {
    @api recordId;
    @track data;
    @track columns = columns;
    @track sortBy;
    @track sortDirection;
    @track isModalOpen = false;
    @track OrderProduct = {};
    url;
    orderURL;
    
    @wire(getPriceBooks, {orderID: '$recordId'})
    products(result) {
        if (result.data) {
            this.data = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.data = undefined;
        }
    }
    @wire(getRecord, { recordId: '$recordId', fields })
    order;
    get status() {
        return getFieldValue(this.order.data, STATUS_FIELD);
    }
    get isActive(){
        if(this.status === 'Activated'){
            return true;
        }
        return false;
    }
    connectedCallback() {
        
        this.orderURL = {
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view'
            }
        };
        this[ NavigationMixin.GenerateUrl ]( this.orderURL )
            .then( url => this.url = url );

    }
    renderedCallback() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                if(field.fieldName == 'OrderId')
                    field.value = this.recordId;
            });
        }
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }
    addProducts() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }
    
    handleSubmit(event){
        event.preventDefault();       // stop the form from submitting
            Object.assign(
              this.OrderProduct, 
              event.detail.fields,
               { sobjectType: ORDER_PRODUCT.objectApiName }
            );
            submitOrderProduct({OrderProduct:this.OrderProduct})
            .then(result => {
                this.isModalOpen = false;
                window.open( this.url, '_self' );
            })
            .catch(error => {
                this.error = error;
            });
          }
}