import votingApi from "../apis/voting";
import {
  EMPLOYEES_GET,
  EMPLOYEE_GET_BY_ID,
  EMPLOYEE_DELETE_BY_ID,
  EMPLOYEE_HEADERS_SET,
  EMPLOYEE_MODIFIED_SET
} from "../reducers/employee";

export const emptyEmployees = () => dispatch => {
  dispatch({
    type: EMPLOYEES_GET,
    payload: { employees: {} }
  });
};

export const uploadEmployeeExcel = ({
  onUploadProgress,
  excelFile,
  socketToken
}) => async () => {
  const formData = new FormData();
  formData.append("excelFile", excelFile);
  formData.append("socketToken", socketToken);
  const response = await votingApi({ onUploadProgress }).post(
    `/employees/upload/excel`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
  return response.data;
};

export const getEmployees = ({ headers }) => async (dispatch, getState) => {
  if (headers) {
    dispatch({
      type: EMPLOYEE_HEADERS_SET,
      payload: { headers }
    });
  }
  headers = headers
    ? headers.map(header => header.name)
    : getState().employee.headers.map(header => header.name);

  const response = await votingApi().get(`/employees`, {
    params: { headers }
  });
  const payload = { employees: response.data };
  dispatch({
    type: EMPLOYEES_GET,
    payload
  });
  return payload;
};

export const getEmployeeById = (id, { headers }) => async (
  dispatch,
  getState
) => {
  if (headers) {
    dispatch({
      type: EMPLOYEE_HEADERS_SET,
      payload: { headers }
    });
  }
  headers = headers
    ? headers.map(header => header.name)
    : getState().employee.headers.map(header => header.name);

  const response = await votingApi().get(`/employees/${id}`, {
    params: { headers }
  });
  const payload = { employee: response.data };
  dispatch({
    type: EMPLOYEE_GET_BY_ID,
    payload
  });
  return payload;
};

export const deleteEmployeeById = id => async dispatch => {
  const response = await votingApi().delete(`/employees/${id}`);
  const payload = { id: response.data.id };
  dispatch({
    type: EMPLOYEE_DELETE_BY_ID,
    payload
  });
  return payload;
};

export const setEmployeeHeaders = headers => dispatch => {
  dispatch({
    type: EMPLOYEE_HEADERS_SET,
    payload: { headers }
  });
};

export const getKategoriPegawaiEnums = () => async () => {
  const response = await votingApi().get(`/employees/kategori_pegawai/enums`);
  const payload = { kategoriPegawaiEnums: response.data };
  return payload;
};

export const getAllEmployeeHeaders = () => async () => {
  const response = await votingApi().get(`/employees/headers`);
  const payload = { headers: response.data };
  return payload;
};

export const setEmployeeModified = employeeModified => {
  return {
    type: EMPLOYEE_MODIFIED_SET,
    payload: { employeeModified }
  };
};
