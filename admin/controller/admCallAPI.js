import { URL_API } from "../../asset/util/variable_global.js";

let getListProd = () => {
  return axios({
    method: "get",
    url: `${URL_API}/getall`,
  });
};

let addListProd = (prod) => {
  return axios({
    method: "post",
    url: `${URL_API}/create`,
    data: prod,
  });
};

let getProduct = (idProd) => {
  return axios({
    method: "get",
    url: `${URL_API}/get/${idProd}`,
  });
};

let updateProduct = (prod) => {
  return axios({
    method: "put",
    url: `${URL_API}/update/${prod.id}`,
    data: prod,
  });
};

let deleteProduct = (idProdDel) => {
  return axios({
    method: "delete",
    url: `${URL_API}/delete/${idProdDel}`,
  });
};

export { getListProd, addListProd, getProduct, updateProduct, deleteProduct };
