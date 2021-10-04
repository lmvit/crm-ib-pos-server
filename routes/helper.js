const DataBase = require('../Database');
const dateFunction = require('date-fns');

const queryFunction = (employeesArray, queryName) => {
    if (!employeesArray) {
        return;
    }

    if (employeesArray.length === 1) {
        console.log("1")
        return `${queryName} = ${employeesArray[0].employee_id}`;
    }

    if (employeesArray.length > 1) {
        return employeesArray.map((employee, index) => {
            if (employeesArray.length - 1 === index) {
                return `${queryName} = ${employee.employee_id}`;
            }
            return `${queryName} = ${employee.employee_id} or `;
        }
        ).join('');
    }
}

const panQueryFunction = (panArray) => {
    if (panArray.length === 1) {
        console.log("2")
        return `customer_pan = '${panArray[0]}'`;
    }

    if (panArray.length > 1) {
        return panArray.map((panNumber, index) => {
            if (panArray.length - 1 === index) {
                return `customer_pan = '${panNumber}'`;
            }
            return `customer_pan  = '${panNumber}' or `;
        }
        ).join('');
    }
}



const getDependentEmployees = async (id, onlyIds) => {
    const totalEmployees = [];
    let fetchedEmployees = [];

    const headEmployee = await (await DataBase.DB.query(`select first_name, last_name, pos_id from pos_details where pos_id = ${id}`)).rows;
    headEmployee[0] && totalEmployees.push(headEmployee)

    fetchedEmployees = await (await DataBase.DB.query(`select firstname, lastname, employee_id from employees where concern_manager_id = ${id}`)).rows;
    fetchedEmployees[0] && totalEmployees.push(fetchedEmployees);

    while (true) {
        if (fetchedEmployees[0]) {
            fetchedEmployees = await (await DataBase.DB.query(`select firstname, lastname, employee_id from employees where  ${queryFunction(fetchedEmployees, "concern_manager_id")}`)).rows;
            fetchedEmployees[0] && totalEmployees.push(fetchedEmployees);
        } else {
            break;
        }
    }

    if (onlyIds) {
        const mergedEmployees = [].concat.apply([], totalEmployees);
        const employeeIds = mergedEmployees.map(emp => emp.employee_id)
        return employeeIds;
    }
    return mergedEmployees = [].concat.apply([], totalEmployees);
}
const getDetails = async (colName, str, posId) => {
    return await (await DataBase.DB.query(`select * from pos_customers where ${colName} = '${str}' and pos_id = '${posId}'`)).rows;
}

const getReports = async (tableName, tableName1, id) => {
    return await (await DataBase.DB.query(`SELECT SUM(l.net_premium/100000) as Total,date_part('month',l.date_of_entry) as Month
    FROM ${tableName} l inner join ${tableName1} pl on pl.policy_number = l.policy_number and pl.submitted_pos_id = '${id}' and 
      date_part('year',l.date_of_entry) = date_part('year',current_date) GROUP BY date_part('year',l.date_of_entry),date_part('month',l.date_of_entry)`)).rows
}

const getPayoutReports = async (tableName, tableName1, id,percentage) => {
    return await (await DataBase.DB.query(`SELECT SUM(l.net_premium/100000)*${percentage} as Total,date_part('month',l.date_of_entry) as Month
    FROM ${tableName} l inner join ${tableName1} pl on pl.policy_number = l.policy_number and pl.submitted_pos_id = '${id}' and 
      date_part('year',l.date_of_entry) = date_part('year',current_date) GROUP BY date_part('year',l.date_of_entry),date_part('month',l.date_of_entry)`)).rows
}

const getRenwalDate = async (policy_issue_date, month) => {
    const newDate = dateFunction.addMonths(dateFunction.parseISO(policy_issue_date), month)
    return newDate.toLocaleDateString('en-CA');
}
const getRenewalDate = async (policy_issue_date, month) => {
    const newDate = dateFunction.addMonths(policy_issue_date, month);
    return newDate.toLocaleDateString('en-CA');
}

const validateLifeTransactionCount = async (colName, str, posId) => {
    return await (await DataBase.DB.query(`select count(*) from pos_life_insurance_transactions pli inner join pos_life_transactions pl on pli.policy_number = pl.policy_number where pli.submitted_pos_id = '${posId}' and pli.${colName} = '${str}'`)).rows;
}

const validateLifeTransactionDues = async (colName, str, posId) => {
    return await (await DataBase.DB.query(`select pl.premium_payment_mode,pli.renewal_date from pos_life_transactions pl inner join pos_life_insurance_transactions pli on pl.policy_number = pli.policy_number where pli.submitted_pos_id = '${posId}' and pli.${colName} = '${str}'`)).rows
}

const validateGeneralTransactionCount = async (colName, str, posId) => {
    return await (await DataBase.DB.query(`select count(*) from pos_general_insurance_transactions pgi inner join pos_general_transactions pg on pgi.policy_number = pg.policy_number where pgi.submitted_pos_id = '${posId}' and pgi.${colName} = '${str}'`)).rows;
}

const validateGeneralTransactionDues = async (colName, str, posId) => {
    return await (await DataBase.DB.query(`select pg.premium_payment_mode,pgi.renewal_date from pos_general_transactions pg inner join pos_general_insurance_transactions pgi on pg.policy_number = pgi.policy_number where pgi.submitted_pos_id = '${posId}' and pgi.${colName} = '${str}'`)).rows
}

const getPolicyRenewalDate = async (ppm,renewal_date) => {
    const date = new Date(renewal_date);
    let getPremiumPaymentMode = ppm;
    const currentDate = new Date().toLocaleDateString('en-CA');
    switch (getPremiumPaymentMode) {
        case 'Monthly':
            renewalDateNotification = dateFunction.subDays(date, 15).toLocaleDateString('en-CA');
            return renewalDateNotification;
            break;
        case 'Quaterly':
            renewalDateNotification = dateFunction.subMonths(date, 1).toLocaleDateString('en-CA');
            return renewalDateNotification;
            break;
        case 'Half Yearly':
            renewalDateNotification = dateFunction.subMonths(date, 1).toLocaleDateString('en-CA');
            return renewalDateNotification;
            break;
        case 'Annually':
            renewalDateNotification = dateFunction.subMonths(date, 1).toLocaleDateString('en-CA');
            return renewalDateNotification;
            break;
        default:
            renewalDateNotification = dateFunction.subDays(date, 15).toLocaleDateString('en-CA');
            return renewalDateNotification;
            break;
    }
}
module.exports = { getDependentEmployees, queryFunction, panQueryFunction, getDetails, getReports,getPayoutReports, getRenwalDate, getRenewalDate, validateLifeTransactionCount, validateLifeTransactionDues, validateGeneralTransactionCount, validateGeneralTransactionDues,getPolicyRenewalDate }