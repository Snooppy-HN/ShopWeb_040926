import { SanPham } from "../model/SanPham.js";
import { ValidationAdm } from "../model/ValidationAdm.js";
import {
  getListProd,
  addListProd,
  getProduct,
  updateProduct,
  deleteProduct,
} from "./admCallAPI.js";

let arrProd = [];
let currentProdList = [];
let validation = new ValidationAdm();

function formatPrice(price) {
  return Number(price).toLocaleString("vi-VN");
}
let showListProd = (arrProd) => {
  let stringTable = "";
  arrProd.map((itemProd, index) => {
    let trProd = `
    <tr>
        <td>${itemProd.id}</td>
        <td style="font-size: 14px; font-weight: 500; width: 20%;">${itemProd.name}</td>
        <td>${
          itemProd.price != null &&
          String(itemProd.price).toLowerCase() !== "null" &&
          !isNaN(Number(itemProd.price))
            ? formatPrice(itemProd.price)
            : `<span class="no-price">
                  Giá chưa xác định
              </span>`
        }
        </td>
        <td>
          ${
            itemProd.img &&
            String(itemProd.img) !== "" &&
            String(itemProd.img).toLowerCase() !== "null"
              ? `<img
                  src="${itemProd.img}"
                  alt="${itemProd.name}"
                  class="product-thumb"
              >`
              : `<span class="no-image">
                  Không có ảnh
              </span>`
          }
        </td>
        <td style="width: 35%;">${itemProd.description}</td>
        <td>
            <span class="product-type">${
              itemProd.type.toLowerCase() == "iphone" ||
              itemProd.type.toLowerCase() == "samsung" ||
              itemProd.type.toLowerCase() == "phone"
                ? "Phone"
                : itemProd.type.toLowerCase() == "laptop"
                  ? "Laptop"
                  : itemProd.type.toLowerCase() == "tablet"
                    ? "Tablet"
                    : itemProd.type.toLowerCase() == "watch"
                      ? "Smartwatch"
                      : "Không xác định"
            }</span>
        </td>
        <td>
            <div class="action-group justify-content-end">
                <button onclick = "xemChiTietProd('${itemProd.id}')"  type="button" class="action-btn edit" data-bs-toggle="modal" data-bs-target="#phoneModal">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>

                <button onclick = "deleProd('${itemProd.id}')"  type="button" class="action-btn delete">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            </div>
        </td>
    </tr>
    `;
    stringTable += trProd;
  });

  document.querySelector("#tbodyProduct").innerHTML = stringTable;
};
let getDSProd = () => {
  let axiosObj = getListProd();

  axiosObj
    .then((result) => {
      arrProd = result.data.filter((itemProd) => {
        return (
          itemProd.id != null &&
          String(itemProd.id) !== "" &&
          itemProd.name != null &&
          String(itemProd.name) !== "" &&
          itemProd.price != null &&
          !isNaN(Number(itemProd.price)) &&
          itemProd.type != null &&
          String(itemProd.type) !== "" &&
          itemProd.deleted == false
        );
      });

      currentProdList = [...arrProd];

      showListProd(currentProdList);
    })

    .catch((error) => {
      console.log(error);
    });
};
getDSProd();

let sortProductPrice = (arrSort, optionSort) => {
  if (optionSort === "asc") {
    return arrSort.sort((a, b) => {
      return Number(a.price) - Number(b.price);
    });
  }

  if (optionSort === "desc") {
    return arrSort.sort((a, b) => {
      return Number(b.price) - Number(a.price);
    });
  }

  return arrSort;
};
function sortPrice() {
  let opSort = document.querySelector("#selSortPrice").value;

  if (opSort === "") {
    showListProd(currentProdList);

    return;
  }

  let arrSortPrice = sortProductPrice([...currentProdList], opSort);

  currentProdList = arrSortPrice;

  showListProd(currentProdList);
}
document.querySelector("#selSortPrice").onchange = sortPrice;

let destructuringForm = () => {
  let arrFormELE = document.querySelectorAll("#productForm .form-control");

  let prodForm = {};

  for (let element of arrFormELE) {
    prodForm[element.id] = element.value;
  }

  return prodForm;
};
let addProd = () => {
  let { isRequired, isID, isName, isPrice, isURL } = validation;

  let prodForm = destructuringForm();
  let { id, name, price, img, description, type } = prodForm;
  let deleted = false;
  prodForm.deleted = deleted;

  let isValid = true;

  isValid &=
    isRequired(id, "#err_required_ID", "Mã sản phẩm không được để trống") &&
    isID(arrProd, id, "#err_required_ID", "Mã sản phẩm đang bị trùng ");

  isValid &=
    isRequired(
      name,
      "#err_required_tenSanPham",
      "Tên sản phẩm không được để trống",
    ) &&
    isName(
      name,
      "#err_isName_tenSanPham",
      "Tên sản phẩm nhập vào chưa hợp lệ (Không được bắt đầu băng SỐ, KÍ TỰ ĐẶC BIỆT,...) ",
    );

  isValid &=
    isRequired(
      price,
      "#err_required_giaSanPham",
      "Giá sản phẩm không được để trống",
    ) &&
    isPrice(
      price,
      "#err_regex_giaSanPham",
      "Giá sản phẩm nhập vào chưa hợp lệ",
    );

  isValid &=
    isRequired(
      img,
      "#err_required_hinhSanPham",
      "Đường dẫn hình ảnh không được để trống",
    ) &&
    isURL(
      img,
      "#err_regex_hinhSanPham",
      "Đường dẫn hình ảnh nhập vào chưa hợp lệ",
    );

  isValid &= isRequired(
    description,
    "#err_required_moTa",
    "Mô tả sản phẩm không được để trống",
  );

  if (isValid) {
    let prod = new SanPham(prodForm);

    let axiosObj = addListProd(prod);
    axiosObj
      .then((result) => {
        alert("Thêm sản phẩm mới thành công !!!");

        document.querySelector("#phoneModal .btn-close").click();

        console.log(result);

        getDSProd();
      })

      .catch((error) => {
        console.log(error);
      });
  }
};
document.querySelector("#btnThemSP").onclick = addProd;

let clearValidation = () => {
  document.querySelector("#err_required_ID").innerHTML = "";

  document.querySelector("#err_required_tenSanPham").innerHTML = "";
  document.querySelector("#err_isName_tenSanPham").innerHTML = "";

  document.querySelector("#err_required_giaSanPham").innerHTML = "";
  document.querySelector("#err_regex_giaSanPham").innerHTML = "";

  document.querySelector("#err_required_hinhSanPham").innerHTML = "";
  document.querySelector("#err_regex_hinhSanPham").innerHTML = "";

  document.querySelector("#err_required_moTa").innerHTML = "";
};
let xemChiTietProd = (idProd) => {
  clearValidation();

  let axiosObj = getProduct(idProd);

  axiosObj
    .then((result) => {
      document.querySelector("#exampleModalTitle").innerHTML =
        "Chi tiết sản phẩm";

      document.querySelector("#btnThemSP").style.display = "none";
      document.querySelector("#btnCapNhat").style.display = "block";

      document.querySelector("#id").value = result.data.id;
      document.querySelector("#id").disabled = true;

      document.querySelector("#name").value = result.data.name;
      document.querySelector("#price").value = result.data.price;
      document.querySelector("#img").value = result.data.img;
      document.querySelector("#description").value = result.data.description;

      let typeForm = {
        iphone: "phone",
        samsung: "phone",
        phone: "phone",

        laptop: "laptop",

        tablet: "tablet",

        watch: "watch",
      };
      document.querySelector("#type").value =
        typeForm[result.data.type.toLowerCase()];
    })

    .catch((error) => {
      console.log(error);
    });
};
window.xemChiTietProd = xemChiTietProd;
function editPopupAdd() {
  clearValidation();

  document.querySelector("#exampleModalTitle").innerHTML = "Thêm sản phẩm";

  document.querySelector("#btnThemSP").style.display = "block";
  document.querySelector("#btnCapNhat").style.display = "none";

  document.querySelector("#id").disabled = false;

  document.querySelector("#productForm").reset();
}
document.querySelector("#btnThem").onclick = editPopupAdd;
let updateProd = () => {
  let { isRequired, isID, isName, isPrice, isURL } = validation;

  let prodForm = destructuringForm();
  let { id, name, price, img, description, type } = prodForm;
  let deleted = false;
  prodForm.deleted = deleted;

  let isValid = true;

  isValid &=
    isRequired(
      name,
      "#err_required_tenSanPham",
      "Tên sản phẩm không được để trống",
    ) &&
    isName(
      name,
      "#err_isName_tenSanPham",
      "Tên sản phẩm nhập vào chưa hợp lệ (Không được bắt đầu băng SỐ, KÍ TỰ ĐẶC BIỆT,...) ",
    );

  isValid &=
    isRequired(
      price,
      "#err_required_giaSanPham",
      "Giá sản phẩm không được để trống",
    ) &&
    isPrice(
      price,
      "#err_regex_giaSanPham",
      "Giá sản phẩm nhập vào chưa hợp lệ",
    );

  isValid &=
    isRequired(
      img,
      "#err_required_hinhSanPham",
      "Đường dẫn hình ảnh không được để trống",
    ) &&
    isURL(
      img,
      "#err_regex_hinhSanPham",
      "Đường dẫn hình ảnh nhập vào chưa hợp lệ",
    );

  isValid &= isRequired(
    description,
    "#err_required_moTa",
    "Mô tả sản phẩm không được để trống",
  );

  if (isValid) {
    let prod = new SanPham(prodForm);

    let axiosObj = updateProduct(prod);
    axiosObj
      .then((result) => {
        alert("Cập nhật thông tin sản phẩm thành công !!!");

        document.querySelector("#phoneModal .btn-close").click();

        console.log(result);

        getDSProd();
      })

      .catch((error) => {
        console.log(error);
      });
  }
};
document.querySelector("#btnCapNhat").onclick = updateProd;

let deleProd = (idProdDel) => {
  let axiosObj = deleteProduct(idProdDel);
  axiosObj
    .then((result) => {
      let prodDeleted = result.data;

      prodDeleted.deleted = true;

      let index = arrProd.findIndex((item) => item.id === idProdDel);

      if (index > -1) {
        arrProd[index] = prodDeleted;
      }

      arrProd = arrProd.filter((item) => item.deleted === false);

      showListProd(arrProd);

      alert(`Xóa sản phẩm có mã ${idProdDel} thành công !!!`);
    })

    .catch((error) => {
      console.log(error);
    });
};
window.deleProd = deleProd;

let searchProdName = (keyword) => {
  let keyLowerCase = keyword.toLowerCase();

  let arrSearch = [];

  arrProd.map((itemProd, index) => {
    let idLowerCase = String(itemProd.id).toLowerCase();

    let nameLowerCase = String(itemProd.name).toLowerCase();

    let typeLowerCase = String(itemProd.type).toLowerCase();

    let descriptLowerCase = String(itemProd.description).toLowerCase();

    if (
      idLowerCase.indexOf(keyLowerCase) > -1 ||
      nameLowerCase.indexOf(keyLowerCase) > -1 ||
      typeLowerCase.indexOf(keyLowerCase) > -1 ||
      descriptLowerCase.indexOf(keyLowerCase) > -1
    ) {
      arrSearch.push(itemProd);
    }
  });

  return arrSearch;
};
function searchProduct() {
  let keyWord = document.querySelector("#inputSearch").value;

  if (keyWord === "") {
    getDSProd();
    return;
  }

  let mangTK = searchProdName(keyWord);

  currentProdList = mangTK;

  showListProd(currentProdList);
}
document.querySelector("#inputSearch").onkeyup = searchProduct;
