class Records {
  constructor(id, amount, category, type, createdAt, note, description) {
    (this.id = id),
      (this.amount = amount),
      (this.category = category),
      (this.type = type),
      (this.createdAt = createdAt),
      (this.note = note),
      (this.description = description);
  }
}

export default Records;
