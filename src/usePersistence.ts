import { useEffect } from 'react';
import { useRegimenStore } from './store';
import { saveRegimenToDB, getAllRegimensFromDB } from './db';

export const usePersistence = () => {
  const { currentRegimen, setRegimens } = useRegimenStore();

  // Load all regimens on mount
  useEffect(() => {
    getAllRegimensFromDB().then((data) => {
      if (data && data.length > 0) {
        setRegimens(data);
      }
    });
  }, [setRegimens]);

  // Save current regimen on change
  useEffect(() => {
    if (currentRegimen) {
      saveRegimenToDB(currentRegimen);
    }
  }, [currentRegimen]);
};
