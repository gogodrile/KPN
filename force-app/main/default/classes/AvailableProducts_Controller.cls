public with sharing class AvailableProducts_Controller {
    @AuraEnabled(Cacheable=true)
    public static List <PricebookEntry> getPriceBooks(String orderID) {
        Order Order = [select id, Pricebook2Id FROM Order where Id = : orderID LIMIT 1];
        List<PricebookEntry> PBEntries = [ SELECT Id, Product_Name__c, UnitPrice, Pricebook2Id
                                   FROM PricebookEntry WHERE Pricebook2Id =: Order.Pricebook2Id ];
        return PBEntries;
    }
    @AuraEnabled(Cacheable=false)
    public static List<Id> submitOrderProduct(OrderItem OrderProduct) {
        List<Id> NewProducts = new List<Id>();
        Order Order = [SELECT Id, Pricebook2Id FROM Order WHERE Id =: OrderProduct.OrderId LIMIT 1];
        Pricebook2 PriceBook = [SELECT Id FROM PriceBook2 WHERE Id =: Order.Pricebook2Id LIMIT 1];
        PricebookEntry PricebookEntry = [SELECT Id, Product2Id, UnitPrice FROM PricebookEntry WHERE Product2Id =: OrderProduct.Product2Id 
                                         AND Pricebook2Id =: PriceBook.Id LIMIT 1 ];
        OrderProduct.UnitPrice = PricebookEntry.UnitPrice;
        OrderProduct.PricebookEntryId = PricebookEntry.Id;
        Insert OrderProduct;
        NewProducts.add(OrderProduct.Id);
        return NewProducts;
    }  
}