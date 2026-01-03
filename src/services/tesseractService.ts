import Tesseract from 'tesseract.js';

export const tesseractService = {
  async performOCR(image: Blob): Promise<string> {
    const worker = await Tesseract.createWorker('eng');
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('OCR Timeout')), 15000)
      );

      const recognitionPromise = worker.recognize(image).then(result => result.data.text);

      const text = await Promise.race([recognitionPromise, timeoutPromise]);
      return text;
    } catch (error) {
      console.error('OCR error (timeout or other):', error);
      return '';
    } finally {
      await worker.terminate();
    }
  }
};
