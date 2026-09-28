//const { useInsertionEffect } = require("react");

const { startswith, contains, error } = require("@cap-js/hana/lib/cql-functions");
const {uuid,decodeURI,exists,isdir,mkdirp,read} =cds.utils;

module.exports = cds.service.impl(async function () {
    //step1: Declare Employee service from entities
    const { EmployeeSrv } = this.entities;
    const { AddressSrv } = this.entities;
    const { ProductSrv, PurchaseitemsSrv, BusinessPartnerSrv } = this.entities;
    //implementation of an action
    //there are 3 generic handlers
    //.before(): pre-check and validation
    //.on():performin db operations
    //.after(): to save/close connection

    this.before("UPDATE", EmployeeSrv, async (request, response) => {
        const sal = request.data.salaryAmount;
        if (sal > 100000) {
            request.error(500, "Please contact your line Manager");
        }
    })
    this.before("UPDATE", ProductSrv, async (request, response) => {
        const price = request.data.PRICE;
        if (price > 100000) {
            request.error("Please Contact your Line Manager");
        }
    })

    this.before("UPDATE", PurchaseitemsSrv, async (request, response) => {
        const gross = request.data.GROSS_AMOUNT;
        const currency = request.data.CURRENCY_code;
        //if(currency=='USD' || currency=='EUR')
        //{
        if (currency == 'USD' && gross > 15000) {
            request.error(500, "Contact your line Manager");
        }
        else (currency == 'EUR' && gross > 10000)
        {
            request.error(500, "Check with regional head");
        }
        //}
    })

    this.before("UPDATE", AddressSrv, async (request, response) => {
        const country = request.data.COUNTRY;
        if (country !== 'GB' && country !== 'US') {
            request.error(500, "Please Contact Administrator");
        }
    })
    this.before("UPDATE", EmployeeSrv, async (request, response) => {
        const phone = request.data.PHONENUMBER;
        if (phone !== startswith("+1") && phone !== startswith("+44")) {
            request.error(500, "Cannot Update Mobile Number");
        }
    })

    this.before("UPDATE", BusinessPartnerSrv, async (request, response) => {
        const company = request.data.COMPANY_NAME;
        if (company.includes(' , ') || company.includes('.') || company == includes('-')) {
            request.error(500, "Invalid Company Name");
        }
    })

    this.before("UPDATE", PurchaseitemsSrv, async (request, response) => {
        const pos = request.data.PO_ITEMS_POS;
        if (pos % 10 !== 0) {
            request.error(500, "Invalid Position");
        }
    })

    this.on('createEmployee', async (request, response) => {
        //step-2: get the data which is coming from the API
        const empData = request.data;

        //step3: instantiate the transaction object
        const objTransaction = cds.tx(request);

        //step4: insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(EmployeeSrv).entries(empData)
        ]).then((resolve, reject) => {
            if (typeof (resolve) !== undefined) {
                return request.data
            }
            else {
                request.error(500, "Error in inserting data into the database")
            }
        }).catch(err => {
            request.error("There is an error: ", err.toString())
        })
        //step5: return data
        return returnData;
    })

    this.on('createAddress', async (request, response) => {
        const addressData = request.data;
        const objTransaction = cds.tx(request);
        let returnData = await objTransaction.run([
            INSERT.into(AddressSrv).entries(addressData)
        ]).then((resolve, reject) => {
            if (typeof (resolve) != undefined) {
                return request.data
            }
            else {
                request.error(500, "Error in inserting data into the database")
            }
        }).catch(err => {
            request.error("There is an error: ", err.toString())
        })
        //step5: return data
        return returnData;
    })

    this.on('updateEmployee', async (request, response) => {
        const {
            ID,
            salaryAmount,
            Currency_code
        } = request.data;
        try {
            const objTransaction = cds.tx(request);
            await objTransaction.update(EmployeeSrv).with({
                salaryAmount: salaryAmount,
                Currency_code: Currency_code
            }).where({
                ID: ID
            })
            return "Successfully updated";
        } catch (error) {
            request.error("Error:", error)
        }
    })
    this.on('updateAddress', async (request, response) => {
        const {
            NODE_KEY,
            STREET
        } = request.data;
        try {
            const objTransaction = cds.tx(request);
            await objTransaction.update(AddressSrv).with({
                STREET: STREET
            }).where({
                NODE_KEY: NODE_KEY
            })
            return "Successfully updated";
        } catch (error) {
            request.error("Error:", error)
        }
    })

    this.on('createProduct', async (request, response) => {
        //step-2: get the data which is coming from the API
        const prodData = request.data;

        //step3: instantiate the transaction object
        const objTransaction = cds.tx(request);

        //step4: insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(ProductSrv).entries(prodData)
        ]).then((resolve, reject) => {
            if (typeof (resolve) !== undefined) {
                return request.data
            }
            else {
                request.error(500, "Error in inserting data into the database")
            }
        }).catch(err => {
            request.error("There is an error: ", err.toString())
        })
        //step5: return data
        return returnData;
    })
    this.on('updateProduct', async (request, response) => {
        const {
            NODE_KEY,
            PRICE
        } = request.data;
        try {
            const objTransaction = cds.tx(request);
            await objTransaction.update(ProductSrv).with({
                PRICE: PRICE
            }).where({
                NODE_KEY: NODE_KEY
            })
            return "Successfully updated";
        } catch (error) {
            request.error("Error:", error)
        }
    })

    this.on("deleteEmployee", async (request, response) => {
        const {
            ID
        } = request.data;
        try {
            const objTransaction = cds.tx(request);
            await objTransaction.delete(EmployeeSrv).where({
                ID: ID
            })
            return "Successfully Deleted"
        }
        catch (error) {
            request.error("Error:", error);
        }
    })

    //Implementation of Custom Function
    this.on('getHighestSalariedEmployees', async (request, response) => {
        try {
            //step-1: Create an object for the transaction
            const transaction = cds.tx(request);

            //step-2: Get Salaries of an employee using Transaction object
            const response = await transaction.read(EmployeeSrv).orderBy({
                salaryAmount: 'desc'
            }).limit(10);

            //step-3: Display the employee salaries
            return response;
        }
        catch (error) {
            request.error("Error:", error)
        }
    })

    this.on('getPrice', async (request, response) => {
        try {
            const objTransaction = cds.tx(request);

            const response = await objTransaction.read(ProductSrv).orderBy({ PRICE: 'desc' }).limit(10);
            return response;
        }
        catch (error) {
            request.error("Error: ", error)
        }
    })

    //Bounded actions and functions
    this.on('increasePrice', async (request, response) => {
        try {
            const key = request.params[0];
            const txn = cds.tx(request);
            // const product = await txn.read(ProductSrv)
            //                 .where(key);
            const product = await txn.run(
                SELECT.one
                    .from(ProductSrv)
                    .where(key)
            );
            const currentPrice = Number(product.PRICE);
            // 3. Increase by 10%
            const newPrice = (currentPrice * 1.10).toFixed(2);
            console.log("Old price:", product.PRICE);
            console.log("New price:", newPrice);
            console.log("Type:", typeof newPrice);
            await txn.update(ProductSrv).with({
                PRICE: newPrice
            }).where(key)

            const updateprice = await txn.read(ProductSrv);
            return updateprice;
        }
        catch (error) {
            return "Error :" + error.toString();
        }
    })

    this.on("getHighestPricedProducts", async (request, response) => {
        try {
            const txn = cds.tx(request);
            const response = await txn.read(ProductSrv).orderBy({
                PRICE: 'desc'
            }).limit(5);
            return response;
        }
        catch (error) {
            request.error("Error:", error);
        }
    })

    this.on('increaseSalary', async (request, response) => {
        try {
            const { ID } = request.params[0];
            const txn = cds.tx(request);
            const emp = await txn.read(EmployeeSrv).where({ ID });
            const cs = emp[0].salaryAmount;
            const per = (cs * 0.15);
            const newsal = Number(cs)+Number(per);
            console.log("Old sal:",cs);
            console.log("newsal",newsal);
            await txn.update(EmployeeSrv).with({
                salaryAmount: newsal.toFixed(2)
            }).where({
                ID
            })
            const updatesal = await txn.read(EmployeeSrv);
            return updatesal;
        } catch (error) {
            return "Error: " + error.toString();
        }
    })
    this.on('getHighestSalariedEmployees', async (request, response) => {
        try {
            //const id=request;
            const txn = cds.tx(request);
            const response = await tx.read(EmployeeSrv).orderBy({
                salaryAmount: 'desc'
            }).limit(20);
            return response;
        }
        catch (error) {
            return "Error:" + error.toString();
        }
    })
    this.on('utilities',async(request,response)=>{
        let vUUID=uuid(),vInput="%27Sam%27",dirExists=false,isFileExists=false,vPackageContent=null;

        //Decode URI and Make Directory
        try{
            uri=decodeURI(vInput);
            await mkdirp('srv/mydir');
        }
        catch{
            uri=vInput; 
        }
        //Exists()
        if(exists('srv/request.http'))
        {
            isFileExists=true;
        }
        //isDir
        if(isdir('srv'))
        {
            dirExists=true;
        }
        vPackageContent=await read('package.json');
        //final values
         var finalValue={
            uuid:vUUID,
            uri:uri,
            isFileExists: isFileExists,
            dirExists:dirExists,
            packageInfo: vPackageContent
         }
         return finalValue;

    })
})