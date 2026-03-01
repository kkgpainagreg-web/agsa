/**
 * AGSA - Admin Guru Super App
 * Authentication Service
 * 
 * Handles all authentication operations
 */

const AuthService = {
    currentUser: null,
    userProfile: null,
    isInitialized: false,
    listeners: [],

    /**
     * Initialize auth service
     * @returns {Promise<Object|null>} Current user
     */
    async init() {
        return new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                this.currentUser = user;
                
                if (user) {
                    // Load user profile from Firestore
                    try {
                        this.userProfile = await this.loadUserProfile(user.uid);
                    } catch (error) {
                        console.error('Failed to load user profile:', error);
                    }
                } else {
                    this.userProfile = null;
                }

                this.isInitialized = true;
                this.notifyListeners();
                
                // Only resolve once
                if (!this._resolved) {
                    this._resolved = true;
                    resolve(user);
                }
            });
        });
    },

    /**
     * Sign in with Google
     * @returns {Promise<Object>} User object
     */
    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });

            const result = await firebase.auth().signInWithPopup(provider);
            const user = result.user;

            // Check/create user document
            await this.ensureUserDocument(user);

            return user;
        } catch (error) {
            AGSAHelpers.error('Auth', 'Sign in failed:', error);
            throw error;
        }
    },

    /**
     * Sign out
     * @returns {Promise<void>}
     */
    async signOut() {
        try {
            await firebase.auth().signOut();
            this.currentUser = null;
            this.userProfile = null;
        } catch (error) {
            AGSAHelpers.error('Auth', 'Sign out failed:', error);
            throw error;
        }
    },

    /**
     * Ensure user document exists in Firestore
     * @param {Object} user - Firebase user object
     */
    async ensureUserDocument(user) {
        const { COLLECTIONS, SUPER_ADMIN_EMAIL } = AGSA_CONSTANTS;
        const userRef = firebase.firestore().collection(COLLECTIONS.USERS).doc(user.uid);
        
        const doc = await userRef.get();
        
        if (!doc.exists) {
            // Create new user document
            const userData = {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                role: user.email === SUPER_ADMIN_EMAIL ? 'superadmin' : 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                subscription: {
                    type: 'free',
                    plan: null,
                    expiresAt: null,
                    npsn: null,
                    activatedAt: null
                }
            };

            await userRef.set(userData);
            this.userProfile = { id: user.uid, ...userData };
        } else {
            // Update last login
            await userRef.update({
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                displayName: user.displayName,
                photoURL: user.photoURL
            });
            
            this.userProfile = { id: user.uid, ...doc.data() };
        }
    },

    /**
     * Load user profile from Firestore
     * @param {string} uid - User ID
     * @returns {Promise<Object>}
     */
    async loadUserProfile(uid) {
        const { COLLECTIONS } = AGSA_CONSTANTS;
        const doc = await firebase.firestore()
            .collection(COLLECTIONS.USERS)
            .doc(uid)
            .get();

        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    },

    /**
     * Get current user
     * @returns {Object|null}
     */
    getUser() {
        return this.currentUser;
    },

    /**
     * Get user profile
     * @returns {Object|null}
     */
    getProfile() {
        return this.userProfile;
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.currentUser;
    },

    /**
     * Check if user is super admin
     * @returns {boolean}
     */
    isSuperAdmin() {
        return this.userProfile?.role === 'superadmin' || 
               this.currentUser?.email === AGSA_CONSTANTS.SUPER_ADMIN_EMAIL;
    },

    /**
     * Check if user has premium subscription
     * @returns {boolean}
     */
    isPremium() {
        if (this.isSuperAdmin()) return true;
        
        const subscription = this.userProfile?.subscription;
        if (!subscription) return false;
        
        if (subscription.type !== 'premium') return false;
        
        // Check expiration
        if (subscription.expiresAt) {
            const expiresAt = subscription.expiresAt.toDate ? 
                subscription.expiresAt.toDate() : 
                new Date(subscription.expiresAt);
            return expiresAt > new Date();
        }
        
        return true; // Lifetime subscription
    },

    /**
     * Get subscription type
     * @returns {string} 'free' or 'premium'
     */
    getSubscriptionType() {
        return this.isPremium() ? 'premium' : 'free';
    },

    /**
     * Check if user has access to a feature
     * @param {string} featureId 
     * @returns {boolean}
     */
    hasFeatureAccess(featureId) {
        if (this.isPremium() || this.isSuperAdmin()) return true;
        
        const freeFeatures = AGSA_CONSTANTS.SUBSCRIPTION.FREE.features;
        return freeFeatures.includes(featureId);
    },

    /**
     * Update user profile
     * @param {Object} data 
     * @returns {Promise<void>}
     */
    async updateProfile(data) {
        if (!this.currentUser) throw new Error('Not authenticated');

        const { COLLECTIONS } = AGSA_CONSTANTS;
        await firebase.firestore()
            .collection(COLLECTIONS.USERS)
            .doc(this.currentUser.uid)
            .update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Refresh profile
        this.userProfile = await this.loadUserProfile(this.currentUser.uid);
        this.notifyListeners();
    },

    /**
     * Add auth state listener
     * @param {Function} callback 
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChange(callback) {
        this.listeners.push(callback);
        
        // Immediately call with current state if initialized
        if (this.isInitialized) {
            callback(this.currentUser, this.userProfile);
        }

        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    },

    /**
     * Notify all listeners of state change
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback(this.currentUser, this.userProfile);
            } catch (error) {
                console.error('Auth listener error:', error);
            }
        });
    },

    /**
     * Get user ID
     * @returns {string|null}
     */
    getUserId() {
        return this.currentUser?.uid || null;
    },

    /**
     * Get user email
     * @returns {string|null}
     */
    getUserEmail() {
        return this.currentUser?.email || null;
    },

    /**
     * Get user display name
     * @returns {string}
     */
    getUserDisplayName() {
        return this.currentUser?.displayName || this.userProfile?.displayName || 'Pengguna';
    },

    /**
     * Get user photo URL
     * @returns {string|null}
     */
    getUserPhotoURL() {
        return this.currentUser?.photoURL || this.userProfile?.photoURL || null;
    }
};

// Export
window.AuthService = AuthService;

console.log('🔐 Auth Service loaded successfully');