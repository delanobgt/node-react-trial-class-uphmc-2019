import _ from "lodash";

export const EMPLOYEE_HEADERS_SET = "EMPLOYEE_HEADERS_SET";
export const EMPLOYEES_GET = "EMPLOYEES_GET";
export const EMPLOYEE_GET_BY_ID = "EMPLOYEE_GET_BY_ID";
export const EMPLOYEE_DELETE_BY_ID = "EMPLOYEE_DELETE_BY_ID";
export const EMPLOYEE_MODIFIED_SET = "EMPLOYEE_MODIFIED_SET";

const INITIAL_STATE = {
  employees: {},
  headers: [],
  kategoriPegawaiEnums: [],
  employeeModified: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case EMPLOYEE_HEADERS_SET: {
      const { headers } = action.payload;
      return {
        ...state,
        headers
      };
    }
    case EMPLOYEES_GET: {
      const { employees } = action.payload;
      return {
        ...state,
        employees: _.mapKeys(employees, "_id")
      };
    }
    case EMPLOYEE_GET_BY_ID: {
      const { employee } = action.payload;
      return {
        ...state,
        employees: {
          ...state.employees,
          [employee._id]: employee
        }
      };
    }
    case EMPLOYEE_DELETE_BY_ID: {
      const { id } = action.payload;
      return {
        ...state,
        employees: _.pickBy(state.employees, employee => employee._id !== id)
      };
    }
    case EMPLOYEE_MODIFIED_SET: {
      const { employeeModified } = action.payload;
      return {
        ...state,
        employeeModified
      };
    }
    default: {
      return state;
    }
  }
}
