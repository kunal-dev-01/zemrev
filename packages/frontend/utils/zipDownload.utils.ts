import JSZip from 'jszip';

interface FileToZip {
  name: string;
  blob: Blob;
}

export const zipDownloadUtils = {

  downloadAsZip: async (
    files: FileToZip[],
    zipFileName: string = 'files'
  ): Promise<void> => {
    if (files.length === 0) {
      console.warn('No files to zip');
      return;
    }

    try {
      const zip = new JSZip();

      // Add each file to the zip
      for (const file of files) {
        zip.file(file.name, file.blob);
      }

      // Generate the ZIP blob
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Create download link
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${zipFileName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating ZIP file:', error);
      throw error;
    }
  },

  createZipBlob: async (
    files: FileToZip[]
  ): Promise<Blob> => {
    const zip = new JSZip();

    for (const file of files) {
      zip.file(file.name, file.blob);
    }

    return await zip.generateAsync({ type: 'blob' });
  },
};