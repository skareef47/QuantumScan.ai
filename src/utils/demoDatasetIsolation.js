/**
 * DemoDatasetIsolation.js
 * 
 * DEMO-ONLY Dataset and Workstation Validation & State Isolation Layer.
 * 
 * This module strictly prevents Demo-selected dataset files from being
 * carried over or cross-loaded into incompatible diagnostic workstations.
 * 
 * SCOPE: Demo Dashboard ONLY. Real Dashboard is 100% excluded.
 */

export const DEMO_DATASETS = {
  lung: {
    cancerType: 'lung',
    datasetName: 'Lung',
    modality: 'CT',
    engineName: 'Lung CT Engine',
    workstationTitle: 'Lung CT Scan Engine',
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.dcm'],
    color: '#5B8DEF'
  },
  brain: {
    cancerType: 'brain',
    datasetName: 'Brain',
    modality: 'MRI',
    engineName: 'Brain MRI Engine',
    workstationTitle: 'Brain MRI Diagnostic',
    allowedExtensions: ['.jpg', '.jpeg', '.png'],
    color: '#9B8AFB'
  },
  breast: {
    cancerType: 'breast',
    datasetName: 'Breast',
    modality: 'Ultrasound',
    engineName: 'Breast Sonogram Engine',
    workstationTitle: 'Breast Ultrasound Engine',
    allowedExtensions: ['.png', '.jpg', '.bmp'],
    color: '#EF8B8B'
  },
  kidney: {
    cancerType: 'kidney',
    datasetName: 'Kidney',
    modality: 'CT',
    engineName: 'Kidney CT Engine',
    workstationTitle: 'Kidney CT Engine',
    allowedExtensions: ['.png', '.jpg', '.nii', '.dcm'],
    color: '#70C9A8'
  },
  liver: {
    cancerType: 'liver',
    datasetName: 'Liver',
    modality: 'CT/NIfTI',
    engineName: 'Liver CT Engine',
    workstationTitle: 'Liver CT Engine',
    allowedExtensions: ['.nii', '.nii.gz', '.npy', '.png', '.jpg', '.jpeg', '.dcm'],
    color: '#F4C96B'
  }
};

/**
 * Track the origin metadata of a Demo-selected file.
 */
export function trackDemoFileOrigin(cancerType, subclass, fileName, filePath = null) {
  if (!cancerType || !fileName) return null;
  const lowerType = cancerType.toLowerCase();
  const config = DEMO_DATASETS[lowerType] || {
    cancerType: lowerType,
    datasetName: cancerType,
    modality: 'Scan',
    engineName: `${cancerType} Engine`,
    workstationTitle: `${cancerType} Diagnostic`
  };

  return {
    dataset: lowerType,
    datasetName: config.datasetName,
    subclass: subclass || '',
    fileName: fileName,
    filePath: filePath,
    modality: config.modality,
    workstation: config.engineName,
    workstationTitle: config.workstationTitle,
    selectedAt: Date.now()
  };
}

/**
 * Determine if a Demo file origin is compatible with a target workstation.
 */
export function isDemoFileCompatible(fileOrigin, targetWorkstation) {
  if (!fileOrigin || !fileOrigin.dataset) return true;
  if (!targetWorkstation) return false;
  return fileOrigin.dataset.toLowerCase() === targetWorkstation.toLowerCase();
}

/**
 * Generate a clear, non-destructive user notification for dataset mismatches.
 */
export function getDemoMismatchMessage(fileOrigin, targetWorkstation) {
  if (!fileOrigin || !fileOrigin.dataset || !targetWorkstation) return null;
  if (isDemoFileCompatible(fileOrigin, targetWorkstation)) return null;

  const src = DEMO_DATASETS[fileOrigin.dataset.toLowerCase()] || {
    datasetName: fileOrigin.dataset,
    modality: 'file'
  };
  const tgt = DEMO_DATASETS[targetWorkstation.toLowerCase()] || {
    datasetName: targetWorkstation,
    workstationTitle: `${targetWorkstation} Engine`
  };

  return `Dataset mismatch — this ${src.datasetName} ${src.modality} file cannot be loaded into the ${tgt.workstationTitle} Demo workstation. Please select a file from the ${tgt.datasetName} dataset.`;
}

/**
 * Comprehensive validation function returning validation status, reason, and message.
 */
export function validateDemoDatasetWorkstation(fileOrigin, targetWorkstation) {
  if (!fileOrigin || !fileOrigin.dataset) {
    return { valid: true, fileOrigin: null };
  }

  const compatible = isDemoFileCompatible(fileOrigin, targetWorkstation);
  if (compatible) {
    return {
      valid: true,
      fileOrigin,
      config: DEMO_DATASETS[targetWorkstation.toLowerCase()]
    };
  }

  return {
    valid: false,
    reason: 'DATASET_MISMATCH',
    fileOrigin,
    targetWorkstation,
    message: getDemoMismatchMessage(fileOrigin, targetWorkstation)
  };
}
