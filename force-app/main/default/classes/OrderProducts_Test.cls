@isTest
private class OrderProducts_Test {
    @testSetup static void dataSetup() {
		Id pricebookId = Test.getStandardPricebookId();        
        Product2 product = new Product2(
        name = 'Test Product',
        IsActive = True);
        insert product;
        
 		PricebookEntry standardPrice = new PricebookEntry(
        Pricebook2Id = pricebookId, 
        Product2Id = product.Id,
        UnitPrice = 10000, 
        IsActive = true);
        insert standardPrice;
        
        Pricebook2 customPB = new Pricebook2(Name='Custom Pricebook', isActive=true);
        insert customPB;
        
        PricebookEntry customPrice = new PricebookEntry(
        Pricebook2Id = customPB.Id, Product2Id = product.Id,
        UnitPrice = 12000, IsActive = true);
        insert customPrice;
        Account acc = new Account(name ='Test acc');
        insert acc;
        
        Contract cont = new Contract (
        AccountId = acc.id,
        Status ='Draft',
        ContractTerm = 12,
        StartDate = system.today());
        insert cont;
        
        cont.Status ='Activated';
        update cont;
        
        Order order = new Order(
        Status ='Draft',
        ContractId = cont.id,
        AccountId = acc.id,
        EffectiveDate = system.today(),
        Pricebook2Id =customPB.id);
       	insert order;
        
}
    @isTest
    static void getOrderItemsTest(){
        Order order = [select id, PriceBook2Id FROM Order LIMIT 1];
        String orderID = order.id;
        List <OrderItem> orderItems = OrderProducts_Controller.getOrderItems(orderID);
        system.assertNotEquals(null, orderItems);
    }

}