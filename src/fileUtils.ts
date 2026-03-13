import { Regimen } from './types';

export const exportToJsonFile = (regimen: Regimen) => {
  const dataStr = JSON.stringify(regimen, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${regimen.regimen_core.regimen_name || 'regimen'}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const importFromJsonFile = (file: File): Promise<Regimen> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        resolve(json as Regimen);
      } catch (e) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
