import {LightningElement, wire, track, api} from 'lwc';
import getOrderItems from '@salesforce/apex/OrderProducts_Controller.getOrderItems';
import { NavigationMixin } from 'lightning/navigation';
import { updateRecord, getRecord, getFieldValue } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Order.Status';

const fields = [STATUS_FIELD];

// datatable columns with row actions. Set sortable = true
const columns = [ { label: 'Name', fieldName : 'Product_Name__c',  sortable: "true"}, 
                  { label: 'Unit Price', fieldName: 'UnitPrice', sortable: "true"},
                  { label: 'Quantity', fieldName: 'Quantity', sortable: "true"},
                  { label: 'Total Price', fieldName: 'TotalPrice', sortable: "true" },];

export default class DataTableSortingLWC extends NavigationMixin(LightningElement)  {
    @api recordId;
    @track data;
    @track columns = columns;
    @track sortBy;
    @track sortDirection;
    recordId;
    url;
    orderURL;
    
    @wire(getOrderItems,{orderID: '$recordId'})
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
    activate(){
        let record = {
            fields: {
                Id: this.recordId,
                Status: 'Activated',
            },
        };
 updateRecord(record)
        // eslint-disable-next-line no-unused-vars
        .then(() => {
            window.open( this.url, '_self' );
        })
        .catch(error => {
            this.error = error;
        });
}
}