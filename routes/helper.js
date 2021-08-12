const DataBase = require('../Database');


const queryFunction = (employeesArray, queryName ) => {
    if(!employeesArray){
        return;
    }
    
    if(employeesArray.length === 1){
        console.log("1")
        return `${queryName} = ${employeesArray[0].employee_id}`;
    }

    if(employeesArray.length > 1){
        return employeesArray.map((employee, index) => {
            if ( employeesArray.length - 1  === index ){
                return `${queryName} = ${employee.employee_id}`;
            }
            return `${queryName} = ${employee.employee_id} or `;
        } 
        ).join('');
    }
}

 const panQueryFunction = (panArray) => {
    if(panArray.length === 1){
        console.log("2")
        return `customer_pan = '${panArray[0]}'`;
    }

    if(panArray.length > 1){
        return panArray.map((panNumber, index) => {
            if ( panArray.length - 1  === index ){
                return `customer_pan = '${panNumber}'`;
            }
            return `customer_pan  = '${panNumber}' or `;
        } 
        ).join('');
    }
}



const getDependentEmployees =async (id, onlyIds) => {
    const totalEmployees  = [];
    let fetchedEmployees = [];

    const headEmployee = await( await DataBase.DB.query(`select first_name, last_name, pos_id from pos_details where pos_id = ${id}`)).rows;
    headEmployee[0] && totalEmployees.push(headEmployee)

    fetchedEmployees = await ( await DataBase.DB.query(`select firstname, lastname, employee_id from employees where concern_manager_id = ${id}`)).rows;
    fetchedEmployees[0] && totalEmployees.push(fetchedEmployees);
    
    while ( true){
        if(fetchedEmployees[0]){
            fetchedEmployees = await ( await DataBase.DB.query(`select firstname, lastname, employee_id from employees where  ${queryFunction(fetchedEmployees,  "concern_manager_id")}`)).rows;
            fetchedEmployees[0] && totalEmployees.push(fetchedEmployees);
        } else {
            break;
        }
    }

    if(onlyIds){
        const mergedEmployees = [].concat.apply([], totalEmployees);
        const employeeIds = mergedEmployees.map(emp => emp.employee_id)
        return employeeIds;
    }
    return mergedEmployees = [].concat.apply([], totalEmployees);
}
const  getDetails = async(colName,str,posId)=>{
     return await(await DataBase.DB.query(`select * from pos_customers where ${colName} = '${str}' and pos_id = '${posId}'`)).rows;
}

module.exports = { getDependentEmployees, queryFunction, panQueryFunction,getDetails}