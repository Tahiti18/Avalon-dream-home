import React from 'react';
import { Save } from 'lucide-react';
import { auth, db, setDoc, doc, handleFirestoreError, OperationType } from '../firebase';
import { Timestamp } from 'firebase/firestore';

export const SaveDiscoveryButton = ({ brief, assets }: { brief: string, assets: any[] }) => {
  const saveDiscovery = async () => {
    if (!auth.currentUser) {
      console.warn('User not authenticated');
      return;
    }
    const discoveryId = Date.now().toString();
    const path = `users/${auth.currentUser.uid}/projects/${discoveryId}`;
    const discoveryRef = doc(db, 'users', auth.currentUser.uid, 'projects', discoveryId);
    try {
      await setDoc(discoveryRef, {
        id: discoveryId,
        brief,
        userId: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        assets
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <button onClick={saveDiscovery} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
      <Save className="w-4 h-4 text-white" />
    </button>
  );
};
