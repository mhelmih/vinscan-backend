class Record {
  constructor(amount, category, type, createdAt, note, description) {
    this.amount = amount;
    this.category = category;
    this.type = type;
    this.createdAt = createdAt;
    this.note = note;
    this.description = description;
  }
}

class Asset {
  constructor(category, subCategory, amount, createdAt) {
    this.category = category;
    this.subCategory = subCategory;
    this.amount = amount;
    this.createdAt = createdAt;
  }
}

class Users {
  constructor(id, email, assets, records, createdAt) {
    this.id = id;
    this.email = email;
    this.assets = assets || [];
    this.records = records || [];
    this.createdAt = createdAt;
  }

  addAsset(asset) {
    this.assets.push(asset);
  }

  addRecord(record) {
    this.records.push(record);
  }
}

export { Users, Asset, Record };
