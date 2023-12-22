const { db } = require('../firebase.js');
const {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} = require('firebase/firestore');

/**
 * @swagger
 * /api/v1/records:
 *   post:
 *     summary: Create a record in a user's account
 *     tags: [Records]
 *     security:
 *     - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: number
 *                 description: Record day. Must be between 1 and 31
 *               month:
 *                 type: number
 *                 description: Record month. Must be between 1 and 12
 *               year:
 *                 type: number
 *                 description: Record year
 *               assetId:
 *                 type: string
 *                 description: Asset ID from which the record is created
 *               type:
 *                 type: string
 *                 enum: ["Expense", "Income", "Transfer"]
 *                 description: Record type (Expense, Income, or Transfer)
 *               category:
 *                 type: string
 *                 description: Record category (Expense = Makanan, Kehidupan sosial, Transportasi, Kultur, Kebutuhan harian, Pakaian, Kecantikan, Kesehatan, Pendidikan, Hadiah, or Lainnya; Income = Uang saku, Gaji, Bonus, Kas kecil, or Lainnya; Transfer = ID Asset tujuan)
 *               amount:
 *                 type: number
 *                 description: Record amount
 *               note:
 *                 type: string
 *                 description: Record note (optional)
 *               description:
 *                 type: string
 *                 description: Record description (optional)
 *               fee:
 *                 type: number
 *                 description: Fee for transfer type record (optional)
 *     responses:
 *       201:
 *         description: Record created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const createRecord = async (req, res) => {
  try {
    const userId = req.user.uid;
    const data = req.body;

    // validate the request body
    if (
      !data.day ||
      !data.month ||
      !data.year ||
      !data.assetId ||
      !data.type ||
      !data.category ||
      (!data.amount && data.amount !== 0)
    ) {
      res.status(400).send({
        message:
          'day, month, year, assetId, type, category, and amount are required',
      });
      return;
    }
    if (data.day < 1 || data.day > 31) {
      res.status(400).send({ message: 'day must be between 1 and 31' });
      return;
    }
    if (data.month < 1 || data.month > 12) {
      res.status(400).send({ message: 'month must be between 1 and 12' });
      return;
    }
    if (
      data.type !== 'Expense' &&
      data.type !== 'Income' &&
      data.type !== 'Transfer'
    ) {
      res
        .status(400)
        .send({ message: 'type must be Expense, Income, or Transfer' });
      return;
    }

    // check if the asset exists
    const assetRef = doc(db, 'users', userId, 'assets', data.assetId);
    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
      res.status(404).send({ message: 'Asset not found' });
      return;
    }
    const assetData = assetDoc.data();

    // if the type is Transfer, check if the target asset exists
    let targetAssetRef, targetAssetDoc, targetAssetData, targetAssetAmount;
    if (data.type === 'Transfer') {
      targetAssetRef = doc(db, 'users', userId, 'assets', data.category);
      targetAssetDoc = await getDoc(targetAssetRef);
      if (!targetAssetDoc.exists()) {
        res.status(404).send({ message: 'Target asset not found' });
        return;
      }
      targetAssetData = targetAssetDoc.data();
      targetAssetAmount = targetAssetData.amount;
      data.category = targetAssetData.subcategory;
    }

    // create the record
    const createdAt = serverTimestamp();
    const date = new Date(data.year, data.month - 1, data.day).toISOString();
    const tempRecord = {
      day: data.day,
      month: data.month,
      year: data.year,
      date,
      asset: assetData.subcategory,
      type: data.type,
      category: data.category,
      amount: data.amount,
      note: data.note || '',
      description: data.description || '',
      createdAt,
    };
    const recordRef = collection(db, 'users', userId, 'records');
    const docRef = await addDoc(recordRef, tempRecord);

    // update the asset amount
    const assetAmount = assetData.amount;
    if (data.type === 'Expense') {
      await updateDoc(assetRef, {
        amount: assetAmount - data.amount,
      });
    } else if (data.type === 'Income') {
      await updateDoc(assetRef, {
        amount: assetAmount + data.amount,
      });
    } else {
      // type === 'Transfer'
      await updateDoc(assetRef, {
        amount: assetAmount - data.amount,
      });
      await updateDoc(targetAssetRef, {
        amount: targetAssetAmount + data.amount,
      });

      if (data.fee) {
        // Create a new record for the fee
        const feeRecord = {
          day: data.day,
          month: data.month,
          year: data.year,
          date,
          asset: assetData.subcategory,
          type: 'Expense',
          category: 'Lainnya',
          amount: data.fee,
          note: data.note,
          description: 'Biaya transfer',
          createdAt,
        };
        await addDoc(recordRef, feeRecord);
      }
    }

    res
      .status(201)
      .send({ message: 'record created successfully', id: docRef.id });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1/records:
 *   get:
 *     summary: Get records in a user's account
 *     description: Get records in a user's account. Records can be filtered by (startDate & endDate, date, month & year, or year only), type, category, and asset.
 *     tags: [Records]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: query
 *       name: startDate
 *       schema:
 *         type: string
 *         example: dd-mm-yyyy
 *       description: Start date of the records to be retrieved
 *     - in: query
 *       name: endDate
 *       schema:
 *         type: string
 *         example: dd-mm-yyyy
 *       description: End date of the records to be retrieved
 *     - in: query
 *       name: date
 *       schema:
 *         type: string
 *         example: dd-mm-yyyy
 *       description: Date of the records to be retrieved
 *     - in: query
 *       name: month
 *       schema:
 *         type: number
 *       description: Month of the records to be retrieved. Must be between 1 and 12
 *     - in: query
 *       name: year
 *       schema:
 *         type: number
 *       description: Year of the records to be retrieved
 *     - in: query
 *       name: type
 *       schema:
 *         type: string
 *         enum: ["Expense", "Income", "Transfer"]
 *       description: Type of the records to be retrieved
 *     - in: query
 *       name: category
 *       schema:
 *         type: string
 *       description: Category of the records to be retrieved
 *     - in: query
 *       name: asset
 *       schema:
 *         type: string
 *       description: Asset of the records to be retrieved
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   day:
 *                     type: number
 *                     description: Record day
 *                   month:
 *                     type: number
 *                     description: Record month
 *                   year:
 *                     type: number
 *                     description: Record year
 *                   date:
 *                     type: string
 *                     format: dd-mm-yyyy
 *                     description: Record date
 *                   asset:
 *                     type: string
 *                     description: Asset name from which the record is created
 *                   type:
 *                     type: string
 *                     enum: ["Expense", "Income", "Transfer"]
 *                     description: Record type (Expense, Income, or Transfer)
 *                   category:
 *                     type: string
 *                     description: Record category (Expense = Makanan, Kehidupan sosial, Transportasi, Kultur, Kebutuhan harian, Pakaian, Kecantikan, Kesehatan, Pendidikan, Hadiah, or Lainnya; Income = Uang saku, Gaji, Bonus, Kas kecil, or Lainnya; Transfer = Asset tujuan)
 *                   amount:
 *                     type: number
 *                     description: Record amount
 *                   note:
 *                     type: string
 *                     description: Record note
 *                   description:
 *                     type: string
 *                     description: Record description
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

const getRecords = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { startDate, endDate, date, month, year, type, category, asset } =
      req.query;

    // Validate date inputs
    if ((!startDate && endDate) || (startDate && !endDate)) {
      return res
        .status(400)
        .send({ message: 'startDate and endDate must be provided together' });
    }

    if (date && (month || year)) {
      return res.status(400).send({
        message: 'date cannot be provided together with month or year',
      });
    }

    if (month && !year) {
      return res
        .status(400)
        .send({ message: 'month and year must be provided together' });
    }

    if (month && (month < 1 || month > 12)) {
      return res
        .status(400)
        .send({ message: 'month must be between 1 and 12' });
    }

    // Convert string dates to Date objects
    const startDateObj = startDate ? new Date(startDate) : null;
    const endDateObj = endDate ? new Date(endDate) : null;
    const dateObj = date ? new Date(date) : null;

    const recordRef = collection(db, 'users', userId, 'records');
    let recordsSnapshot;

    // Query based on provided parameters
    if (dateObj) {
      recordsSnapshot = await getDocs(
        query(recordRef, where('date', '==', dateObj.toISOString())),
      );
    } else if (startDateObj && endDateObj) {
      recordsSnapshot = await getDocs(
        query(
          recordRef,
          where('date', '>=', startDateObj.toISOString()),
          where('date', '<=', endDateObj.toISOString()),
        ),
      );
    } else if (month && year) {
      recordsSnapshot = await getDocs(
        query(
          recordRef,
          where('month', '==', parseInt(month)),
          where('year', '==', parseInt(year)),
        ),
      );
    } else if (year) {
      recordsSnapshot = await getDocs(
        query(recordRef, where('year', '==', parseInt(year))),
      );
    } else {
      recordsSnapshot = await getDocs(recordRef);
    }

    // Convert QuerySnapshot to an array of document data
    let records = [];
    recordsSnapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      });
    });

    // Apply additional filters if necessary
    if (asset) {
      records = records.filter((doc) => doc.asset === asset);
    }
    if (type) {
      records = records.filter((doc) => doc.type === type);
    }
    if (category) {
      records = records.filter((doc) => doc.category === category);
    }

    // Grouping records
    const groupedRecords = {};
    records.forEach((data) => {
      const recordDate = new Date(data.date);
      const monthKey = recordDate.getMonth() + 1; // Months are zero-based, so adding 1
      const day = recordDate.getDate();
      const recordYear = recordDate.getFullYear();
      const dateKey = `${day}-${monthKey}-${recordYear}`;

      if (!groupedRecords[monthKey]) {
        groupedRecords[monthKey] = {};
      }

      if (!groupedRecords[monthKey][dateKey]) {
        groupedRecords[monthKey][dateKey] = [];
      }

      groupedRecords[monthKey][dateKey].push(data);
    });

    res.status(200).json(groupedRecords);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

// Get a record in a user's account
/**
 * @swagger
 * /api/v1/records/{recordId}:
 *   get:
 *     summary: Get a record in a user's account
 *     tags: [Records]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: recordId
 *       schema:
 *         type: string
 *       required: true
 *       description: Record ID
 *     responses:
 *       200:
 *         description: Record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 day:
 *                   type: number
 *                   description: Record day
 *                 month:
 *                   type: number
 *                   description: Record month
 *                 year:
 *                   type: number
 *                   description: Record year
 *                 date:
 *                   type: string
 *                   format: dd-mm-yyyy
 *                   description: Record date
 *                 asset:
 *                   type: string
 *                   description: Asset name from which the record is created
 *                 type:
 *                   type: string
 *                   enum: ["Expense", "Income", "Transfer"]
 *                   description: Record type (Expense, Income, or Transfer)
 *                 category:
 *                   type: string
 *                   description: Record category (Expense = Makanan, Kehidupan sosial, Transportasi, Kultur, Kebutuhan harian, Pakaian, Kecantikan, Kesehatan, Pendidikan, Hadiah, or Lainnya; Income = Uang saku, Gaji, Bonus, Kas kecil, or Lainnya; Transfer = Asset tujuan)
 *                 amount:
 *                   type: number
 *                   description: Record amount
 *                 note:
 *                   type: string
 *                   description: Record note
 *                 description:
 *                   type: string
 *                   description: Record description
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
const getRecord = async (req, res) => {
  try {
    const userId = req.user.uid;
    const recordId = req.params.recordId;
    if (!recordId) {
      res.status(400).send({ message: 'recordId is required' });
      return;
    }

    const recordRef = doc(db, 'users', userId, 'records', recordId);
    const recordDoc = await getDoc(recordRef);
    if (!recordDoc.exists()) {
      res.status(404).send({ message: 'Record not found' });
      return;
    }

    res.status(200).json({
      id: recordDoc.id,
      ...recordDoc.data(),
      // Convert the createdAt field to a Date object
      createdAt: recordDoc.data().createdAt.toDate(),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1/records/{recordId}:
 *   put:
 *     summary: Update a record in a user's account
 *     tags: [Records]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: recordId
 *       schema:
 *         type: string
 *       required: true
 *       description: Record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               day:
 *                 type: number
 *                 description: Record day. Must be between 1 and 31
 *               month:
 *                 type: number
 *                 description: Record month. Must be between 1 and 12
 *               year:
 *                 type: number
 *                 description: Record year
 *               assetId:
 *                 type: string
 *                 description: Asset ID from which the record is created
 *               type:
 *                 type: string
 *                 enum: ["Expense", "Income", "Transfer"]
 *                 description: Record type (Expense, Income, or Transfer)
 *               category:
 *                 type: string
 *                 description: Record category (Expense = Makanan, Kehidupan sosial, Transportasi, Kultur, Kebutuhan harian, Pakaian, Kecantikan, Kesehatan, Pendidikan, Hadiah, or Lainnya; Income = Uang saku, Gaji, Bonus, Kas kecil, or Lainnya; Transfer = ID Asset tujuan)
 *               amount:
 *                 type: number
 *                 description: Record amount
 *               note:
 *                 type: string
 *                 description: Record note (optional)
 *               description:
 *                 type: string
 *                 description: Record description (optional)
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Record not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
const updateRecord = async (req, res) => {
  try {
    const userId = req.user.uid;
    const recordId = req.params.recordId;
    const data = req.body;

    // validate the params and request body
    if (!recordId) {
      res.status(400).send({ message: 'recordId is required' });
      return;
    }
    if (
      !data.day ||
      !data.month ||
      !data.year ||
      !data.assetId ||
      !data.type ||
      !data.category ||
      (!data.amount && data.amount !== 0)
    ) {
      res.status(400).send({
        message:
          'day, month, year, assetId, type, category, and amount are required',
      });
      return;
    }
    if (data.day < 1 || data.day > 31) {
      res.status(400).send({ message: 'day must be between 1 and 31' });
      return;
    }
    if (data.month < 1 || data.month > 12) {
      res.status(400).send({ message: 'month must be between 1 and 12' });
      return;
    }
    if (
      data.type !== 'Expense' &&
      data.type !== 'Income' &&
      data.type !== 'Transfer'
    ) {
      res
        .status(400)
        .send({ message: 'type must be Expense, Income, or Transfer' });
      return;
    }

    // check if the asset exists
    const assetRef = doc(db, 'users', userId, 'assets', data.assetId);
    const assetDoc = await getDoc(assetRef);
    if (!assetDoc.exists()) {
      res.status(404).send({ message: 'Asset not found' });
      return;
    }
    const assetData = assetDoc.data();

    // if the type is Transfer, check if the target asset exists
    let targetAssetRef, targetAssetDoc, targetAssetData, targetAssetAmount;
    if (data.type === 'Transfer') {
      targetAssetRef = doc(db, 'users', userId, 'assets', data.category);
      targetAssetDoc = await getDoc(targetAssetRef);
      if (!targetAssetDoc.exists()) {
        console.log('Target asset not found');
        res.status(404).send({ message: 'Target asset not found' });
        return;
      }
      targetAssetData = targetAssetDoc.data();
      targetAssetAmount = targetAssetData.amount;
      data.category = targetAssetData.subcategory;
    }

    // check if the record exists
    const recordRef = doc(db, 'users', userId, 'records', recordId);
    const recordDoc = await getDoc(recordRef);
    if (!recordDoc.exists()) {
      res.status(404).send({ message: 'Record not found' });
      return;
    }
    const currentRecordData = recordDoc.data();

    // update the record
    const date = new Date(data.year, data.month - 1, data.day).toISOString();
    const tempRecord = {
      day: data.day,
      month: data.month,
      year: data.year,
      date,
      asset: assetData.subcategory,
      type: data.type,
      category: data.category,
      amount: data.amount,
      note: data.note || currentRecordData.note,
      description: data.description || currentRecordData.description,
    };
    await updateDoc(recordRef, tempRecord);

    // update the asset amount
    const assetAmount = assetData.amount;
    // if the type is the same
    if (data.type === currentRecordData.type) {
      await updateDoc(assetRef, {
        amount: assetAmount - data.amount + currentRecordData.amount,
      });
      if (data.type === 'Transfer') {
        await updateDoc(targetAssetRef, {
          amount: targetAssetAmount + data.amount - currentRecordData.amount,
        });
      }
    } else {
      // if the type is different
      if (currentRecordData.type === 'Expense') {
        // Expense -> Income or Transfer
        if (data.type === 'Income') {
          await updateDoc(assetRef, {
            amount: assetAmount + currentRecordData.amount + data.amount,
          });
        } else {
          await updateDoc(assetRef, {
            amount: assetAmount - data.amount + currentRecordData.amount,
          });
          await updateDoc(targetAssetRef, {
            amount: targetAssetAmount + data.amount,
          });
        }
      } else if (currentRecordData.type === 'Income') {
        // Income -> Expense or Transfer
        if (data.type === 'Expense') {
          await updateDoc(assetRef, {
            amount: assetAmount - currentRecordData.amount - data.amount,
          });
        } else {
          await updateDoc(assetRef, {
            amount: assetAmount - data.amount + currentRecordData.amount,
          });
          await updateDoc(targetAssetRef, {
            amount: targetAssetAmount + data.amount,
          });
        }
      } else {
        // Transfer -> Expense or Income
        if (data.type === 'Expense') {
          await updateDoc(assetRef, {
            amount: assetAmount + currentRecordData.amount - data.amount,
          });
          await updateDoc(targetAssetRef, {
            amount: targetAssetAmount - currentRecordData.amount,
          });
        } else {
          // data.type === 'Income'
          await updateDoc(assetRef, {
            amount: assetAmount + currentRecordData.amount - data.amount,
          });
          await updateDoc(targetAssetRef, {
            amount: targetAssetAmount - data.amount,
          });
        }
      }
    }

    res.status(200).send({ message: 'record updated successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error.message });
  }
};

/**
 * @swagger
 * /api/v1/records/{recordId}:
 *   delete:
 *     summary: Delete a record in a user's account
 *     tags: [Records]
 *     security:
 *     - bearerAuth: []
 *     parameters:
 *     - in: path
 *       name: recordId
 *       schema:
 *         type: string
 *       required: true
 *       description: Record ID
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Record not found
 *       500:
 *         description: Internal server error
 */
const deleteRecord = async (req, res) => {
  try {
    const userId = req.user.uid;
    const recordId = req.params.recordId;

    // validate the params
    if (!recordId) {
      res.status(400).send({ message: 'recordId is required' });
      return;
    }

    // check if the record exists
    const recordRef = doc(db, 'users', userId, 'records', recordId);
    const docRef = await getDoc(recordRef);
    if (!docRef.exists()) {
      res.status(404).send({ message: 'Record not found' });
      return;
    }

    // delete the record
    await deleteDoc(recordRef);
    res.status(200).send({ message: 'record deleted successfully' });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
};
