import React, { useEffect, useState } from 'react';
import { History, X } from 'lucide-react';
import { auth, db, collection, query, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

export const DiscoveryHistory = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && auth.currentUser) {
      const path = `users/${auth.currentUser.uid}/projects`;
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setProjects(snapshot.docs.map(doc => doc.data()));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">Discovery History</h2>
        <button onClick={onClose} className="text-white/60 hover:text-white"><X /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-white/80 mb-2">{project.brief.substring(0, 50)}...</p>
            <p className="text-white/40 text-xs">{new Date(project.createdAt.toDate()).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
