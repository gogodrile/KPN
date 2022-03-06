public with sharing class OrderProducts_Controller {
    @AuraEnabled(Cacheable=true)
    public static List<OrderItem> getOrderItems(String orderID) {
        List<OrderItem> OrderItemList = [ SELECT Product_Name__c, UnitPrice, Quantity, TotalPrice
                                   FROM OrderItem WHERE orderID = : orderID ];
        return OrderItemList;
    }
}