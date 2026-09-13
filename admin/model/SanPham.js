export class SanPham {
  constructor(prodForm) {
    let { id, name, price, img, description, type, deleted } = prodForm;

    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.img = img;
    this.description = description;
    this.type = type;
    this.deleted = deleted;
  }
}
