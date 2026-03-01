/**
 * AGSA - Admin Guru Super App
 * Database Service
 * 
 * Base Firestore operations
 */

const DBService = {
    db: null,

    /**
     * Initialize database service
     */
    init() {
        this.db = firebase.firestore();
        return this;
    },

    /**
     * Get Firestore instance
     * @returns {firebase.firestore.Firestore}
     */
    getDB() {
        if (!this.db) {
            this.db = firebase.firestore();
        }
        return this.db;
    },

    /**
     * Get current user ID
     * @returns {string}
     */
    getUserId() {
        const uid = AuthService.getUserId();
        if (!uid) throw new Error('User not authenticated');
        return uid;
    },

    /**
     * Get collection reference
     * @param {string} collectionName 
     * @returns {firebase.firestore.CollectionReference}
     */
    collection(collectionName) {
        return this.getDB().collection(collectionName);
    },

    /**
     * Get document reference
     * @param {string} collectionName 
     * @param {string} docId 
     * @returns {firebase.firestore.DocumentReference}
     */
    doc(collectionName, docId) {
        return this.collection(collectionName).doc(docId);
    },

    /**
     * Get user-specific document
     * @param {string} collectionName 
     * @returns {firebase.firestore.DocumentReference}
     */
    userDoc(collectionName) {
        return this.doc(collectionName, this.getUserId());
    },

    /**
     * Create document
     * @param {string} collectionName 
     * @param {Object} data 
     * @param {string} docId - Optional document ID
     * @returns {Promise<string>} Document ID
     */
    async create(collectionName, data, docId = null) {
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const docData = {
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp
        };

        if (docId) {
            await this.doc(collectionName, docId).set(docData);
            return docId;
        } else {
            const docRef = await this.collection(collectionName).add(docData);
            return docRef.id;
        }
    },

    /**
     * Read document
     * @param {string} collectionName 
     * @param {string} docId 
     * @returns {Promise<Object|null>}
     */
    async read(collectionName, docId) {
        const doc = await this.doc(collectionName, docId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    },

    /**
     * Update document
     * @param {string} collectionName 
     * @param {string} docId 
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    async update(collectionName, docId, data) {
        await this.doc(collectionName, docId).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    },

    /**
     * Delete document
     * @param {string} collectionName 
     * @param {string} docId 
     * @returns {Promise<void>}
     */
    async delete(collectionName, docId) {
        await this.doc(collectionName, docId).delete();
    },

    /**
     * Set document (create or overwrite)
     * @param {string} collectionName 
     * @param {string} docId 
     * @param {Object} data 
     * @param {boolean} merge 
     * @returns {Promise<void>}
     */
    async set(collectionName, docId, data, merge = true) {
        await this.doc(collectionName, docId).set({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge });
    },

    /**
     * Query collection
     * @param {string} collectionName 
     * @param {Array} conditions - Array of [field, operator, value]
     * @param {Object} options - { orderBy, limit, startAfter }
     * @returns {Promise<Array>}
     */
    async query(collectionName, conditions = [], options = {}) {
        let query = this.collection(collectionName);

        // Apply conditions
        conditions.forEach(([field, operator, value]) => {
            query = query.where(field, operator, value);
        });

        // Apply ordering
        if (options.orderBy) {
            const [field, direction = 'asc'] = Array.isArray(options.orderBy) 
                ? options.orderBy 
                : [options.orderBy, 'asc'];
            query = query.orderBy(field, direction);
        }

        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }

        // Apply pagination
        if (options.startAfter) {
            query = query.startAfter(options.startAfter);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Get all documents in collection
     * @param {string} collectionName 
     * @returns {Promise<Array>}
     */
    async getAll(collectionName) {
        const snapshot = await this.collection(collectionName).get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    /**
     * Batch write operations
     * @param {Function} operations - Function that receives batch object
     * @returns {Promise<void>}
     */
    async batch(operations) {
        const batch = this.getDB().batch();
        await operations(batch);
        await batch.commit();
    },

    /**
     * Transaction
     * @param {Function} operations - Function that receives transaction object
     * @returns {Promise<any>}
     */
    async transaction(operations) {
        return this.getDB().runTransaction(operations);
    },

    /**
     * Listen to document changes
     * @param {string} collectionName 
     * @param {string} docId 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    onDocChange(collectionName, docId, callback) {
        return this.doc(collectionName, docId).onSnapshot(
            (doc) => {
                if (doc.exists) {
                    callback({ id: doc.id, ...doc.data() });
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error('Document listener error:', error);
            }
        );
    },

    /**
     * Listen to collection changes
     * @param {string} collectionName 
     * @param {Array} conditions 
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    onCollectionChange(collectionName, conditions = [], callback) {
        let query = this.collection(collectionName);

        conditions.forEach(([field, operator, value]) => {
            query = query.where(field, operator, value);
        });

        return query.onSnapshot(
            (snapshot) => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(docs);
            },
            (error) => {
                console.error('Collection listener error:', error);
            }
        );
    },

    /**
     * Check if document exists
     * @param {string} collectionName 
     * @param {string} docId 
     * @returns {Promise<boolean>}
     */
    async exists(collectionName, docId) {
        const doc = await this.doc(collectionName, docId).get();
        return doc.exists;
    },

    /**
     * Get server timestamp
     * @returns {firebase.firestore.FieldValue}
     */
    serverTimestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    },

    /**
     * Get array union
     * @param  {...any} elements 
     * @returns {firebase.firestore.FieldValue}
     */
    arrayUnion(...elements) {
        return firebase.firestore.FieldValue.arrayUnion(...elements);
    },

    /**
     * Get array remove
     * @param  {...any} elements 
     * @returns {firebase.firestore.FieldValue}
     */
    arrayRemove(...elements) {
        return firebase.firestore.FieldValue.arrayRemove(...elements);
    },

    /**
     * Get increment
     * @param {number} n 
     * @returns {firebase.firestore.FieldValue}
     */
    increment(n) {
        return firebase.firestore.FieldValue.increment(n);
    },

    /**
     * Delete field
     * @returns {firebase.firestore.FieldValue}
     */
    deleteField() {
        return firebase.firestore.FieldValue.delete();
    },

    /**
     * Generate document ID
     * @param {string} collectionName 
     * @returns {string}
     */
    generateId(collectionName) {
        return this.collection(collectionName).doc().id;
    }
};

// Initialize
DBService.init();

// Export
window.DBService = DBService;

console.log('💾 DB Service loaded successfully');