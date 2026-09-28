using { purchaseApp.db as database } from '../db/schema';
using { purchaseApp.common as common } from '../db/common';


service CatlogService {
    //master data service
    entity BusinessPartnerSrv as projection on database.master.BusinessPartners;
    entity AddressSrv as projection on database.master.Addresses;

    entity ProductSrv as projection on database.master.Products{
        *
    } actions{
        action increasePrice() returns array of ProductSrv;
        function getHighestPricedProducts() returns array of ProductSrv
    }
    
    @Capabilities:{
        InsertRestrictions.Insertable: true,
        UpdateRestrictions.Updatable: true,
        DeleteRestrictions.Deletable: true,
        //ReadRestrictions.Readable: false
    }

    entity EmployeeSrv as projection on database.master.Employees{
        *
    } actions{
        action increaseSalary() returns array of EmployeeSrv;
        function getHighestSalariedEmployees() returns array of EmployeeSrv;
    }

    //transactional data servies
    entity PurchaseoderSrv as projection on database.transaction.PurchaseOrders;
    entity PurchaseitemsSrv as projection on database.transaction.PurchaseItems;

    action createEmployee(
        ID: UUID,
        nameFirst: common.String64,
        nameLast: common.String64,
        nameInitials: common.String64,
        nameMiddle: common.String64,
        gender: common.Gender,
        language: String(2),
        loginName: String(16),
        phoneNumber: common.PhoneNumber,
        email: common.Email,
        Currency: String(3),
        salaryAmount: common.AmountT,
        accountNumber: common.String32,
        bankId: String(16),
        bankName: common.String64,
    )  returns array of EmployeeSrv;

    action createAddress(
        NODE_KEY: common.Guid,
        ADDRESS_TYPE: common.String32,
        VAL_START: Date,
        VAL_END: Date,
        LATITUDE: Decimal,
        LONGITUDE: Decimal,
    ) returns array of AddressSrv;

    action updateEmployee(
        ID:UUID,
        salaryAmount: common.AmountT,
        Currency_code: String(3))
        returns String;
    
    action updateAddress(
        NODE_KEY:common.Guid,
        STREET: String(255)
    ) returns String;

    action createProduct(
        NODE_KEY: common.Guid,
        PRODUCT_ID: common.String32,
        TYPE_CODE: String(2),
        CATEGORY: common.String32,
        DESCRIPTION: common.String255,
        TAX_TARIF_CODE: Integer,
        MEASURE_UNIT:String(2),
        WEIGHT_MEASURE: Decimal(5,2),
        WEIGHT_UNIT:String(2),
        PRICE: Decimal(15, 2 ),
        CURRENCY_CODE: String(5),
        WIDTH: Decimal(5, 2),
        DEPTH: Decimal(5, 2),
        HEIGHT: Decimal(5, 2),
        DIM_UNIT: String(2),
    ) returns array of ProductSrv;

    action updateProduct(
        NODE_KEY: common.Guid,
        PRICE: Decimal(15,2)
    ) returns String;

    action deleteEmployee(
        ID: UUID
    ) returns String;

    // --- Added comment
    //custom Function Declaration
    function getHighestSalariedEmployees() returns array of EmployeeSrv;

    function getPrice()returns array of ProductSrv;
    function utilities()returns String;
} 

