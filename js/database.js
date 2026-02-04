// =====================================================
// DATABASE MODULE - database.js
// =====================================================

import { db } from './firebase-config.js';
import { 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    serverTimestamp,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// =====================================================
// GENERIC CRUD OPERATIONS
// =====================================================

// Add Document
export async function addDocument(collectionName, data, customId = null) {
    try {
        const dataWithTimestamp = {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (customId) {
            await setDoc(doc(db, collectionName, customId), dataWithTimestamp);
            return { success: true, id: customId };
        } else {
            const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
            return { success: true, id: docRef.id };
        }
    } catch (error) {
        console.error('Add document error:', error);
        return { success: false, error: error.message };
    }
}

// Get Single Document
export async function getDocument(collectionName, docId) {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
        }
        return { success: false, error: 'Document not found' };
    } catch (error) {
        console.error('Get document error:', error);
        return { success: false, error: error.message };
    }
}

// Get All Documents with Query
export async function getDocuments(collectionName, conditions = [], orderByField = null, limitCount = null) {
    try {
        let q = collection(db, collectionName);
        
        // Build query constraints
        const constraints = [];
        conditions.forEach(cond => {
            constraints.push(where(cond.field, cond.operator, cond.value));
        });
        
        if (orderByField) {
            constraints.push(orderBy(orderByField.field, orderByField.direction || 'asc'));
        }
        
        if (limitCount) {
            constraints.push(limit(limitCount));
        }
        
        if (constraints.length > 0) {
            q = query(q, ...constraints);
        }
        
        const querySnapshot = await getDocs(q);
        const documents = [];
        querySnapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        
        return { success: true, data: documents };
    } catch (error) {
        console.error('Get documents error:', error);
        return { success: false, error: error.message, data: [] };
    }
}

// Update Document
export async function updateDocument(collectionName, docId, data) {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update document error:', error);
        return { success: false, error: error.message };
    }
}

// Delete Document
export async function deleteDocument(collectionName, docId) {
    try {
        await deleteDoc(doc(db, collectionName, docId));
        return { success: true };
    } catch (error) {
        console.error('Delete document error:', error);
        return { success: false, error: error.message };
    }
}

// Batch Write
export async function batchWrite(operations) {
    try {
        const batch = writeBatch(db);
        
        operations.forEach(op => {
            const docRef = op.id 
                ? doc(db, op.collection, op.id)
                : doc(collection(db, op.collection));
            
            if (op.type === 'set') {
                batch.set(docRef, {
                    ...op.data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            } else if (op.type === 'update') {
                batch.update(docRef, {
                    ...op.data,
                    updatedAt: new Date().toISOString()
                });
            } else if (op.type === 'delete') {
                batch.delete(docRef);
            }
        });
        
        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('Batch write error:', error);
        return { success: false, error: error.message };
    }
}

// Real-time Listener
export function subscribeToCollection(collectionName, conditions, callback) {
    let q = collection(db, collectionName);
    
    if (conditions && conditions.length > 0) {
        const constraints = conditions.map(cond => where(cond.field, cond.operator, cond.value));
        q = query(q, ...constraints);
    }
    
    return onSnapshot(q, (snapshot) => {
        const documents = [];
        snapshot.forEach((doc) => {
            documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
    }, (error) => {
        console.error('Subscription error:', error);
        callback([], error);
    });
}

// =====================================================
// SPECIFIC DATA FUNCTIONS
// =====================================================

// Get Mata Pelajaran by Jenjang
export async function getMapelByJenjang(jenjang) {
    return await getDocuments('mata_pelajaran', [
        { field: 'jenjang', operator: 'array-contains', value: jenjang }
    ]);
}

// Get Master Data (CP, ATP, etc) by User and Mapel
export async function getMasterData(userId, mapelId, tahunAjaran) {
    return await getDocuments('master_data', [
        { field: 'userId', operator: '==', value: userId },
        { field: 'mapelId', operator: '==', value: mapelId },
        { field: 'tahunAjaran', operator: '==', value: tahunAjaran }
    ]);
}

// Get Kalender Pendidikan by NPSN
export async function getKalenderByNPSN(npsn, tahunAjaran) {
    return await getDocuments('kalender_pendidikan', [
        { field: 'npsn', operator: '==', value: npsn },
        { field: 'tahunAjaran', operator: '==', value: tahunAjaran }
    ]);
}

// Get Jadwal Pelajaran by NPSN
export async function getJadwalByNPSN(npsn, tahunAjaran, semester) {
    return await getDocuments('jadwal_pelajaran', [
        { field: 'npsn', operator: '==', value: npsn },
        { field: 'tahunAjaran', operator: '==', value: tahunAjaran },
        { field: 'semester', operator: '==', value: semester }
    ]);
}

// Check Schedule Conflict
export async function checkScheduleConflict(npsn, hari, kelas, rombel, jamKe, excludeId = null) {
    const result = await getDocuments('jadwal_pelajaran', [
        { field: 'npsn', operator: '==', value: npsn },
        { field: 'hari', operator: '==', value: hari },
        { field: 'kelas', operator: '==', value: kelas },
        { field: 'rombel', operator: '==', value: rombel },
        { field: 'jamKe', operator: '==', value: jamKe }
    ]);
    
    if (result.success && result.data.length > 0) {
        // Filter out the current document if updating
        const conflicts = result.data.filter(d => d.id !== excludeId);
        return conflicts.length > 0 ? conflicts : null;
    }
    return null;
}

// Check Teacher Schedule Conflict (same teacher at same time)
export async function checkTeacherConflict(npsn, guruId, hari, jamKe, excludeId = null) {
    const result = await getDocuments('jadwal_pelajaran', [
        { field: 'npsn', operator: '==', value: npsn },
        { field: 'guruId', operator: '==', value: guruId },
        { field: 'hari', operator: '==', value: hari },
        { field: 'jamKe', operator: '==', value: jamKe }
    ]);
    
    if (result.success && result.data.length > 0) {
        const conflicts = result.data.filter(d => d.id !== excludeId);
        return conflicts.length > 0 ? conflicts : null;
    }
    return null;
}

// Get Kelas by NPSN
export async function getKelasByNPSN(npsn) {
    return await getDocuments('kelas', [
        { field: 'npsn', operator: '==', value: npsn }
    ], { field: 'tingkat', direction: 'asc' });
}