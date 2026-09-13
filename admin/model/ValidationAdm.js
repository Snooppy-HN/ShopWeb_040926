export class ValidationAdm {
  isRequired(inpValue, idElEerror, messageErr) {
    if (inpValue == "") {
      document.querySelector(idElEerror).innerHTML = messageErr;
      return false;
    }

    document.querySelector(idElEerror).innerHTML = "";
    return true;
  }

  isID(arrProd, inpValue, idElEerror, messageErr) {
    let isIDTrung = arrProd.some((product) => {
      return product.id == inpValue;
    });

    if (isIDTrung) {
      document.querySelector(idElEerror).innerHTML = messageErr;
      return false;
    }

    document.querySelector(idElEerror).innerHTML = "";
    return true;
  }

  isName(inpValue, idElEerror, messageErr) {
    let format = /^[\p{L}][\p{L}\p{N}\s.\-+/()]*$/u;

    if (inpValue.match(format)) {
      document.querySelector(idElEerror).innerHTML = "";
      return true;
    }

    document.querySelector(idElEerror).innerHTML = messageErr;
    return false;
  }

  isPrice(inpValue, idElEerror, messageErr) {
    let formatPrice = /^[1-9][0-9]*$/gm;

    if (inpValue.match(formatPrice)) {
      document.querySelector(idElEerror).innerHTML = "";
      return true;
    }

    document.querySelector(idElEerror).innerHTML = messageErr;
    return false;
  }

  isURL(inpValue, idElEerror, messageErr) {
    let formatURL = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})(\/[^\s]*)?$/i;

    if (inpValue.match(formatURL)) {
      document.querySelector(idElEerror).innerHTML = "";
      return true;
    }

    document.querySelector(idElEerror).innerHTML = messageErr;
    return false;
  }
}
